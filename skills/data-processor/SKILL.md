# data-processor 技能

强大的数据处理工具，支持过滤、分组、聚合、排序和统计分析。

## 功能特性

- **多种数据操作**：过滤、分组、聚合、排序
- **统计摘要**：计算平均值、中位数、标准差等
- **文件支持**：JSON和CSV格式
- **批处理**：支持大数据集的分批处理
- **详细日志**：执行时间统计和详细输出
- **错误处理**：完善的异常处理和用户友好的错误信息

## 安装依赖

```bash
# 不需要额外依赖，使用Python标准库
```

## 使用方法

### 基本命令

```bash
# 查看帮助
openclaw data-processor --help

# 处理JSON文件
openclaw data-processor data.json

# 处理CSV文件  
openclaw data-processor data.csv
```

### 过滤数据

```bash
# 按条件过滤
openclaw data-processor data.json --filter '{"status": "active"}'

# 使用比较操作
openclaw data-processor data.json --filter '{"price": {"op": "gt", "value": 100}}'

# 包含搜索
openclaw data-processor data.json --filter '{"name": {"op": "contains", "value": "python"}}'
```

### 分组和聚合

```bash
# 按类别分组
openclaw data-processor data.json --group-by category

# 分组并计算总和
openclaw data-processor data.json --group-by category --aggregate price --operation sum

# 计算平均值
openclaw data-processor data.json --group-by department --aggregate salary --operation avg

# 计数
openclaw data-processor data.json --group-by status --aggregate id --operation count
```

### 排序

```bash
# 升序排序
openclaw data-processor data.json --sort-by price

# 降序排序
openclaw data-processor data.json --sort-by price --reverse
```

### 统计摘要

```bash
# 计算价格统计
openclaw data-processor data.json --stats price

# 输出包含：
# - 数量、总和、平均值、中位数
# - 标准差、最小值、最大值、范围
```

### 输出选项

```bash
# 保存到JSON文件
openclaw data-processor data.json --output results.json

# 保存到CSV文件
openclaw data-processor data.json --output results.csv --format csv

# 详细输出
openclaw data-processor data.json --verbose
```

## 示例数据

创建示例数据文件 `sample_data.json`：

```json
[
  {"id": 1, "name": "Laptop", "category": "Electronics", "price": 999.99, "stock": 10},
  {"id": 2, "name": "Python Book", "category": "Books", "price": 39.99, "stock": 25},
  {"id": 3, "name": "Coffee", "category": "Food", "price": 4.99, "stock": 100},
  {"id": 4, "name": "Mouse", "category": "Electronics", "price": 29.99, "stock": 15},
  {"id": 5, "name": "Notebook", "category": "Stationery", "price": 2.99, "stock": 50},
  {"id": 6, "name": "Headphones", "category": "Electronics", "price": 89.99, "stock": 8},
  {"id": 7, "name": "Tea", "category": "Food", "price": 3.99, "stock": 75},
  {"id": 8, "name": "JavaScript Book", "category": "Books", "price": 49.99, "stock": 20}
]
```

## 使用示例

### 示例1：过滤电子产品

```bash
openclaw data-processor sample_data.json --filter '{"category": "Electronics"}'
```

### 示例2：按类别分组并计算平均价格

```bash
openclaw data-processor sample_data.json --group-by category --aggregate price --operation avg
```

### 示例3：价格统计

```bash
openclaw data-processor sample_data.json --stats price
```

### 示例4：按价格降序排序并保存

```bash
openclaw data-processor sample_data.json --sort-by price --reverse --output sorted.json
```

## 输出格式

### 成功响应

```json
{
  "success": true,
  "timestamp": "2026-04-11T10:30:00.123456",
  "operation": "过滤: {\"category\": \"Electronics\"}",
  "input_file": "sample_data.json",
  "record_count": 3,
  "data": [
    {"id": 1, "name": "Laptop", "category": "Electronics", "price": 999.99, "stock": 10},
    {"id": 4, "name": "Mouse", "category": "Electronics", "price": 29.99, "stock": 15},
    {"id": 6, "name": "Headphones", "category": "Electronics", "price": 89.99, "stock": 8}
  ]
}
```

### 错误响应

```json
{
  "success": false,
  "timestamp": "2026-04-11T10:30:00.123456",
  "error": "文件不存在 - missing.json",
  "type": "data_processor_error"
}
```

## 技术实现

### 核心类

1. **DataProcessor** - 主处理类
   - 数据验证和基本操作
   - 过滤、分组、聚合、排序
   - 统计计算

2. **FileHandler** - 文件处理类
   - JSON和CSV读写
   - 编码处理

3. **装饰器**
   - `@timing_decorator` - 执行时间统计
   - `@validate_input` - 输入验证

### 自定义异常

- `DataProcessorError` - 基类错误
- `InvalidDataError` - 无效数据错误
- `FileFormatError` - 文件格式错误

### 生成器

- `batch_generator` - 分批处理大数据集
- `filter_generator` - 流式过滤

## 性能优化

1. **内存效率**：使用生成器处理大数据集
2. **批处理**：支持分批处理减少内存占用
3. **缓存**：重复操作可考虑添加缓存机制

## 扩展建议

1. **数据库支持**：添加SQLite/MySQL连接
2. **更多聚合函数**：添加方差、百分位数等
3. **数据可视化**：集成图表生成
4. **数据转换**：添加数据格式转换功能
5. **API集成**：支持从API获取数据

## 测试

创建测试脚本 `test_data_processor.py`：

```python
#!/usr/bin/env python3
import json
import tempfile
import os
from advanced_python_skill import DataProcessor, FileHandler

def test_basic_operations():
    """测试基本操作"""
    data = [
        {"id": 1, "name": "A", "value": 10},
        {"id": 2, "name": "B", "value": 20},
        {"id": 3, "name": "A", "value": 30}
    ]
    
    processor = DataProcessor(data)
    
    # 测试过滤
    filtered = processor.filter_data({"name": "A"})
    assert len(filtered) == 2
    
    # 测试分组
    grouped = processor.group_by("name")
    assert len(grouped) == 2
    
    # 测试聚合
    aggregated = processor.aggregate("name", "value", "sum")
    assert aggregated["A"] == 40
    
    print("所有测试通过!")

if __name__ == "__main__":
    test_basic_operations()
```

## 注意事项

1. **文件编码**：默认使用UTF-8编码
2. **内存限制**：处理超大文件时使用批处理模式
3. **JSON过滤**：过滤条件必须是有效的JSON字符串
4. **错误处理**：所有错误都会以JSON格式返回

## 版本历史

- v1.0.0 (2026-04-11): 初始版本，包含基本数据处理功能
- v1.1.0 (计划): 添加数据库支持和更多聚合函数