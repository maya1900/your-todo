# 实施任务清单 — build-advanced-todo-app

> 参考：[`proposal.md`](./proposal.md) · [`design.md`](./design.md) · [`ui.md`](./ui.md) · [`specs/`](./specs/)
> 任务粒度：每条 1-3 小时；按"脚手架 → 类型 → store → 组件 → 集成 → 打磨"顺序组织。

---

## 1. 工程脚手架与基础设施

- [x] 1.1 初始化 Vite + React + TypeScript 项目（`npm create vite@latest your-todo -- --template react-ts`），删除模板示例代码（`App.tsx` 主体、`assets/`、模板 css）
- [x] 1.2 `tsconfig.json` 开启 `strict`、`noUnusedLocals`、`noUnusedParameters`、`noImplicitReturns`、`exactOptionalPropertyTypes`，并配置 `paths`（`@/*` → `src/*`）
- [x] 1.3 安装运行时依赖：`react@18` `react-dom@18` `zustand@^5` `date-fns@^3`
- [x] 1.4 安装 dev 依赖：`tailwindcss@^3.4` `postcss` `autoprefixer` `@tailwindcss/forms` `eslint` `eslint-plugin-react` `eslint-plugin-react-hooks` `@typescript-eslint/*` `prettier` `prettier-plugin-tailwindcss` `vitest` `@vitest/ui` `@testing-library/react` `@testing-library/jest-dom` `jsdom`
- [x] 1.5 初始化 Tailwind（`npx tailwindcss init -p`），按 [`design.md` D5](./design.md) + [`ui.md` §8](./ui.md) 配置 `tailwind.config.ts` 的 colors / fontFamily / fontSize / boxShadow / transitionTimingFunction
- [x] 1.6 在 `src/index.css` 注入 CSS 变量（色板、间距）+ `@tailwind base/components/utilities` + 字体 `@import`（Fraunces / IBM Plex Sans / IBM Plex Mono）
- [x] 1.7 配置 ESLint + Prettier（`.eslintrc.cjs` / `.prettierrc`），规则：单引号、行宽 100、import sort
- [x] 1.8 配置 Vitest（`vitest.config.ts` + `vitest.setup.ts` 引入 `@testing-library/jest-dom`），`environment: "jsdom"`
- [x] 1.9 `package.json` 写入脚本：`dev`、`build`、`preview`、`lint`、`format`、`typecheck`（`tsc -p tsconfig.json --noEmit`）、`test`、`test:ui`
- [x] 1.10 添加 `.gitignore`、`.editorconfig`、`README.md`（仅含一句话项目说明 + 启动命令）
- [x] 1.11 验证 `npm run dev` 启动成功、`npm run build` 产出无错、`npm run typecheck` 通过、`npm run lint` 通过

## 2. 类型与工具函数（纯函数，先行单测）

- [x] 2.1 创建 `src/types/todo.ts`：定义 `Priority`、`Status`、`Todo`、`EditableTodoFields`、`NewTodoInput`、`StatusFilter`、`SortKey`、`Filter`（与 [`design.md` D9](./design.md) 一致）
- [x] 2.2 创建 `src/utils/id.ts`：`newId()` 优先 `crypto.randomUUID()`，回退到时间+随机字符串；附单测
- [x] 2.3 创建 `src/utils/date.ts`：`formatDueDate(iso, today)`（返回 `2026.05.22 · 明天` 等格式）、`isOverdue(dueDate, status)`、`relativeFromToday(iso)`；引入 date-fns + locale `zh-CN`；附单测覆盖：今天、明天、N 天后、已逾期、已完成不算逾期
- [x] 2.4 创建 `src/utils/validate.ts`：`validateNewTodo(input)` / `validateEditTodo(patch)`，返回 `{ ok: true } | { ok: false, errors: Record<field, msg> }`；校验：标题 1-200、描述 ≤ 2000、分类 1-30、priority/status 枚举；附单测
- [x] 2.5 创建 `src/utils/filter.ts`：`deriveFilteredSorted(todos, filter, sort)` 纯函数，依次应用搜索（不区分大小写）→ 状态 → 分类 → 优先级 → 排序；附单测覆盖：空筛选、单条件、多条件 AND、4 种排序、空结果
- [x] 2.6 创建 `src/utils/stats.ts`：`deriveStats(todos, today)` 返回 `{ total, active, done, rate, overdue, byPriority, byCategoryTop5 }`；附单测覆盖：空、部分、全完成、逾期边界、分类 ≤ 5、分类 > 5（合并"其他"）
- [x] 2.7 创建 `src/utils/io.ts`：`exportToFile(state)` 触发浏览器下载（文件名 `your-todo-export-YYYYMMDD.json`）；`parseImport(text)` 校验 JSON schema 后返回 `{ todos }` 或抛 `ImportError`；附单测覆盖合法/非法/缺字段三种输入

