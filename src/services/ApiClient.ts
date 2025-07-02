import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface ApiClientResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiClientClass {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          (config.headers as any).Authorization = `Bearer ${token}`;
        }

        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data
        });

        return config;
      },
      (error: AxiosError) => {
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
      async (error: AxiosError) => {
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });

        // Handle auth errors
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken && !error.config?.url?.includes('/auth/refresh')) {
            try {
              const response = await this.refreshAuthToken(refreshToken);
              
              if (response.data.token && error.config) {
                this.setAuthToken(response.data.token);
                
                // Retry the original request
                if (error.config.headers) {
                  (error.config.headers as any).Authorization = `Bearer ${response.data.token}`;
                }
                
                return this.client(error.config);
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              this.clearAuthToken();
              window.location.href = '/admin/login';
            }
          } else {
            this.clearAuthToken();
            window.location.href = '/admin/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAuthToken(refreshToken: string): Promise<AxiosResponse> {
    return this.client.post('/api/auth/refresh', { refreshToken });
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiClientResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    delete this.client.defaults.headers.common['Authorization'];
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/api/health');
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

export const ApiClient = new ApiClientClass();
export default ApiClient;