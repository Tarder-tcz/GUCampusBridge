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

const DEMO_PASSWORD_HASH = bcrypt.hashSync('Password123!', 10);

const USERS = [
  {
    id: 'usr_me',
    email: 'aryan@galgotias.edu',
    password: DEMO_PASSWORD_HASH,
    name: 'Aryan Sharma',
    handle: '@aryan_scse24',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'SCSE 3rd Year (AI & ML)',
    badge: 'SCSE Senior',
    department: 'School of Computer Science & Engineering',
    bio: 'Passionate about AI/ML algorithms and full-stack web dev. TA for DSA Block-A.',
    karma: 1420,
    upvotedPostIds: JSON.stringify(['post-1', 'post-3']),
    downvotedPostIds: JSON.stringify([]),
    upvotedCommentIds: JSON.stringify(['c-1-1']),
    savedPostIds: JSON.stringify(['post-2']),
  },
  {
    id: 'usr_rohan',
    email: 'rohan@galgotias.edu',
    password: DEMO_PASSWORD_HASH,
    name: 'Rohan Verma',
    handle: '@rohan_scse',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'SCSE Teaching Assistant',
    badge: 'TA / Teaching Assistant',
    department: 'School of Computer Science & Engineering',
    bio: 'Algorithms & Data Structures TA.',
    karma: 980,
  },
  {
    id: 'usr_priya',
    email: 'priya@galgotias.edu',
    password: DEMO_PASSWORD_HASH,
    name: 'Priya Nair',
    handle: '@priya_ai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'B.Tech CSE (AI Specialization)',
    badge: 'Top Contributor',
    department: 'School of Computer Science & Engineering',
    bio: 'AI enthusiast & Student mentor.',
    karma: 2150,
  },
  {
    id: 'usr_sneha',
    email: 'sneha@galgotias.edu',
    password: DEMO_PASSWORD_HASH,
    name: 'Sneha Gupta',
    handle: '@sneha_alumni',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Alumnus (Placed @ Top Tech)',
    badge: 'Alumnus',
    department: 'School of Computer Science & Engineering',
    bio: 'SDE-1 placed through Galgotias University campus drive.',
    karma: 3410,
  }
];

const UPCOMING_EVENTS = [
  { title: 'SCSE CAT-2 Examinations', date: 'Sep 02, 2026', tag: 'Academic' },
  { title: 'TCS & Infosys Placement Drive', date: 'Sep 10, 2026', tag: 'Placement' },
  { title: 'GU Annual Hackathon (G-Quasar)', date: 'Nov 14, 2026', tag: 'Unifest' },
];

