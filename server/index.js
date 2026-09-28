import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { PrismaClient } = pkg;
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'GU_CAMPUS_BRIDGE_SECRET_KEY_2026';
const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg';

// Auto-initialize database schema, default records, and reconcile comment counters on boot
async function reconcileCommentCounts() {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        commentCount: true,
        _count: { select: { comments: true } }
      }
    });
    let updatedCount = 0;
    for (const post of posts) {
      if (post.commentCount !== post._count.comments) {
        await prisma.post.update({
          where: { id: post.id },
          data: { commentCount: post._count.comments }
        });
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      console.log(`✅ Reconciled commentCount for ${updatedCount} posts to match actual comments in database!`);
    }
  } catch (err) {
    console.warn('Comment count reconcile notice:', err.message);
  }
}

try {
  console.log('Ensuring database schema and seeds are initialized...');
  execSync('node prisma/seed.js', { stdio: 'inherit' });
  reconcileCommentCounts();
} catch (e) {
  console.warn('Database startup check notice:', e.message);
}

app.use(cors());
app.use(express.json());

// Root Health & API Info Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🚀 GUCampusBridge RBAC Secured REST API Server is running!',
    endpoints: {
      posts: '/api/posts',
      channels: '/api/channels',
      tags: '/api/tags',
      events: '/api/events',
      auth: '/api/auth/me',
      admin: '/api/admin/invites'
    }
  });
});

/* ==========================================
   RBAC MIDDLEWARE & AUDIT LOGGING
   ========================================== */

// Auth Token Verification Middleware: decodes token and sets req.user = { id, email, role }
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.userId = 'usr_me'; // Guest identifier
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      req.userId = 'usr_me';
      req.user = null;
    } else {
      req.userId = decoded.id;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'STUDENT'
      };
    }
    next();
  });
}

