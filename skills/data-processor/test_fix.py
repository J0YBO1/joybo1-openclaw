#!/usr/bin/env python3
"""
测试修复后的过滤功能
"""

import json
import sys

# 测试不同的JSON字符串格式
test_cases = [
    # (输入字符串, 是否应该成功)
    ('{"category": "Electronics"}', True),
    ("{'category': 'Electronics'}", False),  # 单引号，应该失败
    ('{"price": {"op": "gt", "value": 100}}', True),
    ('invalid json', False),
]

print("测试JSON解析:")
print("=" * 50)

for test_str, should_succeed in test_cases:
    print(f"\n测试: {test_str}")
    print(f"期望: {'成功' if should_succeed else '失败'}")
    
    try:
        result = json.loads(test_str)
        print(f"结果: 成功 → {result}")
        if not should_succeed:
            print("❌ 不应该成功但成功了!")
    except json.JSONDecodeError as e:
        print(f"结果: 失败 → {e}")
        if should_succeed:
            print("❌ 应该成功但失败了!")
        else:
            print("✅ 符合预期")

print("\n" + "=" * 50)
print("Windows命令行使用示例:")
print('1. 使用双引号: python data_processor.py data.json --filter "{\\"category\\": \\"Electronics\\"}"')
print("2. 使用单引号: python data_processor.py data.json --filter '{\"category\": \"Electronics\"}'")
print("3. 使用两个双引号: python data_processor.py data.json --filter \"{\"\"category\"\": \"\"Electronics\"\"}\"")