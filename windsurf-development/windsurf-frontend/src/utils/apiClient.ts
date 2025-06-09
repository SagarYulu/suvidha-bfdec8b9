
import { API_CONFIG } from '@/config/api';
import { APP_CONFIG } from '@/config/app';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(APP_CONFIG.TOKEN_STORAGE_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }

    return await response.json();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
