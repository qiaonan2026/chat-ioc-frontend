import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = (import.meta.env as any)?.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => {
    const payload = response.data;
    if (payload && typeof payload === 'object' && 'code' in payload) {
      const code = (payload as any).code;
      const message = (payload as any).message;
      if (code !== 0 && code !== 200) {
        const msg = message || `请求失败 (code=${code})`;
        toast.error(msg);
        return Promise.reject(new Error(msg));
      }
    }
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    const msg = error?.response?.data?.message || error?.message || '网络错误，请稍后重试';
    toast.error(msg);
    return Promise.reject(error);
  }
);
