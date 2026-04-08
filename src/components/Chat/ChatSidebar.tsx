import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { clearMessages, setError, setLoading, setSessionId } from '@/store/features/chatSlice';
import {
  createSessionAPI,
  deleteSessionAPI,
  listSessionsAPI,
  type ChatSessionSummary,
} from '@/services/chatService';
import { getHistoryAPI } from '@/services/chatService';
import type { HomeInfo } from '@/services/homeService';

type ConfirmState = { open: false } | { open: true; sessionId: string };

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M3 12a9 9 0 1 0 3-6.708" />
    <path d="M3 3v6h6" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const CollapseIcon: React.FC<{ className?: string; collapsed?: boolean }> = ({
  className,
  collapsed,
}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    {collapsed ? (
      <>
        <path d="M9 18l6-6-6-6" />
      </>
    ) : (
      <>
        <path d="M15 18l-6-6 6-6" />
      </>
    )}
  </svg>
);

const ChatSidebar: React.FC<{
  serviceInfo?: HomeInfo | null;
  serviceInfoError?: string | null;
}> = ({ serviceInfo, serviceInfoError }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sessionId, isLoading } = useSelector((s: RootState) => s.chat);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false });
  const [collapsed, setCollapsed] = useState(false);

  const activeId = sessionId ?? undefined;

  const titleFor = useMemo(() => {
    // 没有 title 字段，这里仅展示短 ID；后续若服务端返回 title 可替换
    return (id: string) => `会话 ${id.slice(0, 8)}`;
  }, []);

  const refreshSessions = async () => {
    setIsRefreshing(true);
    try {
      const data = await listSessionsAPI(50, 0);
      const next = data.sessions || [];
      setSessions(next);
      return next;
    } catch (e: any) {
      dispatch(setError(e?.message || '获取会话列表失败'));
      return sessions;
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureSession = async () => {
    const created = await createSessionAPI();
    if (!created?.sessionId) throw new Error('未能创建会话');
    dispatch(clearMessages());
    dispatch(setSessionId(created.sessionId));
    await refreshSessions();
    return created.sessionId;
  };

  const handleSelect = async (id: string) => {
    if (!id) return;
    dispatch(setLoading(true));
    try {
      dispatch(setSessionId(id));
      await dispatch(getHistoryAPI(id)).unwrap();
    } catch (e: any) {
      dispatch(setError(e?.message || '加载会话历史失败'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleNew = async () => {
    dispatch(setLoading(true));
    try {
      await ensureSession();
    } catch (e: any) {
      dispatch(setError(e?.message || '创建会话失败'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const requestDelete = (id: string) => setConfirm({ open: true, sessionId: id });

  const confirmDelete = async () => {
    if (!confirm.open) return;
    const toDelete = confirm.sessionId;
    dispatch(setLoading(true));
    try {
      await deleteSessionAPI(toDelete);
      setConfirm({ open: false });
      const nextSessions = await refreshSessions();

      // 如果删除的是当前会话：切到新的“最近会话”，没有则新建兜底
      if (activeId && toDelete === activeId) {
        const latest = nextSessions.filter(x => x.sessionId !== toDelete)[0]?.sessionId;
        if (latest) {
          await handleSelect(latest);
        } else {
          await ensureSession();
        }
      }
    } catch (e: any) {
      dispatch(setError(e?.message || '删除会话失败'));
      setConfirm({ open: false });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <aside
      className={`shrink-0 border-r border-gray-200 bg-white h-full flex flex-col ${
        collapsed ? 'w-14' : 'w-72'
      }`}
    >
      <div
        className={`border-b border-gray-200 flex items-center ${collapsed ? 'px-2 py-3 justify-center' : 'px-4 py-4 justify-between'}`}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                title="展开侧边栏"
                aria-label="展开侧边栏"
                onClick={() => setCollapsed(false)}
              >
                <CollapseIcon className="w-5 h-5" collapsed />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                展开侧边栏
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <button
                  type="button"
                  onClick={handleNew}
                  disabled={isLoading}
                  title="新建会话"
                  aria-label="新建会话"
                  className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  新建会话
                </span>
              </div>

              <div className="relative group">
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                  title="历史会话"
                  aria-label="历史会话"
                  onClick={() => setCollapsed(false)}
                >
                  <HistoryIcon className="w-5 h-5" />
                </button>
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  历史会话
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-700"
                title="折叠侧边栏"
                aria-label="折叠侧边栏"
                onClick={() => setCollapsed(true)}
              >
                <CollapseIcon className="w-5 h-5" />
              </button>
              <HistoryIcon className="w-5 h-5 text-gray-700" />
              <div className="font-semibold text-gray-900">历史会话</div>
            </div>

            <button
              onClick={handleNew}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600"
            >
              <PlusIcon className="w-4 h-4" />
              新建
            </button>
          </>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
          <span>{isRefreshing ? '刷新中...' : `${sessions.length} 个会话`}</span>
          <button
            onClick={refreshSessions}
            className="text-gray-500 hover:text-gray-900"
            disabled={isRefreshing}
          >
            刷新
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500">
              暂无历史会话。你可以先新建一个会话开始聊天。
            </div>
          ) : (
            <ul className="px-2 pb-3">
              {sessions.map(s => {
                const id = s.sessionId;
                const active = !!activeId && id === activeId;
                return (
                  <li key={id} className="group">
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        active ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <button
                        type="button"
                        className="flex-1 min-w-0 text-left"
                        onClick={() => handleSelect(id)}
                      >
                        <div className="text-sm font-medium truncate">{titleFor(id)}</div>
                        <div className="text-xs text-gray-500 truncate">{id}</div>
                      </button>

                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50"
                        onClick={() => requestDelete(id)}
                        aria-label="删除会话"
                        title="删除会话"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* 服务信息（简约底部） */}
      <div className={`mt-auto border-t border-gray-200 ${collapsed ? 'px-2 py-3' : 'px-4 py-3'}`}>
        {serviceInfoError ? (
          <div className={collapsed ? 'relative group flex justify-center' : ''}>
            <div
              className={`text-xs text-red-600 ${collapsed ? 'text-center' : ''}`}
              title={serviceInfoError}
            >
              {collapsed ? '!' : serviceInfoError}
            </div>
            {collapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                {serviceInfoError}
              </span>
            )}
          </div>
        ) : (
          <>
            {collapsed ? (
              <div className="relative group flex justify-center">
                <div
                  className={`mx-auto w-2.5 h-2.5 rounded-full ${
                    serviceInfo?.status === 'UP' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  title={`status: ${serviceInfo?.status || '-'}`}
                />
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  {`${serviceInfo?.title || 'Chat IOC Service'} · ${serviceInfo?.status || '-'} · v${
                    serviceInfo?.version || '-'
                  } · ${serviceInfo?.environment || '-'} · u:${serviceInfo?.activeUsers ?? '-'}`}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-gray-600 truncate">
                  {serviceInfo?.title || 'Chat IOC Service'}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      serviceInfo?.status === 'UP' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    title={`status: ${serviceInfo?.status || '-'}`}
                  />
                  <span className="text-xs text-gray-500">{serviceInfo?.status || '-'}</span>
                </div>
              </div>
            )}

            {!collapsed && (
              <div className="mt-1 text-[11px] text-gray-500 flex items-center justify-between gap-2">
                <span className="truncate">v{serviceInfo?.version || '-'}</span>
                <span className="truncate">{serviceInfo?.environment || '-'}</span>
                <span className="truncate">u:{serviceInfo?.activeUsers ?? '-'}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {confirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirm({ open: false })}
          />
          <div className="relative w-[420px] max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-xl border border-gray-200 p-5">
            <div className="text-lg font-semibold text-gray-900 mb-2">确认删除会话？</div>
            <div className="text-sm text-gray-600 mb-4">
              删除后该会话及其消息将不可恢复。
              <div className="mt-2 text-xs text-gray-500 break-all">{confirm.sessionId}</div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setConfirm({ open: false })}
              >
                取消
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={confirmDelete}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ChatSidebar;
