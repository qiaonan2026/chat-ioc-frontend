import axios from 'axios';
import { User } from '@/types/user';
import { unwrapBackendResponse } from '@/utils/apiUtils';

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
    // 后端实际登录路径：POST /api/login（在本项目中 baseURL 通常已包含 /api）
    // 同时兼容后端用 username 登录的情况：将输入值同时填充到 username/email 字段
    const response = await apiClient.post('/login', {
      username: email,
      email,
      password,
    });
    
    // 兼容：后端统一响应 {code,message,data} 或直接返回业务对象
    const raw = response.data;
    // 兼容：data 里可能再包一层 { success, token, user, message }
    const unwrapped = unwrapBackendResponse<any>(raw);
    const data = (unwrapped && typeof unwrapped === 'object' && 'data' in unwrapped ? (unwrapped as any).data : unwrapped) as {
      user: User;
      token: string;
    };
    
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
    const response = await apiClient.post('/register', {
      username,
      email,
      password,
    });
    
    const raw = response.data;
    const unwrapped = unwrapBackendResponse<any>(raw);
    const data = (unwrapped && typeof unwrapped === 'object' && 'data' in unwrapped ? (unwrapped as any).data : unwrapped) as {
      user: User;
      token: string;
    };
    
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
    const response = await apiClient.get('/me');
    const raw = response.data;
    const data = unwrapBackendResponse<{ user: User } | User>(raw);
    // 兼容两种返回：{user:{...}} 或直接 User
    return (data as any).user ? (data as any).user : (data as User);
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
    await apiClient.post('/logout');
    // 清除本地存储的token
    localStorage.removeItem('access_token');
  } catch (error: any) {
    console.error('登出失败:', error);
    // 即使API失败也清除本地token
    localStorage.removeItem('access_token');
  }
};