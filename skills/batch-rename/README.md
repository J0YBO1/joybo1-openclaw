# batch-rename 技能

📄🔄 **强大的批量文件重命名工具**

## 简介

`batch-rename` 是一个功能强大的批量文件重命名工具，专为 OpenClaw 设计。它支持前缀/后缀添加、正则表达式替换、文件过滤、递归处理等多种重命名需求，同时提供了完善的安全机制和用户友好的操作界面。

## 功能特性

### 🎯 核心功能
- **前缀/后缀添加**：在文件名前后添加固定文本
- **完全重命名**：忽略原文件名，使用前缀+序号格式
- **正则表达式替换**：使用正则表达式匹配和替换文件名
- **文件过滤**：按扩展名过滤文件，支持包含和排除
- **递归处理**：处理子目录中的文件
- **序号控制**：4位数字序号，确保正确排序

### 🛡️ 安全特性
- **预览模式**：默认只预览不执行
- **冲突检测**：自动跳过已存在的文件名
- **操作日志**：JSON格式日志，便于审计
- **模拟执行**：干运行模式，测试效果
- **详细错误提示**：友好的错误信息和解决方案

### 🚀 高级功能
- **批量处理**：一次性处理大量文件
- **复杂规则**：支持组合使用多种重命名规则
- **跨平台**：支持 Windows、Linux、macOS
- **中文支持**：完美支持中文文件名

## 安装

### 前提条件
- Node.js >= 14.0.0
- Python >= 3.6.0
- OpenClaw 环境

### 安装步骤

1. **克隆或下载技能包**
```bash
git clone https://github.com/J0YBO1/joybo1-openclaw.git
cd joybo1-openclaw/skills/batch-rename
```

2. **安装依赖**
```bash
# 无需额外依赖，Python标准库即可
```

3. **测试安装**
```bash
npm test
# 或
node test.js
```

## 快速开始

### 基本使用

```bash
# 预览添加前缀
batch-rename --path ./photos --prefix "vacation_"

# 执行添加前缀
batch-rename --path ./photos --prefix "vacation_" --execute

# 添加后缀
batch-rename --path ./docs --suffix "_final" --execute

# 完全重命名
batch-rename --path ./images --prefix "img_" --full --execute
```

### 正则表达式替换

```bash
# 替换文件名中的数字
batch-rename --path ./files --pattern "\\d+" --replacement "NUM" --preview

# 移除方括号
batch-rename --path ./files --pattern "[\\[\\]]" --replacement "" --execute

# 提取日期并重命名
batch-rename --path ./photos --pattern ".*(\\d{4})-(\\d{2})-(\\d{2}).*" --replacement "photo_$1$2$3" --execute
```

### 文件过滤

```bash
# 只处理图片文件
batch-rename --path ./media --ext .jpg .png .gif --prefix "img_" --execute

# 排除临时文件
batch-rename --path ./project --exclude .tmp .bak --suffix "_clean" --execute

# 递归处理所有文件
batch-rename --path ./data --recursive --prefix "archived_" --execute
```

### 安全操作

```bash
# 预览所有更改
batch-rename --path ./important --prefix "backup_" --verbose

# 模拟执行（不实际修改）
batch-rename --path ./important --prefix "backup_" --dry-run

# 执行并保存日志
batch-rename --path ./important --prefix "backup_" --execute --log
```

## 参数详解

### 基本参数
| 参数 | 说明 | 示例 |
|------|------|------|
| `--path` | 要处理的目录路径（必需） | `--path ./photos` |
| `--prefix` | 要添加的前缀 | `--prefix "vacation_"` |
| `--suffix` | 要添加的后缀 | `--suffix "_final"` |
| `--full` | 完全重命名，忽略原文件名 | `--full` |
| `--no-index` | 不添加序号 | `--no-index` |

### 正则表达式参数
| 参数 | 说明 | 示例 |
|------|------|------|
| `--pattern` | 正则表达式模式 | `--pattern "\\d+"` |
| `--replacement` | 替换字符串 | `--replacement "NUM"` |

### 文件过滤参数
| 参数 | 说明 | 示例 |
|------|------|------|
| `--ext` | 只处理指定扩展名 | `--ext .jpg .png` |
| `--exclude` | 排除指定扩展名 | `--exclude .tmp .bak` |
| `--recursive` | 递归处理子目录 | `--recursive` |

### 执行控制参数
| 参数 | 说明 | 示例 |
|------|------|------|
| `--execute` | 执行重命名操作 | `--execute` |
| `--dry-run` | 模拟执行 | `--dry-run` |
| `--log` | 保存操作日志 | `--log` |
| `--verbose` | 显示详细输出 | `--verbose` |
| `--help` | 显示帮助信息 | `--help` |

## 输出示例

### 预览模式
```
📁 找到 5 个文件

📋 预览重命名结果:
--------------------------------------------------
  photo1.jpg -> vacation_photo1_0000.jpg
  photo2.jpg -> vacation_photo2_0001.jpg
  photo3.jpg -> vacation_photo3_0002.jpg
  document.pdf -> vacation_document_0003.pdf
  notes.txt -> vacation_notes_0004.txt

💡 提示: 这是预览模式，不会修改文件
要执行重命名，请使用 --execute 参数
```

