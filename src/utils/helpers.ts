/**
 * 格式化日期为友好的显示格式
 * @param date - 要格式化的日期
 * @returns 格式化后的字符串
 */
export const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
};

/**
 * 生成唯一ID
 * @param prefix - ID前缀
 * @returns 唯一ID字符串
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString();
  const randomNum = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}${randomNum}`;
};

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 是否为有效邮箱
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * 验证密码强度
 * @param password - 密码
 * @returns 是否为强密码
 */
export const validatePassword = (password: string): boolean => {
  // 至少8位，包含大小写字母、数字和特殊字符
  const strongPassword = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
  return strongPassword.test(password);
};

/**
 * 字符串截断
 * @param str - 要截断的字符串
 * @param maxLength - 最大长度
 * @param suffix - 后缀
 * @returns 截断后的字符串
 */
export const truncateString = (str: string, maxLength: number, suffix: string = '...'): string => {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + suffix;
};