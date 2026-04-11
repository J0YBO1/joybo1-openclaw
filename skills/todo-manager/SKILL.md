---
name: todo-manager
description: 增强版待办事项管理器，支持优先级、分类、截止日期、搜索、统计等功能
metadata:
  openclaw:
    emoji: "✅"
    requires:
      config: []
    version: "2.0.0"
---

## 功能特性

### 🎯 核心功能
- **任务管理**：添加、查看、编辑、删除、完成、清空任务
- **优先级系统**：低、中、高、紧急四个优先级
- **状态跟踪**：待办、进行中、已完成、已取消
- **分类管理**：自定义任务分类
- **标签系统**：支持多个标签
- **截止日期**：支持设置和跟踪截止日期

### 🔍 高级功能
- **智能搜索**：按名称、描述、标签搜索任务
- **多种筛选**：按状态、优先级、分类、过期任务筛选
- **灵活排序**：按名称、优先级、创建时间、截止日期排序
- **详细统计**：任务分布、优先级分布、分类分布统计
- **数据备份**：自动备份和恢复功能
- **数据导出**：支持JSON、CSV、Markdown格式导出

### 🛡️ 安全特性
- **数据持久化**：自动保存到JSON文件
- **备份保护**：重要操作前自动备份
- **错误恢复**：数据损坏时自动恢复
- **输入验证**：完整的参数验证和错误提示

## 使用方式

### 基本命令
```bash
# 通过OpenClaw调用
openclaw todo-manager <命令> [选项]

# 直接调用Node.js版本
node index.js <命令> [选项]

# 直接调用Python版本
python todo_enhanced.py <命令> [选项]
```

### 命令示例

#### 1. 添加任务
```bash
# 基本添加
openclaw todo-manager add "学习Python"

# 添加带详细信息的任务
openclaw todo-manager add "完成项目报告" \
  --description "需要完成季度项目报告" \
  --priority high \
  --category 工作 \
  --tags "报告,季度,重要" \
  --due-date 2026-04-15

# 使用快捷日期
openclaw todo-manager add "明天开会" --due-date tomorrow
```

#### 2. 查看任务
```bash
# 查看所有任务
openclaw todo-manager list --all

# 查看待办任务（默认）
openclaw todo-manager list

# 查看已完成任务
openclaw todo-manager list --completed

# 查看过期任务
openclaw todo-manager list --overdue

# 按优先级筛选
openclaw todo-manager list --priority high

# 按分类筛选
openclaw todo-manager list --category 工作

# 搜索任务
openclaw todo-manager list --search "报告"

# 详细显示
openclaw todo-manager list --detailed

# 排序
openclaw todo-manager list --sort priority --reverse
```

#### 3. 任务操作
```bash
# 查看任务详情
openclaw todo-manager view 1

# 编辑任务
openclaw todo-manager edit 1 --priority urgent --status in_progress

# 标记任务完成
openclaw todo-manager done 1

# 删除任务
openclaw todo-manager delete 1

# 清空所有任务
openclaw todo-manager clear
```

#### 4. 统计与维护
```bash
# 显示统计信息
openclaw todo-manager stats

# JSON格式统计
openclaw todo-manager stats --json

# 创建备份
openclaw todo-manager backup

# 指定备份名称
openclaw todo-manager backup --name "重要备份"

# 列出备份
openclaw todo-manager restore --list

# 恢复备份
openclaw todo-manager restore backup-2026-04-11T08-58-00

# 导出数据
openclaw todo-manager export --format json
openclaw todo-manager export --format csv
openclaw todo-manager export --format markdown
```

## 文件结构

```
todo-manager/
├── SKILL.md                    # 技能说明文档
├── index.js                    # Node.js包装器（主入口）
├── todo_enhanced.py            # Python核心逻辑
├── todo_enhanced.json          # 任务数据文件（自动生成）
├── package.json                # Node.js包配置
├── README.md                   # 详细用户文档
├── test.js                     # 测试脚本
├── examples.bat                # Windows示例脚本
├── examples.sh                 # Linux/Mac示例脚本
└── backups/                    # 备份目录（自动创建）
    ├── backup-2026-04-11T08-58-00.json
    └── ...
```

