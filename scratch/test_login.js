import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function checkAccount() {
  const user = await prisma.user.findUnique({
    where: { email: 'uxorialauto63@gmail.com' }
  });

  console.log('=== USER ACCOUNT IN NEON POSTGRESQL ===');
  if (user) {
    console.log('ACCOUNT FOUND AND INTACT!');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Handle:', user.handle);
    console.log('Created At:', user.createdAt);
  } else {
    console.log('Account not found.');
  }
}

checkAccount()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
