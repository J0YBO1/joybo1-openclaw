#!/usr/bin/env python3
"""
测试Python技能脚本
"""

import subprocess
import json
import sys
from pathlib import Path


def run_command(cmd):
    """运行命令并返回结果"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        return {
            "success": result.returncode == 0,
            "returncode": result.returncode,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
            "command": cmd
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "command": cmd
        }


def test_python_exercises():
    """测试Python练习脚本"""
    print("🧪 测试Python练习脚本")
    print("=" * 50)
    
    tests = [
        {
            "name": "基础语法测试",
            "cmd": "python python_exercises.py --section basic --output text"
        },
        {
            "name": "控制结构测试",
            "cmd": "python python_exercises.py --section control --output text"
        },
        {
            "name": "函数测试",
            "cmd": "python python_exercises.py --section function --output text"
        },
        {
            "name": "模块测试",
            "cmd": "python python_exercises.py --section module --output text"
        },
        {
            "name": "错误处理测试",
            "cmd": "python python_exercises.py --section error --output text"
        },
        {
            "name": "JSON输出测试",
            "cmd": "python python_exercises.py --section basic --output json"
        }
    ]
    
    results = []
    for test in tests:
        print(f"\n📋 {test['name']}")
        print(f"命令: {test['cmd']}")
        
        result = run_command(test['cmd'])
        
        if result["success"]:
            print("✅ 测试通过")
            if len(result["stdout"]) > 200:
                print(f"输出（前200字符）: {result['stdout'][:200]}...")
            else:
                print(f"输出: {result['stdout']}")
        else:
            print("❌ 测试失败")
            print(f"错误: {result.get('error', result['stderr'])}")
        
        results.append({
            "test": test["name"],
            "success": result["success"],
            "output_preview": result["stdout"][:100] if result["stdout"] else ""
        })
    
    return results


def test_simple_python_skill():
    """测试简单Python技能"""
    print("\n\n🧪 测试简单Python技能")
    print("=" * 50)
    
    tests = [
        {
            "name": "打招呼功能",
            "cmd": "python simple_python_skill.py --greet --name 黄冠 --output text"
        },
        {
            "name": "计算功能",
            "cmd": "python simple_python_skill.py --calculate --numbers 1 2 3 4 5 --output text"
        },
        {
            "name": "文件信息功能（当前目录）",
            "cmd": "python simple_python_skill.py --file-info --path . --output text"
        },
        {
            "name": "文本分析功能",
            "cmd": "python simple_python_skill.py --text-analysis --text \"Hello World! 这是一个测试文本。\" --output text"
        },
        {
            "name": "JSON输出测试",
            "cmd": "python simple_python_skill.py --greet --name Test --output json"
        },
        {
            "name": "详细输出测试",
            "cmd": "python simple_python_skill.py --calculate --numbers 10 20 30 --output pretty"
        }
    ]
    
    results = []
    for test in tests:
        print(f"\n📋 {test['name']}")
        print(f"命令: {test['cmd']}")
        
        result = run_command(test['cmd'])
        
        if result["success"]:
            print("✅ 测试通过")
            if test["name"] == "JSON输出测试":
                try:
                    json_data = json.loads(result["stdout"])
                    print(f"JSON解析成功，技能: {json_data.get('skill')}")
                except:
                    print(f"输出: {result['stdout'][:100]}...")
            else:
                if len(result["stdout"]) > 150:
                    print(f"输出（前150字符）: {result['stdout'][:150]}...")
                else:
                    print(f"输出: {result['stdout']}")
        else:
            print("❌ 测试失败")
            print(f"错误: {result.get('error', result['stderr'])}")
        
        results.append({
            "test": test["name"],
            "success": result["success"],
            "output_preview": result["stdout"][:100] if result["stdout"] else ""
        })
    
    return results


def test_python_environment():
    """测试Python环境"""
    print("\n\n🧪 测试Python环境")
    print("=" * 50)
    
    tests = [
        {
            "name": "Python版本",
            "cmd": "python --version"
        },
        {
            "name": "pip版本",
            "cmd": "pip --version"
        },
        {
            "name": "当前目录",
            "cmd": "pwd"
        },
        {
            "name": "列出文件",
            "cmd": "dir" if sys.platform == "win32" else "ls -la"
        }
    ]
    
    results = []
    for test in tests:
        print(f"\n📋 {test['name']}")
        print(f"命令: {test['cmd']}")
        
        result = run_command(test['cmd'])
        
        if result["success"]:
            print("✅ 测试通过")
            print(f"输出: {result['stdout']}")
        else:
            print("❌ 测试失败")
            print(f"错误: {result.get('error', result['stderr'])}")
        
        results.append({
            "test": test["name"],
            "success": result["success"],
            "output": result["stdout"]
        })
    
    return results


def main():
    """主测试函数"""
    print("🚀 开始Python技能测试")
    print("=" * 60)
    
    all_results = {
        "environment": [],
        "exercises": [],
        "skill": []
    }
    
    # 测试环境
    env_results = test_python_environment()
    all_results["environment"] = env_results
    
    # 测试练习脚本
    exercise_results = test_python_exercises()
    all_results["exercises"] = exercise_results
    
    # 测试技能脚本
    skill_results = test_simple_python_skill()
    all_results["skill"] = skill_results
    
    # 统计结果
    print("\n\n📊 测试结果汇总")
    print("=" * 60)
    
    total_tests = 0
    passed_tests = 0
    
    for category, results in all_results.items():
        category_name = {
            "environment": "环境测试",
            "exercises": "练习脚本测试",
            "skill": "技能测试"
        }.get(category, category)
        
        passed = sum(1 for r in results if r["success"])
        total = len(results)
        
        total_tests += total
        passed_tests += passed
        
        print(f"{category_name}: {passed}/{total} 通过")
        
        # 显示失败的测试
        for result in results:
            if not result["success"]:
                print(f"  ❌ {result['test']}")
    
    # 总体结果
    print("\n" + "=" * 60)
    print(f"总计: {passed_tests}/{total_tests} 测试通过")
    
    if passed_tests == total_tests:
        print("🎉 所有测试通过！Python技能开发环境正常。")
        return 0
    else:
        print(f"⚠️  {total_tests - passed_tests} 个测试失败")
        return 1


if __name__ == "__main__":
    sys.exit(main())