## 数据格式

### 任务数据结构
```json
{
  "id": 1,
  "name": "学习Python",
  "description": "学习Python高级特性",
  "priority": "high",
  "status": "pending",
  "category": "学习",
  "tags": ["python", "编程"],
  "created_at": "2026-04-11T16:30:00",
  "updated_at": "2026-04-11T16:30:00",
  "due_date": "2026-04-15T23:59:59",
  "completed_at": null
}
```

### 优先级映射
- `low` → 🟢 低
- `medium` → 🟡 中
- `high` → 🟠 高
- `urgent` → 🔴 紧急

### 状态映射
- `pending` → ⏳ 待办
- `in_progress` → 🔄 进行中
- `completed` → ✅ 已完成
- `cancelled` → ❌ 已取消

## 集成示例

### 在OpenClaw中使用
```bash
# 添加学习任务
openclaw todo-manager add "学习OpenClaw技能开发" \
  --priority high \
  --category 学习 \
  --due-date week

# 查看当前任务
openclaw todo-manager list

# 完成任务
openclaw todo-manager done 1

# 每周检查任务状态
openclaw todo-manager list --overdue
```

### 在脚本中使用
```bash
#!/bin/bash
# 每日任务检查脚本

echo "📋 今日任务检查"
echo "================"

# 检查过期任务
echo "过期任务:"
openclaw todo-manager list --overdue

# 检查高优先级任务
echo "高优先级任务:"
openclaw todo-manager list --priority high

# 显示统计
openclaw todo-manager stats
```

## 错误处理

### 常见错误及解决方案

#### 1. "任务已存在"
```bash
❌ 任务 '学习Python' 已存在
```
**解决方案**：使用不同的任务名称，或先完成/删除现有任务。

#### 2. "未找到任务"
```bash
❌ 未找到任务 #999
```
**解决方案**：使用 `openclaw todo-manager list` 查看有效的任务ID。

#### 3. "无效的日期格式"
```bash
❌ 无效的日期格式: 2026/04/15
```
**解决方案**：使用 `YYYY-MM-DD` 格式，或使用 `today`、`tomorrow`、`week`。

#### 4. "数据文件损坏"
```bash
⚠️ 加载任务数据时出错: ...
```
**解决方案**：
1. 从备份恢复：`openclaw todo-manager restore --list`
2. 使用最近的备份恢复
3. 如果无备份，数据将重置为空

## 性能优化

### 大数据量处理
- 支持数千个任务的高效管理
- 懒加载和增量保存
- 智能缓存机制

### 内存管理
- 按需加载任务数据
- 自动清理临时数据
- 内存使用监控

## 版本历史

### v2.0.0 (2026-04-11)
- 完全重写，增强功能
- 添加优先级、分类、标签系统
- 支持截止日期和过期提醒
- 添加搜索、筛选、排序功能
- 完整的统计和备份功能
- 更好的错误处理和用户体验

### v1.0.0 (初始版本)
- 基本任务管理功能
- 添加、查看、完成、删除、清空
- 简单持久化存储

## 贡献指南

### 开发环境设置
```bash
# 克隆仓库
git clone <repository-url>

# 安装依赖
cd todo-manager
npm install

# 运行测试
npm test

# 开发模式
npm run dev
```

### 代码规范
- 遵循Python PEP8规范
- 使用类型提示
- 完整的文档字符串
- 单元测试覆盖

### 提交更改
1. 创建功能分支
2. 编写测试用例
3. 实现功能
4. 运行测试
5. 提交Pull Request

## 许可证

MIT License

## 支持

如有问题或建议，请：
1. 查看本文档的故障排除部分
2. 提交GitHub Issue
3. 联系开发者

---

**温馨提示**：定期使用 `todo-manager backup` 备份任务数据，防止意外丢失。