## 3. Store（Zustand + persist + 容错存储）

- [x] 3.1 创建 `src/store/storage.ts`：实现 `safeStorage`（PersistStorage 接口），处理 JSON 解析失败 → 备份到 `your-todo/v1.backup` + 返回 null；处理 `QuotaExceededError` → emit toast + rethrow
- [x] 3.2 创建 `src/store/useTodoStore.ts`：用 `create<TodoStoreState>()(persist(..., { name: "your-todo/v1", version: 1, storage: safeStorage, partialize, migrate }))` 实现完整 store；包括 state（todos / filter / sort / ui）+ 所有 actions（addTodo / updateTodo / deleteTodo / toggleStatus / setSearch / setStatusFilter / setCategories / setPriorities / setSort / clearFilters / importAll / openDrawer / closeDrawer / openConfirm / closeConfirm）
- [x] 3.3 实现 actions 内部对 `validateNewTodo` / `validateEditTodo` 的调用，校验失败时不修改 state 并向 caller 返回错误（caller 即组件可据此显示表单错误）
- [x] 3.4 创建 `src/store/selectors.ts`：导出 `useFilteredTodos()`、`useStats()`、`useAllCategories()`（用于分类筛选下拉），内部使用 `useShallow` 浅相等比较
- [x] 3.5 编写 store 单测 `src/store/useTodoStore.test.ts`：覆盖每个 action 的 state 转移；mock localStorage 验证写入；覆盖 QuotaExceededError 回滚

## 4. 通用 UI 元件（独立可测）

- [x] 4.1 `src/components/ui/Button.tsx`：variant `stamp | outline | ghost | text`，size `sm | md | lg`，按钮按下/hover/focus 全态样式按 [`ui.md` §4.3 / §6.2](./ui.md)
- [x] 4.2 `src/components/ui/IconButton.tsx`：36×36 命中区，必传 `aria-label`
- [x] 4.3 `src/components/ui/TextInput.tsx`：受控输入，支持 `error?: string` 显示错误提示，黑实线边框 + focus 时 stamp 红 + 提示色
- [x] 4.4 `src/components/ui/Textarea.tsx`：同上，多行
- [x] 4.5 `src/components/ui/Select.tsx` / `Dropdown.tsx`：自定义下拉（不用 `<select>`，避免原生样式）；支持键盘 ↑↓ Enter Esc
- [x] 4.6 `src/components/ui/Tag.tsx`：通用 tag 组件，variant `priority-low | medium | high | urgent | category | neutral`
- [x] 4.7 `src/components/ui/Toast.tsx` + `ToastHost.tsx`：实现 toast 队列、自动消失、`role="status"` / `role="alert"`；导出 `emitToast({ kind, message })` 单例 API
- [x] 4.8 `src/components/ui/Drawer.tsx`：通用抽屉，支持 `side="right" | "bottom"`（移动端自动），实现 focus trap + Esc 关闭 + body scroll lock
- [x] 4.9 `src/components/ui/ConfirmDialog.tsx`：居中模态，默认焦点在 Cancel
- [x] 4.10 编写关键元件的组件测试：Button focus 样式渲染、Drawer focus trap、ConfirmDialog 默认聚焦 Cancel

## 5. Hooks

