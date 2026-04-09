import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Admin12345!', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@plia.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@plia.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  await prisma.plan.upsert({
    where: { slug: 'landing' },
    update: {
      name: 'LANDING',
      description: 'Landing page + hosting anual',
      price: 390,
      hostingYear: true,
      slug: 'landing',
      serviceType: 'WEBSITE_BUILD',
    },
    create: {
      name: 'LANDING',
      description: 'Landing page + hosting anual',
      price: 390,
      hostingYear: true,
      slug: 'landing',
      serviceType: 'WEBSITE_BUILD',
    },
  })

  await prisma.plan.upsert({
    where: { slug: 'web' },
    update: {
      name: 'WEB INSTITUCIONAL',
      description: 'Web completa + hosting anual',
      price: 690,
      hostingYear: true,
      slug: 'web',
      serviceType: 'WEBSITE_BUILD',
    },
    create: {
      name: 'WEB INSTITUCIONAL',
      description: 'Web completa + hosting anual',
      price: 690,
      hostingYear: true,
      slug: 'web',
      serviceType: 'WEBSITE_BUILD',
    },
  })

  console.log('✅ Admin creado correctamente')
  console.log({
    email: admin.email,
    password: 'Admin12345!',
    role: admin.role,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
