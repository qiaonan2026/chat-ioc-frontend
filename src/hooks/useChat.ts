import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import {
  sendMessageAPI,
  getHistoryAPI,
  createSessionAPI,
  listSessionsAPI,
  Message,
} from '@/services/chatService';
import {
  addMessage,
  setLoading,
  setError,
  setMessages,
  clearMessages,
  setSessionId,
} from '@/store/features/chatSlice';

/**
 * 聊天相关的自定义Hook
 */
export const useChat = () => {
  const { messages, isLoading, error, sessionId } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch<AppDispatch>();
  const [isInitialized, setIsInitialized] = useState(false);

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      try {
        // 确保已有有效 sessionId（后端要求不能为空）
        let activeSessionId = sessionId || undefined;
        if (!activeSessionId) {
          const sessionData = await createSessionAPI();
          if (sessionData?.sessionId) {
            activeSessionId = sessionData.sessionId;
            dispatch(setSessionId(sessionData.sessionId));
          }
        }
        if (!activeSessionId) {
          throw new Error('未能创建会话，请稍后重试');
        }
        const ensuredSessionId: string = activeSessionId;

        // 创建用户消息对象
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          sender: 'user',
          timestamp: new Date(),
          status: 'sending' as const,
        };

        // 立即添加用户消息到UI
        dispatch(addMessage(userMessage));

        // 发送消息到后端
        await dispatch(sendMessageAPI({ content, sessionId: ensuredSessionId }));

        return { success: true };
      } catch (err: any) {
        const errorMsg = err.message || '发送消息失败';
        dispatch(setError(errorMsg));
        return { success: false, error: errorMsg };
      }
    },
    [dispatch, sessionId]
  );

  // 获取聊天历史
  const loadHistory = useCallback(
    async (session: string) => {
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
    },
    [dispatch]
  );

  // 创建新会话
  const createNewSession = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const sessionData = await createSessionAPI();
      dispatch(clearMessages());
      if (sessionData?.sessionId) {
        dispatch(setSessionId(sessionData.sessionId));
      }
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
      (async () => {
        if (sessionId) return;
        try {
          const { sessions } = await listSessionsAPI(1, 0);
          const latestId = sessions?.[0]?.sessionId;
          if (latestId) {
            await loadHistory(latestId);
            return;
          }
          // 若无最近会话，则主动创建一次新会话并设置为当前
          await createNewSession();
        } catch (e: any) {
          // 兜底：拉取失败时也创建新会话，保证可用
          await createNewSession();
        }
      })();
      setIsInitialized(true);
    }
  }, [createNewSession, isInitialized, loadHistory, sessionId]);

  // 记住最近使用的会话
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('last_session_id', sessionId);
    }
  }, [sessionId]);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    loadHistory,
    createNewSession,
    clearCurrentSession,
    isInitialized,
  };
};
