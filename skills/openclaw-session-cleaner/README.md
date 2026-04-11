# OpenClaw Session Cleaner

OpenClaw session清理助手，用于管理和优化OpenClaw的session文件。

## 🎯 功能特性

- **📊 Session统计**：显示session文件数量、大小、时间范围
- **🗑️ 智能清理**：自动识别并清理旧的cron session文件
- **🔧 索引重建**：重建sessions.json，移除不存在的session引用
- **🛡️ 安全保护**：保留main session，避免误删重要会话
- **👁️ 预览模式**：支持干运行，预览将要执行的操作

## 🚀 快速开始

### 安装
```bash
# 技能会自动安装到OpenClaw
# 无需额外步骤
```

### 基本使用
```bash
# 查看session统计信息
openclaw session-cleaner --stats-only

# 预览清理操作（不实际执行）
openclaw session-cleaner --dry-run

# 清理7天前的session并重建索引
openclaw session-cleaner --keep-days 7

# 强制清理（不询问确认）
openclaw session-cleaner --force

# 只重建sessions.json索引
openclaw session-cleaner --rebuild-only
```

## 📖 详细使用说明

### 1. 查看统计信息
```bash
# 基本统计
openclaw session-cleaner --stats-only

# 详细统计（显示所有文件）
openclaw session-cleaner --stats-only --verbose
```

### 2. 清理旧session文件
```bash
# 清理30天前的session
openclaw session-cleaner --keep-days 30

# 清理所有cron session（保留main session）
openclaw session-cleaner --keep-days 0 --force

# 预览清理操作
openclaw session-cleaner --dry-run --keep-days 7
```

### 3. 重建session索引
```bash
# 只重建索引，不删除文件
openclaw session-cleaner --rebuild-only

# 清理后自动重建索引
openclaw session-cleaner --keep-days 7
```

### 4. 组合使用
```bash
# 详细模式查看并清理
openclaw session-cleaner --verbose --keep-days 14 --force

# 干运行+详细模式
openclaw session-cleaner --dry-run --verbose --keep-days 7
```

## 🔧 技术实现

### 文件结构
```
~/.openclaw/agents/main/sessions/
├── main-*.jsonl          # 主会话文件（保留）
├── cron-*.jsonl          # 定时任务会话（可清理）
├── other-*.jsonl         # 其他会话文件
└── sessions.json         # session索引文件
```

### 清理策略
1. **保留规则**：
   - 所有main session文件
   - 最近N天内的session文件（默认7天）
   - 非.jsonl文件

2. **清理规则**：
   - 超过指定天数的cron session
   - 超过指定天数的其他session
   - sessions.json中不存在的session引用

### 安全特性
- ✅ **Main session保护**：永远不会删除main session
- ✅ **预览模式**：先预览再执行
- ✅ **用户确认**：重要操作需要确认（除非使用--force）
- ✅ **错误处理**：单个文件删除失败不影响其他操作
- ✅ **日志记录**：详细的操作日志

## 📊 输出示例

### 统计信息输出
```
📊 OpenClaw Session 统计信息
==================================================
📁 Session目录: C:\Users\username\.openclaw\agents\main\sessions
📄 sessions.json: 1.2 MB

📈 文件统计:
   总文件数: 125
   .jsonl文件: 120
   .json文件: 5
   总大小: 45.3 MB

🎭 Session类型:
   Main sessions: 3
   Cron sessions: 112
   其他 sessions: 5

⏰ 时间范围:
   最旧文件: cron-20260315.jsonl (2026-03-15 14:30:22)
   最新文件: main-current.jsonl (2026-04-11 16:45:10)
==================================================
```

### 清理操作输出
```
🗑️  开始清理session文件...
📋 找到 85 个需要清理的文件:
   1. cron-20260315.jsonl (2.1 MB, 27天前)
   2. cron-20260316.jsonl (1.8 MB, 26天前)
   ...

🔧 开始删除文件...
   ✅ 已删除: cron-20260315.jsonl
   ✅ 已删除: cron-20260316.jsonl
   ...

📊 清理完成:
   删除文件: 85 个
   释放空间: 156.7 MB
   失败次数: 0 次
```

## ⚠️ 注意事项

### 1. 数据安全
- 清理操作**不可逆**，请先使用`--dry-run`预览
- 重要session请手动备份
- Main session受到保护，不会被删除

### 2. 性能影响
- 清理大量文件时可能需要一些时间
- 重建sessions.json时OpenClaw应处于停止状态
- 建议在系统空闲时执行清理

### 3. 兼容性
- 支持Windows、Linux、macOS
- 需要Node.js环境
- 需要OpenClaw已安装并运行过

## 🔄 维护建议

### 定期清理
```bash
# 每周清理一次（添加到cron或计划任务）
openclaw session-cleaner --keep-days 7 --force

# 每月深度清理
openclaw session-cleaner --keep-days 30 --force --rebuild-only
```

### 监控告警
```bash
# 检查session文件数量（如果超过1000个发出警告）
openclaw session-cleaner --stats-only | grep "总文件数"

# 检查sessions.json大小（如果超过100MB发出警告）
openclaw session-cleaner --stats-only | grep "sessions.json"
```

## 🐛 故障排除

### 常见问题

#### 1. "Session目录不存在"
```
❌ Session目录不存在: ~/.openclaw/agents/main/sessions
```
**解决方案**：确保OpenClaw已正确安装并至少运行过一次。

#### 2. "权限不足"
```
❌ 删除失败: cron-20260315.jsonl (权限不足)
```
**解决方案**：以管理员/root权限运行，或检查文件权限。

#### 3. "sessions.json损坏"
```
❌ 重建sessions.json时出错: Unexpected token
```
**解决方案**：
```bash
# 备份损坏的文件
cp ~/.openclaw/agents/main/sessions.json ~/.openclaw/agents/main/sessions.json.backup

# 创建空的sessions.json
echo "{}" > ~/.openclaw/agents/main/sessions.json

# 让OpenClaw自动重建
openclaw session-cleaner --rebuild-only
```

### 调试模式
```bash
# 启用详细日志
openclaw session-cleaner --verbose --dry-run

# 检查环境变量
echo $HOME
echo $USERPROFILE
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 开发指南
1. Fork本仓库
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

### 测试
```bash
# 运行测试
npm test

# 手动测试
node index.js --stats-only
node index.js --dry-run --keep-days 7
```

## 📞 支持

如有问题或建议，请：
1. 查看本文档的故障排除部分
2. 提交GitHub Issue
3. 联系开发者

---

**温馨提示**：定期清理session文件可以提升OpenClaw性能，减少磁盘占用。建议每月执行一次清理操作。