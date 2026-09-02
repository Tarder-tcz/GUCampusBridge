import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function testMultiplePosts() {
  const user = await prisma.user.findFirst();
  console.log('User for test:', user?.name, user?.id);

  for (let i = 1; i <= 3; i++) {
    const post = await prisma.post.create({
      data: {
        title: `Test Discussion ${i} - ${Date.now()}`,
        content: `This is test content for discussion ${i}`,
        channelId: 'scse-computer-science',
        channelName: 'c/scse-computer-science',
        tags: JSON.stringify(['CAT Prep']),
        authorId: user ? user.id : null,
        authorName: user?.name || 'Test User',
        authorHandle: user?.handle || '@test_user',
        authorRole: 'Student',
        authorBadge: 'GU Student',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: 'Just now',
        votes: 1,
        commentCount: 0,
        views: 1
      }
    });
    console.log(`Created Post ${i}:`, post.id, post.title);
  }

  const allPosts = await prisma.post.findMany();
  console.log('TOTAL POSTS IN DB NOW:', allPosts.length);
}

testMultiplePosts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