// Require valid authentication (No guest access)
function requireAuth(req, res, next) {
  if (!req.user || !req.user.id || req.user.id === 'usr_me') {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

// Require explicit Role tier (STUDENT, FACULTY, ADMIN)
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to ${allowedRoles.join(' or ')} accounts.`,
        currentRole: req.user.role,
        requiredRoles: allowedRoles
      });
    }
    next();
  };
}

// Audit Logger helper: writes immutable records to AuditLog table
async function createAuditLog({ userId, userEmail, userRole, action, resource, metadata = {}, req = null }) {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null) : null;
    const userAgent = req ? (req.headers['user-agent'] || null) : null;
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || null,
        userRole: userRole || null,
        action,
        resource,
        ipAddress: typeof ipAddress === 'string' ? ipAddress : null,
        userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 255) : null,
        metadata: JSON.stringify(metadata)
      }
    });
  } catch (err) {
    console.warn('Failed to record audit log:', err.message);
  }
}

// RFC 6238 TOTP Helpers using Node.js crypto
function generateTOTP(secret, windowOffset = 0) {
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  const counter = Math.floor(epoch / timeStep) + windowOffset;
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));
  const key = Buffer.from(secret, 'hex');
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
  return code;
}

function verifyTOTP(secret, inputCode) {
  if (!secret || !inputCode) return false;
  for (let offset = -1; offset <= 1; offset++) {
    if (generateTOTP(secret, offset) === inputCode.trim()) {
      return true;
    }
  }
  return false;
}

// Helper to format user response (excluding password hash)
function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    handle: user.handle,
    avatar: user.avatar,
    role: user.role || 'STUDENT',
    headline: user.headline || user.role || 'Student',
    badge: user.badge || user.role || 'Student',
    department: user.department,
    bio: user.bio,
    karma: user.karma,
    mfaEnabled: !!user.mfaEnabled,
    specialTag: user.specialTag || null,
    upvotedPostIds: JSON.parse(user.upvotedPostIds || '[]'),
    downvotedPostIds: JSON.parse(user.downvotedPostIds || '[]'),
    upvotedCommentIds: JSON.parse(user.upvotedCommentIds || '[]'),
    savedPostIds: JSON.parse(user.savedPostIds || '[]'),
  };
}

// Helper to calculate relative time ago
function formatTimeAgo(dateInput) {
  if (!dateInput) return 'Just now';
  if (dateInput === 'Just now') return 'Just now';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return dateInput;
  }

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
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
    createdAt: formatTimeAgo(comment.createdAt),
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

  const actualCommentCount = post._count?.comments !== undefined
    ? post._count.comments
    : (Array.isArray(post.comments) ? post.comments.length : (post.commentCount ?? 0));

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
    createdAt: formatTimeAgo(post.createdAt),
    votes: post.votes,
    commentCount: actualCommentCount,
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

// POST /api/auth/signup - Register new student account (Public signup STRICTLY defaults to STUDENT)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, handle, department, bio, avatar, headline } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check existing email
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // STRICT SECURITY RULE: Public sign-ups strictly default to STUDENT role.
    // Privileged tiers (FACULTY, ADMIN) can never be self-assigned.
    const userRole = 'STUDENT';
    const userHandle = handle || `@${name.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(100 + Math.random() * 900)}`;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userAvatar = avatar || DEFAULT_AVATAR;

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        handle: userHandle,
        avatar: userAvatar,
        role: userRole,
        headline: headline || 'Student Member',
        badge: 'GU Student',
        department: department || 'School of Computer Science & Engineering',
        bio: bio || 'Galgotias University Student',
        karma: 100
      }
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    await createAuditLog({
      userId: newUser.id,
      userEmail: newUser.email,
      userRole: newUser.role,
      action: 'PUBLIC_STUDENT_SIGNUP',
      resource: `user:${newUser.id}`,
      metadata: { department: newUser.department },
      req
    });

    res.status(201).json({
      message: 'Account created successfully (Student Tier)',
      token,
      user: formatUser(newUser)
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/auth/login - Authenticate user across all tiers (Student, Faculty, Admin)
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
      await createAuditLog({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'FAILED_LOGIN_ATTEMPT',
        resource: `user:${user.id}`,
        metadata: { reason: 'invalid_password' },
        req
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Two-Factor Authentication Check for MFA-enabled accounts
    if (user.mfaEnabled) {
      const tempToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, mfaPending: true },
        JWT_SECRET,
        { expiresIn: '10m' }
      );
      return res.json({
        mfaRequired: true,
        tempToken,
        message: 'Two-Factor Authentication required. Please enter your 6-digit TOTP code.'
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'LOGIN_SUCCESS',
      resource: `user:${user.id}`,
      metadata: { role: user.role },
      req
    });

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

// POST /api/auth/mfa/challenge - Verify 2FA code during login
app.post('/api/auth/mfa/challenge', async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      return res.status(400).json({ error: 'tempToken and 6-digit verification code are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'MFA session expired. Please log in again.' });
    }

    if (!decoded.mfaPending) {
      return res.status(400).json({ error: 'Invalid MFA session' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ error: 'MFA is not configured for this account' });
    }

    const isValid = verifyTOTP(user.mfaSecret, code);
    if (!isValid) {
      await createAuditLog({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'FAILED_MFA_CHALLENGE',
        resource: `user:${user.id}`,
        req
      });
      return res.status(401).json({ error: 'Invalid 2FA code. Please check your authenticator app.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'MFA_LOGIN_SUCCESS',
      resource: `user:${user.id}`,
      metadata: { role: user.role },
      req
    });

    res.json({
      message: 'Two-factor authentication verified',
      token,
      user: formatUser(user)
    });
  } catch (err) {
    console.error('MFA challenge error:', err);
    res.status(500).json({ error: 'MFA verification failed' });
  }
});

// POST /api/auth/mfa/setup - Generate TOTP Secret (Protected)
app.post('/api/auth/mfa/setup', authenticateToken, requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const secret = crypto.randomBytes(20).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecret: secret }
    });

    const uri = `otpauth://totp/Galgotias%20CampusBridge:${encodeURIComponent(user.email)}?secret=${secret}&issuer=Galgotias%20University`;

    res.json({
      secret,
      uri,
      backupCodes: [
        crypto.randomBytes(3).toString('hex').toUpperCase(),
        crypto.randomBytes(3).toString('hex').toUpperCase(),
        crypto.randomBytes(3).toString('hex').toUpperCase()
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate MFA setup' });
  }
});

// POST /api/auth/mfa/verify - Confirm and enable MFA on account
app.post('/api/auth/mfa/verify', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Verification code required' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.mfaSecret) {
      return res.status(400).json({ error: 'MFA setup has not been initiated' });
    }

    const isValid = verifyTOTP(user.mfaSecret, code);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true }
    });

    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'MFA_ACTIVATED',
      resource: `user:${user.id}`,
      req
    });

    res.json({
      message: 'MFA successfully enabled on your account',
      user: formatUser(updated)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to activate MFA' });
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

// PUT /api/auth/profile - Update user profile (Role CANNOT be changed self-service!)
app.put('/api/auth/profile', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { name, handle, department, bio, avatar, headline } = req.body;

    // Notice: role is deliberately ignored here to protect RBAC boundaries!
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(handle && { handle }),
        ...(headline && { headline }),
        ...(department && { department }),
        ...(bio && { bio }),
        ...(avatar && { avatar })
      }
    });

    await createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'PROFILE_UPDATED',
      resource: `user:${req.user.id}`,
      req
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

