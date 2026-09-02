import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const usersCount = await prisma.user.count();
  const postsCount = await prisma.post.count();
  const mentorshipCount = await prisma.mentorshipRequest.count();
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  const posts = await prisma.post.findMany({ select: { id: true, title: true, authorName: true } });

  console.log('=== NEON CLOUD POSTGRESQL DB STATUS ===');
  console.log('Users Count:', usersCount);
  console.log('Posts Count:', postsCount);
  console.log('Mentorship Requests Count:', mentorshipCount);
  console.log('Users list:', users);
  console.log('Posts list:', posts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
