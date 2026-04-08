import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import ChatSection from '@/components/Chat/ChatSection';
import ChatSidebar from '@/components/Chat/ChatSidebar';
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
    <div className="flex h-[calc(100vh-72px)] overflow-hidden">
      <ChatSidebar serviceInfo={homeInfo} serviceInfoError={homeInfoError} />
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 flex flex-col min-h-full">
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
              <p className="text-gray-600 mb-4">
                {user?.isLoggedIn ? '已登录' : '登录以同步历史任务'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