/* =========================================================
   ADMIN PRIVILEGED ONBOARDING & INVITE SYSTEM (RBAC)
   ========================================================= */

// POST /api/admin/invites - Issue time-limited cryptographic invite for Faculty or Admin
app.post('/api/admin/invites', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { email, role = 'FACULTY', department = 'School of Computer Science & Engineering' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid institutional email address is required' });
    }

    if (!['FACULTY', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Privileged role must be either FACULTY or ADMIN' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.role === role) {
      return res.status(400).json({ error: `An active account with ${role} privileges already exists for ${email}` });
    }

    // Generate 32-byte cryptographically random raw token
    const rawToken = crypto.randomBytes(32).toString('hex');
    // Store SHA-256 hash in database
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days validity

    const invitation = await prisma.pendingInvitation.upsert({
      where: { email },
      update: {
        role,
        department,
        tokenHash,
        invitedBy: req.user.id,
        invitedByName: req.user.email,
        expiresAt,
        isAccepted: false,
        acceptedAt: null
      },
      create: {
        email,
        role,
        department,
        tokenHash,
        invitedBy: req.user.id,
        invitedByName: req.user.email,
        expiresAt
      }
    });

    await createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: `INVITE_${role}_GENERATED`,
      resource: `invitation:${invitation.id}`,
      metadata: { targetEmail: email, role, department },
      req
    });

    res.status(201).json({
      message: `Privileged invitation generated for ${email} (${role})`,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        department: invitation.department,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt
      },
      token: rawToken,
      inviteUrl: `/claim-invite?token=${rawToken}`
    });
  } catch (err) {
    console.error('Invite generation error:', err);
    res.status(500).json({ error: 'Failed to generate invitation' });
  }
});

// GET /api/admin/invites - List pending & accepted invitations (Admin only)
app.get('/api/admin/invites', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const invites = await prisma.pendingInvitation.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(invites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// DELETE /api/admin/invites/:id - Revoke pending invitation (Admin only)
app.delete('/api/admin/invites/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await prisma.pendingInvitation.delete({ where: { id } });

    await createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'INVITE_REVOKED',
      resource: `invitation:${id}`,
      metadata: { email: deleted.email },
      req
    });

    res.json({ message: 'Invitation revoked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke invitation' });
  }
});

// GET /api/invites/verify/:token - Verify token before claiming (Public endpoint)
app.get('/api/invites/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ error: 'Token missing' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const invitation = await prisma.pendingInvitation.findUnique({ where: { tokenHash } });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation link is invalid or does not exist.' });
    }

    if (invitation.isAccepted) {
      return res.status(400).json({ error: 'This invitation has already been claimed and activated.' });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      return res.status(400).json({ error: 'This invitation link has expired. Please request a new invite from the university administrator.' });
    }

    res.json({
      valid: true,
      email: invitation.email,
      role: invitation.role,
      department: invitation.department,
      expiresAt: invitation.expiresAt
    });
  } catch (err) {
    console.error('Invite verification error:', err);
    res.status(500).json({ error: 'Failed to verify invitation' });
  }
});

