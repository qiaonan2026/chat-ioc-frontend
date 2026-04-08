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

```dotenv
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

## 常见问题：接口被重复调用（开发环境更明显）

### 现象

- 登录成功后，发现 **用户信息**（如 `GET /api/me`）以及 **首页服务状态/版本信息**（如 `GET /api/home`）在网络面板里出现多次请求。

### 原因

- **React 18 StrictMode（开发模式）**：为了帮助发现副作用问题，开发环境可能会对组件的挂载/卸载与 `useEffect` 执行进行额外触发，从而让 `useEffect([])` 的请求看起来像“请求了两次”。生产环境不会这样表现。
- **在多个组件中调用 `useAuth()`**：如果 `useAuth()` 内部包含“挂载即拉取当前用户”的副作用，那么像 `Header` 这种仅需要 `logout` 的组件也会触发一次 `/me`；多个组件使用时会叠加成多次请求。
- **重复导航/重复挂载**：登录流程中如果在多个地方触发 `navigate('/')`，也可能导致 Home 页/Header 重复挂载，从而放大请求次数。

### 解决方案（本项目当前实现）

- **认证态检查与 `/me` 请求做全局去重**：`src/hooks/useAuth.ts` 将“检查 token 并拉取当前用户”的逻辑做成模块级单例，仅在一次会话中执行一次，并在并发情况下复用同一个进行中的请求。
- **`/home` 服务信息加缓存与并发去重**：`src/services/homeService.ts` 对 `getHomeInfoAPI()` 添加 TTL 缓存（默认 30s）并复用进行中的请求，避免 StrictMode 或多处触发导致的重复请求。
- **避免登录页重复跳转**：登录成功后的跳转由 `useAuth().login()` 统一负责，页面层不再二次导航。

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

```text
feat: 新增功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具变动
```

### 项目依赖（提交校验，强制执行）

本项目使用 **Husky + Commitlint + lint-staged** 在本地提交时进行校验，避免不符合规范的提交进入仓库：

- **commit-msg**：使用 `commitlint` 校验提交信息是否符合 Conventional Commits（例如 `feat:`、`fix:`、`docs:` 等）。
- **pre-commit**：使用 `lint-staged` 对本次提交涉及的文件执行 `eslint --fix`（只对暂存区文件生效）。

首次拉取代码后请执行一次：

```bash
npm install
```

安装依赖后会自动执行 `npm run prepare` 初始化 hooks（见 `package.json` 的 `prepare` 脚本）。

### 编辑器/客户端插件（可选，提升体验）

- **VS Code 插件：Conventional Commits**：在提交时提供 `feat/fix/docs/...` 的交互式选择与模板，减少手写出错。
- **Git 客户端模板**：如果你使用 SourceTree / GitKraken 等客户端，也可以开启其“提交模板/前缀”功能，统一团队提交信息风格。
