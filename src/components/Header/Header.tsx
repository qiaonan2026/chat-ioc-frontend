import React from 'react';
import { useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { RootState } from '@/store/store';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const { logout: handleLogout, loading } = useAuth();

  const techBlueGradientText =
    'bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text drop-shadow-sm';

  const navItemClassName = ({ isActive }: { isActive: boolean }) =>
    [
      'text-gray-800 hover:text-blue-600 transition-colors',
      isActive ? 'text-[#1677FF] font-semibold' : 'font-normal',
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-10">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/src/assets/logo.png"
            alt="纳米AI"
            className="h-8 w-auto mr-2"
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%233B82F6"/></svg>';
            }}
          />
          <span className={`text-xl font-bold ${techBlueGradientText}`}>纳米AI</span>
        </Link>

        {/* 导航菜单 */}
        <nav className="hidden md:flex space-x-6">
          <NavLink to="/" end className={navItemClassName}>
            首页
          </NavLink>
          <NavLink to="/models" className={navItemClassName}>
            大模型
          </NavLink>
          <NavLink to="/agents" className={navItemClassName}>
            智能体
          </NavLink>
          <NavLink to="/knowledge" className={navItemClassName}>
            知识库
          </NavLink>
          <NavLink to="/writing" className={navItemClassName}>
            AI写作
          </NavLink>
          <NavLink to="/editing" className={navItemClassName}>
            AI修图
          </NavLink>
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
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%239CA3AF"/><circle cx="12" cy="10" r="3" fill="%236B7280"/></svg>';
                }}
              />
              <span className="text-gray-700 hidden md:inline">
                {user.nickname || user.username || (user.email ? user.email.split('@')[0] : '用户')}
              </span>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {loading ? '退出中...' : '退出'}
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
