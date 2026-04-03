// 用户类型定义
export interface User {
  id: string;
  username?: string;
  email: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isLoggedIn?: boolean;
}

// 消息类型定义
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed'; // 消息发送状态
}

// 聊天会话类型定义
export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

// AI模型类型定义
export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  maxTokens: number;
  isDefault: boolean;
}

// API响应类型定义
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}