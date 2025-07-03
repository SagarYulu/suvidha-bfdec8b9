// API client to replace Supabase calls with server API calls

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Employee methods
  async getEmployees() {
    return this.request('/employees');
  }

  async getEmployeeById(id: string) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(employee: any) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  async updateEmployee(id: string, updates: any) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteEmployee(id: string) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard user methods
  async getDashboardUsers() {
    return this.request('/dashboard-users');
  }

  async getDashboardUserById(id: string) {
    return this.request(`/dashboard-users/${id}`);
  }

  async createDashboardUser(user: any) {
    return this.request('/dashboard-users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateDashboardUser(id: string, updates: any) {
    return this.request(`/dashboard-users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteDashboardUser(id: string) {
    return this.request(`/dashboard-users/${id}`, {
      method: 'DELETE',
    });
  }

  // Issue methods
  async getIssues(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
    }
    const queryString = params.toString();
    return this.request(`/issues${queryString ? `?${queryString}` : ''}`);
  }

  async getIssueById(id: string) {
    return this.request(`/issues/${id}`);
  }

  async createIssue(issue: any) {
    return this.request('/issues', {
      method: 'POST',
      body: JSON.stringify(issue),
    });
  }

  async updateIssue(id: string, updates: any) {
    return this.request(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Issue comment methods
  async getIssueComments(issueId: string) {
    return this.request(`/issues/${issueId}/comments`);
  }

  async createIssueComment(issueId: string, comment: any) {
    return this.request(`/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  // Ticket feedback methods
  async getTicketFeedback(issueId?: string) {
    const params = issueId ? `?issueId=${issueId}` : '';
    return this.request(`/ticket-feedback${params}`);
  }

  async createTicketFeedback(feedback: any) {
    return this.request('/ticket-feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Sentiment analysis method
  async analyzeSentiment(feedback: string) {
    return this.request('/analyze-sentiment', {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  // Seed data method (for development)
  async seedData() {
    return this.request('/seed-data', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();