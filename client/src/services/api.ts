/**
 * API Client Service
 * Centralizes all HTTP calls from the React frontend to the Express backend.
 * Automatically injects the JWT Bearer token from localStorage for protected routes.
 */

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic JSON request handler
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  // If body is not FormData, set Content-Type to application/json
  if (options.body && !(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// ---- AUTH API ----
export const authAPI = {
  async register(userData: { name: string; email: string; password: string; confirmPassword?: string }) {
    return request<{ success: boolean; message: string; token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(credentials: { email: string; password: string }) {
    return request<{ success: boolean; message: string; token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getMe() {
    return request<{ success: boolean; user: any }>('/api/auth/me');
  },

  async updateProfile(profileData: { name?: string; bio?: string; profileImage?: string }) {
    return request<{ success: boolean; message: string; user: any }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// ---- BLOGS API ----
export const blogsAPI = {
  async getBlogs(params: { search?: string; category?: string; tag?: string; page?: number; limit?: number; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.tag) query.set('tag', params.tag);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.status) query.set('status', params.status);

    return request<{ success: boolean; blogs: any[]; total: number; page: number; totalPages: number }>(
      `/api/blogs?${query.toString()}`
    );
  },

  async getBlogById(id: string) {
    return request<{ success: boolean; blog: any }>(`/api/blogs/${id}`);
  },

  async createBlog(formData: FormData) {
    return request<{ success: boolean; message: string; blog: any }>('/api/blogs', {
      method: 'POST',
      body: formData,
    });
  },

  async updateBlog(id: string, formData: FormData) {
    return request<{ success: boolean; message: string; blog: any }>(`/api/blogs/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  async deleteBlog(id: string) {
    return request<{ success: boolean; message: string }>(`/api/blogs/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleLike(id: string) {
    return request<{ success: boolean; liked: boolean; likesCount: number }>(`/api/blogs/${id}/like`, {
      method: 'POST',
    });
  },

  async toggleBookmark(id: string) {
    return request<{ success: boolean; bookmarked: boolean; message: string }>(`/api/blogs/${id}/bookmark`, {
      method: 'POST',
    });
  },

  async getMyBookmarks() {
    return request<{ success: boolean; bookmarks: any[] }>('/api/blogs/user/bookmarks');
  },

  async getAuthorDashboard() {
    return request<{ success: boolean; stats: any; blogs: any[] }>('/api/blogs/user/dashboard');
  },
};

// ---- CATEGORIES API ----
export const categoriesAPI = {
  async getCategories() {
    return request<{ success: boolean; categories: any[] }>('/api/categories');
  },

  async createCategory(data: { name: string; description?: string }) {
    return request<{ success: boolean; message: string; category: any }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: { name: string; description?: string }) {
    return request<{ success: boolean; message: string; category: any }>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string) {
    return request<{ success: boolean; message: string }>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// ---- COMMENTS API ----
export const commentsAPI = {
  async getComments(blogId: string) {
    return request<{ success: boolean; comments: any[] }>(`/api/blogs/${blogId}/comments`);
  },

  async createComment(blogId: string, text: string) {
    return request<{ success: boolean; message: string; comment: any }>(`/api/blogs/${blogId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async deleteComment(commentId: string) {
    return request<{ success: boolean; message: string }>(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// ---- ADMIN API ----
export const adminAPI = {
  async getDashboard() {
    return request<{ success: boolean; stats: any }>('/api/admin/dashboard');
  },

  async getUsers() {
    return request<{ success: boolean; users: any[] }>('/api/admin/users');
  },

  async updateUserRole(userId: string, role: string) {
    return request<{ success: boolean; message: string; user: any }>(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async deleteUser(userId: string) {
    return request<{ success: boolean; message: string }>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async getAllComments() {
    return request<{ success: boolean; comments: any[] }>('/api/admin/comments');
  },
};

// ---- SYSTEM HEALTH ----
export const systemAPI = {
  async getHealth() {
    return request<{ status: string; timestamp: string; database: any }>('/api/health');
  },
};
