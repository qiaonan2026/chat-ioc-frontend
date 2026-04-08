

/**
 * 处理API错误
 * @param error - 错误对象
 * @param customMessage - 自定义错误消息
 */
export const handleApiError = (error: any, customMessage?: string) => {
  let errorMessage = customMessage || '操作失败';

  if (error.response) {
    // 服务器响应了错误状态码
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        errorMessage = data.message || '请求参数错误';
        break;
      case 401:
        errorMessage = '身份验证失败，请重新登录';
        // 可以在这里重定向到登录页
        break;
      case 403:
        errorMessage = '没有权限执行此操作';
        break;
      case 404:
        errorMessage = '请求的资源不存在';
        break;
      case 500:
        errorMessage = '服务器内部错误，请稍后重试';
        break;
      default:
        errorMessage = data.message || `请求失败 (${status})`;
    }
  } else if (error.request) {
    // 请求已发出但没有收到响应
    errorMessage = '网络连接失败，请检查网络';
  } else {
    // 其他错误
    errorMessage = error.message || '未知错误';
  }

  console.error('API Error:', errorMessage);
  // 这里可以使用通知库显示错误消息
  // toast.error(errorMessage);
};

/**
 * 显示成功消息
 * @param message - 成功消息
 */
export const showSuccess = (message: string) => {
  console.log('Success:', message);
  // toast.success(message);
};

/**
 * 检查是否为有效的API响应
 * @param response - API响应
 * @returns 是否有效
 */
export const isValidApiResponse = (response: any): boolean => {
  return response && response.data && response.success !== undefined;
};

/**
 * 从API响应中提取数据
 * @param response - API响应
 * @returns 提取的数据
 */
export const extractDataFromResponse = <T>(response: any): T | null => {
  if (isValidApiResponse(response)) {
    return response.data;
  }
  return null;
};

/**
 * 兼容后端常见统一响应结构并提取 data
 *
 * 支持两类结构：
 * 1) { code: number; message?: string; data: T }
 * 2) 旧式：直接返回 T（或 { token, user } 这类业务对象）
 */
export const unwrapBackendResponse = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'code' in payload) {
    const code = (payload as any).code;
    const message = (payload as any).message;
    const data = (payload as any).data;

    // 约定：常见成功码可能是 0 或 200
    if (code === 0 || code === 200) {
      return data as T;
    }

    throw new Error(message || `请求失败 (code=${code})`);
  }

  // 非统一包装结构，直接按业务数据返回
  return payload as T;
};