# File Reader Skill

一个功能强大的文件读取技能，支持多种文件格式的读取和预览。

## 🎯 功能特点

- **多格式支持**：文本、JSON、CSV、YAML、TOML 等常见格式
- **智能检测**：自动检测文件格式，也支持手动指定
- **友好预览**：可控制预览行数，避免输出过长
- **详细统计**：文件信息、读取时间、内容统计等
- **错误处理**：完善的错误提示和用户友好信息
- **性能优化**：异步读取，支持大文件处理

## 📁 支持的文件格式

| 格式 | 扩展名 | 说明 |
|------|--------|------|
| 文本文件 | .txt, .md | 纯文本和Markdown文件 |
| 数据文件 | .json, .csv, .tsv | JSON和CSV格式数据 |
| 配置文件 | .yaml, .yml, .toml, .ini | 常见配置文件格式 |
| 代码文件 | .js, .html, .css, .xml | 网页和代码文件 |
| 编程语言 | .py, .java, .cpp, .go, .rs | 各种编程语言源文件 |

## 🚀 快速开始

### 安装依赖
```bash
cd skills/file-reader
npm install
```

### 基本使用
```bash
# 读取文件（自动检测格式）
file-reader --path "data.json"

# 限制预览行数
file-reader --path "large-file.txt" --lines 20

# 指定文件格式
file-reader --path "config.yml" --format yaml

# 指定文件编码
file-reader --path "gbk-file.txt" --encoding gbk
```

## 📖 详细用法

### 参数说明

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--path` | 字符串 | 是 | - | 要读取的文件路径 |
| `--format` | 字符串 | 否 | 自动检测 | 文件格式（json, csv, yaml等） |
| `--lines` | 数字 | 否 | 50 | 预览行数 |
| `--encoding` | 字符串 | 否 | utf-8 | 文件编码 |

### 返回值格式

技能返回一个对象，包含以下字段：

```javascript
{
  success: true,  // 是否成功
  message: "提示信息",
  data: {
    fileInfo: {    // 文件信息
      path: "文件路径",
      name: "文件名",
      size: "文件大小",
      format: "文件格式",
      // ... 其他信息
    },
    content: "预览内容",  // 限制行数的内容
    stats: {       // 统计信息
      readTime: "读取时间",
      previewLines: "预览行数",
      totalLines: "总行数"
    }
  },
  tips: ["使用提示"]  // 有用的提示信息
}
```

## 🔧 开发指南

### 项目结构
```
file-reader/
├── SKILL.md          # 技能元数据文档
├── index.js          # 技能主文件
├── package.json      # 项目配置和依赖
├── test.js           # 单元测试
├── simple-test.js    # 简单测试示例
└── README.md         # 本文件
```

### 添加新的文件格式支持

1. 在 `SUPPORTED_FORMATS` 对象中添加新的格式映射
2. 创建对应的读取函数（如 `readXxxFile`）
3. 在 `formatHandlers` 对象中注册读取函数
4. 更新测试用例

### 运行测试
```bash
# 运行所有测试
npm test

# 或直接运行
node test.js

# 运行简单演示
node simple-test.js
```

## 🧪 测试覆盖

技能包含完整的测试用例：

1. **参数验证测试**：验证必需参数
2. **文件存在性测试**：处理不存在的文件
3. **格式支持测试**：验证各种文件格式
4. **错误处理测试**：验证错误场景
5. **性能测试**：大文件读取测试

## 📚 学习要点

通过开发这个技能，你学习了：

1. **文件系统操作**：使用 Node.js 的 fs 模块
2. **异步编程**：Promise 和 async/await
3. **错误处理**：try/catch 和友好的错误信息
4. **模块化设计**：功能分离和代码组织
5. **参数解析**：命令行参数处理
6. **测试驱动开发**：编写测试用例

## 🔮 扩展想法

这个技能可以进一步扩展：

1. **更多格式支持**：PDF、Excel、图像元数据等
2. **内容搜索**：在文件中搜索关键词
3. **文件比较**：比较两个文件的差异
4. **编码检测**：自动检测文件编码
5. **远程文件**：支持 HTTP/HTTPS 文件读取
6. **压缩文件**：读取 ZIP、TAR 等压缩包内的文件

## 📄 许可证

MIT License

## 👤 作者

joyboy - OpenClaw 技能开发学习项目