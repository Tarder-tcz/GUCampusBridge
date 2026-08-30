const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

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
  }
};
