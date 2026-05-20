## Why

当前用户没有一个轻量、好用且数据不会丢失的本地待办事项管理工具。市面上的同类产品要么需要注册账号、要么功能过于臃肿、要么没有"分类 + 优先级 + 截止日期"的多维管理能力。我们希望提供一个**纯前端、零后端依赖、开箱即用**的高级待办事项 Web 应用，让用户在浏览器里就能完成任务规划、追踪和复盘，并通过 LocalStorage 保障数据在刷新和重启浏览器后不丢失。

## What Changes

- 引入 **Todo 数据模型**：包含标题、描述、截止日期、优先级（低/中/高/紧急）、分类（用户自定义）、状态（待办/进行中/已完成）、创建/更新时间
- 提供 **CRUD 能力**：新增、编辑、删除、切换状态
- 提供 **列表查询能力**：按分类筛选、按优先级筛选、按状态筛选、关键字搜索（匹配标题与描述），多筛选项可组合
- 提供 **统计仪表盘**：总数、完成数、待办数、完成率、按优先级/分类的分布
- 引入 **LocalStorage 持久化层**：通过 Zustand persist middleware 自动同步，应用启动时还原数据，并在数据 schema 升级时进行版本迁移
- 搭建 **前端工程基础设施**：Vite + React 18 + TypeScript（strict）+ Tailwind CSS + Zustand + date-fns，配套 ESLint/Prettier/Vitest
- 设计 **桌面优先且响应式** 的 UI：顶部统计 + 工具栏（搜索/筛选/新建）+ 主列表区 + 抽屉式编辑表单

## Capabilities

### New Capabilities

- `todo-management`：待办事项的核心数据模型与 CRUD 操作（创建、读取、更新、删除、状态切换）
- `todo-filtering`：列表筛选、搜索与排序能力（按分类、优先级、状态筛选，关键字搜索，组合条件）
- `todo-statistics`：基于当前数据的统计指标（总数、完成率、按维度分布）
- `local-persistence`：LocalStorage 持久化、序列化策略、schema 版本迁移
- `app-shell`：前端工程脚手架与全局 UI 框架（路由、布局、主题、全局状态注入）

### Modified Capabilities

（无 —— 项目当前为空仓库，没有需要修改的既有 capability）

## Impact

- **新增代码**：完整的 `src/` 目录（组件、store、类型、工具、hooks），约 20-30 个源文件
- **新增依赖**：`react`、`react-dom`、`zustand`、`date-fns`、`tailwindcss`、`vite`、`typescript`、`vitest`、`@testing-library/react`、`eslint`、`prettier` 等
- **构建产物**：通过 Vite 产出静态资源，可部署到任意静态托管服务（GitHub Pages / Vercel / Netlify / Nginx）
- **浏览器要求**：需要支持 ES2020 + LocalStorage 的现代浏览器（Chrome / Edge / Firefox / Safari 最近两个大版本）
- **数据迁移**：首次发布无历史数据；后续若修改 Todo schema，需在 persist middleware 的 `migrate` 钩子中处理
- **非目标 (Non-goals)**：
  - 不做用户账号、登录、云同步
  - 不做多端实时同步、协作或分享
  - 不做提醒推送（系统通知、邮件、Push）
  - 不做附件上传、富文本编辑、子任务嵌套
  - 不做国际化（i18n）—— 首版仅中文 UI
  - 不做拖拽排序 —— 首版仅支持按预设字段排序
