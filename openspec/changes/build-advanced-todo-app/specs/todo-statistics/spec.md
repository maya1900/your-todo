## ADDED Requirements

### Requirement: 总览指标

系统 SHALL 在页面顶部展示一个统计卡片区域，至少包含以下指标：总待办数、已完成数、未完成数（pending + in-progress 之和）、完成率（百分比，保留一位小数）。

#### Scenario: 空数据时显示零值
- **WHEN** 当前 store 中没有任何待办
- **THEN** 系统 MUST 显示：总数 0、已完成 0、未完成 0、完成率 `0.0%`

#### Scenario: 部分完成时计算正确
- **WHEN** 当前共有 10 条待办，其中 3 条 `completed`、4 条 `pending`、3 条 `in-progress`
- **THEN** 系统 MUST 显示：总数 10、已完成 3、未完成 7、完成率 `30.0%`

#### Scenario: 全部完成时显示 100%
- **WHEN** 全部待办均为 `completed`
- **THEN** 系统 MUST 显示完成率 `100.0%`

### Requirement: 按优先级分布

系统 SHALL 展示按优先级的数量分布（4 个优先级各一项），用于了解任务紧急程度结构。

#### Scenario: 展示各优先级数量
- **WHEN** 当前列表中 `urgent` 2 条、`high` 5 条、`medium` 3 条、`low` 0 条
- **THEN** 系统 MUST 展示对应数值 2 / 5 / 3 / 0

### Requirement: 按分类分布

系统 SHALL 展示按分类的数量分布（Top N，N 默认 5；超出部分合并为"其他"）。

#### Scenario: 分类数 ≤ N 时全部展示
- **WHEN** 共有 3 个不同分类，分别有 4、2、1 条待办
- **THEN** 系统 MUST 展示这 3 个分类各自的数量，不展示"其他"

#### Scenario: 分类数 > N 时合并尾部
- **WHEN** 共有 8 个不同分类，N = 5
- **THEN** 系统 MUST 展示前 5 个数量最多的分类，其余 3 个合并为"其他"（数量为它们之和）

### Requirement: 逾期统计

系统 SHALL 单独统计"已逾期"的待办数：`dueDate < 今天 0:00` 且 `status != "completed"` 的待办计入逾期。

#### Scenario: 截止日期在昨天且未完成
- **WHEN** 一条 `pending` 待办的 `dueDate` 为昨天
- **THEN** 系统 MUST 将其计入"已逾期"

#### Scenario: 截止日期在昨天但已完成
- **WHEN** 一条 `completed` 待办的 `dueDate` 为昨天
- **THEN** 系统 MUST NOT 将其计入"已逾期"

#### Scenario: 截止日期为今天
- **WHEN** 一条 `pending` 待办的 `dueDate` 为今天
- **THEN** 系统 MUST NOT 将其计入"已逾期"

### Requirement: 实时刷新

系统 SHALL 在任意 CRUD 或状态切换操作后立即重新计算统计指标，无需用户手动刷新页面。

#### Scenario: 新建待办后总数 + 1
- **WHEN** 用户成功新增一条待办
- **THEN** 系统 MUST 在 100ms 内将"总数"指标 + 1

#### Scenario: 标记完成后完成率刷新
- **WHEN** 用户将一条非 completed 的待办标记为 completed
- **THEN** 系统 MUST 在 100ms 内更新"已完成"和"完成率"
