import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { clearMessages, setSessionId } from '@/store/features/chatSlice';
import { createSessionAPI } from '@/services/chatService';

const ChatSessionManager: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { sessionId } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch<AppDispatch>();

  const handleNewSession = async () => {
    setIsCreating(true);
    try {
      const newSession = await createSessionAPI();
      dispatch(clearMessages());
      dispatch(setSessionId(newSession.id));
    } catch (error) {
      console.error('创建会话失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600">
        {sessionId ? `会话: ${sessionId.substring(0, 8)}...` : '新会话'}
      </div>
      <button
        onClick={handleNewSession}
        disabled={isCreating}
        className={`text-sm px-3 py-1 rounded-md ${
          isCreating 
            ? 'bg-gray-300 text-gray-500' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isCreating ? '创建中...' : '新建会话'}
      </button>
    </div>
  );
};

export default ChatSessionManager;