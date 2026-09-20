import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const usersCount = await prisma.user.count();
  const mentorshipCount = await prisma.mentorshipRequest.count();
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, department: true }
  });
  console.log('Users Count:', users.length);
  console.log('Mentorship Requests Count:', mentorshipCount);
  console.log('Users:', users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
