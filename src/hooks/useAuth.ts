import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { setUser, logout, setLoading, setError } from '@/store/features/userSlice';
import { getCurrentUserAPI, loginAPI, registerAPI, logoutAPI } from '@/services/authService';

/**
 * 认证相关的自定义Hook
 */
export const useAuth = () => {
  const { user, loading, error } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 检查用户认证状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          dispatch(setLoading(true));
          const userData = await getCurrentUserAPI();
          dispatch(setUser({ ...userData, isLoggedIn: true }));
        } catch (err) {
          // Token无效，清除本地存储
          localStorage.removeItem('access_token');
          dispatch(logout());
        } finally {
          setIsCheckingAuth(false);
          dispatch(setLoading(false));
        }
      } else {
        setIsCheckingAuth(false);
        dispatch(setLoading(false));
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  // 登录
  const login = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      const result = await loginAPI(email, password);
      dispatch(setUser({ ...result.user, isLoggedIn: true }));
      dispatch(setError(null));
      navigate('/');
      return { success: true, user: result.user };
    } catch (err: any) {
      const errorMsg = err.message || '登录失败';
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // 注册
  const register = async (username: string, email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      const result = await registerAPI(username, email, password);
      dispatch(setUser({ ...result.user, isLoggedIn: true }));
      dispatch(setError(null));
      navigate('/');
      return { success: true, user: result.user };
    } catch (err: any) {
      const errorMsg = err.message || '注册失败';
      dispatch(setError(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // 登出
  const handleLogout = async () => {
    try {
      dispatch(setLoading(true));
      await logoutAPI(); // 调用后端登出API
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      // 即使API失败也要清除本地状态
      dispatch(logout());
      localStorage.removeItem('access_token');
      navigate('/login');
    } finally {
      dispatch(setLoading(false));
    }
  };

  // 检查用户是否已登录
  const isAuthenticated = !!user?.isLoggedIn;

  return {
    user,
    loading,
    error,
    isCheckingAuth,
    login,
    register,
    logout: handleLogout,
    isAuthenticated,
  };
};