// POST /api/invites/claim - Activate account with privileged role (Faculty/Admin)
app.post('/api/invites/claim', async (req, res) => {
  try {
    const { token, name, password, handle, bio, avatar } = req.body;

    if (!token || !name || !password) {
      return res.status(400).json({ error: 'Token, name, and password are required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const invitation = await prisma.pendingInvitation.findUnique({ where: { tokenHash } });

    if (!invitation || invitation.isAccepted || new Date() > new Date(invitation.expiresAt)) {
      return res.status(400).json({ error: 'Invalid or expired invitation token.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userHandle = handle || `@${name.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(100 + Math.random() * 900)}`;

    let user = await prisma.user.findUnique({ where: { email: invitation.email } });

    if (user) {
      // Elevate existing account to privileged role
      user = await prisma.user.update({
        where: { email: invitation.email },
        data: {
          name,
          password: hashedPassword,
          role: invitation.role,
          badge: invitation.role === 'ADMIN' ? 'Super Admin' : 'Faculty Member',
          headline: invitation.role === 'ADMIN' ? 'System Administrator' : `Faculty • ${invitation.department || 'Galgotias'}`,
          department: invitation.department || user.department,
          avatar: avatar || user.avatar,
          bio: bio || user.bio
        }
      });
    } else {
      // Create new privileged user
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          password: hashedPassword,
          name,
          handle: userHandle,
          avatar: avatar || DEFAULT_AVATAR,
          role: invitation.role,
          badge: invitation.role === 'ADMIN' ? 'Super Admin' : 'Faculty Member',
          headline: invitation.role === 'ADMIN' ? 'System Administrator' : `Faculty • ${invitation.department || 'Galgotias'}`,
          department: invitation.department || 'School of Computer Science & Engineering',
          bio: bio || `Galgotias University ${invitation.role === 'ADMIN' ? 'Administrator' : 'Faculty Member'}`,
          karma: invitation.role === 'ADMIN' ? 5000 : 1500
        }
      });
    }

    // Mark invitation as claimed
    await prisma.pendingInvitation.update({
      where: { id: invitation.id },
      data: {
        isAccepted: true,
        acceptedAt: new Date()
      }
    });

    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: `INVITE_${invitation.role}_CLAIMED`,
      resource: `user:${user.id}`,
      metadata: { invitationId: invitation.id },
      req
    });

    const authToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: `Account activated successfully as ${invitation.role}!`,
      token: authToken,
      user: formatUser(user)
    });
  } catch (err) {
    console.error('Invite claim error:', err);
    res.status(500).json({ error: 'Failed to claim invitation' });
  }
});

// GET /api/admin/audit-logs - Query immutable audit logs (Admin only)
app.get('/api/admin/audit-logs', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// GET /api/admin/users - Campus User Directory (Admin only)
app.get('/api/admin/users', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        avatar: true,
        role: true,
        headline: true,
        badge: true,
        department: true,
        karma: true,
        mfaEnabled: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campus directory' });
  }
});

