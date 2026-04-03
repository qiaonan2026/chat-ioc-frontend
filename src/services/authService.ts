import axios from 'axios';
import { User } from '@/types/user';

// API基础配置
const API_BASE_URL = (import.meta.env as any)?.VITE_API_URL || '/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储并重定向到登录页
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户登录
export const loginAPI = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    const { data } = response;
    
    // 存储token到localStorage
    if (data.token) {
      localStorage.setItem('access_token', data.token);
    }
    
    return {
      user: data.user,
      token: data.token,
    };
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || '登录失败');
    } else {
      throw new Error('网络错误，请稍后重试');
    }
  }
};

// 用户注册
export const registerAPI = async (username: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    const response = await apiClient.post('/auth/register', {
      username,
      email,
      password,
    });
    
    const { data } = response;
    
    // 存储token到localStorage
    if (data.token) {
      localStorage.setItem('access_token', data.token);
    }
    
    return {
      user: data.user,
      token: data.token,
    };
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || '注册失败');
    } else {
      throw new Error('网络错误，请稍后重试');
    }
  }
};

// 获取当前用户信息
export const getCurrentUserAPI = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || '获取用户信息失败');
    } else {
      throw new Error('网络错误，请稍后重试');
    }
  }
};

// 用户登出
export const logoutAPI = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
    // 清除本地存储的token
    localStorage.removeItem('access_token');
  } catch (error: any) {
    console.error('登出失败:', error);
    // 即使API失败也清除本地token
    localStorage.removeItem('access_token');
  }
};