import { NestFactory } from '@nestjs/core';

import { AppModule } from '../src/app.module';
import { ProjectsService } from '../src/projects/projects.service';

async function main() {
  const projectId = Number(process.argv[2] || 0);
  const reprovision = process.argv.includes('--reprovision');

  if (!projectId) {
    throw new Error('Uso: npm run ai:diagnose -- <projectId> [--reprovision]');
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const projectsService = app.get(ProjectsService);
    const diagnostics = await projectsService.runManualGeneration(
      projectId,
      undefined,
      true,
      reprovision,
    );

    console.log(JSON.stringify(diagnostics, null, 2));
  } finally {
    await app.close();
  }
}

void main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
