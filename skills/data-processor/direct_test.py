#!/usr/bin/env python3
"""
直接测试，绕过命令行参数问题
"""

import json
from data_processor import DataProcessor, FileHandler

# 直接读取数据
import os
data_path = os.path.join(os.path.dirname(__file__), "sample_data.json")
data = FileHandler.read_json(data_path)
processor = DataProcessor(data)

# 测试过滤
print("测试1: 过滤电子产品")
filter_condition = {"category": "Electronics"}
result = processor.filter_data(filter_condition, verbose=True)
if isinstance(result, dict) and "result" in result:
    filtered_data = result["result"]
    print(f"找到 {len(filtered_data)} 个电子产品:")
    for item in filtered_data:
        print(f"  - {item['name']} (${item['price']})")
else:
    print(f"结果格式异常: {result}")

print("\n测试2: 价格大于100")
filter_condition2 = {"price": {"op": "gt", "value": 100}}
result2 = processor.filter_data(filter_condition2, verbose=True)
print(f"找到 {len(result2['result'])} 个价格大于100的产品:")
for item in result2["result"]:
    print(f"  - {item['name']} (${item['price']})")

print("\n测试3: 统计价格")
stats = processor.statistical_summary("price")
print("价格统计:")
for key, value in stats.items():
    print(f"  {key}: {value}")