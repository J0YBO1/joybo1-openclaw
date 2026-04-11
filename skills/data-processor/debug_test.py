#!/usr/bin/env python3
"""
调试脚本，测试命令行参数传递
"""

import sys
import json

print("命令行参数:")
for i, arg in enumerate(sys.argv):
    print(f"  [{i}] {arg}")

print("\n测试JSON解析:")
test_json = '{"category": "Electronics"}'
try:
    parsed = json.loads(test_json)
    print(f"成功解析: {parsed}")
except json.JSONDecodeError as e:
    print(f"解析失败: {e}")

# 测试从命令行读取
if len(sys.argv) > 1 and sys.argv[1] == "--test":
    test_arg = sys.argv[2]
    print(f"\n从命令行读取的参数: {test_arg}")
    try:
        parsed_arg = json.loads(test_arg)
        print(f"成功解析命令行参数: {parsed_arg}")
    except json.JSONDecodeError as e:
        print(f"命令行参数解析失败: {e}")