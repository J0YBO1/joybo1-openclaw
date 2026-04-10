# Day 4: Python基础（上）学习材料

## 📅 学习日期
2026年4月10日

## 🎯 学习目标
1. 掌握Python基础语法和数据结构
2. 学习Python函数和模块的使用
3. 了解Python在OpenClaw技能开发中的应用
4. 为后续的Python相关技能开发打下基础

## 📁 文件结构

```
day4-python-basics/
├── python-basics-notes.md      # Python基础学习笔记
├── python_exercises.py         # Python练习脚本
├── simple_python_skill.py      # 简单Python技能示例
├── test_python_skill.py        # 测试脚本
└── README.md                   # 本文件
```

## 📚 学习内容

### 1. Python基础语法
- 变量和数据类型（字符串、数字、列表、字典等）
- 控制结构（条件语句、循环语句）
- 函数定义和使用
- 模块导入和使用

### 2. Python在OpenClaw中的应用
- Python技能开发模式
- 与Node.js的交互
- 错误处理和异常捕获
- 命令行参数解析

### 3. 实践练习
- 编写Python脚本
- 创建简单的Python技能
- 测试和调试

## 🚀 快速开始

### 环境要求
- Python 3.6+
- 基本的命令行使用知识

### 运行练习脚本
```bash
# 进入学习目录
cd learning/day4-python-basics

# 运行所有练习
python python_exercises.py

# 运行特定章节
python python_exercises.py --section basic
python python_exercises.py --section control
python python_exercises.py --section function
python python_exercises.py --section module
python python_exercises.py --section error
python python_exercises.py --section openclaw

# 以JSON格式输出
python python_exercises.py --output json
```

### 测试Python技能
```bash
# 运行测试脚本
python test_python_skill.py

# 测试简单Python技能
python simple_python_skill.py --greet --name "黄冠"
python simple_python_skill.py --calculate --numbers 1 2 3 4 5
python simple_python_skill.py --file-info --path "."
python simple_python_skill.py --text-analysis --text "Hello World"

# 不同输出格式
python simple_python_skill.py --greet --name Test --output text
python simple_python_skill.py --greet --name Test --output json
python simple_python_skill.py --greet --name Test --output pretty
```

## 📝 文件说明

### 1. python-basics-notes.md
完整的Python基础学习笔记，包含：
- Python环境验证
- 基础语法示例
- 控制结构
- 函数使用
- 模块导入
- 错误处理
- OpenClaw集成示例
- 实践练习任务

### 2. python_exercises.py
Python练习脚本，包含6个章节：
1. **基础语法示例**：变量、数据类型、容器类型
2. **控制结构示例**：条件语句、循环语句、列表推导式
3. **函数示例**：基本函数、lambda函数、类型提示
4. **模块示例**：math、os、random、datetime模块
5. **错误处理示例**：异常捕获、自定义异常
6. **OpenClaw集成示例**：命令处理、JSON输出

### 3. simple_python_skill.py
简单的Python技能示例，展示如何创建可被OpenClaw调用的Python技能：

**功能包括：**
- `--greet`：打招呼功能
- `--calculate`：计算功能（统计、求和、平均等）
- `--file-info`：文件信息功能
- `--text-analysis`：文本分析功能

**输出格式：**
- `--output text`：简单文本输出
- `--output json`：JSON格式输出
- `--output pretty`：美观的格式化输出

### 4. test_python_skill.py
测试脚本，用于验证：
- Python环境是否正常
- 练习脚本功能是否正常
- 技能脚本功能是否正常

## 🧪 练习任务

### 任务1：理解基础语法
1. 阅读 `python-basics-notes.md` 中的示例
2. 运行 `python_exercises.py` 查看输出
3. 修改示例代码，尝试不同的参数

### 任务2：创建自己的Python技能
1. 参考 `simple_python_skill.py` 的结构
2. 添加新的功能（如：时间转换、数据格式化等）
3. 添加命令行参数支持
4. 添加错误处理

### 任务3：集成测试
1. 运行 `test_python_skill.py` 确保所有测试通过
2. 为你的新技能添加测试用例
3. 测试不同边界情况

## 💡 学习要点

### 1. Python特点
- **简洁易读**：语法清晰，代码可读性高
- **动态类型**：变量类型在运行时确定
- **丰富的库**：标准库功能强大，第三方库丰富
- **跨平台**：可在Windows、Linux、Mac上运行

### 2. OpenClaw集成要点
- **命令行接口**：使用argparse模块解析参数
- **JSON输出**：便于与其他系统集成
- **错误处理**：提供清晰的错误信息
- **模块化设计**：便于维护和扩展

### 3. 最佳实践
- **类型提示**：提高代码可读性和可维护性
- **文档字符串**：为函数添加详细的文档
- **错误处理**：合理使用try-except块
- **代码格式化**：保持一致的代码风格

## 🔧 故障排除

### 常见问题

#### Q1: Python命令找不到
```bash
# 检查Python是否安装
python --version

# 如果未安装，下载安装：
# https://www.python.org/downloads/
```

#### Q2: 模块导入错误
```bash
# 安装缺少的模块
pip install 模块名

# 或使用虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

#### Q3: 编码问题
```python
# 在Python文件开头添加编码声明
# -*- coding: utf-8 -*-

# 读写文件时指定编码
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()
```

#### Q4: 路径问题
```python
from pathlib import Path

# 使用Path处理路径
current_dir = Path(__file__).parent
file_path = current_dir / "data" / "file.txt"
```

## 📈 下一步学习

### Day 5: Python基础（下）
- 面向对象编程
- 装饰器和生成器
- 并发编程
- 高级数据结构

### Day 6: Web API技能开发
- HTTP请求处理
- RESTful API设计
- 数据序列化
- 错误处理和日志

### Day 7: 数据库操作技能
- 数据库连接
- SQL查询
- 数据迁移
- 性能优化

## 👤 作者

**黄冠** - OpenClaw技能开发学习者

## 📄 许可证

本学习材料基于MIT许可证

---

**学习愉快！** 掌握Python基础是OpenClaw技能开发的重要一步。