// PUT /api/admin/users/:id/role - Alter user role with mandatory audit logging (Superadmin only)
app.put('/api/admin/users/:id/role', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole, reason = 'Administrative role reassignment' } = req.body;

    if (!['STUDENT', 'FACULTY', 'ADMIN'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid target role. Must be STUDENT, FACULTY, or ADMIN.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

    const previousRole = targetUser.role;
    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: newRole,
        badge: newRole === 'ADMIN' ? 'Super Admin' : newRole === 'FACULTY' ? 'Faculty Member' : 'Student'
      }
    });

    await createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'ADMIN_ROLE_MODIFIED',
      resource: `user:${id}`,
      metadata: { targetEmail: targetUser.email, previousRole, newRole, reason },
      req
    });

    res.json({
      message: `User role updated from ${previousRole} to ${newRole}`,
      user: formatUser(updated)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role' });
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

// GET /api/users/:userId/activity - Fetch user contributions (posts, comments, accepted answers)
app.get('/api/users/:userId/activity', authenticateToken, async (req, res) => {
  try {
    let { userId } = req.params;
    let targetUser = null;

    const rawId = userId ? decodeURIComponent(userId).trim() : '';
    const cleanId = rawId.replace(/^@/, '');

    if (rawId === 'me' || !rawId) {
      if (req.userId) {
        targetUser = await prisma.user.findUnique({ where: { id: req.userId } });
      }
      if (!targetUser) {
        targetUser = await prisma.user.findFirst();
      }
    } else {
      // Try by UUID
      try {
        targetUser = await prisma.user.findUnique({ where: { id: rawId } });
      } catch (e) {
        targetUser = null;
      }

      // Try by handle or name
      if (!targetUser) {
        targetUser = await prisma.user.findFirst({
          where: {
            OR: [
              { handle: { equals: rawId, mode: 'insensitive' } },
              { handle: { equals: `@${cleanId}`, mode: 'insensitive' } },
              { handle: { contains: cleanId, mode: 'insensitive' } },
              { name: { equals: cleanId, mode: 'insensitive' } }
            ]
          }
        });
      }
    }

    if (!targetUser) {
      targetUser = await prisma.user.findFirst();
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch user posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { authorId: targetUser.id },
          { authorName: { equals: targetUser.name, mode: 'insensitive' } },
          { authorHandle: { equals: targetUser.handle, mode: 'insensitive' } }
        ]
      },
      orderBy: { id: 'desc' },
      include: { comments: true }
    });

    // Fetch user comments
    const comments = await prisma.comment.findMany({
      where: {
        OR: [
          { authorName: { equals: targetUser.name, mode: 'insensitive' } },
          { authorHandle: { equals: targetUser.handle, mode: 'insensitive' } }
        ]
      },
      orderBy: { id: 'desc' }
    });

    // Filter accepted solutions
    const acceptedAnswers = comments.filter(c => c.isSolution);

    res.json({
      user: formatUser(targetUser),
      posts: posts.map(formatPost),
      comments: comments.map(formatComment),
      acceptedAnswers: acceptedAnswers.map(formatComment),
      stats: {
        totalPosts: posts.length,
        totalComments: comments.length,
        totalAnswers: acceptedAnswers.length
      }
    });
  } catch (err) {
    console.error('User activity fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch user activity' });
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
        _count: {
          select: { comments: true }
        },
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
        _count: {
          select: { comments: true }
        },
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
        authorAvatar: user?.avatar || DEFAULT_AVATAR,
        createdAt: new Date().toISOString(),
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
        authorAvatar: user?.avatar || DEFAULT_AVATAR,
        createdAt: new Date().toISOString(),
        votes: 1,
        isSolution: false
      }
    });

    const totalComments = await prisma.comment.count({ where: { postId: id } });
    await prisma.post.update({
      where: { id },
      data: { commentCount: totalComments }
    });

    const updatedPost = await prisma.post.findUnique({
      where: { id },
      include: {
        _count: {
          select: { comments: true }
        },
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

// DELETE /api/posts/:postId/comments/:commentId - Delete comment and recalculate comment count
app.delete('/api/posts/:postId/comments/:commentId', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // Allow author of comment or ADMIN
    if (comment.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    const remainingCount = await prisma.comment.count({ where: { postId } });
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: remainingCount }
    });

    await createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'COMMENT_DELETED',
      resource: `Post:${postId}/Comment:${commentId}`,
      metadata: { postId, commentId, remainingCount },
      req
    });

    res.json({ message: 'Comment deleted successfully', remainingCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

/* ==========================================
   1-ON-1 MENTORSHIP & STAFF PORTAL ENDPOINTS
   ========================================== */

// GET /api/mentors - List registered faculty mentors with optional department filter
app.get('/api/mentors', async (req, res) => {
  try {
    const { department } = req.query;
    const facultyWhere = {
      role: 'FACULTY'
    };

    if (department && department !== 'all' && department !== 'All Departments') {
      facultyWhere.department = {
        contains: department,
        mode: 'insensitive'
      };
    }

    const faculty = await prisma.user.findMany({
      where: facultyWhere,
      select: {
        id: true,
        name: true,
        email: true,
        headline: true,
        badge: true,
        department: true,
        avatar: true,
        bio: true,
        specialTag: true
      },
      orderBy: { name: 'asc' }
    });

    const mentors = faculty.map(f => ({
      id: f.id,
      name: f.name,
      email: f.email,
      role: f.headline || f.badge || 'Faculty Mentor',
      department: f.department || 'School of Computer Science & Engineering (SCSE)',
      avatar: f.avatar || DEFAULT_AVATAR,
      bio: f.bio || 'Available for private student consultations, project guidance, and academic mentoring.',
      specialTag: f.specialTag
    }));

    res.json(mentors);
  } catch (err) {
    console.error('Error fetching mentors:', err);
    res.status(500).json({ error: 'Failed to fetch mentors list' });
  }
});

// GET /api/faculty-responses - Fetch faculty responses (Account Specific)
app.get('/api/faculty-responses', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { department, search } = req.query;

    let whereClause = {
      replyMessage: { not: null }
    };

    if (department && department !== 'all' && department !== 'All Departments') {
      whereClause.OR = [
        { studentDepartment: { contains: department, mode: 'insensitive' } },
        { mentor: { department: { contains: department, mode: 'insensitive' } } }
      ];
    }

    // Role-based account-specific scoping:
    if (req.user.role === 'STUDENT') {
      // Students can ONLY view responses directed to their account
      const studentConditions = [
        { studentId: req.user.id }
      ];
      if (req.user.email) {
        studentConditions.push({ studentEmail: req.user.email });
      }
      const userProfile = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (userProfile?.name) {
        studentConditions.push({ studentName: { equals: userProfile.name, mode: 'insensitive' } });
      }

      if (whereClause.OR) {
        whereClause.AND = [
          { OR: whereClause.OR },
          { OR: studentConditions }
        ];
        delete whereClause.OR;
      } else {
        whereClause.OR = studentConditions;
      }
    } else if (req.user.role === 'FACULTY') {
      // Faculty can view responses authored by or assigned to them
      whereClause.mentorId = req.user.id;
    }
    // ADMIN can view all responses

    const mentorshipResponses = await prisma.mentorshipRequest.findMany({
      where: whereClause,
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            headline: true,
            badge: true,
            department: true,
            avatar: true,
            specialTag: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            handle: true,
            avatar: true,
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let formatted = mentorshipResponses.map(r => ({
      id: r.id,
      type: 'MENTORSHIP_ADVISORY',
      facultyName: r.mentor?.name || r.mentorName,
      facultyRole: r.mentor?.headline || r.mentor?.badge || 'Faculty Advisor',
      facultyDepartment: r.mentor?.department || r.studentDepartment,
      facultyAvatar: r.mentor?.avatar || DEFAULT_AVATAR,
      facultySpecialTag: r.mentor?.specialTag,
      studentId: r.studentId,
      studentName: r.studentName,
      studentDepartment: r.studentDepartment,
      admissionNo: r.admissionNo,
      inquiryTopic: r.reason,
      responseContent: r.replyMessage,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    if (search && search.trim()) {
      const q = search.toLowerCase();
      formatted = formatted.filter(item =>
        item.facultyName.toLowerCase().includes(q) ||
        item.facultyRole.toLowerCase().includes(q) ||
        item.facultyDepartment.toLowerCase().includes(q) ||
        item.studentName.toLowerCase().includes(q) ||
        item.inquiryTopic.toLowerCase().includes(q) ||
        item.responseContent.toLowerCase().includes(q)
      );
    }

    formatted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching faculty responses:', err);
    res.status(500).json({ error: 'Failed to fetch faculty responses' });
  }
});

// POST /api/mentorship-requests - Submit student 1-on-1 request (Linked to student account)
app.post('/api/mentorship-requests', authenticateToken, async (req, res) => {
  try {
    const { admissionNo, studentName, contactNo, studentDepartment, reason, mentorId } = req.body;

    if (!admissionNo || !studentName || !contactNo || !reason || !mentorId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const mentor = await prisma.user.findFirst({
      where: {
        id: mentorId,
        role: 'FACULTY'
      }
    });
    if (!mentor) {
      return res.status(404).json({ error: 'Selected faculty mentor not found or inactive' });
    }

    const studentUser = req.user && req.user.id !== 'usr_me'
      ? await prisma.user.findUnique({ where: { id: req.user.id } })
      : null;

    const request = await prisma.mentorshipRequest.create({
      data: {
        admissionNo,
        studentName: studentUser?.name || studentName,
        studentEmail: studentUser?.email || null,
        contactNo,
        studentDepartment: studentDepartment || studentUser?.department || 'General Student',
        reason,
        studentId: studentUser ? studentUser.id : null,
        mentorId: mentor.id,
        mentorName: mentor.name,
        status: 'PENDING'
      }
    });

    await createAuditLog({
      userId: studentUser?.id || null,
      userEmail: studentUser?.email || null,
      userRole: studentUser?.role || 'STUDENT',
      action: 'MENTORSHIP_REQUEST_SUBMITTED',
      resource: `MentorshipRequest:${request.id}`,
      metadata: {
        requestId: request.id,
        studentName: request.studentName,
        admissionNo: request.admissionNo,
        studentEmail: request.studentEmail,
        studentDepartment: request.studentDepartment,
        mentorId: mentor.id,
        mentorName: mentor.name,
        reason: request.reason
      },
      req
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

// POST /api/staff/login - Faculty Mentor Login using email and password
app.post('/api/staff/login', async (req, res) => {
  try {
    const { email, password, specialTag } = req.body;
    const identifier = (email || specialTag || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Faculty Email and Password are required' });
    }

    const staff = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { specialTag: { equals: identifier, mode: 'insensitive' } }
        ],
        role: { in: ['FACULTY', 'ADMIN'] }
      }
    });

    if (!staff) {
      return res.status(401).json({ error: 'Invalid Faculty Email or Password' });
    }

    const isMatch = bcrypt.compareSync(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Faculty Email or Password' });
    }

    const token = jwt.sign(
      { id: staff.id, role: staff.role, email: staff.email, specialTag: staff.specialTag },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password: _, ...staffClean } = staff;

    res.json({
      message: 'Faculty login successful',
      token,
      staff: staffClean
    });
  } catch (err) {
    console.error('Staff/Faculty login error:', err);
    res.status(500).json({ error: 'Faculty authentication failed' });
  }
});

// GET /api/staff/requests - Fetch incoming requests for logged in faculty mentor or admin
app.get('/api/staff/requests', authenticateToken, requireRole('FACULTY', 'ADMIN'), async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'ADMIN';

    const requests = await prisma.mentorshipRequest.findMany({
      where: isSuperAdmin ? {} : { mentorId: req.user.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            handle: true,
            avatar: true,
            department: true
          }
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (err) {
    console.error('Failed to fetch faculty requests:', err);
    res.status(500).json({ error: 'Failed to fetch faculty requests' });
  }
});

// PUT /api/staff/requests/:id - Update status and send reply answer (Faculty/Admin only)
app.put('/api/staff/requests/:id', authenticateToken, requireRole('FACULTY', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, replyMessage } = req.body;

    const existingRequest = await prisma.mentorshipRequest.findUnique({ where: { id } });
    if (!existingRequest) {
      return res.status(404).json({ error: 'Mentorship request not found' });
    }

    if (req.user.role === 'FACULTY' && existingRequest.mentorId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only respond to requests assigned to you.' });
    }

    const previousStatus = existingRequest.status;
    const updated = await prisma.mentorshipRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(replyMessage !== undefined && { replyMessage })
      }
    });

    // Record immutable audit log entry for this faculty response for the student
    await createAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'FACULTY_RESPONSE_RECORDED',
      resource: `MentorshipRequest:${id}`,
      metadata: {
        requestId: id,
        studentId: existingRequest.studentId,
        studentName: existingRequest.studentName,
        studentEmail: existingRequest.studentEmail,
        admissionNo: existingRequest.admissionNo,
        studentDepartment: existingRequest.studentDepartment,
        mentorId: existingRequest.mentorId,
        mentorName: existingRequest.mentorName,
        facultyEmail: req.user.email,
        previousStatus,
        newStatus: status || previousStatus,
        replyMessage: replyMessage !== undefined ? replyMessage : existingRequest.replyMessage,
        inquiryReason: existingRequest.reason,
        respondedAt: new Date().toISOString()
      },
      req
    });

    res.json({
      message: 'Request updated successfully',
      request: updated
    });
  } catch (err) {
    console.error('Failed to update mentorship request:', err);
    res.status(500).json({ error: 'Failed to update mentorship request' });
  }
});

// GET /api/admin/faculty-responses/audit - View audit log for faculty responses for each student (Admin only)
app.get('/api/admin/faculty-responses/audit', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { student, mentorId, status } = req.query;

    const mentorshipRequests = await prisma.mentorshipRequest.findMany({
      include: {
        student: {
          select: { id: true, name: true, email: true, handle: true, department: true, avatar: true }
        },
        mentor: {
          select: { id: true, name: true, email: true, department: true, avatar: true, headline: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: { in: ['FACULTY_RESPONSE_RECORDED', 'FACULTY_RESPONSE_UPDATED', 'MENTORSHIP_REQUEST_SUBMITTED'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    const parsedLogs = auditLogs.map(l => {
      let meta = {};
      try {
        meta = JSON.parse(l.metadata || '{}');
      } catch (e) {
        meta = {};
      }
      return {
        ...l,
        metadataParsed: meta
      };
    });

    let filteredRequests = mentorshipRequests;
    if (student && student.trim()) {
      const q = student.trim().toLowerCase();
      filteredRequests = filteredRequests.filter(r =>
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.admissionNo && r.admissionNo.toLowerCase().includes(q)) ||
        (r.studentEmail && r.studentEmail.toLowerCase().includes(q)) ||
        (r.studentDepartment && r.studentDepartment.toLowerCase().includes(q))
      );
    }
    if (mentorId && mentorId !== 'all') {
      filteredRequests = filteredRequests.filter(r => r.mentorId === mentorId);
    }
    if (status && status !== 'all') {
      filteredRequests = filteredRequests.filter(r => r.status.toUpperCase() === status.toUpperCase());
    }

    const studentMap = {};
    for (const reqItem of filteredRequests) {
      const studentKey = reqItem.admissionNo || reqItem.studentEmail || reqItem.studentName;
      if (!studentMap[studentKey]) {
        studentMap[studentKey] = {
          studentKey,
          studentName: reqItem.studentName,
          admissionNo: reqItem.admissionNo,
          studentEmail: reqItem.studentEmail || reqItem.student?.email || 'N/A',
          studentDepartment: reqItem.studentDepartment,
          totalInquiries: 0,
          resolvedCount: 0,
          pendingCount: 0,
          requests: [],
          auditTrail: []
        };
      }
      studentMap[studentKey].totalInquiries += 1;
      if (reqItem.status === 'RESOLVED') studentMap[studentKey].resolvedCount += 1;
      if (reqItem.status === 'PENDING') studentMap[studentKey].pendingCount += 1;

      const relatedLogs = parsedLogs.filter(log =>
        log.metadataParsed?.requestId === reqItem.id ||
        log.metadataParsed?.admissionNo === reqItem.admissionNo ||
        (log.resource && log.resource.includes(reqItem.id))
      );

      studentMap[studentKey].requests.push({
        ...reqItem,
        relatedAuditLogs: relatedLogs
      });
      studentMap[studentKey].auditTrail.push(...relatedLogs);
    }

    const studentsList = Object.values(studentMap);

    const summary = {
      totalInquiries: mentorshipRequests.length,
      totalResponses: mentorshipRequests.filter(r => r.replyMessage !== null).length,
      resolvedCount: mentorshipRequests.filter(r => r.status === 'RESOLVED').length,
      pendingCount: mentorshipRequests.filter(r => r.status === 'PENDING').length,
      uniqueStudentsCount: new Set(mentorshipRequests.map(r => r.admissionNo || r.studentName)).size
    };

    res.json({
      summary,
      students: studentsList,
      rawRequests: filteredRequests,
      auditLogs: parsedLogs
    });
  } catch (err) {
    console.error('Error fetching faculty response audit:', err);
    res.status(500).json({ error: 'Failed to fetch faculty response audit log' });
  }
});

// Serve static frontend assets and SPA catch-all for page refreshes
const distPath = path.join(__dirname, '../dist');
const localDistPath = path.join(__dirname, 'dist');
const staticPath = fs.existsSync(distPath) ? distPath : (fs.existsSync(localDistPath) ? localDistPath : null);

if (staticPath) {
  app.use(express.static(staticPath));
  app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 GUCampusBridge Auth Server running on http://localhost:${PORT}`);
});

