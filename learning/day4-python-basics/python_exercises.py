#!/usr/bin/env python3
"""
Day 4 Python基础练习脚本
包含Python基础语法的各种示例
"""

import sys
import json
import argparse
import datetime
from typing import List, Dict, Optional, Union


def basic_syntax_examples():
    """基础语法示例"""
    print("=" * 50)
    print("1. 基础语法示例")
    print("=" * 50)
    
    # 变量和数据类型
    name = "黄冠"
    age = 21
    height = 1.75
    is_student = True
    
    print(f"姓名: {name}")
    print(f"年龄: {age}")
    print(f"身高: {height}")
    print(f"是否学生: {is_student}")
    
    # 容器类型
    fruits = ["苹果", "香蕉", "橙子", "葡萄"]
    coordinates = (30.2672, -97.7431)
    person = {"name": "黄冠", "age": 21, "city": "广州"}
    unique_numbers = {1, 2, 3, 4, 5, 5, 4}  # 集合会自动去重
    
    print(f"\n水果列表: {fruits}")
    print(f"坐标元组: {coordinates}")
    print(f"个人信息: {person}")
    print(f"唯一数字集合: {unique_numbers}")
    
    return {"status": "success", "message": "基础语法示例完成"}


def control_structures():
    """控制结构示例"""
    print("\n" + "=" * 50)
    print("2. 控制结构示例")
    print("=" * 50)
    
    # 条件语句
    scores = [85, 92, 78, 60, 95]
    grade_counts = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    
    print("分数等级统计:")
    for score in scores:
        if score >= 90:
            grade = "A"
        elif score >= 80:
            grade = "B"
        elif score >= 70:
            grade = "C"
        elif score >= 60:
            grade = "D"
        else:
            grade = "F"
        
        grade_counts[grade] += 1
        print(f"  分数 {score}: 等级 {grade}")
    
    print(f"\n等级分布: {grade_counts}")
    
    # 循环语句
    print("\n循环示例:")
    print("for循环:")
    for i in range(1, 6):
        print(f"  第{i}次迭代")
    
    print("\nwhile循环:")
    count = 0
    while count < 3:
        print(f"  计数: {count}")
        count += 1
    
    # 列表推导式
    squares = [x ** 2 for x in range(1, 6)]
    print(f"\n列表推导式（1-5的平方）: {squares}")
    
    return {"status": "success", "grade_counts": grade_counts, "squares": squares}


