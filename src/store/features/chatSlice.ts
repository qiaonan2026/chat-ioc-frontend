import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sendMessageAPI, getHistoryAPI } from '@/services/chatService';

// 定义消息类型
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed';
}

// 定义聊天状态
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}

// 初始化状态
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  sessionId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // 添加消息
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // 设置错误
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // 设置会话ID
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    
    // 清除聊天历史
    clearMessages: (state) => {
      state.messages = [];
    },
    
    // 设置消息历史
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // 发送消息
      .addCase(sendMessageAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessageAPI.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        // 替换最后一条消息（用户消息），添加AI回复
        const lastMessageIndex = state.messages.length - 1;
        if (lastMessageIndex >= 0 && state.messages[lastMessageIndex].sender === 'user') {
          // 更新用户消息状态
          state.messages[lastMessageIndex].status = 'sent';
        }
        // 添加AI回复
        state.messages.push(payload);
      })
      .addCase(sendMessageAPI.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || '发送消息失败';
        // 更新最后一条消息的状态为失败
        const lastMessageIndex = state.messages.length - 1;
        if (lastMessageIndex >= 0 && state.messages[lastMessageIndex].sender === 'user') {
          state.messages[lastMessageIndex].status = 'failed';
        }
      })
      
      // 获取历史消息
      .addCase(getHistoryAPI.fulfilled, (state, { payload }) => {
        state.messages = payload;
      });
  }
});

export const { addMessage, setLoading, setError, setSessionId, clearMessages, setMessages } = chatSlice.actions;
export default chatSlice.reducer;