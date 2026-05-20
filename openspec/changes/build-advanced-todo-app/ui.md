# UI 设计文档 — your-todo

> 高级待办事项 Web 应用 · 视觉语言与组件规范
> 配套提案：`proposal.md` · 配套技术设计：`design.md` · 可视化原型：`ui-preview.html`

---

## 1. 设计概念

### 一句话定位
**"一本可以呼吸的、属于你自己的索引卡片簿。"**

待办应用泛滥的市场上，大多数产品都长得像同一个：白底 + 圆角卡片 + 紫蓝渐变 + Inter 字体。本作品刻意走相反方向：**借用图书馆索引卡 / 老式办公档案柜 / 编辑部排版台的视觉语言**，让"管理任务"这件枯燥的事，回到一种克制、专注、有手感的氛围。

### 三个不变量
1. **纸感底色，不用纯白**——背景永远带一丝米黄，让屏幕在长时间使用下不灼眼。
2. **细线 + 方角**——几乎所有分隔靠 1px 细线，几乎所有形状是方形或仅有 2px 极小圆角，拒绝塑料感。
3. **印章式重点色**——主色调高度克制（黑+米），仅在"紧急"、"逾期"、"提交按钮"这种语义最强的位置放一抹**朱砂红 (#B33A3A)**，像档案盖章。

### 灵感关键词
`索引卡` · `老式编辑部` · `Monocle 杂志版式` · `日本文具店` · `Cabinet card` · `图书登记簿` · `编号化`

### 反向（明确不要）
- ❌ 紫色渐变背景、磨砂玻璃、霓虹色
- ❌ 多余的插画、emoji 表情、3D 卡通
- ❌ 大圆角、立体阴影、新拟物
- ❌ Inter / Roboto / Arial 这类被用滥的中性字体

---

## 2. 设计 Token

### 2.1 色板

所有颜色 MUST 通过 CSS 变量定义，方便未来扩展暗色主题（首版仅亮色）。

| Token | 值 | 用途 |
|---|---|---|
| `--ink-900` | `#1A1A18` | 主文字、标题、图标 |
| `--ink-700` | `#3D3B36` | 副标题、加重正文 |
| `--ink-500` | `#6B6760` | 次要正文、placeholder |
| `--ink-300` | `#9A9489` | 禁用文字、辅助标签 |
| `--paper-50` | `#FBF8F1` | 主背景（页面） |
| `--paper-100` | `#F5F0E3` | 次级背景（统计卡片底） |
| `--paper-200` | `#EDE6D2` | hover 态背景 |
| `--rule-200` | `#E0D8C2` | 浅分隔线 |
| `--rule-400` | `#C7BFA8` | 强分隔线、卡片边框 |
| `--stamp-600` | `#B33A3A` | 强调色（主按钮、紧急、印章） |
| `--stamp-700` | `#8A2A2A` | hover / active |
| `--stamp-100` | `#F5E0DC` | 极淡背景（紧急 tag 底） |
| `--ink-on-stamp` | `#FBF8F1` | 红色块上的文字 |

#### 语义色（优先级）

| Token | 文字色 | 背景色 | 用途 |
|---|---|---|---|
| `--prio-low` | `#5C6B4F` | `#E8EBE0` | 优先级 · 低 |
| `--prio-medium` | `#8C6A1F` | `#F2EAD0` | 优先级 · 中 |
| `--prio-high` | `#A14820` | `#F4DDCD` | 优先级 · 高 |
| `--prio-urgent` | `#FBF8F1` | `#B33A3A` | 优先级 · 紧急 |

> **规则**：所有优先级标签 MUST 同时使用配色 + 文字，禁止仅用颜色传达信息。

#### 语义色（状态）

| Token | 值 | 用途 |
|---|---|---|
| `--state-pending` | `#6B6760` | 待办（中性墨色） |
| `--state-progress` | `#2E5F7E` | 进行中（深青蓝，像旧地图） |
| `--state-completed` | `#4A6B4A` | 已完成（橄榄绿，像复核章） |
| `--state-overdue` | `#8B1F1F` | 逾期（深红，像红线警告） |

#### 对比度

所有正文/标签 MUST 通过 WCAG AA：

- `--ink-900` on `--paper-50` → 对比度 ≈ 14.5:1 ✅
- `--ink-500` on `--paper-50` → 对比度 ≈ 5.8:1 ✅
- `--ink-on-stamp` on `--stamp-600` → 对比度 ≈ 7.2:1 ✅
- `--prio-low` 文字 on 自身背景 → ≥ 5.0:1 ✅

### 2.2 字体

#### 字族（三件套）

```css
--font-display: "Fraunces", "Songti SC", "Source Han Serif SC", serif;
--font-body:    "IBM Plex Sans", "PingFang SC", "Hiragino Sans GB",
                "Source Han Sans SC", system-ui, sans-serif;
--font-mono:    "IBM Plex Mono", "SF Mono", "JetBrains Mono", monospace;
```

| 字族 | 角色 | 理由 |
|---|---|---|
| **Fraunces** | display：统计大数字、页面标题、空状态主标题 | variable font，支持 `opsz`/`SOFT`/`WONK`，在大字号下有 stencil 印刷感，独特但不张扬 |
| **IBM Plex Sans** | body：正文、标签、按钮、表单 | 工业制图基因，几何 + 人文，自带"档案柜"气质 |
| **IBM Plex Mono** | mono：编号 №.001、日期戳、键盘提示 | 跟 Plex Sans 同家族，行业感强 |

#### 字号阶梯（4px 基线，倍率 1.25 — major third）

| Token | 值 | line-height | 字重 | 用途 |
|---|---|---|---|---|
| `text-display-2xl` | 56px / 3.5rem | 1.02 | 400 (Fraunces) | 统计大数字 |
| `text-display-xl` | 40px / 2.5rem | 1.05 | 400 | 空状态主标题、对话框主标题 |
| `text-display-lg` | 28px / 1.75rem | 1.15 | 500 | Header 应用标题 |
| `text-body-lg` | 18px / 1.125rem | 1.55 | 400 | 待办卡片标题 |
| `text-body` | 15px / 0.9375rem | 1.55 | 400 | 正文、表单输入 |
| `text-body-sm` | 13px / 0.8125rem | 1.5 | 400 | 描述摘要、辅助说明 |
| `text-label` | 11px / 0.6875rem | 1.3 | 500 | 区段标题（ALL CAPS，letter-spacing 0.14em） |
| `text-caption` | 10px / 0.625rem | 1.3 | 500 | 徽章、tag |
| `text-mono` | 12px / 0.75rem | 1.4 | 400 | 编号、日期戳 |

> **规则**：
> - `text-label` MUST 配 `text-transform: uppercase` + `letter-spacing: 0.14em`，是本设计的视觉招牌。
> - 中文区段标题不大写化，但 letter-spacing 设为 `0.08em`。

### 2.3 间距 (Spacing)

4px 基线，使用 Tailwind 默认刻度（`0.5`、`1`、`2`、`3`、`4`、`6`、`8`、`12`、`16`、`20`、`24`）。本设计偏向**疏密对比**：

- 列表项之间：`gap-0`（无 gap，靠分隔线区隔，像登记簿一行一行）
- 列表项内部：`p-6`（24px，给信息呼吸）
- 卡片之间：`gap-3`（12px）
- 统计卡片之间：`gap-px`（1px，靠极细分隔模拟"格子"，更像档案柜）
- 主内容左右内边距：`px-8`（32px，桌面）/ `px-4`（16px，手机）
- 主内容上下：`py-12`（48px，给"杂志感"留呼吸空间）

### 2.4 圆角 (Border Radius)

| Token | 值 | 使用范围 |
|---|---|---|
| `rounded-none` | `0` | 卡片、分隔条、统计盒子（**默认**） |
| `rounded-sm` | `2px` | 按钮、tag、输入框（仅一点点，避免完全锋利） |
| `rounded-md` | `4px` | 抽屉/模态容器 |
| `rounded-full` | `9999px` | 状态指示圆点、头像（少量使用） |

> **规则**：默认 **无圆角**。圆角是例外不是默认。

### 2.5 阴影 (Shadow)

刻意克制，绝大多数靠 `border` 制造层级。

| Token | 值 | 用途 |
|---|---|---|
| `shadow-paper-1` | `0 1px 0 var(--rule-200)` | 列表分隔（实际是 border-bottom） |
| `shadow-paper-2` | `0 2px 8px rgba(26,26,24,0.04), 0 1px 2px rgba(26,26,24,0.06)` | 悬浮卡片（hover） |
| `shadow-paper-3` | `0 12px 32px rgba(26,26,24,0.10), 0 4px 12px rgba(26,26,24,0.06)` | 抽屉、模态 |
| `shadow-stamp` | `0 0 0 1px var(--stamp-600), 0 4px 12px rgba(179,58,58,0.18)` | 主按钮 focus 态、"紧急"印章悬浮 |

### 2.6 边框 (Border)

`border-color` 默认使用 `--rule-400`（强分隔线，深米色）；表单输入、按钮使用 `--ink-900`（一律黑色实线，最具版式感）。

```css
--border-thin: 1px solid var(--rule-400);    /* 分隔、容器 */
--border-strong: 1px solid var(--ink-900);   /* 输入框、按钮 */
--border-stamp: 1.5px solid var(--stamp-600);/* 强调框、focus */
```

---

## 3. 全局布局

### 3.1 三段式主布局

```
┌─────────────────────────────────────────────────────────────┐
│  ╭─ HEADER (sticky, h=64px) ─────────────────────────────╮  │
│  │  YOUR · TODO  №.INDEX        [⇣Export][⇡Import]  [⚙]  │  │
│  ╰────────────────────────────────────────────────────────╯  │
│                                                              │
│  ╭─ STATS BAR ────────────────────────────────────────────╮  │
│  │  TASKS IN MOTION                                       │  │
│  │  [总数 42][进行 14][完成 28][率 66.7%][逾期 3]         │  │
│  │  ─── 优先级分布 ────  ─── 分类 Top 5 ────              │  │
│  ╰────────────────────────────────────────────────────────╯  │
│                                                              │
│  ╭─ TOOLBAR (sticky on scroll) ───────────────────────────╮  │
│  │  [🔍 Search]  [All|Pending|InProgress|Done]  ▼Cat ▼Pri │  │
│  │  ▼Sort        active: [Work×][Urgent×] [Clear]  [+New] │  │
│  ╰────────────────────────────────────────────────────────╯  │
│                                                              │
│  ╭─ LIST (无 gap，靠分隔线) ──────────────────────────────╮  │
│  │  №.001  ◯  Finish Q3 report …  [URGENT][Work]  ⏱     │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  №.002  ●  Review PR #1234   …  [HIGH][Work]    ⏱     │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │  …                                                      │  │
│  ╰────────────────────────────────────────────────────────╯  │
└─────────────────────────────────────────────────────────────┘
                          ▲
                  [+] FAB (mobile only)
```

### 3.2 容器宽度

- 主内容容器 max-width: **1080px**，左右居中
- 桌面 ≥1280px：左右各 32px padding
- 平板 768-1279px：左右各 24px padding
- 手机 <768px：左右各 16px padding

### 3.3 响应式断点

沿用 Tailwind 默认：

| 断点 | 起始宽度 | 主要变化 |
|---|---|---|
| `<sm` | 0-639px | 单列；筛选改为底部抽屉；工具栏堆叠两行；统计卡 2×2 网格；新建按钮变 FAB |
| `sm` | ≥640px | 工具栏单行；统计卡 2×3 |
| `md` | ≥768px | 抽屉宽度 480px |
| `lg` | ≥1024px | **最佳体验**：统计卡 5 列（含逾期数）、分布图表并排 |
| `xl` | ≥1280px | 主内容容器固定 1080px |

---

## 4. 核心组件规范

### 4.1 Header

**结构**

```
[YOUR·TODO]                                    [Export] [Import] [Theme]
   ↑                                                ↑
display-lg, Fraunces 500          icon button, 36×36, 仅图标
"·" 分隔符颜色 var(--stamp-600)，是本作品的"印章"符号
```

**规范**

- 高度 64px，桌面 `sticky top-0`，背景 `var(--paper-50)` + 底部 `border-b-thin`
- 滚动超过 80px 后 `border-b-strong`（从 `--rule-400` 变 `--ink-900`，制造"页眉压实"效果）
- 应用标题与 LOGO 视觉合一：用 Fraunces 500，字号 22px，字距 `tracking-tight`，中间的 "·" 改用红色作为微视觉锚点
- 右侧操作按钮使用 ghost 风格（仅图标，hover 显示 1px 边框）

**Tailwind 示例**

```html
<header class="sticky top-0 z-30 h-16 border-b border-[--rule-400]
               bg-[--paper-50]/90 backdrop-blur supports-[backdrop-filter]:bg-[--paper-50]/70">
  <div class="mx-auto flex h-full max-w-[1080px] items-center justify-between px-8">
    <div class="font-display text-[22px] font-medium tracking-tight text-[--ink-900]">
      YOUR<span class="mx-2 text-[--stamp-600]">·</span>TODO
      <span class="ml-3 font-mono text-[11px] tracking-[0.2em] text-[--ink-500]">№.INDEX</span>
    </div>
    <nav class="flex items-center gap-1">
      <button class="h-9 w-9 grid place-items-center text-[--ink-700]
                     hover:bg-[--paper-200] hover:text-[--ink-900]
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-[--stamp-600] focus-visible:ring-offset-2
                     focus-visible:ring-offset-[--paper-50]">
        <!-- icon: download -->
      </button>
      <!-- ... -->
    </nav>
  </div>
</header>
```

### 4.2 统计卡片区 (Stats Bar)

**结构**

```
─── TASKS IN MOTION · 2026.05.20 ───────────────────────
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│   42    │   14    │   28    │ 66.7%   │    3    │
│  TOTAL  │ ACTIVE  │  DONE   │  RATE   │ OVERDUE │
└─────────┴─────────┴─────────┴─────────┴─────────┘
─── BY PRIORITY ─────────  ─── BY CATEGORY ────────
Urgent   ████░░░░ 4         Work       ███████ 12
High     ██████░░ 7         Personal   █████ 8
Medium   █████░░░ 5         Study      ███ 5
Low      █░░░░░░░ 1         Other      ██ 3
```

**规范**

- 区段标题：`text-label`（11px ALL CAPS letter-spacing 0.14em），左对齐，左右用 `─` (em-dash) 装饰
- 数字格子：`grid grid-cols-5`，**格子间用 1px 内边线，无圆角，无外阴影**
  - 大数字：`text-display-2xl`（Fraunces 56px，`font-feature-settings: 'opsz' on; font-variation-settings: 'opsz' 144`）
  - 标签：`text-label`，下置，色 `--ink-500`
  - "逾期" 数字 ≥1 时，数字色变 `--state-overdue`，背景加 1px 红边
- 分布条形图：纯 CSS，使用 `▰▰▰▰░░░░` 或者 `<div>` 块状元素
  - 条形使用 `--ink-700` 实色，背景 `--rule-200` 占位
  - 高度 6px，标签宽度 80px，对齐"标签 - 条形 - 数字"三列

**手机端 (<sm)**：5 个数字格子改为 `grid-cols-2`，"逾期"独占一行（视觉强调）。

### 4.3 工具栏 (Toolbar)

**结构**

```
[🔍 search…   ⌘K]  [All|Pending|InProgress|Done]    [+ New Todo]
[Category ▼] [Priority ▾] [Sort: Recent ▼]          [Clear all]
active: [Category: Work ×] [Priority: Urgent ×]
```

**规范**

- **搜索框**：高 40px，左 icon 16px，右侧显示快捷键提示 `⌘K`（`font-mono` 灰色），无圆角，`border-strong`（黑实线），focus 时变 `border-stamp` + `shadow-stamp`
- **状态 Tab**：横向分段控件，4 段等宽（也可自适应）；选中态为 `bg-[--ink-900] text-[--paper-50]`，未选中为 `text-[--ink-500] hover:text-[--ink-900]`，**无圆角**
- **筛选下拉**：按钮 + popover，按钮 36px 高，`border-thin`，标签后跟 ▾ 字符（不用 SVG icon，更"印刷"）
- **排序下拉**：同筛选，但左侧加 `↕` 字符
- **新建按钮**：**唯一的红色填充按钮**，`bg-[--stamp-600] text-[--paper-50]`，高 40px，hover 变 `--stamp-700`，按下 `translate-y-[1px]`（像盖章）
  - 内文：`+ 新建待办`（中文），字重 500
- **生效筛选徽章**：方形 tag，背景 `--paper-200`，左侧分类色点（4px），右侧 `×` 按钮，点击移除
- **Clear all**：纯文字按钮 `underline-offset-4`，色 `--ink-500` hover 变 `--stamp-600`

### 4.4 待办卡片 (Todo Row)

**这是整个应用最高频接触的组件，必须打磨。**

**结构（桌面）**

```
┌──────────────────────────────────────────────────────────────────┐
│  №.001   ◯   Finish Q3 financial report                          │
│              Write the executive summary, attach charts and …     │
│              [URGENT]  [Work]   ⏱ Due 2026-05-22 · 2 天后          │
│                                                       [⋯ actions] │
└──────────────────────────────────────────────────────────────────┘
   编号        标题                                       hover 时
   12px      18px Plex Sans 500                            浮现
   mono     描述 13px ink-500，最多 1 行 ellipsis
            tags                  日期戳 12px mono
```

**规范**

- **整行**：`px-6 py-5`，`border-b border-[--rule-200]`，无独立卡片背景（依靠分隔线区隔）
- **编号** №.001：`font-mono text-[12px] text-[--ink-300]`，宽度固定 56px，垂直顶对齐，模拟"卡片编号"
- **完成复选框**：32×32 命中区，视觉是 18×18 方形
  - `pending`：◯ 空心圆，1.5px 边框 `--ink-500`
  - `in-progress`：◐ 半填充，色 `--state-progress`
  - `completed`：◉ 黑色实心圆 + 白色 ✓
  - **不用原生 checkbox**，用自定义按钮实现，确保视觉一致
- **标题**：`text-body-lg font-medium text-[--ink-900]`
  - completed 状态：`line-through text-[--ink-300]`
- **描述摘要**：`text-body-sm text-[--ink-500]`，单行 `truncate`，无描述时整行不渲染
- **元信息行**（tags + 日期）：上间距 12px，水平 gap-3
  - 优先级 tag：详见 §5.1
  - 分类 tag：高 22px，方形 `rounded-sm`，背景 `--paper-200`，文字 `--ink-700`，前缀 `#`（像 hashtag）
  - 日期戳：`font-mono text-[12px] text-[--ink-500]`，前缀字符 `⏱`（U+23F1）
    - 逾期：色变 `--state-overdue`，文字加 `font-medium`，附加 `· 已逾期 N 天`
    - 今天到期：色变 `--prio-high` 文字，加 `· 今天到期`
    - 明天到期：附加 `· 明天`
- **操作菜单**：默认隐藏，hover 时浮现在右侧
  - 三个按钮：编辑、删除、（移动端）展开
  - 36×36 命中区，ghost 风格

**交互**

| 事件 | 反馈 |
|---|---|
| 整行 hover | 背景从 `--paper-50` 渐变到 `--paper-100`（150ms），右侧操作按钮浮现 |
| 整行点击 | 打开编辑抽屉 |
| 复选框点击 | **就地状态切换**（不打开抽屉），打勾时附加 50ms 的 scale 0.9→1 动画 |
| 完成动画 | 标题先变灰再加 line-through（200ms 顺序触发）|

### 4.5 抽屉 / 模态 (Drawer / Modal)

**新建/编辑表单 → 右侧抽屉**

- 桌面：从右侧滑入，宽 **480px**，全高
- 手机：从底部滑入，全宽，高度 90vh，顶部 `rounded-t-md`
- 背景遮罩：`bg-[--ink-900]/30 backdrop-blur-sm`
- 容器：`bg-[--paper-50]`，左边 `border-l-strong`（黑实线，像装订线）

**结构**

```
─── № NEW · 2026.05.20 ───────────────────────── [×]
TITLE *
[___________________________________________________]

DESCRIPTION
[___________________________________________________]
[___________________________________________________]

DUE DATE          PRIORITY
[YYYY/MM/DD ▾]    [LOW][MED][HIGH][URGENT]   ← 分段选择器

CATEGORY *
[Work ▾] or [+ 创建新分类]

                              [Cancel]  [Save & Stamp]
                                            ↑ 红色印章按钮
```

**字段规范**

- 字段标签：`text-label`（ALL CAPS 11px letter-spacing 0.14em），上间距 24px
- 输入框：高 44px，`border-strong`（黑实线），`px-3`，focus 变 `border-stamp` + `outline-none ring-2 ring-[--stamp-100]`
- 必填星号：`text-[--stamp-600] ml-1`
- 错误提示：`text-body-sm text-[--state-overdue]`，下间距 4px
- 字符计数：右下角小字 `text-[11px] text-[--ink-300]`，超出时变红
- 优先级分段选择器：4 段等宽 button group，选中态填该优先级语义色背景，未选中态透明 + 1px 边
- 主按钮"Save & Stamp"：红色印章风，hover scale 1.02，按下 translate-y-[1px]

**删除确认 → 居中模态**

- 宽 400px，居中
- 标题：`Delete this entry?`（display-xl Fraunces）
- 描述：`此操作不可撤销。待办「{title}」将被永久删除。`
- 按钮：左侧 Cancel（ghost），右侧 Delete（红色实心，强调）
- 焦点默认在 Cancel（防止误删）

### 4.6 空状态

**首次进入（无任何待办）**

```
                  ─── 空白卡片 ───
                       №.000

                  你的索引还没开始。
                  Start your first entry.

                  [+  新建第一条待办]
```

- 整个空状态垂直居中于列表区域，最小高度 400px
- 编号 №.000：`font-mono text-[--ink-300]`
- 主标题：`text-display-xl font-display`，中文标题 + 英文副标
- 主按钮：红色印章按钮

**筛选后无结果**

```
                  ─── № NULL ───

                  这个组合下没有任何待办。
                  Try adjusting your filters.

                  [Clear filters]
```

- 第二个 CTA 按钮：清除筛选（次按钮 ghost 风）

### 4.7 Toast / 临时提示

- 位置：右下角，距边缘 24px
- 宽度自适应，max-width 360px
- 容器：`bg-[--ink-900] text-[--paper-50] px-4 py-3 rounded-sm shadow-paper-3`
- 进入：从下滑入 200ms ease-out
- 自动消失：4 秒（错误类 6 秒）
- 错误 toast 加左侧 4px 红色竖线 (`border-l-4 border-[--stamp-600]`)

---

## 5. 语义视觉系统

### 5.1 优先级 Tag

```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│   LOW   │ │   MED   │ │  HIGH   │ │ URGENT  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
 olive bg   wheat bg    rust bg     stamp red bg
 olive ink  wheat ink   rust ink    paper ink (反白)
```

- 高度 22px，padding `px-2`，`text-caption`（10px 500 letter-spacing 0.1em）
- 文字一律大写（`uppercase`），中文展示时用 `低 / 中 / 高 / 紧急`，加 `tracking-wider`
- `urgent` 是唯一**反白**填充的优先级（红底白字），强烈醒目
- 紧急 tag 在 hover 卡片时附加 `shadow-stamp` 微微闪一下（120ms），像印章未干

### 5.2 状态指示

| 状态 | 复选框图形 | 圆点（用在 stats 等场景） |
|---|---|---|
| pending | ◯ 空心，`--ink-500` | • `--state-pending` |
| in-progress | ◐ 半填，`--state-progress` | • `--state-progress` |
| completed | ◉ 实心 + ✓，`--ink-900` 背景 + `--paper-50` 勾 | • `--state-completed` |
| overdue | — | • `--state-overdue` (附加在 dueDate 上) |

### 5.3 日期格式

- 列表中：`2026.05.22`（年.月.日，等宽，配 Plex Mono）
- 编辑表单：原生 `<input type="date">` 但样式重置为黑边框方角
- 相对时间（辅助）：`今天 / 明天 / N 天后 / N 天前`，使用 date-fns `formatDistanceToNowStrict({ locale: zhCN })`
- 逾期：始终展示 `已逾期 N 天`，色变红

---

## 6. 交互与微动效

> 基调：**克制**。动效服务于"反馈"，不为"炫技"。

### 6.1 动画曲线

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);     /* 主体 ease-out (类似 Material easing) */
--ease-stamp: cubic-bezier(0.34, 1.56, 0.64, 1); /* 弹一下，仅用于"盖章"按钮按下 */
--ease-rule: linear; /* 分隔线展开，保持机械感 */
```

### 6.2 关键动效

| 场景 | 动效 |
|---|---|
| 页面首次加载 | Header `fade-in 200ms`，统计数字"翻牌"效果（0 → 实际值，使用 CSS `@property` + counter，500ms）；列表项**自上而下**逐行 `translate-y(8px → 0) + opacity(0 → 1)`，stagger 40ms |
| 列表项 hover | 背景渐变 150ms，操作按钮 fade-in 150ms |
| 完成复选框点击 | 复选框 scale `0.9 → 1` 120ms，标题 line-through 在 200ms 后浮现（顺序感），整行轻微抖动 `translate-x(-2px → 0)` 100ms（"盖章"反馈） |
| 删除 | 整行高度收缩 + opacity 0，220ms，配合 toast 提示 |
| 抽屉打开 | 遮罩 fade-in 150ms，抽屉 translate-x 200ms `--ease-out` |
| 主按钮（红印章） | hover scale 1.02 + 阴影增强；按下 `translate-y-[1px]` + 阴影收缩，模拟盖章接触 |
| 筛选条件变更 | 列表项跨度变化时使用 `view-transition` 或 FLIP 简化版（首版可只做 fade） |
| 表单字段 focus | `border-color` + `box-shadow` 同步过渡 120ms |

### 6.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

所有"印章弹跳"、列表 stagger、抽屉滑入等动效 MUST 在用户开启 reduced-motion 时退化为瞬时切换。

---

## 7. 无障碍 (Accessibility)

### 7.1 键盘导航

| 按键 | 行为 |
|---|---|
| `Tab` / `Shift+Tab` | 在所有可交互元素间循环；顺序符合视觉阅读顺序 |
| `Enter` / `Space` | 触发按钮 / 切换复选框 / 提交表单 |
| `Esc` | 关闭抽屉/模态；清空搜索框（如已聚焦） |
| `⌘/Ctrl + K` | 聚焦搜索框（全局快捷键） |
| `⌘/Ctrl + N` | 打开新建抽屉 |
| `↑ / ↓` | 在列表项之间移动焦点（roving tabindex） |
| `D` | 删除当前焦点上的待办（带二次确认） |

### 7.2 Focus 样式

**所有**可交互元素 MUST 有可见 focus 环：

```css
.focus-ring {
  outline: none;
  box-shadow: 0 0 0 2px var(--paper-50), 0 0 0 4px var(--stamp-600);
}
```

不要用浏览器默认的蓝色虚线。

### 7.3 ARIA

- 状态 Tab 用 `role="tablist"` + `role="tab"` + `aria-selected`
- 复选框用 `role="checkbox"` + `aria-checked` + `aria-label="标记完成 / 取消完成"`
- 优先级分段选择器：`role="radiogroup"`，每个选项 `role="radio"`
- 抽屉用 `role="dialog"` + `aria-modal="true"` + `aria-labelledby`，打开时 trap focus
- 列表用 `role="list"`，每行 `role="listitem"`
- 统计区域：每个数字格用 `<dl>` 结构（`<dt>` 标签 + `<dd>` 数字），便于读屏理解

### 7.4 颜色与对比

- 优先级**不仅靠颜色**：每个 tag 同时有文字标签
- 状态**不仅靠颜色**：复选框图形 (◯/◐/◉) 也区分
- 错误**不仅靠红色**：错误提示前加图标 `⚠` + 文字 `错误：`

### 7.5 文案与读屏

- 所有图标按钮 MUST 有 `aria-label`
- 状态切换 toast 用 `role="status"` + `aria-live="polite"`
- 删除确认 toast 用 `role="alert"` + `aria-live="assertive"`
- 数字大变化时（统计区刷新）使用 `aria-live="polite"`，但避免过于频繁

---

## 8. Tailwind 配置建议

`tailwind.config.ts` 关键扩展：

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "var(--ink-900)",
          700: "var(--ink-700)",
          500: "var(--ink-500)",
          300: "var(--ink-300)",
        },
        paper: {
          50:  "var(--paper-50)",
          100: "var(--paper-100)",
          200: "var(--paper-200)",
        },
        rule: {
          200: "var(--rule-200)",
          400: "var(--rule-400)",
        },
        stamp: {
          100: "var(--stamp-100)",
          600: "var(--stamp-600)",
          700: "var(--stamp-700)",
        },
        prio: {
          low:    "var(--prio-low)",
          medium: "var(--prio-medium)",
          high:   "var(--prio-high)",
          urgent: "var(--prio-urgent)",
        },
        state: {
          pending:   "var(--state-pending)",
          progress:  "var(--state-progress)",
          completed: "var(--state-completed)",
          overdue:   "var(--state-overdue)",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Songti SC", "serif"],
        sans:    ["IBM Plex Sans", "PingFang SC", "system-ui", "sans-serif"],
        mono:    ["IBM Plex Mono", "SF Mono", "monospace"],
      },
      fontSize: {
        "display-2xl": ["3.5rem",   { lineHeight: "1.02", fontWeight: "400" }],
        "display-xl":  ["2.5rem",   { lineHeight: "1.05", fontWeight: "400" }],
        "display-lg":  ["1.75rem",  { lineHeight: "1.15", fontWeight: "500" }],
        "body-lg":     ["1.125rem", { lineHeight: "1.55", fontWeight: "400" }],
        "body":        ["0.9375rem",{ lineHeight: "1.55", fontWeight: "400" }],
        "body-sm":     ["0.8125rem",{ lineHeight: "1.50", fontWeight: "400" }],
        "label":       ["0.6875rem",{ lineHeight: "1.30", fontWeight: "500", letterSpacing: "0.14em" }],
        "caption":     ["0.625rem", { lineHeight: "1.30", fontWeight: "500", letterSpacing: "0.10em" }],
      },
      boxShadow: {
        "paper-2": "0 2px 8px rgba(26,26,24,0.04), 0 1px 2px rgba(26,26,24,0.06)",
        "paper-3": "0 12px 32px rgba(26,26,24,0.10), 0 4px 12px rgba(26,26,24,0.06)",
        "stamp":   "0 0 0 1px var(--stamp-600), 0 4px 12px rgba(179,58,58,0.18)",
      },
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(0.16, 1, 0.3, 1)",
        "stamp":     "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
} satisfies Config;
```

