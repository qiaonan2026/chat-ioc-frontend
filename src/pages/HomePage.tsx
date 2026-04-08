import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import ChatSection from '@/components/Chat/ChatSection';
import ChatSessionManager from '@/components/Chat/ChatSessionManager';
import FeatureGrid from '@/components/Features/FeatureGrid';
import GallerySection from '@/components/Gallery/GallerySection';
import { getHomeInfoAPI, type HomeInfo } from '@/services/homeService';

const HomePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [showLoginPrompt, setShowLoginPrompt] = useState(!user?.isLoggedIn);
  const [homeInfo, setHomeInfo] = useState<HomeInfo | null>(null);
  const [homeInfoError, setHomeInfoError] = useState<string | null>(null);

  // 如果用户未登录且已关闭提示，则显示登录提示
  const showSyncPrompt = !user?.isLoggedIn && !showLoginPrompt;

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getHomeInfoAPI();
        if (isMounted) setHomeInfo(data);
      } catch (e: any) {
        if (isMounted) setHomeInfoError(e?.message || '获取服务信息失败');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-140px)]">
      {/* 服务状态卡片（来自 /api/home） */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm text-gray-500">服务状态</div>
              <div className="text-lg font-semibold text-gray-900">
                {homeInfo?.title || 'Chat IOC Service'}
              </div>
              <div className="text-sm text-gray-600">
                {homeInfo?.description || '服务信息加载中...'}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {homeInfoError ? (
                <span className="text-sm text-red-600">{homeInfoError}</span>
              ) : (
                <>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    version: {homeInfo?.version || '-'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    env: {homeInfo?.environment || '-'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    users: {homeInfo?.activeUsers ?? '-'}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      homeInfo?.status === 'UP'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {homeInfo?.status || '-'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 登录提示条 */}
      {showLoginPrompt && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <p className="text-blue-800">登录以同步历史任务</p>
          <button
            onClick={() => setShowLoginPrompt(false)}
            className="text-blue-600 hover:text-blue-800"
          >
            ×
          </button>
        </div>
      )}

      {/* 欢迎语和聊天输入框 */}
      <div className="flex-grow flex flex-col">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            下午好，有什么我能帮你的吗？
          </h2>

          <div className="max-w-2xl mx-auto">
            <ChatSessionManager />
            <ChatSection />
          </div>
        </div>

        {/* 功能网格 */}
        <div className="mt-12">
          <FeatureGrid />
        </div>

        {/* 作品展示区 */}
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">优秀作品</h3>
          <GallerySection />
        </div>
      </div>

      {/* 底部登录提示（如果用户未登录） */}
      {showSyncPrompt && (
        <div className="mt-auto pt-8 text-center">
          <p className="text-gray-600 mb-4">{user?.isLoggedIn ? '已登录' : '登录以同步历史任务'}</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
