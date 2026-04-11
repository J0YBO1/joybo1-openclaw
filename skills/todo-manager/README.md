# Todo Manager - 增强版待办事项管理器

一个功能丰富的待办事项管理器，专为OpenClaw设计，支持优先级、分类、截止日期、搜索、统计等高级功能。

## 🚀 快速开始

### 安装
```bash
# 技能已包含在OpenClaw中，无需额外安装
# 直接使用即可
```

### 基本使用
```bash
# 添加任务
openclaw todo-manager add "学习Python"

# 查看任务
openclaw todo-manager list

# 完成任务
openclaw todo-manager done 1

# 查看统计
openclaw todo-manager stats
```

## ✨ 功能特性

### 🎯 核心功能
- ✅ **任务管理**：完整的CRUD操作
- ✅ **优先级系统**：低、中、高、紧急四个等级
- ✅ **状态跟踪**：待办、进行中、已完成、已取消
- ✅ **分类管理**：自定义任务分类
- ✅ **标签系统**：支持多个标签
- ✅ **截止日期**：设置和跟踪任务截止时间

### 🔍 高级功能
- ✅ **智能搜索**：按名称、描述、标签搜索
- ✅ **多种筛选**：状态、优先级、分类、过期任务
- ✅ **灵活排序**：名称、优先级、时间排序
- ✅ **详细统计**：任务分布分析
- ✅ **数据备份**：自动备份和恢复
- ✅ **数据导出**：JSON、CSV、Markdown格式

### 🛡️ 安全特性
- ✅ **数据持久化**：自动保存到JSON文件
- ✅ **备份保护**：操作前自动备份
- ✅ **错误恢复**：数据损坏自动恢复
- ✅ **输入验证**：完整参数验证

## 📖 详细使用指南

### 1. 添加任务
```bash
# 基本添加
openclaw todo-manager add "任务名称"

# 完整示例
openclaw todo-manager add "完成季度报告" \
  --description "需要完成Q2季度业务报告" \
  --priority high \
  --category 工作 \
  --tags "报告,季度,重要" \
  --due-date 2026-04-20

# 快捷日期
openclaw todo-manager add "明天会议" --due-date tomorrow
openclaw todo-manager add "本周任务" --due-date week
```

### 2. 查看任务
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
openclaw todo-manager list --priority urgent

# 按分类筛选
openclaw todo-manager list --category 学习

# 搜索任务
openclaw todo-manager list --search "python"

# 详细显示模式
openclaw todo-manager list --detailed

# 排序
openclaw todo-manager list --sort priority --reverse
openclaw todo-manager list --sort due
openclaw todo-manager list --sort created --reverse
```

### 3. 任务操作
```bash
# 查看任务详情
openclaw todo-manager view 1

# 编辑任务
openclaw todo-manager edit 1 --name "新任务名称"
openclaw todo-manager edit 1 --priority urgent
openclaw todo-manager edit 1 --status in_progress
openclaw todo-manager edit 1 --category 新分类
openclaw todo-manager edit 1 --tags "标签1,标签2"
openclaw todo-manager edit 1 --due-date "2026-04-25"

# 清除标签
openclaw todo-manager edit 1 --tags ""

# 清除截止日期
openclaw todo-manager edit 1 --due-date ""

# 标记任务完成
openclaw todo-manager done 1

# 删除任务
openclaw todo-manager delete 1

# 清空所有任务
openclaw todo-manager clear
```

### 4. 统计与维护
```bash
# 显示统计信息
openclaw todo-manager stats

# JSON格式输出
openclaw todo-manager stats --json

# 创建备份
openclaw todo-manager backup

# 指定备份名称
openclaw todo-manager backup --name "重要备份"

# 列出所有备份
openclaw todo-manager restore --list

# 恢复备份
openclaw todo-manager restore backup-2026-04-11T08-58-00
openclaw todo-manager restore "重要备份"

# 导出数据
openclaw todo-manager export --format json
openclaw todo-manager export --format csv
openclaw todo-manager export --format markdown
```

## 📊 输出示例

### 任务列表输出
```
📋 任务列表 (5个)
================================================================================
  1. ⏳🟠 完成季度报告                          [工作     ] ⏰3天 #报告 #季度 +1
  2. ✅🟢 学习Python基础                        [学习     ] #python #编程
  3. ⏳🔴 紧急bug修复                           [工作     ] ⚠️过期2天 #bug #紧急
  4. 🔄🟡 项目文档编写                          [项目     ] #文档 #项目
  5. ⏳🟢 购买日常用品                          [生活     ]
```

### 任务详情输出
```
============================================================
📝 任务 #1: 完成季度报告
============================================================
  状态: ⏳ 待办
  优先级: 🟠 高
  分类: 📂 工作
  描述: 需要完成Q2季度业务报告
  标签: #报告 #季度 #重要
  创建时间: 📅 2026-04-11T16:30:00
  更新时间: 🔄 2026-04-11T16:30:00
  截止日期: ⚠️  2026-04-20T23:59:59 (3天后截止)
