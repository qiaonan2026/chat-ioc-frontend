import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './features/chatSlice';
import userReducer from './features/userSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;