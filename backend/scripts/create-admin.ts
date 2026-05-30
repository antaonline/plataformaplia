/**
 * Crea (o actualiza) el usuario admin de PLIA.
 *
 * Uso:
 *   cd backend
 *   npx ts-node scripts/create-admin.ts                       # defaults
 *   npx ts-node scripts/create-admin.ts <email> <password>    # custom
 *
 * Defaults: admin@plia.com / Admin12345!
 *
 * Comportamiento:
 *  - Si el email no existe, crea el usuario con role=ADMIN.
 *  - Si ya existe, lo PROMUEVE a ADMIN y resetea la password (util si
 *    olvidaste la antigua).
 *  - Como role=ADMIN, el bypass de creditos del iachat aplica
 *    automaticamente (panel "Ilimitado (admin)" + nunca consume).
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || 'admin@plia.com').toLowerCase().trim();
  const password = process.argv[3] || 'Admin12345!';
  const name = process.argv[4] || 'Admin PLIA';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Email invalido:', email);
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password debe tener al menos 8 caracteres');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  let user;
  if (existing) {
    user = await prisma.user.update({
      where: { email },
      data: {
        role: 'ADMIN' as any,
        password: hash,
        name: existing.name || name,
      },
    });
    console.log('\n=========================================');
    console.log(`Usuario EXISTENTE actualizado a ADMIN`);
    console.log('=========================================');
  } else {
    user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name,
        role: 'ADMIN' as any,
        emailVerified: true as any,
      },
    });
    console.log('\n=========================================');
    console.log(`Usuario admin CREADO`);
    console.log('=========================================');
  }

  console.log(`  ID:       ${user.id}`);
  console.log(`  Email:    ${user.email}`);
  console.log(`  Name:     ${user.name}`);
  console.log(`  Role:     ${user.role}`);
  console.log(`  Password: ${password}`);
  console.log('=========================================');
  console.log('\nCreditos en PLIA Studio: ilimitados (bypass admin).');
  console.log('Endpoints admin del dashboard tambien disponibles.\n');
}

main()
  .catch((e) => {
    console.error('\nError:', e?.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
