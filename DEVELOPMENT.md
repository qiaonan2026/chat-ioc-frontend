# 开发说明文档

## 项目概述

纳米AI前端项目是一个现代化的React应用，实现了智能聊天界面、用户认证、功能展示等功能。

## 开发环境设置

1. 安装Node.js (推荐版本 16.x 或更高)
2. 安装项目依赖:
   ```bash
   npm install
   ```

## 开发命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run lint` - 检查代码规范
- `npm run format` - 格式化代码

## 环境变量配置

在项目根目录创建 `.env` 文件：

```
VITE_API_URL=http://localhost:8080/api  # 后端API地址
```

## 代码结构说明

- `src/components/` - 可复用UI组件
- `src/pages/` - 页面级组件
- `src/store/` - Redux状态管理
- `src/services/` - API服务
- `src/hooks/` - 自定义React Hooks
- `src/utils/` - 工具函数
- `src/types/` - TypeScript类型定义
- `src/styles/` - 样式文件

## API集成

项目使用Axios进行HTTP请求，已配置请求/响应拦截器：
- 自动添加认证token
- 统一错误处理
- 401错误自动跳转登录

## 状态管理

使用Redux Toolkit进行全局状态管理：
- 用户认证状态
- 聊天消息历史
- UI加载状态

## 路由保护

已实现认证路由保护：
- 已登录用户可访问受保护页面
- 未登录用户重定向至登录页

## 组件开发规范

- 使用TypeScript编写组件
- 组件名称采用PascalCase
- Props类型定义清晰
- 使用Tailwind CSS进行样式设计

## 提交规范

请遵循以下提交信息格式：

```
feat: 新增功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具变动
```