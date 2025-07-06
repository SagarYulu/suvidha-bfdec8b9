
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiClientClass {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data
        });

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data
        });

        return response;
      },
      (error) => {
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });

        // Handle auth errors
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/admin/login';
        }

        return Promise.reject(error);
      }
    );
  }

  // GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  // POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  // PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  // PATCH request
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  // DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Set auth token
  setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  // Clear auth token
  clearAuthToken() {
    localStorage.removeItem('authToken');
    delete this.client.defaults.headers.Authorization;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/api/health');
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const ApiClient = new ApiClientClass();
export default ApiClient;
