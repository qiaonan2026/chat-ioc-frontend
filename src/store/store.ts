import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './features/chatSlice';
import userReducer from './features/userSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // 兼容：消息里 timestamp 是 Date 对象（非序列化），避免开发期告警刷屏
        ignoredPaths: ['chat.messages'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
