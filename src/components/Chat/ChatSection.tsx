import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addMessage,
  updateMessage,
  setSessionId,
  setError,
  setLoading,
} from '@/store/features/chatSlice';
import { RootState, AppDispatch } from '@/store/store';
import { Message } from '@/types/user';
import { unwrapBackendResponse } from '@/utils/apiUtils';
import { toast } from 'react-toastify';
import { createSessionAPI } from '@/services/chatService';

const ChatSection: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { messages, isLoading, sessionId } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch<AppDispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // 创建用户消息对象
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    // 立即添加用户消息到UI
    dispatch(addMessage(userMessage));

    // 创建 AI 占位消息（流式增量更新内容）
    const aiMessageId = `ai-${Date.now()}`;
    const aiPlaceholder: Message = {
      id: aiMessageId,
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      status: 'sending',
    };
    dispatch(addMessage(aiPlaceholder));

    // 清空输入框
    const contentToSend = inputValue;
    setInputValue('');

    try {
      dispatch(setLoading(true));

      // 确保 sessionId 存在（后端要求不能为空/不能为 null）
      let activeSessionId = sessionId || undefined;
      if (!activeSessionId) {
        const created = await createSessionAPI();
        if (created?.sessionId) {
          activeSessionId = created.sessionId;
          dispatch(setSessionId(created.sessionId));
        }
      }
      if (!activeSessionId) {
        throw new Error('未能创建会话，请稍后重试');
      }
      const ensuredSessionId: string = activeSessionId;

      const token = localStorage.getItem('access_token');
      const baseURL = (import.meta.env as any)?.VITE_API_URL || '/api';

      const resp = await fetch(`${baseURL}/chat?stream=1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 不显式声明 text/event-stream 时，后端在 stream=1 场景返回 NDJSON（逐行 JSON）
          Accept: 'application/x-ndjson, application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: contentToSend, sessionId: ensuredSessionId }),
      });

      if (!resp.ok) {
        throw new Error(`请求失败 (${resp.status})`);
      }

      const ct = resp.headers.get('content-type') || '';
      // 非 SSE：优先按 NDJSON（逐行 JSON）解析；失败再回退一次性 JSON
      if (!ct.includes('text/event-stream')) {
        // NDJSON（逐行 JSON）流（即使 content-type 被标成 application/json 也尝试）
        if (resp.body) {
          if (!resp.body) {
            throw new Error('NDJSON 流响应不可用');
          }

          const reader = resp.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';
          let aiContent = '';
          let parsedAny = false;

          const handleObj = (chunk: any) => {
            // 兼容统一响应包装：{ code, message, data }
            let code: number | undefined;
            let inner: any = chunk;
            if (chunk && typeof chunk === 'object' && 'code' in chunk) {
              code = (chunk as any).code;
              try {
                inner = unwrapBackendResponse<any>(chunk);
              } catch (e: any) {
                const msg = e?.message || '流式响应错误';
                toast.error(msg);
                dispatch(setError(msg));
                dispatch(updateMessage({ id: aiMessageId, patch: { status: 'failed' } }));
                dispatch(updateMessage({ id: userMessage.id, patch: { status: 'failed' } }));
                return;
              }
            }

            const eventType = inner?.event || inner?.type;
            const nextSessionId = inner?.sessionId;
            if (nextSessionId) dispatch(setSessionId(nextSessionId));

            if (eventType === 'error' || (code !== undefined && code !== 200)) {
              const errText = inner?.error || '流式响应失败';
              toast.error(errText);
              dispatch(setError(errText));
              dispatch(updateMessage({ id: aiMessageId, patch: { status: 'failed' } }));
              dispatch(updateMessage({ id: userMessage.id, patch: { status: 'failed' } }));
              return;
            }

            if (eventType === 'start') return;

            if (eventType === 'delta' || inner?.delta !== undefined) {
              const piece = inner?.delta ?? inner?.data ?? inner?.chunk ?? '';
              const text = typeof piece === 'string' ? piece : (piece?.text ?? '');
              if (text) {
                aiContent += text;
                dispatch(updateMessage({ id: aiMessageId, patch: { content: aiContent } }));
              }
              return;
            }

            if (eventType === 'done' || inner?.done === true) {
              dispatch(updateMessage({ id: aiMessageId, patch: { status: 'sent' } }));
              dispatch(updateMessage({ id: userMessage.id, patch: { status: 'sent' } }));
            }
          };

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });

              let idx: number;
              while ((idx = buffer.indexOf('\n')) !== -1) {
                const line = buffer.slice(0, idx).trim();
                buffer = buffer.slice(idx + 1);
                if (!line) continue;
                try {
                  const obj = JSON.parse(line);
                  parsedAny = true;
                  handleObj(obj);
                } catch {
                  // 忽略不完整/脏行
                }
              }
            }
          } catch {
            // 如果读取/解析流失败，回退到一次性 JSON
            parsedAny = false;
          }

          if (parsedAny) {
            // 流结束兜底
            dispatch(updateMessage({ id: aiMessageId, patch: { status: 'sent' } }));
            dispatch(updateMessage({ id: userMessage.id, patch: { status: 'sent' } }));
            return;
          }
        }

        const raw = await resp.json();
        const data = raw && typeof raw === 'object' && 'code' in raw ? (raw as any).data : raw;
        if (data?.sessionId) dispatch(setSessionId(data.sessionId));
        const reply = data?.reply ?? data?.content ?? '';
        dispatch(updateMessage({ id: aiMessageId, patch: { content: reply, status: 'sent' } }));
        dispatch(updateMessage({ id: userMessage.id, patch: { status: 'sent' } }));
        return;
      }

      if (!resp.body) {
        throw new Error('流式响应不可用');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let buffer = '';
      let aiContent = '';

      const handleData = (payloadText: string) => {
        // payloadText 可能是 JSON，也可能是纯文本
        let obj: any = null;
        try {
          obj = JSON.parse(payloadText);
        } catch {
          obj = null;
        }

        let code: number | undefined;
        let inner: any = obj ?? payloadText;
        if (obj && typeof obj === 'object' && 'code' in obj) {
          code = (obj as any).code;
          try {
            inner = unwrapBackendResponse<any>(obj);
          } catch (e: any) {
            const msg = e?.message || '流式响应错误';
            toast.error(msg);
            dispatch(setError(msg));
            dispatch(updateMessage({ id: aiMessageId, patch: { status: 'failed' } }));
            dispatch(updateMessage({ id: userMessage.id, patch: { status: 'failed' } }));
            return;
          }
        }

        const eventType = inner?.event || inner?.type;

        const nextSessionId = inner?.sessionId;
        if (nextSessionId) dispatch(setSessionId(nextSessionId));

        if (eventType === 'error' || (code !== undefined && code !== 200)) {
          const errText = inner?.error || '流式响应失败';
          toast.error(errText);
          dispatch(setError(errText));
          dispatch(updateMessage({ id: aiMessageId, patch: { status: 'failed' } }));
          dispatch(updateMessage({ id: userMessage.id, patch: { status: 'failed' } }));
          return;
        }

        if (eventType === 'start') {
          return;
        }

        const delta = inner?.delta ?? inner?.data ?? inner?.chunk;
        if (eventType === 'delta' || delta !== undefined) {
          const piece = (delta ?? inner ?? payloadText) as any;
          const text = typeof piece === 'string' ? piece : (piece?.text ?? '');
          if (text) {
            aiContent += text;
            dispatch(updateMessage({ id: aiMessageId, patch: { content: aiContent } }));
          }
          return;
        }

        const done = inner?.done;
        if (eventType === 'done' || done === true) {
          dispatch(updateMessage({ id: aiMessageId, patch: { status: 'sent' } }));
          dispatch(updateMessage({ id: userMessage.id, patch: { status: 'sent' } }));
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE 事件之间用空行分隔
        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          // 只处理 data: 行（支持多行 data）
          const dataLines = chunk
            .split('\n')
            .map(l => l.trimEnd())
            .filter(l => l.startsWith('data:'))
            .map(l => l.replace(/^data:\s?/, ''));

          if (dataLines.length === 0) continue;
          const payloadText = dataLines.join('\n').trim();
          if (!payloadText) continue;

          handleData(payloadText);
        }
      }

      // 流结束时兜底：如果还在 sending，标记为 sent
      dispatch(updateMessage({ id: aiMessageId, patch: { status: 'sent' } }));
      dispatch(updateMessage({ id: userMessage.id, patch: { status: 'sent' } }));
    } catch (error) {
      console.error('发送消息失败:', error);
      const msg = (error as any)?.message || '发送失败，请稍后重试';
      toast.error(msg);
      dispatch(setError(msg));
      dispatch(updateMessage({ id: userMessage.id, patch: { status: 'failed' } }));
      dispatch(updateMessage({ id: aiMessageId, patch: { status: 'failed' } }));
      // 创建错误消息显示
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: '发送失败，请稍后重试',
        sender: 'ai',
        timestamp: new Date(),
        status: 'failed',
      };
      dispatch(addMessage(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="w-full">
      {/* 消息历史展示 */}
      {messages.length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto mb-4">
          {messages.slice(-5).map(message => (
            <div
              key={message.id}
              className={`p-3 my-2 rounded-lg max-w-xs ${
                message.sender === 'user'
                  ? 'bg-blue-100 text-gray-800 ml-auto'
                  : 'bg-gray-100 text-gray-800'
              } ${message.status === 'failed' ? 'bg-red-100 border border-red-300' : ''}`}
            >
              <p>{message.content}</p>
              <small className="text-gray-500 text-xs">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </small>
              {message.status === 'failed' && (
                <span className="text-red-500 text-xs block">发送失败</span>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="p-3 my-2 bg-gray-100 text-gray-800 rounded-lg max-w-xs">
              <p>AI正在思考中...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* 聊天输入框 */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center border border-gray-300 rounded-full px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入任何问题"
            className="flex-grow bg-transparent outline-none pr-4"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            aria-label="发送消息"
            className={`p-2 rounded-full ${
              inputValue.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            } transition-colors`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* 快捷操作按钮 */}
      <div className="flex justify-center mt-4 space-x-4">
        <button className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>智能体</span>
        </button>

        <button className="flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-200 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>深度思考</span>
        </button>
      </div>
    </div>
  );
};

export default ChatSection;
