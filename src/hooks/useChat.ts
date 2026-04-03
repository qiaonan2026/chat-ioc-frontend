import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { 
  sendMessageAPI, 
  getHistoryAPI, 
  createSessionAPI,
  Message 
} from '@/services/chatService';
import { 
  addMessage, 
  setLoading, 
  setError, 
  setMessages,
  clearMessages,
  setSessionId
} from '@/store/features/chatSlice';

/**
 * 聊天相关的自定义Hook
 */
export const useChat = () => {
  const { messages, isLoading, error, sessionId } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch<AppDispatch>();
  const [isInitialized, setIsInitialized] = useState(false);

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      // 创建用户消息对象
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date(),
        status: 'sending' as const
      };

      // 立即添加用户消息到UI
      dispatch(addMessage(userMessage));

      // 发送消息到后端
      await dispatch(sendMessageAPI({ content, sessionId: sessionId || undefined }));

      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || '发送消息失败';
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    }
  }, [dispatch, sessionId]);

  // 获取聊天历史
  const loadHistory = useCallback(async (session: string) => {
    try {
      dispatch(setLoading(true));
      const history = await dispatch(getHistoryAPI(session)).unwrap();
      dispatch(setMessages(history));
      dispatch(setSessionId(session));
      return { success: true, history };
    } catch (err: any) {
      const errorMsg = err.message || '加载历史记录失败';
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // 创建新会话
  const createNewSession = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const sessionData = await createSessionAPI();
      dispatch(clearMessages());
      dispatch(setSessionId(sessionData.id));
      return { success: true, session: sessionData };
    } catch (err: any) {
      const errorMsg = err.message || '创建会话失败';
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // 清除当前会话
  const clearCurrentSession = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // 初始化聊天
  useEffect(() => {
    if (!isInitialized) {
      // 可以在这里初始化默认会话或加载最近的会话
      setIsInitialized(true);
    }
  }, [isInitialized]);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    loadHistory,
    createNewSession,
    clearCurrentSession,
    isInitialized
  };
};