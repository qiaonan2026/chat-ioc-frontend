import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 定义用户类型
interface User {
  id?: string | number;
  username?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  isLoggedIn: boolean;
}

// 定义用户状态
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// 初始化状态
const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 设置用户信息
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },

    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // 设置错误
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // 登出
    logout: state => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, logout } = userSlice.actions;
export default userSlice.reducer;
