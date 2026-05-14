
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { join } = require('path');

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  console.log(`Checking projects at ${now.toISOString()}`);

  const readyProjects = await prisma.project.findMany({
    where: {
      status: 'IN_PROGRESS',
      deadline: { lte: now },
    },
    include: {
      user: true,
    },
  });

  console.log(`Found ${readyProjects.length} projects with passed deadline and status IN_PROGRESS`);

  for (const project of readyProjects) {
    const data = project.onboardingData || {};
    console.log(`--- Project ID: ${project.id} (${project.name}) ---`);
    console.log(`AI Status: ${data.aiGeneration?.status}`);
    
    if (data.aiGeneration?.status !== 'READY') {
      console.log(`Skipping: AI generation status is not READY`);
      continue;
    }

    const hasGeneratedOutput = () => {
      const previewIndex = join(process.cwd(), 'uploads', 'previews', String(project.id), 'index.html');
      const hasPreview = fs.existsSync(previewIndex);
      console.log(`Check: hasPreview=${hasPreview} at ${previewIndex}`);
      return hasPreview;
    };

    if (!hasGeneratedOutput()) {
      console.log(`Skipping: No preview output found.`);
      continue;
    }

    const targetDir = data.aiGeneration?.target;
    console.log(`Target Directory: ${targetDir}`);
    
    console.log(`Project is READY to be published! The cron job would now copy files to public_html and set status to DELIVERED.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
