import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { execSync } from 'child_process';

const { PrismaClient } = pkg;
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'GU_CAMPUS_BRIDGE_SECRET_KEY_2026';

// Auto-initialize SQLite database schema and default records on boot
try {
  console.log('Ensuring database schema and seeds are initialized...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  execSync('node prisma/seed.js', { stdio: 'inherit' });
} catch (e) {
  console.warn('Database startup check notice:', e.message);
}

app.use(cors());
app.use(express.json());

// Root Health & API Info Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🚀 GUCampusBridge REST API Server is running!',
    endpoints: {
      posts: '/api/posts',
      channels: '/api/channels',
      tags: '/api/tags',
      events: '/api/events',
      auth: '/api/auth/me'
    }
  });
});

// Auth Token Verification Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.userId = 'usr_me'; // Fallback for guest/demo operations
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.userId = 'usr_me';
    } else {
      req.userId = decoded.id;
    }
    next();
  });
}

// Helper to format user response (excluding password hash)
function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    handle: user.handle,
    avatar: user.avatar,
    role: user.role,
    badge: user.badge,
    department: user.department,
    bio: user.bio,
    karma: user.karma,
    upvotedPostIds: JSON.parse(user.upvotedPostIds || '[]'),
    downvotedPostIds: JSON.parse(user.downvotedPostIds || '[]'),
    upvotedCommentIds: JSON.parse(user.upvotedCommentIds || '[]'),
    savedPostIds: JSON.parse(user.savedPostIds || '[]'),
  };
}

// Helper to format comment recursively with author object
function formatComment(comment) {
  return {
    id: comment.id,
    author: {
      name: comment.authorName,
      handle: comment.authorHandle,
      role: comment.authorRole,
      badge: comment.authorBadge,
      avatar: comment.authorAvatar,
    },
    content: comment.content,
    createdAt: comment.createdAt,
    votes: comment.votes,
    isSolution: comment.isSolution,
    replies: (comment.replies || []).map(formatComment)
  };
}

// Helper to format post with author object and parsed tags
function formatPost(post) {
  let parsedTags = [];
  try {
    parsedTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
  } catch (e) {
    parsedTags = [];
  }

  return {
    id: post.id,
    channelId: post.channelId,
    channelName: post.channelName,
    title: post.title,
    content: post.content,
    author: {
      name: post.authorName,
      handle: post.authorHandle,
      role: post.authorRole,
      badge: post.authorBadge,
      avatar: post.authorAvatar,
    },
    createdAt: post.createdAt,
    votes: post.votes,
    commentCount: post.commentCount,
    views: post.views,
    tags: parsedTags,
    isSolved: post.isSolved,
    solvedCommentId: post.solvedCommentId,
    isPinned: post.isPinned,
    comments: (post.comments || []).filter(c => !c.parentId).map(formatComment)
  };
}

/* ==========================================
   AUTHENTICATION & PROFILING ENDPOINTS
   ========================================== */

