import { createAsyncThunk } from '@reduxjs/toolkit';
import { unwrapBackendResponse } from '@/utils/apiUtils';
import { apiClient } from '@/services/httpClient';

// 定义消息类型
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed';
}

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
        aiMessage: {
          id: data.id || Date.now().toString(),
          content: data.reply ?? data.content ?? '',
          sender: 'ai' as const,
          timestamp: new Date(),
        },
        sessionId: data.sessionId ?? sessionId,
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
      // 按接口文档：GET /api/chat/session?sessionId=<sessionId>
      const response = await apiClient.get(`/chat/session`, {
        params: { sessionId },
      });
      const raw = response.data;
      const data = unwrapBackendResponse<any>(raw);
      return (data.messages || []).map((msg: any) => ({
        id: String(msg.id ?? ''),
        content: msg.content ?? '',
        sender: (msg.role === 'assistant' ? 'ai' : msg.role) ?? msg.sender,
        timestamp: new Date(msg.createdAt ?? msg.timestamp ?? Date.now()),
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

export interface ChatSessionSummary {
  sessionId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const listSessionsAPI = async (limit = 20, offset = 0) => {
  const response = await apiClient.get('/chat/sessions', {
    params: { limit, offset },
  });
  const data = unwrapBackendResponse<any>(response.data);
  const sessions = (data.sessions || []).map((s: any) => ({
    sessionId: s.sessionId,
    createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
    updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
  })) as ChatSessionSummary[];

  return {
    limit: data.limit ?? limit,
    offset: data.offset ?? offset,
    sessions,
  };
};

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
    const data = unwrapBackendResponse<any>(response.data);
    return {
      sessionId: data.sessionId ?? data.id,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    };
  } catch (error) {
    console.error('创建会话失败:', error);
    throw error;
  }
};

export const deleteSessionAPI = async (sessionId: string) => {
  const response = await apiClient.delete('/chat/session', {
    params: { sessionId },
  });
  return unwrapBackendResponse<any>(response.data);
};