`index.css`（CSS 变量注入）：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap");

:root {
  --ink-900: #1A1A18;
  --ink-700: #3D3B36;
  --ink-500: #6B6760;
  --ink-300: #9A9489;

  --paper-50:  #FBF8F1;
  --paper-100: #F5F0E3;
  --paper-200: #EDE6D2;

  --rule-200: #E0D8C2;
  --rule-400: #C7BFA8;

  --stamp-100: #F5E0DC;
  --stamp-600: #B33A3A;
  --stamp-700: #8A2A2A;

  --prio-low:    #5C6B4F;
  --prio-medium: #8C6A1F;
  --prio-high:   #A14820;
  --prio-urgent: #B33A3A;

  --state-pending:   #6B6760;
  --state-progress:  #2E5F7E;
  --state-completed: #4A6B4A;
  --state-overdue:   #8B1F1F;
}

body {
  background: var(--paper-50);
  color: var(--ink-900);
  font-family: theme("fontFamily.sans");
  font-feature-settings: "ss01", "cv11";  /* IBM Plex stylistic alternates */
}

::selection {
  background: var(--stamp-100);
  color: var(--stamp-700);
}
```

---

## 9. 设计交付清单 (Definition of Done)

实现侧验收 UI 时按本清单逐条核对：

- [ ] 三件套字体已 `@import` 且 `font-display: swap`
- [ ] CSS 变量全部注入到 `:root`
- [ ] 优先级 / 状态全部 4 种各能区分（颜色 + 文字 + 形状）
- [ ] 主按钮（红色印章）全站只有一个色 `--stamp-600`，无其他实色按钮
- [ ] 列表行无圆角、靠 `border-b` 区隔
- [ ] 复选框使用自定义图形（◯/◐/◉），未使用原生 checkbox
- [ ] 大数字使用 Fraunces 且开启 `opsz` variable axis
- [ ] 区段标题为 ALL CAPS + letter-spacing 0.14em
- [ ] 所有交互元素有可见 focus 环（非浏览器默认蓝色）
- [ ] `prefers-reduced-motion` 已生效
- [ ] 桌面 / 平板 / 手机三个断点截图通过 review
- [ ] WCAG AA 对比度通过（用 axe-core 扫一遍）
- [ ] 键盘可完成"新建 → 编辑 → 完成 → 删除"完整流程

---

## 10. 参考与示意

- 可视化原型：见同目录 [`ui-preview.html`](./ui-preview.html)（单文件 HTML，浏览器直接打开）
- Fraunces font: https://fonts.google.com/specimen/Fraunces
- IBM Plex font: https://fonts.google.com/?query=IBM+Plex
- 灵感参考：Monocle Magazine、Cabinet Magazine、日本图书馆索引卡、Linear changelog 排版
