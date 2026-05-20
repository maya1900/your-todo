# 技术设计 — build-advanced-todo-app

> 配套：[`proposal.md`](./proposal.md) · [`specs/`](./specs/) · [`ui.md`](./ui.md) · [`ui-preview.html`](./ui-preview.html)

---

## Context

**your-todo** 是一个纯前端的高级待办事项 SPA。当前仓库为空，所有架构、目录结构与依赖均需在本变更中建立。产品形态要求：

- **零后端**：不引入任何服务端，数据完全位于浏览器 LocalStorage
- **离线可用**：首次加载后无网络也能完整使用（无 SW 也满足，因为没有外部 API 调用）
- **高交互密度**：搜索、筛选、排序、CRUD 均在同一页面完成，状态变化频繁
- **设计先行**：UI 视觉风格已在 [`ui.md`](./ui.md) 锁定为 "Archive Index"（档案索引）美学，本文档不重复 UI 决策

技术取向上，团队倾向**轻量 + 显式**：避免过度抽象，避免重型框架，避免不必要的依赖。

---

## Goals / Non-Goals

### Goals

1. 建立一个**可长期维护**的前端工程：TypeScript 严格模式、ESLint/Prettier、Vitest 测试、Vite 快速构建
2. 选择一组**搭配清晰、文档丰富**的依赖：React 18 + Zustand + Tailwind + date-fns，避免冷门库
3. **数据持久化必须健壮**：序列化失败、配额超限、版本不匹配都要有明确处理路径
4. **状态管理简单可推理**：单一 store，纯函数 reducer 风格的 actions，便于单测
5. **组件解耦**：UI 组件接收 props 与 store hook，禁止业务逻辑直接散落在组件内
6. **类型先行**：所有数据结构与函数签名在 `src/types/` 与文件顶部明确声明

### Non-Goals

- 不引入路由库（react-router）—— 首版单页就够
- 不引入 UI 组件库（shadcn / radix / antd）—— UI 已自定义设计，组件不复杂，自己写更可控
- 不引入图表库 —— 统计分布图用纯 CSS bar 即可
- 不做 PWA、Service Worker、离线缓存增强 —— 首版不需要
- 不做服务端导出（远端备份）—— 仅提供本地 JSON 文件导出
- 不引入 i18n —— 首版只支持中文 UI

---

## Decisions

### D1. 状态管理：Zustand（含 persist + immer）

