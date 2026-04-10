# Python Runner Skill

一个安全、可靠的 Python 脚本执行技能，支持代码字符串和脚本文件执行。

## 🎯 功能特点

- **🔒 安全执行**：在隔离环境中运行，基础安全检查
- **📊 完整输出捕获**：标准输出、标准错误、退出码
- **⏱️ 超时控制**：防止无限循环和长时间运行
- **📦 参数支持**：支持命令行参数传递
- **🛡️ 安全检查**：危险模块检测和警告
- **📝 多种执行模式**：代码字符串、脚本文件

## 🚀 快速开始

### 安装依赖
```bash
cd skills/python-runner
npm install
```

### 基本使用
```bash
# 执行Python代码字符串
python-runner --code "print('Hello, World!')"

# 执行Python脚本文件
python-runner --file "script.py"

# 带参数执行
python-runner --code "import sys; print(sys.argv[1:])" --args "arg1 arg2"

# 设置超时时间（毫秒）
python-runner --code "import time; time.sleep(2)" --timeout 1000

# 指定Python解释器
python-runner --code "print('Hello')" --python "python3"
```

## 📖 详细用法

### 参数说明

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--code` | 字符串 | 否 | - | 要执行的Python代码字符串 |
| `--file` | 字符串 | 否 | - | 要执行的Python脚本文件路径 |
| `--args` | 字符串 | 否 | - | 传递给脚本的命令行参数（空格分隔） |
| `--timeout` | 数字 | 否 | 10000 | 执行超时时间（毫秒） |
| `--python` | 字符串 | 否 | python | Python解释器路径 |
| `--cwd` | 字符串 | 否 | 当前目录 | 工作目录 |

**注意：** `--code` 和 `--file` 参数不能同时使用。

### 返回值格式

技能返回一个对象，包含以下字段：

```javascript
{
  success: true,  // 是否成功
  message: "提示信息",
  data: {
    executionInfo: {    // 执行信息
      codePreview: "代码预览",
      file: "文件路径",
      args: ["参数列表"],
      python: "python解释器",
      timeout: "超时时间",
      executionTime: "执行时间"
    },
    output: {       // 输出信息
      stdout: "标准输出",
      stderr: "标准错误",
      exitCode: "退出码",
      killedByTimeout: "是否超时终止"
    },
    safety: {       // 安全检查结果
      warnings: ["警告信息"],
      errors: ["错误信息"],
      safe: true
    },
    stats: {        // 统计信息
      stdoutLines: "输出行数",
      stderrLines: "错误行数",
      stdoutLength: "输出长度",
      stderrLength: "错误长度"
    }
  },
  tips: ["使用提示"]  // 有用的提示信息
}
```

## 🔧 安全特性

### 安全检查项目
1. **代码长度限制**：防止过长的代码影响性能
2. **危险模块检测**：警告可能危险的操作
3. **无限循环检测**：基础模式匹配
4. **执行时间限制**：超时自动终止
5. **临时文件清理**：执行后自动清理

### 危险模块列表
技能会检测以下可能危险的模块使用：
- `os.system`, `os.popen`
- `subprocess`
- `eval`, `exec`, `__import__`
- `open`, `file`
- `shutil`
- `sys.exit`（允许但监控）
- `threading`, `multiprocessing`

## 🧪 测试覆盖

技能包含完整的测试用例：

1. **参数验证测试**：验证必需参数
2. **代码执行测试**：简单和复杂代码执行
3. **错误处理测试**：语法错误、运行时错误
4. **超时测试**：超时控制功能
5. **参数传递测试**：命令行参数处理
6. **安全检查测试**：危险代码检测
7. **文件执行测试**：脚本文件执行

### 运行测试
```bash
# 运行所有测试
npm test

# 或直接运行
node test.js

# 运行简单演示
node simple-test.js
```

## 📚 学习要点

通过开发这个技能，你学习了：

1. **子进程管理**：Node.js child_process 模块
2. **异步控制**：Promise、async/await、超时控制
3. **文件操作**：临时文件创建和管理
4. **流处理**：标准输出/错误流捕获
5. **安全编程**：代码安全检查模式
6. **错误处理**：多种错误场景处理
7. **参数解析**：命令行参数处理

## 🔮 扩展想法

这个技能可以进一步扩展：

1. **更多语言支持**：JavaScript、Shell、Ruby 等
2. **交互式执行**：支持多行代码输入
3. **代码沙箱**：更严格的安全隔离
4. **性能监控**：CPU、内存使用监控
5. **代码格式化**：自动格式化输出
6. **依赖管理**：虚拟环境支持
7. **结果缓存**：相同代码结果缓存

## 🐍 Python 版本要求

- 支持 Python 3.6+
- 默认使用系统 `python` 命令
- 可通过 `--python` 参数指定解释器

## 📄 许可证

MIT License

## 👤 作者

joyboy - OpenClaw 技能开发学习项目