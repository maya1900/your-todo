## ADDED Requirements

### Requirement: 关键字搜索

系统 SHALL 提供顶部搜索框，根据输入的关键字对所有待办进行**不区分大小写**的子串匹配，匹配范围包括 `title` 与 `description`。

- 搜索行为 MUST 在用户停止输入后 200ms 内更新结果（防抖）
- 空关键字 MUST 视为"不筛选"
- 搜索 MUST 与其他筛选条件（分类/优先级/状态）以"逻辑与 (AND)"组合

#### Scenario: 输入关键字命中标题
- **WHEN** 列表中存在 `title = "写周报"` 的待办，用户在搜索框输入 `"周报"`
- **THEN** 系统 MUST 在结果中保留该条记录，并隐藏不匹配的记录

#### Scenario: 输入关键字命中描述
- **WHEN** 列表中存在 `description` 包含 `"季度复盘"` 的待办，用户在搜索框输入 `"复盘"`
- **THEN** 系统 MUST 在结果中保留该条记录

#### Scenario: 关键字大小写不敏感
- **WHEN** 列表中存在 `title = "Review PR"` 的待办，用户输入 `"review"` 或 `"REVIEW"`
- **THEN** 系统 MUST 都能命中该条记录

#### Scenario: 清空搜索框恢复全部
- **WHEN** 用户清空搜索框
- **THEN** 系统 MUST 移除关键字过滤条件，仅按剩余筛选条件展示

### Requirement: 按分类筛选

系统 SHALL 提供分类筛选下拉/标签组，可单选某个分类或选择"全部"。

#### Scenario: 选择特定分类
- **WHEN** 用户从分类筛选器中选择 `"工作"`
- **THEN** 系统 MUST 仅展示 `category = "工作"` 的待办

#### Scenario: 选择"全部"
- **WHEN** 用户选择"全部"
- **THEN** 系统 MUST 不再按分类筛选

### Requirement: 按优先级筛选

系统 SHALL 提供优先级筛选控件，可选 `low`、`medium`、`high`、`urgent` 中的任意子集，也可选择"全部"。

#### Scenario: 选择多个优先级
- **WHEN** 用户同时勾选 `high` 与 `urgent`
- **THEN** 系统 MUST 展示 `priority` 为 `high` 或 `urgent` 的待办

#### Scenario: 不选任何优先级
- **WHEN** 用户取消所有优先级勾选
- **THEN** 系统 MUST 等同于"全部"，展示所有优先级的待办

### Requirement: 按状态筛选

系统 SHALL 提供状态筛选 Tab：`全部`、`待办`、`进行中`、`已完成`。

#### Scenario: 切换到"已完成"Tab
- **WHEN** 用户点击"已完成"Tab
- **THEN** 系统 MUST 仅展示 `status = "completed"` 的待办

#### Scenario: 切换到"待办"Tab
- **WHEN** 用户点击"待办"Tab
- **THEN** 系统 MUST 仅展示 `status = "pending"` 的待办

### Requirement: 多条件组合筛选

系统 SHALL 支持搜索、分类、优先级、状态四类条件**同时生效**，结果为各条件的逻辑与 (AND)。

#### Scenario: 同时按分类与状态筛选
- **WHEN** 用户选择分类 `"工作"`，状态 Tab `"进行中"`
- **THEN** 系统 MUST 仅展示 `category = "工作"` 且 `status = "in-progress"` 的待办

#### Scenario: 三条件组合命中为空
- **WHEN** 用户的组合筛选条件没有匹配的待办
- **THEN** 系统 MUST 显示友好的空状态提示（例如"没有匹配的待办，试试调整筛选条件"）

### Requirement: 排序

系统 SHALL 在列表头部提供排序下拉，默认按"创建时间倒序"，可切换为：截止日期升序、优先级降序（urgent → low）、更新时间倒序。

#### Scenario: 按截止日期排序
- **WHEN** 用户切换排序为"截止日期升序"
- **THEN** 系统 MUST 将有 `dueDate` 的待办按日期升序排列，无 `dueDate` 的待办排在末尾

#### Scenario: 按优先级排序
- **WHEN** 用户切换排序为"优先级降序"
- **THEN** 系统 MUST 按 `urgent → high → medium → low` 的顺序排列

### Requirement: 筛选状态可见

系统 SHALL 在工具栏显示当前已生效的筛选条件徽章，并提供"清除全部筛选"按钮。

#### Scenario: 显示已生效筛选
- **WHEN** 用户已选择分类 `"工作"` 与优先级 `urgent`
- **THEN** 系统 MUST 显示两个可关闭的徽章："分类：工作"、"优先级：紧急"

#### Scenario: 一键清除筛选
- **WHEN** 用户点击"清除全部筛选"
- **THEN** 系统 MUST 重置搜索关键字与所有筛选条件，列表恢复全部数据
