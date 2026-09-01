import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const GU_CHANNELS = [
  { id: 'all', name: 'All Discussions', label: 'All Discussions', icon: 'Sparkles', count: 48 },
  { id: 'scse-computer-science', name: 'c/scse-computer-science', label: 'SCSE (CSE/AI/DS)', icon: 'Code2', count: 18 },
  { id: 'soe-engineering', name: 'c/soe-engineering', label: 'SOE (ECE/Mech/Civil)', icon: 'Cpu', count: 9 },
  { id: 'sob-management', name: 'c/sob-management', label: 'SOB (MBA/BBA)', icon: 'TrendingUp', count: 7 },
  { id: 'gu-placements', name: 'c/gu-placements', label: 'Placements & Internships', icon: 'Briefcase', count: 12 },
  { id: 'exam-cell', name: 'c/exam-cell', label: 'Exam Cell & CAT Prep', icon: 'GraduationCap', count: 15 },
  { id: 'campus-life', name: 'c/campus-life', label: 'Campus Life & Unifest', icon: 'Music', count: 11 },
];

const GU_TAGS = [
  { id: 'cat-prep', name: 'CAT Prep' },
  { id: 'end-sem', name: 'End-Sem Exam' },
  { id: 'placement-drive', name: 'Placement Drive' },
  { id: 'lab-manual', name: 'Lab Manual' },
  { id: 'project-partner', name: 'Project Partner' },
  { id: 'unifest', name: 'Unifest / G-Quasar' },
  { id: 'faculty-qa', name: 'Faculty Q&A' },
  { id: 'hostel-query', name: 'Hostel & Transport' },
];

const USERS = [];

const UPCOMING_EVENTS = [
  { title: 'SCSE CAT-2 Examinations', date: 'Sep 02, 2026', tag: 'Academic' },
  { title: 'TCS & Infosys Placement Drive', date: 'Sep 10, 2026', tag: 'Placement' },
  { title: 'GU Annual Hackathon (G-Quasar)', date: 'Nov 14, 2026', tag: 'Unifest' },
];

const INITIAL_POSTS = [];

async function seed() {
  console.log('Seeding relational SQLite database...');

  // Reset database tables
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.channel.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  // Insert channels
  for (const ch of GU_CHANNELS) {
    await prisma.channel.create({ data: ch });
  }

  // Insert users
  for (const u of USERS) {
    await prisma.user.create({ data: u });
  }

  // Insert tags
  for (const tg of GU_TAGS) {
    await prisma.tag.create({ data: tg });
  }

  // Insert events
  for (const ev of UPCOMING_EVENTS) {
    await prisma.event.create({ data: ev });
  }

  // Helper for recursive comment insertion
  async function insertComments(comments, postId, parentId = null) {
    for (const c of comments) {
      const createdComment = await prisma.comment.create({
        data: {
          id: c.id,
          postId: postId,
          parentId: parentId,
          authorId: c.authorId,
          authorName: c.authorName,
          authorHandle: c.authorHandle,
          authorRole: c.authorRole,
          authorBadge: c.authorBadge,
          authorAvatar: c.authorAvatar,
          content: c.content,
          createdAt: c.createdAt,
          votes: c.votes || 1,
          isSolution: Boolean(c.isSolution)
        }
      });

      if (c.replies && c.replies.length > 0) {
        await insertComments(c.replies, postId, createdComment.id);
      }
    }
  }

  // Insert posts and comments
  for (const postData of INITIAL_POSTS) {
    const { comments, ...pData } = postData;
    await prisma.post.create({ data: pData });
    if (comments && comments.length > 0) {
      await insertComments(comments, pData.id, null);
    }
  }

  console.log('Successfully seeded relational database!');
}

seed()
  .catch((e) => {
    console.error('Error seeding relational database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
