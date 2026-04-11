# Python高级特性学习笔记 - Day 5

## 一、面向对象编程（OOP）

### 1.1 类与对象
```python
class Person:
    # 类属性
    species = "Human"
    
    # 初始化方法
    def __init__(self, name, age):
        # 实例属性
        self.name = name
        self.age = age
    
    # 实例方法
    def introduce(self):
        return f"Hi, I'm {self.name}, {self.age} years old."
    
    # 类方法
    @classmethod
    def from_birth_year(cls, name, birth_year):
        from datetime import datetime
        age = datetime.now().year - birth_year
        return cls(name, age)
    
    # 静态方法
    @staticmethod
    def is_adult(age):
        return age >= 18
```

### 1.2 继承和多态
```python
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        raise NotImplementedError("子类必须实现speak方法")

class Dog(Animal):
    def speak(self):
        return f"{self.name} says: Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says: Meow!"
```

### 1.3 特殊方法（魔术方法）
```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    # 字符串表示
    def __str__(self):
        return f"Vector({self.x}, {self.y})"
    
    # 加法运算
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    
    # 长度
    def __len__(self):
        return 2
    
    # 迭代
    def __iter__(self):
        return iter([self.x, self.y])
```

## 二、异常处理

### 2.1 基本异常处理
```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"除零错误: {e}")
except Exception as e:
    print(f"其他错误: {e}")
else:
    print("没有发生异常")
finally:
    print("无论是否异常都会执行")
```

### 2.2 自定义异常
```python
class ValidationError(Exception):
    """自定义验证错误"""
    def __init__(self, message, field=None):
        self.message = message
        self.field = field
        super().__init__(self.message)

def validate_age(age):
    if age < 0:
        raise ValidationError("年龄不能为负数", "age")
    if age > 150:
        raise ValidationError("年龄超出合理范围", "age")
    return True
```

## 三、装饰器

### 3.1 函数装饰器
```python
import time
from functools import wraps

def timer(func):
    """计算函数执行时间的装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} 执行时间: {end_time - start_time:.4f}秒")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "完成"
```

### 3.2 带参数的装饰器
```python
def repeat(n):
    """重复执行函数的装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            results = []
            for i in range(n):
                print(f"第{i+1}次执行")
                result = func(*args, **kwargs)
                results.append(result)
            return results
        return wrapper
    return decorator

@repeat(3)
def say_hello(name):
    return f"Hello, {name}!"
```

## 四、上下文管理器

### 4.1 使用with语句
```python
# 使用with自动管理资源
with open('file.txt', 'r') as f:
    content = f.read()
# 文件会自动关闭

# 自定义上下文管理器
class Timer:
    def __enter__(self):
        self.start = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end = time.time()
        self.elapsed = self.end - self.start
        print(f"耗时: {self.elapsed:.4f}秒")

with Timer():
    time.sleep(1)
```

## 五、生成器和迭代器

### 5.1 生成器函数
```python
def fibonacci(n):
    """生成斐波那契数列"""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 使用生成器
for num in fibonacci(10):
    print(num)
```

### 5.2 生成器表达式
```python
# 列表推导式
squares = [x**2 for x in range(10)]

# 生成器表达式（节省内存）
squares_gen = (x**2 for x in range(10))
```

## 六、在OpenClaw中的应用

### 6.1 复杂的命令行工具
```python
import argparse
import json
import sys
from typing import Dict, List, Optional

class DataProcessor:
    """数据处理工具类"""
    def __init__(self, data: List[Dict]):
        self.data = data
    
    def filter_by_key(self, key: str, value: str) -> List[Dict]:
        """按键值过滤数据"""
        return [item for item in self.data if item.get(key) == value]
    
    def sort_by_key(self, key: str, reverse: bool = False) -> List[Dict]:
        """按键排序数据"""
        return sorted(self.data, key=lambda x: x.get(key, ''), reverse=reverse)
    
    def group_by_key(self, key: str) -> Dict[str, List[Dict]]:
        """按键分组数据"""
        grouped = {}
        for item in self.data:
            group_key = item.get(key)
            if group_key not in grouped:
                grouped[group_key] = []
            grouped[group_key].append(item)
        return grouped
```

### 6.2 错误处理最佳实践
```python
class OpenClawSkillError(Exception):
    """OpenClaw技能专用错误"""
    pass

def safe_execute(func):
    """安全执行装饰器，捕获所有异常并转换为OpenClaw格式"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except OpenClawSkillError as e:
            return {
                "success": False,
                "error": str(e),
                "type": "skill_error"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"内部错误: {str(e)}",
                "type": "internal_error"
            }
    return wrapper
```

## 七、实践建议

1. **面向对象设计**：将复杂功能封装成类，提高代码复用性
2. **异常处理**：使用自定义异常，提供清晰的错误信息
3. **装饰器**：用于日志、计时、权限检查等横切关注点
4. **生成器**：处理大数据集时节省内存
5. **上下文管理器**：自动管理资源（文件、网络连接、数据库）

## 八、OpenClaw技能开发要点

1. **模块化设计**：将功能拆分为独立的模块
2. **配置管理**：使用配置文件或环境变量
3. **日志记录**：使用logging模块记录运行信息
4. **测试覆盖**：编写单元测试和集成测试
5. **文档完整**：提供详细的使用说明和示例