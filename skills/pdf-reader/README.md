# PDF Reader Skill

一个用于读取PDF文件内容的OpenClaw技能包，支持提取文本、元数据和页面信息。

## 功能特性

- 📝 **文本提取**：从PDF文件中提取文本内容
- 📊 **元数据读取**：读取PDF的作者、标题、创建日期等信息
- 📄 **页面信息**：获取PDF页数、页面尺寸等信息
- 🔍 **内容预览**：提供PDF内容的预览和摘要
- ⚡ **快速处理**：支持大文件分页处理

## 安装

### 1. 安装依赖
```bash
cd skills/pdf-reader
npm install
```

### 2. 全局安装（可选）
```bash
npm link
```

## 使用方法

### 基本命令
```bash
pdf-reader --path "文件路径.pdf"
```

### 常用参数
```bash
# 读取指定页面范围
pdf-reader --path "document.pdf" --pages "1-5"

# 只显示元数据，不提取文本
pdf-reader --path "resume.pdf" --no-extract-text --metadata

# 自定义预览行数
pdf-reader --path "book.pdf" --preview-lines 200

# 读取特定页面
pdf-reader --path "report.pdf" --pages "1,3,5,7-10"
```

### 参数说明
| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--path` | PDF文件路径（必需） | - |
| `--pages` | 页面范围，如"1-5"或"1,3,5" | "all" |
| `--extract-text` | 提取文本内容 | true |
| `--no-extract-text` | 不提取文本内容 | - |
| `--metadata` | 显示元数据信息 | true |
| `--no-metadata` | 不显示元数据信息 | - |
| `--preview-lines` | 预览文本行数 | 100 |
| `--help`, `-h` | 显示帮助信息 | - |

## 示例输出

```
📕 PDF文件读取结果：document.pdf

✅ 文件信息：
- 路径：C:\documents\document.pdf
- 大小：1.2 MB
- 页数：15页
- 修改时间：2026-04-10 08:00:00

📋 元数据：
- 标题：技术文档示例
- 作者：黄冠
- 创建者：wkhtmltopdf 0.12.6
- 主题：OpenClaw技能开发

📄 内容预览（前100行）：
# 技术文档示例
## 第一章：OpenClaw技能开发
OpenClaw是一个强大的AI助手平台，支持技能扩展...
## 第二章：PDF读取技能
PDF读取技能可以提取PDF文件中的文本内容...

📊 统计信息：
- 总页数：15页
- 提取文本行数：245行
- 字符数：12,450个
- 读取时间：120ms
```

## 开发说明

### 技术架构
- 使用Node.js的fs模块进行文件操作
- 支持异步文件读取和处理
- 模块化设计，易于扩展

### 依赖库
- **pdf-parse**：专业的PDF解析库
- 其他：纯Node.js实现，无外部依赖

### 扩展功能
1. **OCR支持**：添加对扫描版PDF的OCR识别
2. **图片提取**：提取PDF中的图片内容
3. **表格识别**：识别和提取PDF中的表格数据
4. **多语言支持**：支持更多语言的PDF文档

## 测试

运行测试：
```bash
npm test
```

## 贡献

欢迎提交Issue和Pull Request来改进这个技能包。

## 许可证

MIT License