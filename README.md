# 纳米AI前端项目

基于纳米AI官网(https://www.n.cn/)设计的聊天应用前端项目。

## 项目概述

此项目是纳米AI聊天应用的前端部分，实现了主页、聊天界面、功能模块和作品展示等功能。采用现代React技术栈，具有良好的用户体验和可扩展性。

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **状态管理**: Redux Toolkit
- **路由**: React Router
- **样式**: Tailwind CSS
- **构建工具**: Vite
- **HTTP客户端**: Axios

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Header/          # 页面头部组件
│   ├── Chat/            # 聊天相关组件
│   ├── Features/        # 功能网格组件
│   ├── Gallery/         # 画廊组件
│   └── Footer/          # 页脚组件
├── pages/               # 页面组件
├── store/               # Redux状态管理
├── services/            # API服务
├── types/               # 类型定义
├── styles/              # 样式文件
├── utils/               # 工具函数
├── assets/              # 静态资源
├── hooks/               # 自定义Hook
```

## 安装与运行

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 环境变量

创建 `.env` 文件配置后端API地址：

```
VITE_API_URL=http://localhost:8080/api
```

## API接口

项目通过 `services` 目录下的服务文件与后端通信：

- `chatService.ts`: 聊天相关接口
- `authService.ts`: 认证相关接口

## 状态管理

使用Redux Toolkit进行全局状态管理：

- `chatSlice`: 管理聊天消息、会话状态
- `userSlice`: 管理用户认证状态

## 路由

项目路由结构：

- `/` - 首页
- `/login` - 登录页
- `/register` - 注册页
- `/chat/:sessionId` - 聊天详情页

## 开发规范

- 使用TypeScript编写所有组件
- 组件命名采用PascalCase
- CSS类名使用Tailwind约定
- 提交信息遵循Angular风格

## 部署

构建后的文件位于 `dist/` 目录，可通过静态服务器部署。