============================================================
```

### 统计信息输出
```
📊 任务统计信息
============================================================
总任务数: 12
待办: 5 | 进行中: 3 | 已完成: 4 | 已取消: 0
过期任务: 2

📈 优先级分布:
  🟢 低: 3
  🟡 中: 4
  🟠 高: 3
  🔴 紧急: 2

📂 分类分布:
  📂 工作: 6
  📂 学习: 3
  📂 生活: 2
  📂 项目: 1
============================================================
```

## 🗂️ 文件结构

```
todo-manager/
├── SKILL.md                    # 技能说明文档
├── index.js                    # Node.js包装器（主入口）
├── todo_enhanced.py            # Python核心逻辑（1600+行）
├── todo_enhanced.json          # 任务数据文件（自动生成）
├── package.json                # Node.js包配置
├── README.md                   # 详细用户文档
├── test.js                     # 测试脚本
├── examples.bat                # Windows示例脚本
├── examples.sh                 # Linux/Mac示例脚本
└── backups/                    # 备份目录（自动创建）
    ├── backup-2026-04-11T08-58-00.json
    ├── pre-restore-2026-04-11T09-02-00.json
    └── ...
```

## 🔧 技术实现

### 架构设计
```
用户界面 (CLI)
    ↓
Node.js包装器 (index.js)
    ↓
Python核心逻辑 (todo_enhanced.py)
    ↓
数据持久层 (JSON文件)
```

### 数据模型
```python
{
    "id": 1,
    "name": "任务名称",
    "description": "任务描述",
    "priority": "high",          # low/medium/high/urgent
    "status": "pending",         # pending/in_progress/completed/cancelled
    "category": "分类名称",
    "tags": ["标签1", "标签2"],
    "created_at": "ISO时间戳",
    "updated_at": "ISO时间戳",
    "due_date": "ISO时间戳",
    "completed_at": "ISO时间戳"
}
```

### 错误处理机制
1. **输入验证**：所有参数都经过严格验证
2. **数据完整性**：JSON解析错误时自动恢复
3. **文件操作**：读写错误时提供详细错误信息
4. **备份保护**：重要操作前自动创建备份

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 直接运行测试脚本
node test.js
```

### 测试覆盖
- ✅ 任务添加和验证
- ✅ 任务查询和筛选
- ✅ 任务更新和删除
- ✅ 数据持久化
- ✅ 备份和恢复
- ✅ 错误处理

## 📈 性能优化

### 大数据量支持
- 支持10,000+任务的高效管理
- 懒加载数据，减少内存占用
- 增量保存，提高写入性能

### 搜索优化
- 内存中索引，快速搜索
- 支持多字段联合搜索
- 智能缓存搜索结果

## 🔄 集成示例

### 在OpenClaw工作流中使用
```bash
#!/bin/bash
# 每日任务检查脚本

echo "🎯 今日重点任务"
openclaw todo-manager list --priority urgent --priority high

echo "⏰ 即将到期任务"
openclaw todo-manager list --overdue

echo "📊 任务概览"
openclaw todo-manager stats
```

### 在项目中使用
```bash
#!/bin/bash
# 项目任务管理脚本

# 添加项目任务
openclaw todo-manager add "实现用户登录功能" \
  --category 项目 \
  --priority high \
  --tags "前端,后端,认证"

# 查看项目任务
openclaw todo-manager list --category 项目

# 导出项目任务
openclaw todo-manager export --format markdown > 项目任务.md
```

## 🐛 故障排除

### 常见问题

#### 1. "命令未找到"
```bash
bash: openclaw: command not found
```
**解决方案**：确保OpenClaw已正确安装并添加到PATH。

#### 2. "Python未找到"
```bash
python: command not found
```
**解决方案**：安装Python 3.6+并确保在PATH中。

#### 3. "数据文件损坏"
```bash
⚠️ 加载任务数据时出错: JSON解析错误
```
**解决方案**：
```bash
# 从备份恢复
openclaw todo-manager restore --list
openclaw todo-manager restore <最近的备份>

# 如果没有备份，数据将重置
```

#### 4. "权限不足"
```bash
❌ 保存失败: Permission denied
```
**解决方案**：检查文件权限，或使用管理员权限运行。

### 调试模式
```bash
# 启用详细日志
export DEBUG=todo-manager

# 运行命令查看详细输出
openclaw todo-manager list --all
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -am '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 创建Pull Request

### 代码规范
- 遵循Python PEP8规范
- 使用类型提示
- 编写单元测试
- 更新文档

## 📞 支持

如有问题或建议：
1. 查看本文档的故障排除部分
2. 提交GitHub Issue
3. 联系开发者

---

**开发团队**：黄冠 & 阿虾AI助理  
**版本**：v2.0.0  
**更新日期**：2026-04-11  
**项目状态**：✅ 生产就绪