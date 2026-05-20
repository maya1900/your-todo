## ADDED Requirements

### Requirement: 工程脚手架

系统 SHALL 基于 Vite 构建，使用 React 18 + TypeScript（`strict: true`）作为前端框架，Tailwind CSS 作为样式方案。

- `package.json` MUST 提供脚本：`dev`、`build`、`preview`、`lint`、`test`、`typecheck`
- `tsconfig.json` MUST 开启 `strict`、`noUnusedLocals`、`noUnusedParameters`、`noImplicitReturns`
- ESLint + Prettier MUST 集成，并在 lint 命令中执行

#### Scenario: 运行 dev 启动开发服务器
- **WHEN** 开发者在仓库根目录执行 `npm run dev`
- **THEN** Vite 开发服务器 MUST 在 5 秒内启动，并在终端打印本地 URL（默认 `http://localhost:5173`）

#### Scenario: 运行 build 产出静态资源
- **WHEN** 开发者执行 `npm run build`
- **THEN** 系统 MUST 在 `dist/` 目录下生成可部署的静态文件（`index.html` + JS/CSS bundle），且过程无 TypeScript 错误

#### Scenario: 运行 typecheck 通过
- **WHEN** 开发者执行 `npm run typecheck`
- **THEN** 系统 MUST 在零错误的情况下退出（exit code 0）

### Requirement: 全局布局

系统 SHALL 提供一个三段式主布局：
1. **顶部导航条 (Header)**：应用标题 + 导出/导入入口 + 主题切换（可选）
2. **统计卡片区 (Stats Bar)**：展示总览指标（参见 todo-statistics 能力）
3. **工具栏 + 列表区 (Main)**：搜索框 + 筛选器 + 排序下拉 + 新建按钮 + 待办列表
4. **抽屉/模态层 (Overlay)**：编辑/新建表单、删除确认

布局 MUST 在 ≥1024px 桌面端为最佳体验，并对 ≥768px 平板与 ≥375px 手机做响应式适配。

#### Scenario: 桌面端布局完整
- **WHEN** 用户在 1280×800 桌面浏览器打开应用
- **THEN** 系统 MUST 同时展示 Header、Stats Bar、工具栏与列表，列表项以单列卡片展示

#### Scenario: 手机端布局收起
- **WHEN** 用户在 375×667 手机浏览器打开应用
- **THEN** 系统 MUST 收起筛选器为下拉/抽屉形式，列表项保持单列，所有交互可触达

### Requirement: 主题与无障碍

系统 SHALL 在 UI 设计中遵循 WCAG AA 对比度（普通文本对比度 ≥ 4.5:1），所有交互元素 MUST 可通过键盘访问（Tab/Shift+Tab 导航，Enter/Space 触发）。

- 主要交互元素 MUST 有可见的 focus 样式
- 颜色 MUST NOT 是传达信息的唯一手段（例如优先级除了颜色还要文字标签）

#### Scenario: 键盘导航完成创建
- **WHEN** 用户仅使用键盘，先 Tab 到"新建"按钮按 Enter，在表单中用 Tab 切换字段填写并按 Enter 提交
- **THEN** 系统 MUST 完成创建流程，每个交互元素都有可见 focus 环

#### Scenario: 优先级有文字标识
- **WHEN** 用户在列表中查看一条 `urgent` 待办
- **THEN** 系统 MUST 同时使用颜色（红色调）与文字标签（"紧急"）表达优先级

### Requirement: 错误与空状态

系统 SHALL 为以下场景提供明确的 UI 反馈：
- 列表为空（无任何待办）
- 筛选后无结果
- LocalStorage 写入失败（参见 local-persistence）
- 表单校验失败

#### Scenario: 首次进入空列表
- **WHEN** 用户首次打开应用，store 中无任何数据
- **THEN** 系统 MUST 展示插画 + 文案"还没有待办，点击右上角'新建'开始吧"

#### Scenario: 筛选无结果
- **WHEN** 用户的筛选/搜索条件无匹配结果
- **THEN** 系统 MUST 展示"没有匹配的待办，试试调整筛选条件"，并提供"清除筛选"按钮

#### Scenario: 表单校验错误
- **WHEN** 用户提交标题为空的待办
- **THEN** 系统 MUST 在标题字段下方显示红色错误提示"标题不能为空"，并阻止提交

### Requirement: 路由

系统 SHALL 使用单页应用 (SPA) 路由结构。首版仅需要一个主路由 `/`，作为待办主页。

- 后续如需要"设置页"、"统计详情页"，MUST 通过 React Router 添加 `/settings`、`/stats` 等路径
- 首版可不引入 react-router 依赖，使用单页结构 + 内部状态切换抽屉/模态即可

#### Scenario: 直接访问根路径
- **WHEN** 用户访问 `http://localhost:5173/`
- **THEN** 系统 MUST 渲染主页（Header + Stats Bar + 工具栏 + 列表）
