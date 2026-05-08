import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProjectsService } from '../src/projects/projects.service';
import { PrismaService } from '../src/prisma/prisma.service';

async function createTestProject() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const projectsService = app.get(ProjectsService);
  const prisma = app.get(PrismaService);

  try {
    const adminEmail = 'admin@plia.com';
    const user = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!user) {
      console.error('❌ No se encontro el usuario admin@plia.com. Ejecuta npm run seed primero.');
      await app.close();
      return;
    }

    // 1. Crear una orden ficticia (Plan 1 = LANDING)
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        email: user.email,
        planId: 1,
        amount: 390,
        currency: 'PEN',
        status: 'PAID',
      }
    });

    // 2. Crear el proyecto desde la orden
    const project = await projectsService.createFromOrder(order);
    console.log(`✅ Proyecto de prueba creado con ID: ${project.id}`);

    // 3. Simular que el cliente completa el onboarding
    console.log('🚀 Iniciando onboarding y generacion IA instantanea...');
    const testSubdomain = `test-plia-${Math.floor(Math.random() * 10000)}`;
    
    await projectsService.saveOnboarding(project.id, {
      step: 5,
      completed: true,
      data: {
        subdomain: testSubdomain,
        businessName: 'Prueba Instantanea PLIA',
        businessIdentity: 'Una empresa de tecnologia innovadora',
        businessSector: 'Tecnologia',
        city: 'Lima',
        shortDescription: 'Creamos soluciones digitales en tiempo record.',
        colors: ['#000000', '#ffffff'],
        visualStyle: 'Minimalista'
      }
    });

    console.log(`\n\x1b[32m✅ ¡FLUJO INICIADO CON EXITO!\x1b[0m`);
    console.log(`Subdominio solicitado: ${testSubdomain}.plia.pe`);
    console.log(`\n\x1b[33mREVISA LOS LOGS AHORA MISMO CON:\x1b[0m`);
    console.log(`pm2 logs plia-backend --lines 50`);
    
  } catch (error: any) {
    console.error('❌ Error creando el proyecto de prueba:', error.message);
  } finally {
    await app.close();
  }
}

createTestProject();
