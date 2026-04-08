# chat-ioc-frontend

Vite + React + Tailwind CSS

## 开发启动

```bash
npm install
npm run dev
```

默认本地地址是 `http://localhost:3000/`。

## 关于 Tailwind 样式不生效

本项目的 Tailwind 入口在 `src/styles/index.css`，必须在 `src/main.tsx` 中引入，并且需要 `postcss.config.cjs` 启用 `tailwindcss`/`autoprefixer` 插件；否则像 `text-sm`、`mt-2` 等 class 会看起来“完全不生效”。
