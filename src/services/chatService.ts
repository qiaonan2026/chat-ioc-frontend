import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { unwrapBackendResponse } from '@/utils/apiUtils';

// 定义消息类型
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed';
}

// API基础配置
const API_BASE_URL = (import.meta.env as any)?.VITE_API_URL || '/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒超时
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

// 发送消息异步操作
export const sendMessageAPI = createAsyncThunk(
  'chat/sendMessage',
  async ({ content, sessionId }: { content: string; sessionId?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/chat', {
        content,
        sessionId: sessionId || null,
      });
      
      const raw = response.data;
      const data = unwrapBackendResponse<any>(raw);
      return {
        id: data.id || Date.now().toString(),
        content: data.content || content,
        sender: 'ai' as const,
        timestamp: new Date(),
      };
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || '发送消息失败');
      } else {
        return rejectWithValue('网络错误，请稍后重试');
      }
    }
  }
);

// 获取聊天历史异步操作
export const getHistoryAPI = createAsyncThunk(
  'chat/getHistory',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/chat/history/${sessionId}`);
      const raw = response.data;
      const data = unwrapBackendResponse<any>(raw);
      return (data.messages || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message || '获取历史记录失败');
      } else {
        return rejectWithValue('网络错误，请稍后重试');
      }
    }
  }
);

// 获取可用AI模型列表
export const getModelsAPI = async () => {
  try {
    const response = await apiClient.get('/models');
    return unwrapBackendResponse<any>(response.data);
  } catch (error) {
    console.error('获取模型列表失败:', error);
    throw error;
  }
};

// 创建新的聊天会话
export const createSessionAPI = async () => {
  try {
    const response = await apiClient.post('/chat/session');
    return unwrapBackendResponse<any>(response.data);
  } catch (error) {
    console.error('创建会话失败:', error);
    throw error;
  }
};