def function_examples():
    """函数示例"""
    print("\n" + "=" * 50)
    print("3. 函数示例")
    print("=" * 50)
    
    # 基本函数
    def greet(name: str, greeting: str = "你好") -> str:
        """打招呼函数
        
        Args:
            name: 姓名
            greeting: 问候语，默认为"你好"
        
        Returns:
            问候字符串
        """
        return f"{greeting}, {name}!"
    
    # 调用函数
    print("基本函数调用:")
    print(f"  {greet('黄冠')}")
    print(f"  {greet('世界', 'Hello')}")
    
    # 多个返回值
    def calculate_stats(numbers: List[int]) -> Dict[str, Union[int, float]]:
        """计算统计信息
        
        Args:
            numbers: 数字列表
        
        Returns:
            包含统计信息的字典
        """
        if not numbers:
            return {"count": 0, "sum": 0, "average": 0, "max": 0, "min": 0}
        
        return {
            "count": len(numbers),
            "sum": sum(numbers),
            "average": sum(numbers) / len(numbers),
            "max": max(numbers),
            "min": min(numbers)
        }
    
    numbers = [10, 20, 30, 40, 50]
    stats = calculate_stats(numbers)
    print(f"\n数字列表 {numbers} 的统计信息:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    # lambda函数
    print("\nlambda函数示例:")
    square = lambda x: x ** 2
    add = lambda x, y: x + y
    
    print(f"  5的平方: {square(5)}")
    print(f"  3 + 7: {add(3, 7)}")
    
    # 使用lambda进行排序
    people = [
        {"name": "Alice", "age": 25},
        {"name": "Bob", "age": 30},
        {"name": "Charlie", "age": 20}
    ]
    
    sorted_by_age = sorted(people, key=lambda p: p["age"])
    print(f"\n按年龄排序: {sorted_by_age}")
    
    return {
        "status": "success",
        "greeting": greet("黄冠"),
        "stats": stats,
        "sorted_people": sorted_by_age
    }


def module_examples():
    """模块示例"""
    print("\n" + "=" * 50)
    print("4. 模块示例")
    print("=" * 50)
    
    import math
    import os
    import random
    from datetime import datetime
    
    # math模块
    print("math模块示例:")
    print(f"  π的值: {math.pi}")
    print(f"  e的值: {math.e}")
    print(f"  16的平方根: {math.sqrt(16)}")
    print(f"  2的3次方: {math.pow(2, 3)}")
    print(f"  正弦(π/2): {math.sin(math.pi/2)}")
    
    # os模块
    print("\nos模块示例:")
    print(f"  当前工作目录: {os.getcwd()}")
    print(f"  当前用户: {os.getlogin()}")
    print(f"  环境变量PATH: {os.environ.get('PATH', '未找到')[:50]}...")
    
    # random模块
    print("\nrandom模块示例:")
    print(f"  随机整数(1-100): {random.randint(1, 100)}")
    print(f"  随机浮点数(0-1): {random.random()}")
    print(f"  随机选择: {random.choice(['苹果', '香蕉', '橙子'])}")
    
    # datetime模块
    print("\ndatetime模块示例:")
    now = datetime.now()
    print(f"  当前时间: {now}")
    print(f"  年份: {now.year}")
    print(f"  月份: {now.month}")
    print(f"  日期: {now.day}")
    print(f"  格式化时间: {now.strftime('%Y-%m-%d %H:%M:%S')}")
    
    return {
        "status": "success",
        "pi": math.pi,
        "current_dir": os.getcwd(),
        "random_number": random.randint(1, 100),
        "current_time": now.isoformat()
    }


def error_handling_examples():
    """错误处理示例"""
    print("\n" + "=" * 50)
    print("5. 错误处理示例")
    print("=" * 50)
    
    # 基本错误处理
    def safe_divide(a: float, b: float) -> Optional[float]:
        """安全除法
        
        Args:
            a: 被除数
            b: 除数
        
        Returns:
            商，如果除数为0则返回None
        """
        try:
            result = a / b
        except ZeroDivisionError:
            print(f"  错误: 除数不能为0 ({a} / {b})")
            return None
        except TypeError as e:
            print(f"  类型错误: {e}")
            return None
        except Exception as e:
            print(f"  未知错误: {e}")
            return None
        else:
            print(f"  计算成功: {a} / {b} = {result}")
            return result
        finally:
            print("  除法计算完成")
    
    print("安全除法示例:")
    safe_divide(10, 2)
    safe_divide(10, 0)
    safe_divide(10, "2")  # 类型错误
    
    # 自定义异常
    class ValidationError(Exception):
        """自定义验证错误"""
        pass
    
    def validate_age(age: int) -> bool:
        """验证年龄
        
        Args:
            age: 年龄
        
        Returns:
            是否有效
        
        Raises:
            ValidationError: 如果年龄无效
        """
        if age < 0:
            raise ValidationError("年龄不能为负数")
        elif age > 150:
            raise ValidationError("年龄不能超过150岁")
        elif age < 18:
            raise ValidationError("年龄未满18岁")
        
        return True
    
    print("\n自定义异常示例:")
    test_ages = [25, -5, 200, 16]
    
    for age in test_ages:
        try:
            if validate_age(age):
                print(f"  年龄 {age}: 有效")
        except ValidationError as e:
            print(f"  年龄 {age}: 无效 - {e}")
    
    return {"status": "success", "message": "错误处理示例完成"}


def openclaw_integration_example():
    """OpenClaw集成示例"""
    print("\n" + "=" * 50)
    print("6. OpenClaw集成示例")
    print("=" * 50)
    
    def process_command(args: Dict) -> Dict:
        """处理命令
        
        Args:
            args: 命令参数
        
        Returns:
            处理结果
        """
        command = args.get("command", "")
        data = args.get("data", {})
        
        result = {
            "command": command,
            "timestamp": datetime.datetime.now().isoformat(),
            "success": True
        }
        
        if command == "greet":
            name = data.get("name", "用户")
            result["message"] = f"你好，{name}！"
            result["data"] = {"greeting": result["message"]}
        
        elif command == "calculate":
            numbers = data.get("numbers", [])
            if numbers:
                result["sum"] = sum(numbers)
                result["average"] = sum(numbers) / len(numbers)
                result["data"] = {"numbers": numbers, "sum": result["sum"], "average": result["average"]}
            else:
                result["success"] = False
                result["error"] = "没有提供数字"
        
        elif command == "file_info":
            import os
            filename = data.get("filename", "")
            if os.path.exists(filename):
                stats = os.stat(filename)
                result["data"] = {
                    "filename": filename,
                    "size": stats.st_size,
                    "modified": datetime.datetime.fromtimestamp(stats.st_mtime).isoformat()
                }
            else:
                result["success"] = False
                result["error"] = f"文件不存在: {filename}"
        
        else:
            result["success"] = False
            result["error"] = f"未知命令: {command}"
        
        return result
    
    # 测试命令处理
    test_commands = [
        {"command": "greet", "data": {"name": "黄冠"}},
        {"command": "calculate", "data": {"numbers": [1, 2, 3, 4, 5]}},
        {"command": "file_info", "data": {"filename": "test.txt"}},
        {"command": "unknown", "data": {}}
    ]
    
    print("命令处理测试:")
    for cmd in test_commands:
        result = process_command(cmd)
        status = "✅" if result["success"] else "❌"
        print(f"  {status} {cmd['command']}: {result.get('message', result.get('error', '完成'))}")
    
    return {
        "status": "success",
        "test_results": [process_command(cmd) for cmd in test_commands]
    }


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='Python基础练习脚本')
    parser.add_argument('--section', type=str, choices=['all', 'basic', 'control', 'function', 'module', 'error', 'openclaw'], default='all', help='要运行的章节')
    parser.add_argument('--output', type=str, choices=['text', 'json'], default='text', help='输出格式')
    
    args = parser.parse_args()
    
    results = {}
    
    try:
        # 根据参数运行相应的章节
        if args.section in ['all', 'basic']:
            results['basic'] = basic_syntax_examples()
        
        if args.section in ['all', 'control']:
            results['control'] = control_structures()
        
        if args.section in ['all', 'function']:
            results['function'] = function_examples()
        
        if args.section in ['all', 'module']:
            results['module'] = module_examples()
        
        if args.section in ['all', 'error']:
            results['error'] = error_handling_examples()
        
        if args.section in ['all', 'openclaw']:
            results['openclaw'] = openclaw_integration_example()
        
        # 汇总结果
        summary = {
            "status": "success",
            "timestamp": datetime.datetime.now().isoformat(),
            "sections_run": list(results.keys()),
            "results": results
        }
        
        # 输出结果
        if args.output == 'json':
            print(json.dumps(summary, ensure_ascii=False, indent=2))
        else:
            print("\n" + "=" * 50)
            print("练习完成总结")
            print("=" * 50)
            print(f"运行章节: {', '.join(results.keys())}")
            print(f"运行时间: {summary['timestamp']}")
            print(f"状态: {summary['status']}")
            print("=" * 50)
        
        return 0
        
    except Exception as e:
        error_result = {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        if args.output == 'json':
            print(json.dumps(error_result, ensure_ascii=False, indent=2))
        else:
            print(f"❌ 错误: {e}")
        
        return 1


if __name__ == "__main__":
    sys.exit(main())