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
    where: { id: 1 },
    update: {
      name: 'LANDING',
      description: 'Landing page + hosting anual',
      price: 390,
      hostingYear: true,
    },
    create: {
      id: 1,
      name: 'LANDING',
      description: 'Landing page + hosting anual',
      price: 390,
      hostingYear: true,
    },
  })

  await prisma.plan.upsert({
    where: { id: 2 },
    update: {
      name: 'WEB INSTITUCIONAL',
      description: 'Web completa + hosting anual',
      price: 690,
      hostingYear: true,
    },
    create: {
      id: 2,
      name: 'WEB INSTITUCIONAL',
      description: 'Web completa + hosting anual',
      price: 690,
      hostingYear: true,
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