// POST /api/auth/signup - Register new account
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, handle, role, department, bio, avatar } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check existing email
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Generated handle if not provided
    const userHandle = handle || `@${name.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(100 + Math.random() * 900)}`;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userAvatar = avatar || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`;

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        handle: userHandle,
        avatar: userAvatar,
        role: role || 'SCSE B.Tech Student',
        badge: 'GU Student',
        department: department || 'School of Computer Science & Engineering',
        bio: bio || 'Galgotias University Student',
        karma: 100
      }
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: formatUser(newUser)
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/auth/login - Authenticate user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: formatUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me - Fetch authenticated profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) return res.json(formatUser(defaultUser));
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// PUT /api/auth/profile - Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, handle, role, department, bio, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(handle && { handle }),
        ...(role && { role }),
        ...(department && { department }),
        ...(bio && { bio }),
        ...(avatar && { avatar })
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: formatUser(updatedUser)
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

/* ==========================================
   FORUM API ENDPOINTS
   ========================================== */

// GET /api/user
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    let user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      user = await prisma.user.findFirst();
    }
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/channels
app.get('/api/channels', async (req, res) => {
  try {
    const channels = await prisma.channel.findMany();
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// GET /api/tags
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// GET /api/events
app.get('/api/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { id: 'desc' },
      include: {
        comments: {
          include: {
            replies: {
              include: { replies: true }
            }
          }
        }
      }
    });

    res.json(posts.map(formatPost));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/posts/:id - Fetch single post by unique ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        comments: {
          include: {
            replies: {
              include: { replies: true }
            }
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await prisma.post.update({
      where: { id },
      data: { views: post.views + 1 }
    });

    res.json(formatPost(post));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/posts
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, channelId, tags } = req.body;
    let user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) user = await prisma.user.findFirst();

    const channel = await prisma.channel.findUnique({ where: { id: channelId } });
    const channelName = channel ? channel.name : 'c/scse-computer-science';

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        channelId,
        channelName,
        tags: JSON.stringify(tags || []),
        authorId: user ? user.id : null,
        authorName: user?.name || 'Aryan Sharma',
        authorHandle: user?.handle || '@aryan_scse24',
        authorRole: user?.role || 'SCSE 3rd Year',
        authorBadge: user?.badge || 'SCSE Senior',
        authorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: 'Just now',
        votes: 1,
        commentCount: 0,
        views: 1,
        isSolved: false,
        isPinned: false
      },
      include: { comments: true }
    });

    if (user) {
      try {
        let upvotedArr = [];
        try {
          upvotedArr = typeof user.upvotedPostIds === 'string' ? JSON.parse(user.upvotedPostIds || '[]') : (user.upvotedPostIds || []);
          if (!Array.isArray(upvotedArr)) upvotedArr = [];
        } catch (e) {
          upvotedArr = [];
        }
        if (!upvotedArr.includes(newPost.id)) {
          upvotedArr.push(newPost.id);
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { upvotedPostIds: JSON.stringify(upvotedArr) }
        });
      } catch (userErr) {
        console.warn('User upvote sync notice:', userErr.message);
      }
    }

    res.status(201).json(formatPost(newPost));
  } catch (err) {
    console.error('Post creation endpoint error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST /api/posts/:id/vote
app.post('/api/posts/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    const post = await prisma.post.findUnique({ where: { id } });
    let user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) user = await prisma.user.findFirst();
    if (!post || !user) return res.status(404).json({ error: 'Post or user not found' });

    let upvotedArr = JSON.parse(user.upvotedPostIds || '[]');
    let downvotedArr = JSON.parse(user.downvotedPostIds || '[]');
    let isUpvoted = upvotedArr.includes(id);
    let isDownvoted = downvotedArr.includes(id);

    let voteChange = 0;

    if (direction === 'up') {
      if (isUpvoted) {
        voteChange = -1;
        upvotedArr = upvotedArr.filter(i => i !== id);
      } else {
        voteChange = isDownvoted ? 2 : 1;
        upvotedArr.push(id);
        downvotedArr = downvotedArr.filter(i => i !== id);
      }
    } else {
      if (isDownvoted) {
        voteChange = 1;
        downvotedArr = downvotedArr.filter(i => i !== id);
      } else {
        voteChange = isUpvoted ? -2 : -1;
        downvotedArr.push(id);
        upvotedArr = upvotedArr.filter(i => i !== id);
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { votes: post.votes + voteChange },
      include: {
        comments: {
          include: {
            replies: { include: { replies: true } }
          }
        }
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        upvotedPostIds: JSON.stringify(upvotedArr),
        downvotedPostIds: JSON.stringify(downvotedArr),
      }
    });

    res.json({
      post: formatPost(updatedPost),
      user: formatUser(updatedUser)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// POST /api/posts/:id/bookmark
app.post('/api/posts/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) user = await prisma.user.findFirst();
    if (!user) return res.status(404).json({ error: 'User not found' });

    let saved = JSON.parse(user.savedPostIds || '[]');
    const isSaved = saved.includes(id);

    if (isSaved) {
      saved = saved.filter(i => i !== id);
    } else {
      saved.push(id);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { savedPostIds: JSON.stringify(saved) }
    });

    res.json({ savedPostIds: JSON.parse(updatedUser.savedPostIds) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// POST /api/posts/:id/comments
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { parentCommentId, content } = req.body;

    let user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) user = await prisma.user.findFirst();
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) return res.status(404).json({ error: 'Post not found' });

    await prisma.comment.create({
      data: {
        postId: id,
        parentId: parentCommentId || null,
        content,
        authorName: user?.name || 'Aryan Sharma',
        authorHandle: user?.handle || '@aryan_scse24',
        authorRole: user?.role || 'SCSE 3rd Year',
        authorBadge: user?.badge || 'SCSE Senior',
        authorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: 'Just now',
        votes: 1,
        isSolution: false
      }
    });

    await prisma.post.update({
      where: { id },
      data: { commentCount: post.commentCount + 1 }
    });

    const updatedPost = await prisma.post.findUnique({
      where: { id },
      include: {
        comments: {
          include: {
            replies: { include: { replies: true } }
          }
        }
      }
    });

    res.status(201).json(formatPost(updatedPost));
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

/* ==========================================
   1-ON-1 MENTORSHIP & STAFF PORTAL ENDPOINTS
   ========================================== */

// GET /api/mentors - List mentors with optional department filter
app.get('/api/mentors', async (req, res) => {
  try {
    const { department } = req.query;
    let mentors;
    if (department && department !== 'all') {
      mentors = await prisma.staffMentor.findMany({
        where: {
          department: {
            contains: department,
            mode: 'insensitive'
          }
        }
      });
    } else {
      mentors = await prisma.staffMentor.findMany();
    }
    res.json(mentors.map(m => {
      const { password, ...mClean } = m;
      return mClean;
    }));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentors list' });
  }
});

// POST /api/mentorship-requests - Submit student 1-on-1 request
app.post('/api/mentorship-requests', async (req, res) => {
  try {
    const { admissionNo, studentName, contactNo, studentDepartment, reason, mentorId } = req.body;

    if (!admissionNo || !studentName || !contactNo || !reason || !mentorId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const mentor = await prisma.staffMentor.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      return res.status(404).json({ error: 'Selected mentor not found' });
    }

    const request = await prisma.mentorshipRequest.create({
      data: {
        admissionNo,
        studentName,
        contactNo,
        studentDepartment: studentDepartment || 'General Student',
        reason,
        mentorId,
        mentorName: mentor.name,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: '1-on-1 Mentorship Request submitted successfully!',
      request
    });
  } catch (err) {
    console.error('Mentorship request submission error:', err);
    res.status(500).json({ error: 'Failed to submit mentorship request' });
  }
});

// POST /api/staff/login - Staff / Mentor Login using special tag and password
app.post('/api/staff/login', async (req, res) => {
  try {
    const { specialTag, password } = req.body;

    if (!specialTag || !password) {
      return res.status(400).json({ error: 'Special Tag and Password are required' });
    }

    let tagToSearch = specialTag.trim();

    let staff = await prisma.staffMentor.findFirst({
      where: { specialTag: { equals: tagToSearch, mode: 'insensitive' } }
    });

    if (!staff) {
      // Flexible alias lookup (e.g. PROF-CSE-101 maps to PROF-SCSE-101)
      const altTag = tagToSearch.replace('CSE', 'SCSE');
      staff = await prisma.staffMentor.findFirst({
        where: { specialTag: { equals: altTag, mode: 'insensitive' } }
      });
    }

    if (!staff) {
      return res.status(401).json({ error: 'Invalid Staff Special Tag or Password' });
    }

    const isMatch = bcrypt.compareSync(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Staff Special Tag or Password' });
    }

    const token = jwt.sign({ id: staff.id, role: 'STAFF', specialTag: staff.specialTag }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...staffClean } = staff;

    res.json({
      message: 'Staff login successful',
      token,
      staff: staffClean
    });
  } catch (err) {
    console.error('Staff login error:', err);
    res.status(500).json({ error: 'Staff authentication failed' });
  }
});

// GET /api/staff/requests - Fetch incoming requests for logged in staff mentor
app.get('/api/staff/requests', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Staff authentication token missing' });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.role !== 'STAFF') {
      return res.status(403).json({ error: 'Access denied: Staff login required' });
    }

    const requests = await prisma.mentorshipRequest.findMany({
      where: { mentorId: decoded.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff requests' });
  }
});

// PUT /api/staff/requests/:id - Update status and send reply answer
app.put('/api/staff/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, replyMessage } = req.body;

    const updated = await prisma.mentorshipRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(replyMessage !== undefined && { replyMessage })
      }
    });

    res.json({
      message: 'Request updated successfully',
      request: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update mentorship request' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 GUCampusBridge Auth Server running on http://localhost:${PORT}`);
});

