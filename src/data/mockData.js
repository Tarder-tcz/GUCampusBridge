// Seed dataset for Galgotias University Campus Bridge (GUCampusBridge)

export const GU_CHANNELS = [
  { id: 'all', name: 'All Discussions', icon: 'Sparkles', count: 48 },
  { id: 'scse-computer-science', name: 'c/scse-computer-science', label: 'SCSE (CSE/AI/DS)', icon: 'Code2', count: 18 },
  { id: 'soe-engineering', name: 'c/soe-engineering', label: 'SOE (ECE/Mech/Civil)', icon: 'Cpu', count: 9 },
  { id: 'sob-management', name: 'c/sob-management', label: 'SOB (MBA/BBA)', icon: 'TrendingUp', count: 7 },
  { id: 'gu-placements', name: 'c/gu-placements', label: 'Placements & Internships', icon: 'Briefcase', count: 12 },
  { id: 'exam-cell', name: 'c/exam-cell', label: 'Exam Cell & CAT Prep', icon: 'GraduationCap', count: 15 },
  { id: 'campus-life', name: 'c/campus-life', label: 'Campus Life & Unifest', icon: 'Music', count: 11 },
];

export const GU_TAGS = [
  { id: 'cat-prep', name: 'CAT Prep' },
  { id: 'end-sem', name: 'End-Sem Exam' },
  { id: 'placement-drive', name: 'Placement Drive' },
  { id: 'lab-manual', name: 'Lab Manual' },
  { id: 'project-partner', name: 'Project Partner' },
  { id: 'unifest', name: 'Unifest / G-Quasar' },
  { id: 'faculty-qa', name: 'Faculty Q&A' },
  { id: 'hostel-query', name: 'Hostel & Transport' },
];

export const GUEST_USER = {
  id: 'usr_guest',
  name: 'Guest Visitor',
  handle: '@guest_user',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'Campus Visitor',
  badge: 'Guest',
  department: 'Galgotias University',
  bio: 'Sign in to participate in campus discussions and post replies.',
  karma: 0,
  isGuest: true,
  upvotedPostIds: [],
  downvotedPostIds: [],
  upvotedCommentIds: [],
  savedPostIds: [],
};

export const CURRENT_USER = GUEST_USER;

export const INITIAL_POSTS = [];

export const UPCOMING_EVENTS = [
  { title: 'SCSE CAT-2 Examinations', date: 'Sep 02, 2026', tag: 'Academic' },
  { title: 'TCS & Infosys Placement Drive', date: 'Sep 10, 2026', tag: 'Placement' },
  { title: 'GU Annual Hackathon (G-Quasar)', date: 'Nov 14, 2026', tag: 'Unifest' },
];