const INITIAL_POSTS = [
  {
    id: 'post-1',
    channelId: 'scse-computer-science',
    channelName: 'c/scse-computer-science',
    title: 'How to prepare for Data Structures & Algorithms CAT-2 Exam? SCSE 2nd Year Roadmap',
    content: `Hey Galgotians! 🎓

CAT-2 exams are right around the corner for Block A SCSE students. A lot of juniors have been asking about how to handle the **Trees & Dynamic Programming** modules for DSA.

### Recommended Study Blueprint:
1. **Binary Search Trees & AVL Rotations**: Make sure you practice left-right rotation dry runs on paper. Professor often asks 5-mark numericals on balanced BST creation.
2. **Graph Algorithms**: BFS, DFS, and Dijkstra's algorithm.
3. **Previous Year Papers**: Check the library repository or the link in the comments below.

\`\`\`python
# Sample Binary Tree Inorder Traversal
def inorder(root):
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)
\`\`\`

Feel free to post your doubts below. TAs are actively monitoring this thread!`,
    authorId: 'usr_rohan',
    authorName: 'Rohan Verma',
    authorHandle: '@rohan_scse',
    authorRole: 'SCSE Teaching Assistant',
    authorBadge: 'TA / Teaching Assistant',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2 hours ago',
    votes: 42,
    commentCount: 6,
    views: 380,
    tags: JSON.stringify(['CAT Prep', 'Lab Manual']),
    isSolved: true,
    solvedCommentId: 'c-1-1',
    isPinned: true,
    comments: [
      {
        id: 'c-1-1',
        authorId: 'usr_priya',
        authorName: 'Priya Nair',
        authorHandle: '@priya_ai',
        authorRole: 'B.Tech CSE (AI Specialization)',
        authorBadge: 'Top Contributor',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        content: 'Here is the Google Drive link to previous 3 years CAT-2 question papers curated by GU CS Society: [Drive Link - SCSE DSA Papers](https://drive.google.com/sample). Make sure to practice the graph traversal problems!',
        createdAt: '1 hour ago',
        votes: 18,
        isSolution: true,
        replies: [
          {
            id: 'c-1-1-1',
            authorId: 'usr_me',
            authorName: 'Aryan Sharma',
            authorHandle: '@aryan_scse24',
            authorRole: 'SCSE 3rd Year (AI & ML)',
            authorBadge: 'SCSE Senior',
            authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            content: 'Thank you so much Priya Didi! Are AVL Tree rotations included in Set-A as well?',
            createdAt: '45 mins ago',
            votes: 5,
            isSolution: false,
            replies: [
              {
                id: 'c-1-1-1-1',
                authorId: 'usr_priya',
                authorName: 'Priya Nair',
                authorHandle: '@priya_ai',
                authorRole: 'B.Tech CSE (AI Specialization)',
                authorBadge: 'Top Contributor',
                authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                content: 'Yes Aryan! Both Set-A and Set-B will have at least one rotation problem.',
                createdAt: '30 mins ago',
                votes: 4,
                isSolution: false,
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'post-2',
    channelId: 'gu-placements',
    channelName: 'c/gu-placements',
    title: 'Off-Campus & On-Campus Placement Experience: SDE-1 at Top Tech Firm (32 LPA Package)',
    content: `Greetings everyone! I recently got placed as an SDE-1 through Galgotias University placement drive. 🚀

### Round 1: Online Assessment (Coding + CS Fundamentals)
- 2 LeetCode Medium Questions (Sliding Window & Tree BFS)
- 20 MCQs on OS (Paging, Threading), DBMS (SQL Joins, Normalization), and Computer Networks (TCP/IP 3-way handshake).

### Round 2: Technical Interview 1
- Deep dive into my B.Tech final year Capstone project built with React and Node.js.
- System Design question: *Design a rate limiter for a university portal like GU Campus Bridge.*

### Key Advice for Juniors:
1. Don't skip OS and DBMS concepts; GU placement team heavily emphasizes core CS fundamentals.
2. Solve at least 250+ LeetCode problems (focus on Patterns over quantity).`,
    authorId: 'usr_sneha',
    authorName: 'Sneha Gupta',
    authorHandle: '@sneha_alumni',
    authorRole: 'Alumnus (Placed @ Top Tech)',
    authorBadge: 'Alumnus',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '5 hours ago',
    votes: 89,
    commentCount: 4,
    views: 1240,
    tags: JSON.stringify(['Placement Drive', 'Faculty Q&A']),
    isSolved: false,
    solvedCommentId: null,
    isPinned: false,
    comments: [
      {
        id: 'c-2-1',
        authorId: 'usr_me',
        authorName: 'Aryan Sharma',
        authorHandle: '@aryan_scse24',
        authorRole: 'SCSE 3rd Year (AI & ML)',
        authorBadge: 'SCSE Senior',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Hearty congratulations Sneha! Did they ask any System Design questions to 3rd years as well during internship shortlisting?',
        createdAt: '4 hours ago',
        votes: 7,
        isSolution: false,
      }
    ]
  },
  {
    id: 'post-3',
    channelId: 'campus-life',
    channelName: 'c/campus-life',
    title: 'Galgotias Unifest 2026 / G-Quasar Registration Open! Hackathon & Cultural Events',
    content: `🎉 **Galgotias Unifest is back!** 

Registrations for **G-Hackathon** and **Battle of Bands** are now live on the student portal. 

- **Dates**: November 14 - 16, 2026
- **Venue**: Main Lawn & GU Amphitheatre
- **Cash Prize Pool**: ₹2,50,000+

Looking for team members for the 24-hour Web3 & AI Hackathon! Need 1 Frontend developer and 1 UI designer. DM or reply below!`,
    authorId: 'usr_me',
    authorName: 'Aryan Sharma',
    authorHandle: '@aryan_scse24',
    authorRole: 'SCSE 3rd Year (AI & ML)',
    authorBadge: 'SCSE Senior',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '1 day ago',
    votes: 64,
    commentCount: 8,
    views: 920,
    tags: JSON.stringify(['Unifest', 'Project Partner']),
    isSolved: false,
    solvedCommentId: null,
    isPinned: false,
    comments: []
  }
];

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
