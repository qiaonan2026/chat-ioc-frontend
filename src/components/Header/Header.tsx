import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '@/store/store';
import { logout } from '@/store/features/userSlice';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-10">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src="/src/assets/logo.png" 
            alt="纳米AI" 
            className="h-8 w-auto mr-2" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%233B82F6"/></svg>';
            }}
          />
          <span className="text-xl font-bold text-gray-800">纳米AI</span>
        </Link>

        {/* 导航菜单 */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">首页</Link>
          <Link to="/models" className="text-gray-600 hover:text-blue-600 transition-colors">大模型</Link>
          <Link to="/agents" className="text-gray-600 hover:text-blue-600 transition-colors">智能体</Link>
          <Link to="/knowledge" className="text-gray-600 hover:text-blue-600 transition-colors">知识库</Link>
          <Link to="/writing" className="text-gray-600 hover:text-blue-600 transition-colors">AI写作</Link>
          <Link to="/editing" className="text-gray-600 hover:text-blue-600 transition-colors">AI修图</Link>
        </nav>
      </div>

      {/* 右侧用户区域 */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="flex items-center space-x-2 cursor-pointer group">
              <img 
                src={user.avatar || '/src/assets/default-avatar.png'} 
                alt="头像" 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%239CA3AF"/><circle cx="12" cy="10" r="3" fill="%236B7280"/></svg>';
                }} 
              />
              <span className="text-gray-700 hidden md:inline">{user.username || (user.email ? user.email.split('@')[0] : '用户')}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              退出
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              登录
            </Link>
            <Link 
              to="/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              注册
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;