- [x] 5.1 `src/hooks/useDebouncedValue.ts`：通用防抖 hook
- [x] 5.2 `src/hooks/useHotkey.ts`：注册全局快捷键（⌘K 聚焦搜索、⌘N 打开新建、Esc 关闭抽屉、N 单键新建只在搜索未聚焦时触发）
- [x] 5.3 `src/hooks/useFocusTrap.ts`：实现抽屉/模态内的 Tab 循环
- [x] 5.4 `src/hooks/useAutoSizeTextarea.ts`：textarea 随内容自适应高度（用于描述字段）

## 6. 业务组件 — 布局 & Header

- [x] 6.1 `src/components/layout/Header.tsx`：实现 [`ui.md` §4.1](./ui.md) 规范，含应用标题（"·" 红色）+ 三个 icon 按钮（导出 / 导入 / 主题占位）+ 滚动 80px 后边框加深
- [x] 6.2 `src/components/layout/PageContainer.tsx`：max-w-1080 + 响应式内边距
- [x] 6.3 `src/App.tsx`：组合 `<ToastHost />` + `<Header />` + `<PageContainer>{...}</PageContainer>` + Overlay（Drawer / ConfirmDialog）

## 7. 业务组件 — 统计区

- [x] 7.1 `src/components/stats/StatNumberCell.tsx`：大数字 + ALL CAPS 标签；逾期单元格在数字 ≥1 时染红
- [x] 7.2 `src/components/stats/DistributionList.tsx`：通用条形分布列表，props `items: { label, count, percent, tagVariant? }[]`
- [x] 7.3 `src/components/stats/StatsBar.tsx`：组合上面两个，使用 `useStats()`；区段标题 "OVERVIEW · 概览" / "BY PRIORITY" / "BY CATEGORY"
- [x] 7.4 移动端响应式（<sm）：5 格变 2 列网格，逾期独占行

## 8. 业务组件 — 工具栏

- [x] 8.1 `src/components/toolbar/SearchBox.tsx`：用 `useDebouncedValue(input, 200)` 同步到 store；右侧 `⌘K` 提示
- [x] 8.2 `src/components/toolbar/StatusTabs.tsx`：4 个 tab，`role="tablist"` + `aria-selected`；每个 tab 显示数量
- [x] 8.3 `src/components/toolbar/CategoryFilter.tsx`：单选下拉，选项来自 `useAllCategories()` + "全部"
- [x] 8.4 `src/components/toolbar/PriorityFilter.tsx`：多选下拉（checkbox 列表），选中态在按钮上以 "+N" 显示
- [x] 8.5 `src/components/toolbar/SortDropdown.tsx`：4 个排序选项；图标 `↕`
- [x] 8.6 `src/components/toolbar/FilterBadges.tsx`：从 store filter 派生当前生效条件，每个生成可关闭徽章
- [x] 8.7 `src/components/toolbar/Toolbar.tsx`：组合上述 + "新建" 红色 stamp 按钮 + "清除全部"链接

## 9. 业务组件 — 列表

- [x] 9.1 `src/components/list/StatusCheckbox.tsx`：3 态自定义复选框（◯/◐/◉），点击 pending → completed / completed → pending；附 hover 动画
- [x] 9.2 `src/components/list/PriorityTag.tsx`：4 种优先级 tag，紧急反白
- [x] 9.3 `src/components/list/CategoryTag.tsx`：`#category` 风格 tag
- [x] 9.4 `src/components/list/DueDateLabel.tsx`：使用 `formatDueDate()` + `isOverdue()` 判断染色（逾期红、今天高、明天 ink）
- [x] 9.5 `src/components/list/TodoRow.tsx`：组合上面所有，含 hover 浮现的操作按钮；点击行（非操作区）打开编辑 Drawer
- [x] 9.6 `src/components/list/TodoList.tsx`：使用 `useFilteredTodos()` 渲染；空时根据 filter 是否有条件渲染对应 EmptyState
- [x] 9.7 列表加上 `role="list"` / `role="listitem"`；逐条 fadeUp stagger 入场动画（CSS @keyframes + animation-delay）

## 10. 业务组件 — 表单与确认

