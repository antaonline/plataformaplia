import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { CyberpanelService } from '../integrations/cyberpanel/cyberpanel.service'

import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cyberpanelService: CyberpanelService,
  ) {}

  async create(data: CreateUserDto) {
  const hashedPassword = await bcrypt.hash(data.password, 10)

  return this.prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: 'USER',
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  })
}


  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  async deleteOwnAccount(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          select: { id: true },
        },
        order: {
          select: { id: true },
        },
        subscription: {
          select: { id: true },
        },
        hostingAccount: {
          select: { id: true },
        },
      },
    })

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    if (user.role === 'ADMIN') {
      throw new BadRequestException('No puedes eliminar una cuenta administradora desde esta accion.')
    }

    const projects = await this.prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        onboardingData: true,
      },
    })
    const hostedSites = await this.prisma.hostedSite.findMany({
      where: {
        hostingAccount: {
          userId,
        },
      },
      select: {
        id: true,
        domain: true,
      },
    })

    const projectIds = projects.map((project) => project.id)
    const orderIds = user.order.map((order) => order.id)
    const subscriptionIds = user.subscription.map((subscription) => subscription.id)
    const cyberpanelUsernames = Array.from(
      new Set(
        [
          ...projects.map(
            (project) =>
              (project.onboardingData as any)?.cyberpanel?.account?.username ||
              (project.onboardingData as any)?.cyberpanel?.owner,
          ),
          user.hostingAccount?.id
            ? (
                await this.prisma.hostingAccount.findUnique({
                  where: { id: user.hostingAccount.id },
                  select: { cyberpanelUsername: true },
                })
              )?.cyberpanelUsername
            : null,
        ].filter(Boolean),
      ),
    ) as string[]

    for (const projectId of projectIds) {
      const deleted = await this.cyberpanelService.deleteSiteByProject(projectId)
      if (!deleted) {
        throw new BadRequestException(
          'No se pudo eliminar uno de los sitios en CyberPanel. Intenta nuevamente.',
        )
      }
    }

    for (const site of hostedSites) {
      const deleted = await this.cyberpanelService.deleteSiteByDomain(site.domain)
      if (!deleted) {
        throw new BadRequestException(
          'No se pudo eliminar uno de los sitios de hosting en CyberPanel. Intenta nuevamente.',
        )
      }
    }

    for (const username of cyberpanelUsernames) {
      const deleted = await this.cyberpanelService.deleteUserByUsername(username)
      if (!deleted) {
        throw new BadRequestException(
          'No se pudo eliminar la cuenta de hosting en CyberPanel. Intenta nuevamente.',
        )
      }
    }

    await this.prisma.$transaction(async (tx) => {
      if (subscriptionIds.length > 0) {
        await tx.hostingRenewal.deleteMany({
          where: { subscriptionId: { in: subscriptionIds } },
        })
      }

      await tx.project.deleteMany({
        where: { userId },
      })

      if (user.hostingAccount?.id) {
        await tx.hostedMailbox.deleteMany({
          where: {
            hostedSite: {
              hostingAccountId: user.hostingAccount.id,
            },
          },
        })
        await tx.hostedSite.deleteMany({
          where: {
            hostingAccountId: user.hostingAccount.id,
          },
        })
        await tx.hostingAccount.delete({
          where: { id: user.hostingAccount.id },
        })
      }

      if (subscriptionIds.length > 0) {
        await tx.hostingSubscription.deleteMany({
          where: { userId },
        })
      }

      if (orderIds.length > 0) {
        await tx.payment.deleteMany({
          where: { orderId: { in: orderIds } },
        })
        await tx.domainSelection.deleteMany({
          where: { orderId: { in: orderIds } },
        })
      }

      await tx.order.deleteMany({
        where: { userId },
      })

      await tx.refreshToken.deleteMany({
        where: { userId },
      })

      await tx.email2FACode.deleteMany({
        where: { userId },
      })

      await tx.passwordSetupToken.deleteMany({
        where: { userId },
      })

      await tx.user.delete({
        where: { id: userId },
      })
    })

    return { ok: true }
  }

}
