## ADDED Requirements

### Requirement: LocalStorage 自动持久化

系统 SHALL 通过 Zustand `persist` middleware，将待办相关的状态**全量序列化**到浏览器 LocalStorage，键名 MUST 为 `your-todo/v1`。

- 序列化格式 MUST 为 JSON
- 每次 store 内 state 发生变化时，MUST 在 300ms 内（debounce）写入 LocalStorage
- 应用启动时 MUST 自动从 LocalStorage 中读取并 rehydrate state

#### Scenario: 新增待办后刷新页面数据仍在
- **WHEN** 用户创建一条待办，等待 1 秒后按 F5 刷新浏览器
- **THEN** 应用重新加载后 MUST 在列表中展示这条待办，所有字段与刷新前一致

#### Scenario: 删除待办后刷新页面不复现
- **WHEN** 用户删除一条待办，等待 1 秒后刷新浏览器
- **THEN** 应用重新加载后 MUST NOT 在列表中展示这条已删除的待办

#### Scenario: 关闭浏览器后重新打开数据仍在
- **WHEN** 用户创建一批待办，完全关闭浏览器，再次打开同一个 URL
- **THEN** 应用 MUST 还原之前的全部待办数据

### Requirement: Schema 版本管理与迁移

系统 SHALL 在持久化数据中存储一个 `version` 字段，初始版本为 `1`。当代码侧 schema 升级时，MUST 通过 persist middleware 的 `migrate` 钩子将旧版本数据转换为新版本结构。

#### Scenario: 读取时版本匹配
- **WHEN** LocalStorage 中存储的数据 `version = 1`，当前代码期望 `version = 1`
- **THEN** 系统 MUST 直接 rehydrate，不触发迁移

#### Scenario: 读取时版本落后
- **WHEN** LocalStorage 中存储的数据 `version = 1`，当前代码期望 `version = 2`
- **THEN** 系统 MUST 调用 `migrate(state, 1)`，并将结果作为初始 state

#### Scenario: 读取时版本超前
- **WHEN** LocalStorage 中存储的数据 `version = 99`，当前代码仅支持 `version ≤ 1`
- **THEN** 系统 MUST 不破坏 LocalStorage 数据，并向用户展示友好提示（例如"检测到不兼容的数据版本，请升级应用"）

### Requirement: 数据损坏容错

系统 SHALL 在 LocalStorage 反序列化失败、数据结构异常或缺失关键字段时，回退到空 state，并 SHOULD 将损坏数据备份到 `your-todo/v1.backup` 键，方便用户找回。

#### Scenario: JSON 解析失败
- **WHEN** LocalStorage 中 `your-todo/v1` 的值不是合法 JSON
- **THEN** 系统 MUST 以空 state 启动，备份原值到 `your-todo/v1.backup`，并在控制台输出警告

#### Scenario: 必填字段缺失
- **WHEN** 反序列化后某条待办缺少 `id` 或 `title`
- **THEN** 系统 MUST 丢弃该条无效记录，其余正常加载

### Requirement: 隐私与容量约束

系统 SHALL 在数据规模接近浏览器 LocalStorage 容量上限（通常 5 MB）时，向用户展示警告。

- 任何待办 MUST NOT 包含敏感信息提示（系统不主动加密；用户对存储内容自负其责）
- 当 LocalStorage 写入抛出 `QuotaExceededError` 时，系统 MUST 捕获并向用户展示明确错误，不进入崩溃状态

#### Scenario: 写入超出配额
- **WHEN** 用户尝试新增待办，但 LocalStorage 已满，写入抛 `QuotaExceededError`
- **THEN** 系统 MUST 回滚本次新增操作，并向用户提示"本地存储空间已满，请清理后重试"

### Requirement: 一键导出 / 导入

系统 SHALL 在设置入口提供"导出 JSON"和"导入 JSON"功能，便于用户在不同浏览器/设备间手动迁移数据。

#### Scenario: 导出 JSON
- **WHEN** 用户点击"导出"
- **THEN** 系统 MUST 触发浏览器下载一个 `your-todo-export-YYYYMMDD.json` 文件，内容为完整的 persisted state

#### Scenario: 导入合法 JSON
- **WHEN** 用户选择一个由本应用导出的 JSON 文件并确认导入
- **THEN** 系统 MUST 用文件中的数据替换当前 state（替换前 MUST 二次确认）

#### Scenario: 导入非法 JSON
- **WHEN** 用户选择的文件无法解析或 schema 不兼容
- **THEN** 系统 MUST 拒绝导入并向用户显示原因，当前数据 MUST NOT 被破坏