- [x] 10.1 `src/components/forms/PrioritySegmented.tsx`：4 段 radio group，键盘 ↔ 切换
- [x] 10.2 `src/components/forms/TodoForm.tsx`：包含 title / description / dueDate / priority / category 字段；接收 `defaultValues` + `onSubmit`；本地状态管理 + 调用 `validateXxx` 显示错误
- [x] 10.3 `src/components/forms/TodoDrawer.tsx`：用 Drawer + TodoForm，新建/编辑共用；标题动态（"新建待办" / `№.xxx 编辑`）；按 store ui slice 受控开关
- [x] 10.4 字符计数显示（描述字段 `0 / 2000`），超出红色
- [x] 10.5 提交后 emit success toast；保留焦点回到列表中新增/编辑的行

## 11. 业务组件 — 空状态 & 反馈

- [x] 11.1 `src/components/feedback/EmptyState.tsx`：支持 `variant: "initial" | "filtered"`，按 [`ui.md` §4.6](./ui.md) 规范
- [x] 11.2 初始空状态 CTA 直接打开新建 Drawer；筛选空状态 CTA 触发 `clearFilters()`

## 12. 导出 / 导入流程

- [x] 12.1 Header 导出按钮 → `exportToFile(useTodoStore.getState())`
- [x] 12.2 Header 导入按钮 → 触发 `<input type="file" hidden>` 选择 → 读文件 → `parseImport()` → 弹 ConfirmDialog "导入将覆盖当前数据" → 确认后 `importAll(data)`
- [x] 12.3 失败时 emit error toast，并保留当前数据完整

## 13. 全局集成与无障碍

- [x] 13.1 注册全局快捷键（`useHotkey` 在 App 顶层），验证 ⌘K / N / Esc 行为
- [x] 13.2 抽屉、模态焦点陷阱 + 打开时记录 trigger 元素，关闭时焦点回到 trigger
- [x] 13.3 所有 icon-only 按钮补齐 `aria-label`；所有图标加 `aria-hidden="true"`
- [x] 13.4 添加 `prefers-reduced-motion` 媒体查询（已在 [`ui.md` §6.3](./ui.md) 规定），所有动画统一退化
- [ ] 13.5 用 axe-core 浏览器扩展跑一遍主页，修复所有违规

## 14. 测试与质量门槛

- [x] 14.1 补齐 utils 单测覆盖率 ≥ 95%
- [x] 14.2 补齐 store actions 单测覆盖率 ≥ 90%
- [x] 14.3 组件测试（关键路径）：新建 → 出现在列表；切换状态 → 列表实时刷新；筛选 → 列表收敛；删除 → 二次确认后消失
- [x] 14.4 持久化测试：写入后重建 store（模拟刷新）数据一致；模拟 JSON 损坏 → 启动后空 state + 备份键存在
- [x] 14.5 `npm run typecheck` / `npm run lint` / `npm run test` 全部零错误零警告
- [ ] 14.6 Lighthouse Performance ≥ 90，Accessibility = 100（桌面 Chrome）

## 15. 文档与发布

- [x] 15.1 完善 `README.md`：项目简介、技术栈、本地开发命令、构建命令、键盘快捷键说明
- [x] 15.2 添加 `LICENSE`（MIT）
- [x] 15.3 添加 GitHub Actions（可选）：lint + typecheck + test on PR
- [x] 15.4 配置静态部署（任选其一）：Vercel / GitHub Pages / Netlify；记录到 README
- [ ] 15.5 首版 git tag `v1.0.0` 并写 release notes（功能清单 + 已知限制 + 反馈渠道）

## 16. 验收

- [ ] 16.1 按 [`ui.md` §9 设计交付清单](./ui.md) 逐条核对
- [ ] 16.2 按本变更下 `specs/*/spec.md` 中的每个 Scenario 手动跑一遍
- [ ] 16.3 在 Chrome / Safari / Firefox 各跑一遍金路径
- [ ] 16.4 在 iPhone（iOS Safari）与 Android（Chrome）各跑一遍移动端布局
- [ ] 16.5 跑一次 `openspec archive build-advanced-todo-app`，归档本变更并将 specs 落入 `openspec/specs/`
