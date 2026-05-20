# YOUR · TODO

> 一本可以呼吸的、属于你自己的索引卡片簿。
>
> 高级待办事项 Web 应用 · React 18 + TypeScript + Vite + Tailwind + Zustand · 数据保存在浏览器 LocalStorage，永不上传。

![主页](docs/screenshots/Jietu20260520-171701@2x.png)

## 功能

- ✓ 多维度待办：标题 / 描述 / 截止日期 / 优先级（低 · 中 · 高 · 紧急）/ 分类
- ✓ 全文搜索（标题 + 描述，防抖 200ms，不区分大小写）
- ✓ 多条件组合筛选（状态 Tab + 分类 + 优先级多选）+ 四种排序
- ✓ 统计仪表盘：总数 / 进行 / 完成 / 完成率 / 逾期数 / 按优先级与分类的分布
- ✓ LocalStorage 自动持久化 + JSON 损坏自动备份 + 版本迁移机制
- ✓ 一键导出 / 导入 JSON
- ✓ 桌面与移动端响应式 · 全键盘可达 · WCAG AA 对比度
- ✓ 视觉风格 **Archive Index**（档案索引）：纸感底色 + 黑墨主色 + 朱砂红印章强调

## 本地开发

```bash
npm install
npm run dev          # 启动开发服务器 http://localhost:5173
npm run build        # 产出 dist/ 静态资源
npm run preview      # 本地预览构建产物
npm run typecheck    # TypeScript 类型检查
npm run lint         # ESLint
npm run format       # Prettier 格式化
npm run test         # Vitest 单测 + 组件测试
npm run test:watch   # 监听模式
npm run test:ui      # Vitest UI
npm run test:coverage
```

## 技术栈

| 关注点 | 选型 |
|---|---|
| 构建 | Vite 5 |
| 框架 | React 18 + TypeScript（`strict` + `exactOptionalPropertyTypes`） |
| 状态 | Zustand 5（含官方 `persist` middleware） |
| 样式 | Tailwind CSS 3.4（utility-first） |
| 日期 | date-fns 3（按需 import） |
| 存储 | LocalStorage（`your-todo/v1`，损坏自动备份到 `your-todo/v1.backup`） |
| 测试 | Vitest + React Testing Library + jsdom |
| 代码风格 | ESLint + Prettier + prettier-plugin-tailwindcss |

## 键盘快捷键

- `⌘/Ctrl + K` — 聚焦搜索框
- `⌘/Ctrl + N` — 打开新建抽屉
- `N` — 在搜索框未聚焦时打开新建抽屉
- `Esc` — 关闭抽屉/模态
- `Tab / Shift + Tab` — 在可交互元素间循环（抽屉/模态内有 focus trap）
- `Enter` — 在列表行上按下进入编辑

## 目录结构

```
src/
├── App.tsx
├── main.tsx
├── index.css                  # CSS 变量 + Tailwind 基础层
├── types/
│   └── todo.ts                # 单一类型源（Priority / Status / Todo / Filter / SortKey）
├── store/
│   ├── useTodoStore.ts        # Zustand store + persist
│   ├── storage.ts             # safeStorage 容错 wrapper
│   └── selectors.ts           # 派生数据 hooks
├── utils/
│   ├── id.ts                  # crypto.randomUUID() 包装
│   ├── date.ts                # 截止日期视图模型
│   ├── validate.ts            # 表单校验
│   ├── filter.ts              # 列表派生（搜索 / 筛选 / 排序）
│   ├── stats.ts               # 统计派生
│   └── io.ts                  # 导入 / 导出 JSON
├── hooks/
│   ├── useDebouncedValue.ts
│   ├── useHotkey.ts
│   ├── useFocusTrap.ts
│   └── useAutoSizeTextarea.ts
└── components/
    ├── ui/                    # 通用元件：Button / TextInput / Dropdown / Drawer / ...
    ├── layout/                # Header / PageContainer
    ├── stats/                 # StatsBar / StatNumberCell / DistributionList
    ├── toolbar/               # SearchBox / StatusTabs / 各类 Filter / FilterBadges
    ├── list/                  # TodoList / TodoRow / StatusCheckbox / PriorityTag / ...
    ├── forms/                 # TodoDrawer / TodoForm / PrioritySegmented
    └── feedback/              # EmptyState / ToastHost / toastBus
```

## 部署

任意静态托管均可（Vercel / Netlify / GitHub Pages / Nginx）。`npm run build` 产出 `dist/`，直接发布即可。

例：Vercel
```bash
npx vercel --prod
```

例：Cloudflare Pages / Netlify — 构建命令 `npm run build`，输出目录 `dist`。

## 文档

- 提案与规范：[`openspec/changes/build-advanced-todo-app/`](./openspec/changes/build-advanced-todo-app/)
- UI 设计文档：[`openspec/changes/build-advanced-todo-app/ui.md`](./openspec/changes/build-advanced-todo-app/ui.md)
- 可视化原型：浏览器打开 [`openspec/changes/build-advanced-todo-app/ui-preview.html`](./openspec/changes/build-advanced-todo-app/ui-preview.html)

## License

[MIT](./LICENSE) © 2026