**选择**：使用 [`zustand`](https://github.com/pmndrs/zustand) `^5.x`，搭配官方 `persist` middleware 自动同步 LocalStorage。可选加 `immer` middleware 简化嵌套更新（但本项目数据结构扁平，可不引入 immer，先用原生展开运算符）。

**为什么不选 Redux Toolkit**：RTK 模板代码多，对单一 store 的简单应用是杀鸡用牛刀。Zustand 一个 `create()` 函数就能定义 store，自带 selector 性能优化，与 React 18 Concurrent 兼容良好。

**为什么不选 Jotai/Recoil**：原子化状态对本项目是**反向优化** —— 我们的核心数据是一个 todos 数组 + 一组 filter，整体性强，单一 store 心智模型更清晰，调试更友好。

**为什么不直接 useState + useReducer**：列表筛选/排序/统计需要在多个组件间共享派生状态，提升到 React Context 后会触发不必要的全树渲染；Zustand 用 selector 比较，更细粒度。

**Store 结构（草案）**：

```ts
// src/store/useTodoStore.ts
type TodoStoreState = {
  // domain data
  todos: Todo[];
  // ui state (filter / search / sort)
  filter: {
    search: string;          // 关键字
    status: StatusFilter;    // 'all' | 'pending' | 'in-progress' | 'completed'
    categories: string[];    // 选中的分类，[] 表示全部
    priorities: Priority[];  // 选中的优先级，[] 表示全部
  };
  sort: SortKey;             // 'createdAt-desc' | 'updatedAt-desc' | 'dueDate-asc' | 'priority-desc'
  // schema versioning (managed by persist middleware)
  // - version: number
  // actions
  addTodo: (input: NewTodoInput) => Todo;
  updateTodo: (id: string, patch: Partial<EditableTodoFields>) => void;
  deleteTodo: (id: string) => void;
  toggleStatus: (id: string, next?: Status) => void;
  setSearch: (q: string) => void;
  setStatusFilter: (s: StatusFilter) => void;
  setCategories: (cats: string[]) => void;
  setPriorities: (prios: Priority[]) => void;
  setSort: (s: SortKey) => void;
  clearFilters: () => void;
  importAll: (next: { todos: Todo[] }) => void;
};
```

**派生数据通过 selector hooks 提供**（不放进 store state）：

```ts
// src/store/selectors.ts
export const useFilteredTodos = () => useTodoStore(
  useShallow(state => deriveFilteredSorted(state.todos, state.filter, state.sort))
);
export const useStats = () => useTodoStore(
  useShallow(state => deriveStats(state.todos))
);
```

`deriveFilteredSorted` 与 `deriveStats` 是 `src/utils/` 下的**纯函数**，便于单元测试。

> **替代方案**：将 filter/sort 放在 URL search params 里，做"可分享视图"。本版不做（Non-Goal），但派生函数纯净，未来加 URL 同步只需在最外层包一层。

### D2. 持久化：Zustand persist + 自定义 storage wrapper

**选择**：使用 Zustand 官方 `persist` middleware，搭配自定义 storage 实现来增强容错与备份。

```ts
// src/store/storage.ts
import type { PersistStorage, StorageValue } from "zustand/middleware";

const STORAGE_KEY = "your-todo/v1";
const BACKUP_KEY = "your-todo/v1.backup";

export const safeStorage: PersistStorage<TodoStoreState> = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      if (raw == null) return null;
      return JSON.parse(raw) as StorageValue<TodoStoreState>;
    } catch (err) {
      console.warn("[storage] read failed, backing up to", BACKUP_KEY, err);
      const raw = localStorage.getItem(name);
      if (raw) localStorage.setItem(BACKUP_KEY, raw);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (err) {
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        emitToast({ kind: "error", message: "本地存储空间已满，请清理后重试" });
        throw err; // 让 store 的 try/catch 回滚
      }
      console.error("[storage] write failed", err);
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};
```

**Schema 版本字段**：persist middleware 内置 `version` + `migrate`：

```ts
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: STORAGE_KEY,
    storage: safeStorage,
    version: 1,
    migrate: (persisted, fromVersion) => {
      if (fromVersion === 0) {
        // 例：未来若有 v0 → v1 升级
        return migrateV0toV1(persisted);
      }
      return persisted as TodoStoreState;
    },
    partialize: (state) => ({
      todos: state.todos,
      filter: state.filter,
      sort: state.sort,
    }),
    onRehydrateStorage: () => (state, error) => {
      if (error) emitToast({ kind: "error", message: "数据加载失败，已重置" });
    },
  }
)
```

**写入节流**：persist middleware 默认每次 state 变更立即同步。React 批处理 + 我们的 actions 粒度小，每次写入 < 5ms 不需额外节流。若发现性能问题再加 `debounce(300ms)`。

**导出/导入**：在 `src/utils/io.ts` 提供 `exportToFile()` 与 `importFromFile(file)`，前者用 `URL.createObjectURL(new Blob([JSON.stringify(state)]))` 触发下载；后者用 `FileReader.readAsText` + JSON.parse + schema 校验，校验通过后调用 `store.getState().importAll(...)`。

### D3. UUID：crypto.randomUUID()

**选择**：`crypto.randomUUID()`（所有现代浏览器支持，包括 Safari 15.4+）。

**不引入 `uuid` / `nanoid`**：原生 API 已够用，少一个依赖。

```ts
const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
```

### D4. 日期：date-fns（按需 import）

**选择**：`date-fns` 不要 `dayjs` / `moment`。

**为什么**：
- date-fns 按需 import（`import { format } from "date-fns"`），bundle 友好
- 不可变 API（返回新对象），无副作用
- TypeScript 类型完整
- moment.js 已停止维护
- dayjs 体积小但 plugin 体系不如 date-fns 干净

用到的函数：`format`, `parseISO`, `formatDistanceToNowStrict`, `isBefore`, `startOfToday`, `addDays`, 以及 `locale/zh-CN`。

### D5. 样式：Tailwind CSS（utility-first）+ CSS 变量

**选择**：Tailwind v3.4+，**所有设计 token 通过 CSS 变量 + `tailwind.config.ts` extends 暴露**，详见 [`ui.md` §8](./ui.md)。

**为什么不用 CSS-in-JS**：
- 多一个运行时开销
- 与 Tailwind 重叠
- 不利于设计 token 沉淀（CSS 变量是天然契约）

**约定**：
- 组件内**只**使用 Tailwind utility class
- 复杂样式（如自定义复选框）通过 `@layer components` 沉淀
- 主题色不要硬编码 hex，一律走 CSS 变量 → Tailwind token（如 `text-ink-900`, `bg-stamp-600`）

### D6. 表单：原生表单 + 受控组件 + 自写校验

**选择**：不用 react-hook-form / formik / zod。

**为什么**：
- 表单字段只有 5 个，且无复杂联动
- 校验规则简单（标题非空、长度上限、必填分类），手写 30 行就够
- 引入表单库会让"新手友好"这一卖点变弱

**未来**：若字段超过 8 个或出现联动校验，再迁移到 react-hook-form + zod。

### D7. 测试：Vitest + React Testing Library + jsdom

**测试金字塔**（轻量化）：

- **单测（必须）**：`utils/*`（派生函数、校验、日期格式化）—— 这些是核心业务逻辑，纯函数最易测
- **store 测试（必须）**：每个 action 一个 case，验证 state 转移与 LocalStorage 副作用（mock storage）
- **组件测试（关键路径）**：TodoRow / FilterToolbar / NewTodoDrawer 各覆盖 1-2 个核心交互
- **E2E（可选，本版不做）**：未来若引入 Playwright，做"新建 → 筛选 → 完成 → 刷新页面数据仍在"的金路径

### D8. 目录结构

```
src/
├── main.tsx                # 应用入口
├── App.tsx                 # 全局布局组合
├── index.css               # Tailwind + CSS 变量
├── types/
│   └── todo.ts             # Todo / Priority / Status / Filter / Sort 等
├── store/
│   ├── useTodoStore.ts     # zustand store + persist
│   ├── storage.ts          # safeStorage 实现
│   └── selectors.ts        # useFilteredTodos / useStats 等
├── utils/
│   ├── id.ts               # newId()
│   ├── date.ts             # formatDueDate / isOverdue / 相对时间
│   ├── filter.ts           # deriveFilteredSorted()
│   ├── stats.ts            # deriveStats()
│   ├── validate.ts         # validateNewTodo() / validateEditTodo()
│   └── io.ts               # exportToFile() / importFromFile()
├── hooks/
│   ├── useDebouncedValue.ts
│   ├── useHotkey.ts        # ⌘K / ⌘N / Esc
│   └── useFocusTrap.ts     # 抽屉/模态焦点陷阱
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── PageContainer.tsx
│   ├── stats/
│   │   ├── StatsBar.tsx
│   │   ├── StatNumberCell.tsx
│   │   └── DistributionList.tsx
│   ├── toolbar/
│   │   ├── Toolbar.tsx
│   │   ├── SearchBox.tsx
│   │   ├── StatusTabs.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── PriorityFilter.tsx
│   │   ├── SortDropdown.tsx
│   │   └── FilterBadges.tsx
│   ├── list/
│   │   ├── TodoList.tsx
│   │   ├── TodoRow.tsx
│   │   ├── StatusCheckbox.tsx
│   │   ├── PriorityTag.tsx
│   │   ├── CategoryTag.tsx
│   │   └── DueDateLabel.tsx
│   ├── forms/
│   │   ├── TodoDrawer.tsx        # 新建/编辑共用
│   │   ├── PrioritySegmented.tsx
│   │   └── ConfirmDialog.tsx     # 删除确认
│   ├── feedback/
│   │   ├── Toast.tsx
│   │   ├── ToastHost.tsx
│   │   └── EmptyState.tsx
│   └── ui/                       # 通用元件（按钮、输入、Tag 等）
│       ├── Button.tsx
│       ├── IconButton.tsx
│       ├── TextInput.tsx
│       └── ... 
└── styles/
    └── tailwind.config.ts
```

### D9. 数据模型（TypeScript 定义）

```ts
// src/types/todo.ts
export type Priority = "low" | "medium" | "high" | "urgent";
export type Status   = "pending" | "in-progress" | "completed";

export interface Todo {
  id: string;                // crypto.randomUUID()
  title: string;             // 1-200 chars, trimmed
  description: string;       // 可空字符串，最多 2000 chars
  dueDate: string | null;    // ISO date "YYYY-MM-DD"（无时分），可空
  priority: Priority;
  category: string;          // 1-30 chars
  status: Status;
  createdAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
}

export type EditableTodoFields = Pick<
  Todo, "title" | "description" | "dueDate" | "priority" | "category" | "status"
>;

export type NewTodoInput = Omit<EditableTodoFields, "status"> & {
  status?: Status; // 默认 "pending"
};

export type StatusFilter = "all" | Status;

export type SortKey =
  | "createdAt-desc"
  | "updatedAt-desc"
  | "dueDate-asc"
  | "priority-desc";
```

### D10. LocalStorage 数据格式（v1）

```jsonc
// localStorage["your-todo/v1"]
{
  "state": {
    "todos": [
      {
        "id": "0c4f3a86-...-...",
        "title": "完成 Q3 报告",
        "description": "写执行摘要 + 附图表",
        "dueDate": "2026-05-22",
        "priority": "urgent",
        "category": "工作",
        "status": "in-progress",
        "createdAt": "2026-05-19T10:34:12.000Z",
        "updatedAt": "2026-05-20T08:01:55.000Z"
      }
    ],
    "filter": {
      "search": "",
      "status": "all",
      "categories": [],
      "priorities": []
    },
    "sort": "createdAt-desc"
  },
  "version": 1
}
```

### D11. 组件树（高层）

```
<App>
  <ToastHost />
  <Header />
  <PageContainer>
    <StatsBar />
      └─ <StatNumberCell> × 5
      └─ <DistributionList kind="priority" />
      └─ <DistributionList kind="category" />
    <Toolbar>
      ├─ <SearchBox />
      ├─ <StatusTabs />
      ├─ <CategoryFilter />
      ├─ <PriorityFilter />
      ├─ <SortDropdown />
      ├─ <FilterBadges />
      └─ <Button kind="stamp">+ 新建待办</Button>
    <TodoList>
      └─ <TodoRow> × N
          ├─ <StatusCheckbox />
          ├─ <PriorityTag />
          ├─ <CategoryTag />
          ├─ <DueDateLabel />
          └─ <IconButton aria-label="编辑/删除" />
    <EmptyState variant="initial | filtered" />
  </PageContainer>

  <!-- Overlays -->
  <TodoDrawer />        // 新建/编辑（受控由 store 中的 ui slice 控制开关）
  <ConfirmDialog />     // 删除确认
</App>
```

> **UI slice 是否合并到 todoStore？** 是。理由：抽屉开关、当前编辑的 todo id、删除确认目标 id 都是简单的视图状态，单 store 足够，避免再起一个 `useUiStore`。

### D12. 性能与边界

- **列表渲染**：1000+ 条 todo 时是否需要虚拟列表？首版不做。原因：单条 row DOM 不复杂，React 18 自动批处理 + memo 即可。若实际超过 500 条出现明显卡顿，再引入 `@tanstack/react-virtual`。
- **派生计算 memo**：`deriveFilteredSorted` / `deriveStats` 在 Zustand selector 内每次都会跑，但 `useShallow` 比较结果对象浅相等，避免无谓 re-render。若 profile 显示热点，再用 `reselect` 风格 memo。
- **搜索防抖**：在 `SearchBox` 用 `useDebouncedValue(input, 200)`，将防抖后的值写入 store。

---

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **LocalStorage 容量上限（~5 MB）**：用户长期使用、不删除完成项时可能撑满 | 在 storage wrapper 中捕获 `QuotaExceededError`，回滚操作并 toast 提示；统计页面显示已用大小（v1.1 增强） |
| **数据损坏导致全部丢失**：浏览器异常关闭、用户手动改 LocalStorage | safeStorage 在反序列化失败时**备份到 `your-todo/v1.backup`** 而非删除，留有恢复机会 |
| **schema 升级**：未来字段增删 | persist `version` + `migrate` 机制；每次 schema breaking change MUST bump version |
| **Zustand v4 → v5 breaking**：useStore API 变化 | 锁版本到 `^5.x`；变更时跟随官方迁移指南 |
| **Tailwind v3 → v4** 重大变化 | 暂用 v3.4；v4 stable 后单独评估迁移 |
| **首版无 router，未来扩展受限** | 当前布局靠 Drawer / Modal 切换；若加"设置页"则引入 react-router-dom，路由跳转层加在 App.tsx，对组件影响可控 |
| **键盘快捷键冲突**：⌘K / ⌘N 在某些浏览器有原生含义 | ⌘K（地址栏搜索）原生影响小且常被前端 app 复用，社区已成共识；⌘N（新窗口）冲突大，改为 `N` 单键（在搜索框未聚焦时触发） |
| **手机端缺乏 hover**：操作按钮的"hover 才显示"会失效 | 手机端始终显示行末 `⋯` 按钮（点击展开操作菜单），桌面端 hover 显示 |
| **测试覆盖率指标**：无后端无法 e2e | 重点覆盖 `utils/*` 与 store actions（业务核心），组件测试聚焦关键交互；不强求 90% 覆盖率 |
| **设计 token 双写**：CSS 变量 + Tailwind 配置 | 单一 source of truth = CSS 变量；Tailwind 配置中 `colors.ink.900 = "var(--ink-900)"` 仅做名称映射，不重复定义值 |

---

## Migration Plan

由于本变更是项目零起点初始化，不涉及"从旧版本迁移"：

- **部署**：首版 `npm run build` 产出静态资源 → 部署 GitHub Pages / Vercel / Netlify
- **回滚**：任意时刻可回滚到上一个 git tag；用户的 LocalStorage 数据完全在客户端，回滚版本不会丢失数据（除非 schema 变更未做 migrate）
- **数据迁移路径**：用户级 → 通过 UI 内 "导出 JSON" 备份；schema 级 → 持久层 `version` + `migrate(state, oldVersion)`
- **首次发布检查**：
  1. 在三种浏览器（Chrome / Safari / Firefox）跑一遍金路径
  2. 在 iPhone 与 Android 各跑一遍移动端布局
  3. 用 axe-core CLI 跑无障碍扫描，至少满足 WCAG AA
  4. Lighthouse Performance 评分 ≥ 90（桌面）

---

## Open Questions

1. **是否要在首版引入暗色主题？**  
   倾向：**v1.0 不做**。暗色主题的优雅程度直接影响"高级感"评价，与其仓促交付不如下个版本认真做。Header 上的"主题切换"按钮**先不放**，避免承诺过的功能未实现。
2. **完成态待办是否要单独折叠区域？**  
   倾向：**不需要**。状态 Tab "已完成" 已经能筛选；列表内混合排列时，completed 的视觉降权（line-through + ink-300）已经足够。
3. **是否要支持子任务（嵌套待办）？**  
   已列入 Non-Goals。
4. **导出文件是否包含 filter/sort 状态？**  
   倾向：**包含**，便于完全还原用户工作环境。导入时提供"仅导入数据"选项可关闭恢复 UI 状态。
5. **是否要在 idle 时把数据备份到 `IndexedDB`？**  
   v1.0 不做。LocalStorage 简单可靠，IDB 引入额外复杂度。若用户 quota 紧张再考虑。
