# Day 4: Python基础（上）学习笔记

## 📅 学习日期
2026年4月10日

## 🎯 学习目标
1. 掌握Python基础语法和数据结构
2. 学习Python函数和模块的使用
3. 了解Python在OpenClaw技能开发中的应用
4. 为后续的Python相关技能开发打下基础

## 📚 学习内容

### 1. Python环境验证
```bash
# 检查Python版本
python --version
# 输出: Python 3.14.3

# 进入Python交互模式
python
```

### 2. 基础语法

#### 2.1 变量和数据类型
```python
# 基本数据类型
name = "黄冠"          # 字符串
age = 21              # 整数
height = 1.75         # 浮点数
is_student = True     # 布尔值

# 容器类型
fruits = ["苹果", "香蕉", "橙子"]          # 列表（可变）
coordinates = (30.2672, -97.7431)         # 元组（不可变）
person = {"name": "黄冠", "age": 21}      # 字典（键值对）
unique_numbers = {1, 2, 3, 4, 5}          # 集合（唯一值）
```

#### 2.2 控制结构
```python
# 条件语句
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "D"
print(f"分数: {score}, 等级: {grade}")

# 循环语句
# for循环
for i in range(5):
    print(f"循环第 {i+1} 次")

# while循环
count = 0
while count < 3:
    print(f"计数: {count}")
    count += 1
```

#### 2.3 函数
```python
# 定义函数
def greet(name, greeting="你好"):
    """打招呼函数"""
    return f"{greeting}, {name}!"

# 调用函数
message = greet("黄冠")
print(message)  # 输出: 你好, 黄冠!

# 使用默认参数
message2 = greet("世界", "Hello")
print(message2)  # 输出: Hello, 世界!

# lambda函数（匿名函数）
square = lambda x: x ** 2
print(square(5))  # 输出: 25
```

#### 2.4 模块和包
```python
# 导入模块
import math
import os
import json
import datetime

# 使用模块
print(math.pi)  # 输出: 3.141592653589793
print(os.getcwd())  # 输出当前工作目录

# 导入特定函数
from math import sqrt, pow
print(sqrt(16))  # 输出: 4.0
print(pow(2, 3))  # 输出: 8.0

# 别名导入
import numpy as np
import pandas as pd
```

### 3. Python在OpenClaw中的应用

#### 3.1 Python技能开发模式
```python
#!/usr/bin/env python3
"""
OpenClaw Python技能模板
"""

import sys
import json
import argparse

def main():
    """主函数"""
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='Python技能示例')
    parser.add_argument('--name', type=str, help='姓名')
    parser.add_argument('--age', type=int, help='年龄')
    parser.add_argument('--output', type=str, choices=['text', 'json'], default='text')
    
    args = parser.parse_args()
    
    # 处理逻辑
    result = {
        "name": args.name or "未知",
        "age": args.age or 0,
        "message": f"你好，{args.name or '用户'}！"
    }
    
    # 输出结果
    if args.output == 'json':
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(result["message"])
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

#### 3.2 与Node.js的交互
```python
# Python脚本可以被Node.js调用
# Node.js使用child_process模块调用Python脚本

# Python端：接收参数，返回JSON
import sys
import json

def process_data(data):
    """处理数据"""
    return {
        "processed": True,
        "original": data,
        "result": data.upper() if isinstance(data, str) else data * 2
    }

if __name__ == "__main__":
    # 从命令行参数或stdin读取数据
    if len(sys.argv) > 1:
        input_data = sys.argv[1]
    else:
        input_data = sys.stdin.read().strip()
    
    result = process_data(input_data)
    print(json.dumps(result))
```

#### 3.3 错误处理
```python
try:
    # 可能出错的代码
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"除零错误: {e}")
    result = None
except Exception as e:
    print(f"其他错误: {e}")
    result = None
else:
    print("没有错误发生")
finally:
    print("清理工作")
```

### 4. 实践练习

#### 练习1：文件处理脚本
```python
import os
import json
import csv

