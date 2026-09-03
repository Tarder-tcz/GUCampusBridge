const API_BASE = import.meta.env.VITE_API_BASE || (
  typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')
    ? 'https://gucampusbridge-backend.onrender.com/api'
    : '/api'
);

function getHeaders(token = null) {
  const headers = { 'Content-Type': 'application/json' };
  const authToken = token || localStorage.getItem('gucampusbridge_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

export const api = {
  // Authentication & Profile Services
  async signup(signupData) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create account');
    return data;
  },

  async login(loginData) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  // Forum Services
  async getUser() {
    const res = await fetch(`${API_BASE}/user`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async getUserActivity(userId = 'me') {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/activity`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user activity');
    return res.json();
  },

  async getChannels() {
    const res = await fetch(`${API_BASE}/channels`);
    if (!res.ok) throw new Error('Failed to fetch channels');
    return res.json();
  },

  async getTags() {
    const res = await fetch(`${API_BASE}/tags`);
    if (!res.ok) throw new Error('Failed to fetch tags');
    return res.json();
  },

  async getEvents() {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getPosts() {
    const res = await fetch(`${API_BASE}/posts`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },

  async getPostById(postId) {
    const res = await fetch(`${API_BASE}/posts/${postId}`);
    if (!res.ok) throw new Error('Post not found');
    return res.json();
  },

  async createPost(postData) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  async votePost(postId, direction) {
    const res = await fetch(`${API_BASE}/posts/${postId}/vote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ direction }),
    });
    if (!res.ok) throw new Error('Failed to vote post');
    return res.json();
  },

  async toggleBookmark(postId) {
    const res = await fetch(`${API_BASE}/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to bookmark post');
    return res.json();
  },

  async addComment(postId, parentCommentId, content) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ parentCommentId, content }),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  // 1-on-1 Mentorship & Staff Portal Services
  async getMentors(department = 'all') {
    const res = await fetch(`${API_BASE}/mentors?department=${encodeURIComponent(department)}`);
    if (!res.ok) throw new Error('Failed to fetch mentors');
    return res.json();
  },

  async submitMentorshipRequest(requestData) {
    const res = await fetch(`${API_BASE}/mentorship-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit request');
    return data;
  },

  async staffLogin(specialTag, password) {
    const res = await fetch(`${API_BASE}/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialTag, password }),
    });
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Staff authentication failed');
      return data;
    }
    throw new Error(`Backend server error (${res.status}). Please ensure Express backend is running on port 5000.`);
  },

  async getStaffRequests(staffToken) {
    const res = await fetch(`${API_BASE}/staff/requests`, {
      headers: getHeaders(staffToken),
    });
    if (!res.ok) throw new Error('Failed to fetch staff requests');
    return res.json();
  },

  async updateStaffRequest(requestId, status, replyMessage, staffToken) {
    const res = await fetch(`${API_BASE}/staff/requests/${requestId}`, {
      method: 'PUT',
      headers: getHeaders(staffToken),
      body: JSON.stringify({ status, replyMessage }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update request');
    return data;
  }
};

