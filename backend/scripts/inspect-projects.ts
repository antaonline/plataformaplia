
import { PrismaClient, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    where: {
      status: ProjectStatus.IN_PROGRESS,
    },
    include: {
      user: true,
      order: {
        include: {
          plan: true,
        },
      },
    },
  });

  console.log(`Found ${projects.length} projects IN_PROGRESS`);

  for (const project of projects) {
    const data = project.onboardingData as any;
    console.log('---');
    console.log(`ID: ${project.id}`);
    console.log(`Name: ${project.name}`);
    console.log(`User: ${project.user.email}`);
    console.log(`Deadline: ${project.deadline}`);
    console.log(`AI Status: ${data?.aiGeneration?.status}`);
    console.log(`AI Error: ${data?.aiGeneration?.error}`);
    console.log(`Public Domain: ${data?.publicDomain}`);
    console.log(`Target: ${data?.aiGeneration?.target}`);
    
    const now = new Date();
    const isPastDeadline = project.deadline ? project.deadline <= now : false;
    console.log(`Is Past Deadline: ${isPastDeadline}`);
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
