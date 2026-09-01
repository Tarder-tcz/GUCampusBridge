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

const DEMO_STAFF_PASSWORD_HASH = bcrypt.hashSync('StaffPassword123!', 10);

const STAFF_MENTORS = [
  {
    id: 'staff_1',
    email: 'ananya.sharma@galgotias.edu',
    password: DEMO_STAFF_PASSWORD_HASH,
    specialTag: 'PROF-SCSE-101',
    name: 'Dr. Ananya Sharma',
    role: 'Professor & AI Lead',
    department: 'School of Computer Science & Engineering (SCSE)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Professor of AI & Machine Learning. Guidance in research papers, capstone projects, and DSA.'
  },
  {
    id: 'staff_2',
    email: 'rajesh.kumar@galgotias.edu',
    password: DEMO_STAFF_PASSWORD_HASH,
    specialTag: 'PROF-SOE-202',
    name: 'Prof. Rajesh Kumar',
    role: 'Senior Faculty & HOD',
    department: 'School of Engineering (SOE)',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    bio: 'Mechanical Engineering Senior Faculty. Robotics & Industrial Automation mentor.'
  },
  {
    id: 'staff_3',
    email: 'priya.nair@galgotias.edu',
    password: DEMO_STAFF_PASSWORD_HASH,
    specialTag: 'VOL-SCSE-303',
    name: 'Priya Nair',
    role: 'Student Volunteer & Peer TA',
    department: 'School of Computer Science & Engineering (SCSE)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: '4th Year CSE Top Contributor. Peer-to-peer tutoring for CAT exams & placement prep.'
  },
  {
    id: 'staff_4',
    email: 'vikram.roy@galgotias.edu',
    password: DEMO_STAFF_PASSWORD_HASH,
    specialTag: 'STAFF-SOB-404',
    name: 'Dr. Vikramaditya Roy',
    role: 'Academic Counselor & MBA Mentor',
    department: 'School of Business (SOB)',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    bio: 'School of Business Senior Counselor. Corporate relations & internship guidance.'
  },
  {
    id: 'staff_5',
    email: 'placement.cell@galgotias.edu',
    password: DEMO_STAFF_PASSWORD_HASH,
    specialTag: 'STAFF-PLACE-505',
    name: 'Placement & Corporate Cell',
    role: 'Placement Officer',
    department: 'Placements & Corporate Relations',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    bio: 'Galgotias Placement Cell Representatives for campus hiring and internship queries.'
  }
];

const INITIAL_POSTS = [];

async function seed() {
  console.log('Seeding relational PostgreSQL database...');

  // Reset database tables
  await prisma.mentorshipRequest.deleteMany({});
  await prisma.staffMentor.deleteMany({});
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

  // Insert tags
  for (const tg of GU_TAGS) {
    await prisma.tag.create({ data: tg });
  }

  // Insert events
  for (const ev of UPCOMING_EVENTS) {
    await prisma.event.create({ data: ev });
  }

  // Insert Staff Mentors
  for (const st of STAFF_MENTORS) {
    await prisma.staffMentor.create({ data: st });
  }

  console.log('Successfully seeded relational database with Staff Mentors!');
}

seed()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
