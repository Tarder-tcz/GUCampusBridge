import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const channelCount = await prisma.channel.count();
  const channels = await prisma.channel.findMany();
  console.log('=== CHANNELS IN DB ===');
  console.log('Count:', channelCount);
  console.log('List:', channels);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
