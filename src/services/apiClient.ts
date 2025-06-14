
import axios, { AxiosInstance } from 'axios';

interface ApiClientInstance extends AxiosInstance {
  setAuthToken?: (token: string | null) => void;
  clearAuthToken?: () => void;
}

const ApiClient: ApiClientInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
});

ApiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('authToken', token);
    ApiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete ApiClient.defaults.headers.common['Authorization'];
  }
}

const clearAuthToken = () => {
    setAuthToken(null);
}

ApiClient.setAuthToken = setAuthToken;
ApiClient.clearAuthToken = clearAuthToken;

export { ApiClient };
