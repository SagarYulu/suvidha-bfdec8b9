const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface LoginCredentials {
  email: string;
  employeeId: string;
}

interface Issue {
  id?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  employeeId: string;
}

interface Comment {
  issueId: string;
  content: string;
  employeeId: string;
}

class MobileApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || 'Request failed');
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async mobileLogin(credentials: LoginCredentials) {
    return this.request('/auth/mobile-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Issues
  async getMyIssues(employeeId: string) {
    return this.request(`/mobile/issues?employeeId=${employeeId}`);
  }

  async getIssueById(id: string) {
    return this.request(`/mobile/issues/${id}`);
  }

  async createIssue(issue: Issue) {
    return this.request('/mobile/issues', {
      method: 'POST',
      body: JSON.stringify(issue),
    });
  }

  async updateIssue(id: string, updates: Partial<Issue>) {
    return this.request(`/mobile/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Comments
  async addComment(comment: Comment) {
    return this.request('/mobile/comments', {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  async getIssueComments(issueId: string) {
    return this.request(`/mobile/issues/${issueId}/comments`);
  }

  // Feedback
  async submitFeedback(feedback: {
    sentiment: string;
    feedbackText: string;
    rating: number;
    category: string;
    employeeId: string;
    issueId?: string;
  }) {
    return this.request('/mobile/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  async getFeedbackHistory(employeeId: string) {
    return this.request(`/mobile/feedback/history/${employeeId}`);
  }

  async getFeedbackAnalytics(employeeId: string) {
    return this.request(`/mobile/feedback/analytics/${employeeId}`);
  }

  // Profile
  async getProfile(employeeId: string) {
    return this.request(`/mobile/profile/${employeeId}`);
  }

  async updateProfile(employeeId: string, updates: any) {
    return this.request(`/mobile/profile/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Dashboard Stats (for admin integration)
  async getDashboardStats() {
    return this.request('/mobile/dashboard-stats');
  }

  // Real-time notifications
  async getNotifications(employeeId: string) {
    return this.request(`/mobile/notifications/${employeeId}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/mobile/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }
}

export const mobileApiService = new MobileApiService();