### 执行模式
```
🚀 执行重命名操作:
--------------------------------------------------
✅ 成功: photo1.jpg -> vacation_photo1_0000.jpg
✅ 成功: photo2.jpg -> vacation_photo2_0001.jpg
✅ 成功: photo3.jpg -> vacation_photo3_0002.jpg
✅ 成功: document.pdf -> vacation_document_0003.pdf
✅ 成功: notes.txt -> vacation_notes_0004.txt

📊 操作完成:
  ✅ 成功: 5
  ⚠️  跳过: 0
  ❌ 失败: 0

📝 日志已保存: ./photos/rename_log_20240410_153045.json
```

## 操作日志

每次执行重命名操作（使用 `--log` 参数）都会生成一个 JSON 格式的日志文件，包含以下信息：

```json
{
  "timestamp": "2026-04-10T15:30:45.123456",
  "directory": "/path/to/photos",
  "parameters": {
    "prefix": "vacation_",
    "suffix": "",
    "full": false,
    "no_index": false,
    "pattern": null,
    "replacement": ""
  },
  "results": {
    "success": [
      "photo1.jpg -> vacation_photo1_0000.jpg",
      "photo2.jpg -> vacation_photo2_0001.jpg"
    ],
    "skipped": [],
    "failed": []
  }
}
```

## 最佳实践

### 1. 安全第一
```bash
# 始终先预览
batch-rename --path ./important --prefix "backup_" --preview

# 重要文件先备份
cp -r ./important ./important_backup

# 使用日志功能
batch-rename --path ./important --prefix "backup_" --execute --log
```

### 2. 分步操作
```bash
# 第一步：测试正则表达式
batch-rename --path ./files --pattern "test" --replacement "demo" --dry-run

# 第二步：预览效果
batch-rename --path ./files --pattern "test" --replacement "demo" --preview

# 第三步：执行操作
batch-rename --path ./files --pattern "test" --replacement "demo" --execute
```

### 3. 复杂规则处理
```bash
# 组合使用多个规则
batch-rename --path ./photos \
  --ext .jpg .png \
  --pattern "IMG_(\\d+)" \
  --replacement "photo_$1" \
  --suffix "_2024" \
  --execute
```

## 故障排除

### 常见问题

#### Q1: 为什么重命名没有执行？
**A**: 默认是预览模式，需要添加 `--execute` 参数才能实际执行。

#### Q2: 如何只处理特定类型的文件？
**A**: 使用 `--ext` 参数指定扩展名，如 `--ext .jpg .png`。

#### Q3: 正则表达式不起作用？
**A**: 使用 `--preview` 模式先测试，确保正则表达式正确。注意在命令行中转义特殊字符。

#### Q4: 如何查看详细错误信息？
**A**: 添加 `--verbose` 参数显示详细错误和堆栈跟踪。

#### Q5: 如何撤销重命名操作？
**A**: 目前不支持自动撤销，但可以通过操作日志手动恢复。

### 错误代码
| 代码 | 含义 | 解决方法 |
|------|------|----------|
| 0 | 成功 | 操作完成 |
| 1 | 目录错误 | 检查路径是否存在，是否有访问权限 |
| 2 | 正则错误 | 检查正则表达式语法 |
| 3 | 其他错误 | 使用 `--verbose` 查看详细错误信息 |

## 开发指南

### 项目结构
```
batch-rename/
├── index.js              # OpenClaw入口文件
├── rename_optimized.py   # Python重命名核心逻辑
├── SKILL.md              # 技能配置文件
├── package.json          # Node.js包配置
├── README.md             # 本文档
├── test.js               # 测试脚本
└── test_rename/          # 测试目录
```

### 扩展功能

要添加新功能，可以修改以下文件：

1. **`rename_optimized.py`**：添加新的重命名逻辑
2. **`index.js`**：添加新的命令行参数解析
3. **`SKILL.md`**：更新技能文档
4. **`test.js`**：添加新的测试用例

### 运行测试
```bash
# 运行所有测试
npm test

# 或直接运行测试脚本
node test.js
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个技能！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 作者

**黄冠** - OpenClaw 技能开发者

- GitHub: [@J0YBO1](https://github.com/J0YBO1)
- 项目地址: [joybo1-openclaw](https://github.com/J0YBO1/joybo1-openclaw)

## 致谢

感谢以下开源项目：
- [OpenClaw](https://openclaw.ai) - 提供了强大的技能开发平台
- [Python](https://python.org) - 强大的脚本语言
- [Node.js](https://nodejs.org) - JavaScript 运行时环境

---

**提示**: 这是一个功能完整、安全可靠的批量重命名工具。建议在使用前仔细阅读文档，特别是安全建议部分。

如有问题或建议，请访问 [GitHub Issues](https://github.com/J0YBO1/joybo1-openclaw/issues)。