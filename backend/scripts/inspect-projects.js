
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    include: {
      user: true,
      order: {
        include: {
          plan: true,
        },
      },
    },
    orderBy: {
        createdAt: 'desc'
    },
    take: 10
  });

  console.log(`Total projects (last 10): ${projects.length}`);

  for (const project of projects) {
    const data = project.onboardingData || {};
    console.log('---');
    console.log(`ID: ${project.id}`);
    console.log(`Name: ${project.name}`);
    console.log(`Status: ${project.status}`);
    console.log(`User: ${project.user.email}`);
    console.log(`Deadline: ${project.deadline}`);
    console.log(`AI Status: ${data?.aiGeneration?.status}`);
    console.log(`AI Error: ${data?.aiGeneration?.error}`);
    console.log(`Public Domain: ${data?.publicDomain}`);
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
