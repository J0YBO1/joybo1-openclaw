---
name: python-runner
description: Python脚本执行技能，安全执行Python代码并返回结果
metadata: { "openclaw": { "emoji": "🐍", "requires": { "config": [] } } }
---

# Python Runner Skill

## 功能
这是一个Python脚本执行技能包，能够安全地执行Python代码并返回格式化结果。

## 核心特性
- 🔒 **安全执行**：在隔离环境中运行Python代码
- 📊 **结果捕获**：捕获标准输出、标准错误和返回值
- ⏱️ **超时控制**：防止无限循环代码
- 📝 **代码验证**：基础语法检查和安全限制
- 🎯 **多种执行模式**：支持代码字符串、脚本文件、交互式执行

## 使用方法

### 执行Python代码字符串
```
python-runner --code "print('Hello, World!')"
```

### 执行Python脚本文件
```
python-runner --file "script.py"
```

### 带参数执行
```
python-runner --code "import sys; print(sys.argv[1:])" --args "arg1 arg2"
```

### 参数说明
- `--code`：要执行的Python代码字符串
- `--file`：要执行的Python脚本文件路径
- `--args`：传递给脚本的命令行参数
- `--timeout`：执行超时时间（秒，默认：10秒）
- `--python`：Python解释器路径（默认：python3）
- `--cwd`：工作目录（默认：当前目录）

## 工作流程
1. 接收用户输入的Python代码或文件路径
2. 验证代码安全性（基础检查）
3. 创建临时执行环境
4. 使用子进程执行Python代码
5. 捕获执行结果（输出、错误、返回值）
6. 清理临时资源
7. 返回格式化结果

## 示例输出
```
🐍 Python执行结果

✅ 执行信息：
- 代码：print('Hello, Python!'); x = 1 + 2; print(f'1 + 2 = {x}')
- 解释器：python3
- 超时：10秒
- 执行时间：0.15秒

📋 输出：
Hello, Python!
1 + 2 = 3

📊 执行统计：
- 返回值：0（成功）
- 输出行数：2行
- 错误输出：无
- 内存使用：~5MB

💡 提示：使用 --timeout 参数调整执行超时时间
```

## 安全特性
- 代码长度限制
- 执行时间限制
- 禁止危险模块导入（可配置）
- 内存使用监控
- 临时文件自动清理

## 开发说明
- 这是一个实用的Python执行技能包
- 展示了子进程调用和代码安全执行的最佳实践
- 可以作为其他语言执行器的基础模板

## 技术要点
- Node.js child_process 模块
- 异步执行和超时控制
- 流式输出捕获
- 临时文件管理
- 错误处理和用户友好提示