def read_file(filepath):
    """读取文件内容"""
    if not os.path.exists(filepath):
        return None
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    return content

def write_file(filepath, content):
    """写入文件"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def process_json_file(input_file, output_file):
    """处理JSON文件"""
    content = read_file(input_file)
    if content is None:
        return False
    
    try:
        data = json.loads(content)
        # 处理数据
        data["processed"] = True
        data["timestamp"] = datetime.datetime.now().isoformat()
        
        # 写入文件
        write_file(output_file, json.dumps(data, indent=2, ensure_ascii=False))
        return True
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        return False
```

#### 练习2：命令行工具
```python
#!/usr/bin/env python3
"""
简单的文件统计工具
"""

import argparse
import os
import sys
from pathlib import Path

def count_file_stats(filepath):
    """统计文件信息"""
    path = Path(filepath)
    
    if not path.exists():
        return None
    
    stats = {
        "filename": path.name,
        "path": str(path.absolute()),
        "size": path.stat().st_size,
        "lines": 0,
        "words": 0,
        "chars": 0
    }
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            stats["lines"] = len(content.splitlines())
            stats["words"] = len(content.split())
            stats["chars"] = len(content)
    except Exception as e:
        print(f"读取文件错误: {e}")
    
    return stats

def main():
    parser = argparse.ArgumentParser(description='文件统计工具')
    parser.add_argument('file', help='要统计的文件路径')
    parser.add_argument('--format', choices=['text', 'json'], default='text')
    
    args = parser.parse_args()
    
    stats = count_file_stats(args.file)
    if stats is None:
        print(f"文件不存在: {args.file}")
        return 1
    
    if args.format == 'json':
        import json
        print(json.dumps(stats, indent=2, ensure_ascii=False))
    else:
        print(f"文件名: {stats['filename']}")
        print(f"文件大小: {stats['size']} 字节")
        print(f"行数: {stats['lines']}")
        print(f"单词数: {stats['words']}")
        print(f"字符数: {stats['chars']}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

## 🧪 练习任务

### 任务1：创建Python学习脚本
1. 创建一个 `learn_python.py` 文件
2. 包含所有基础语法的示例
3. 添加命令行参数支持
4. 添加错误处理

### 任务2：集成到OpenClaw
1. 创建一个简单的Python技能
2. 设计技能接口（命令行参数）
3. 实现核心功能
4. 添加测试用例

### 任务3：实际应用
1. 使用Python处理一个实际问题
2. 考虑性能和安全问题
3. 编写文档和使用说明

## 📝 学习总结

### 收获
1. **Python基础语法**：掌握了变量、控制结构、函数等基础
2. **模块使用**：学会了导入和使用标准库
3. **OpenClaw集成**：了解了Python在技能开发中的应用模式
4. **错误处理**：掌握了Python的异常处理机制

### 应用场景
1. **数据处理**：JSON、CSV等格式处理
2. **文件操作**：读写、统计、转换
3. **系统交互**：调用系统命令、进程管理
4. **Web服务**：简单的API服务

### 下一步计划
1. **Day 5**: Python基础（下） - 高级特性
2. **Day 6**: Web API技能开发
3. **Day 7**: 数据库操作技能

## 💡 实用技巧

### 1. 虚拟环境
```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境（Windows）
venv\Scripts\activate

# 激活虚拟环境（Linux/Mac）
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### 2. 代码格式化
```bash
# 使用black格式化代码
pip install black
black your_script.py

# 使用isort排序import
pip install isort
isort your_script.py
```

### 3. 类型提示
```python
from typing import List, Dict, Optional, Union

def process_data(
    data: List[Dict[str, Union[str, int]]],
    options: Optional[Dict] = None
) -> Dict[str, any]:
    """处理数据函数（带类型提示）"""
    # 函数实现
    return {"result": "success"}
```

---

**今日学习完成！** 明天继续Python高级特性的学习。