import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'


import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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


}
