## ADDED Requirements

### Requirement: Todo 数据模型

系统 SHALL 支持以下结构的 Todo 实体：唯一标识 `id`、必填标题 `title`、可选描述 `description`、可选截止日期 `dueDate`、必填优先级 `priority`、必填分类 `category`、必填状态 `status`、创建时间 `createdAt`、最后更新时间 `updatedAt`。

- `priority` 取值 MUST 为 `low`、`medium`、`high`、`urgent` 之一
- `status` 取值 MUST 为 `pending`、`in-progress`、`completed` 之一
- `title` 长度 MUST 在 1-200 字符之间（去除前后空白后）
- `description` 长度 MUST 不超过 2000 字符
- `category` 长度 MUST 在 1-30 字符之间
- `id` MUST 全局唯一且不可修改（创建后）
- `createdAt` MUST 在创建时设置为当前时间且不可修改
- `updatedAt` MUST 在每次成功更新后被刷新为当前时间

#### Scenario: 标题为空时拒绝创建
- **WHEN** 用户提交一个 `title` 为空字符串或仅包含空白字符的新待办
- **THEN** 系统 MUST 拒绝创建并返回校验错误（不向 store 写入任何数据）

#### Scenario: 优先级取非法值时拒绝创建
- **WHEN** 用户尝试创建 `priority` 为 `"super"` 的待办
- **THEN** 系统 MUST 拒绝创建并返回校验错误

#### Scenario: 创建时自动写入时间戳
- **WHEN** 用户成功创建一个待办
- **THEN** 系统 MUST 自动设置 `createdAt = updatedAt = 当前 ISO 时间`，并生成唯一 `id`

### Requirement: 创建待办 (Create)

系统 SHALL 允许用户通过表单创建新待办，并将其加入到全局待办列表中。

#### Scenario: 成功创建一个最小待办（仅标题）
- **WHEN** 用户在表单中填写 `title = "买牛奶"`，`priority = "medium"`，`category = "生活"`，并提交
- **THEN** 系统 MUST 在列表中新增该待办，`status` 默认为 `pending`，`description` 与 `dueDate` 为空，并生成唯一 `id`

#### Scenario: 成功创建一个完整待办
- **WHEN** 用户填写标题、描述、截止日期、优先级、分类全部字段并提交
- **THEN** 系统 MUST 在列表中新增该待办，所有字段值与用户输入一致

### Requirement: 编辑待办 (Update)

系统 SHALL 允许用户编辑除 `id`、`createdAt` 之外的所有字段。

#### Scenario: 修改标题并保存
- **WHEN** 用户打开某条待办的编辑面板，将标题从 `"买牛奶"` 改为 `"买牛奶和鸡蛋"`，并保存
- **THEN** 系统 MUST 更新该条记录的 `title` 字段，刷新 `updatedAt`，且 `id`、`createdAt` 保持不变

#### Scenario: 修改优先级与截止日期
- **WHEN** 用户将某条待办的 `priority` 从 `medium` 改为 `urgent`，`dueDate` 改为明天，并保存
- **THEN** 系统 MUST 更新对应字段并刷新 `updatedAt`

### Requirement: 删除待办 (Delete)

系统 SHALL 允许用户删除任意一条待办，删除前 MUST 弹出二次确认。

#### Scenario: 用户确认删除
- **WHEN** 用户点击某条待办的删除按钮并在确认弹窗中点击"确定"
- **THEN** 系统 MUST 从列表中移除该条记录，统计与筛选结果实时刷新

#### Scenario: 用户取消删除
- **WHEN** 用户点击删除按钮，但在确认弹窗中点击"取消"
- **THEN** 系统 MUST NOT 修改任何数据

### Requirement: 切换状态 (Toggle Status)

系统 SHALL 允许用户在列表项上直接切换状态，无需打开编辑面板。

#### Scenario: 从待办切换到进行中
- **WHEN** 用户点击一条 `status = "pending"` 待办前的状态切换控件，选择"进行中"
- **THEN** 系统 MUST 将其 `status` 更新为 `in-progress`，并刷新 `updatedAt`

#### Scenario: 标记完成
- **WHEN** 用户点击一条非 `completed` 待办前的完成复选框
- **THEN** 系统 MUST 将其 `status` 更新为 `completed`，并刷新 `updatedAt`

#### Scenario: 取消完成
- **WHEN** 用户点击一条 `status = "completed"` 待办前的完成复选框
- **THEN** 系统 MUST 将其 `status` 回退为 `pending`，并刷新 `updatedAt`
