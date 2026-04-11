# data-processor 技能

一个功能强大的数据处理工具，专门为OpenClaw设计。支持多种数据操作，包括过滤、分组、聚合、排序和统计分析。

## 功能特点

- ✅ **多种数据格式**：支持JSON和CSV文件
- ✅ **丰富的数据操作**：过滤、分组、聚合、排序
- ✅ **统计计算**：平均值、中位数、标准差等
- ✅ **批处理支持**：处理大数据集不卡顿
- ✅ **详细日志**：执行时间统计和进度显示
- ✅ **错误处理**：完善的异常处理和友好的错误信息
- ✅ **跨平台**：Windows、Linux、macOS全支持

## 快速开始

### 安装

```bash
# 技能会自动安装到OpenClaw
# 无需额外步骤
```

### 基本使用

```bash
# 查看帮助
openclaw data-processor --help

# 处理数据文件
openclaw data-processor data.json
```

## 详细功能

### 1. 数据过滤

根据条件过滤数据：

```bash
# 简单过滤
openclaw data-processor data.json --filter '{"status": "active"}'

# 数值比较
openclaw data-processor data.json --filter '{"price": {"op": "gt", "value": 100}}'

# 文本包含
openclaw data-processor data.json --filter '{"name": {"op": "contains", "value": "python"}}'
```

### 2. 数据分组

按指定字段分组数据：

```bash
# 按类别分组
openclaw data-processor data.json --group-by category

# 按部门分组
openclaw data-processor data.json --group-by department
```

### 3. 数据聚合

对分组后的数据进行聚合计算：

```bash
# 计算总和
openclaw data-processor data.json --group-by category --aggregate price --operation sum

# 计算平均值
openclaw data-processor data.json --group-by department --aggregate salary --operation avg

# 计数
openclaw data-processor data.json --group-by status --aggregate id --operation count

# 找最大值
openclaw data-processor data.json --group-by category --aggregate price --operation max

# 找最小值
openclaw data-processor data.json --group-by category --aggregate price --operation min
```

### 4. 数据排序

对数据进行排序：

```bash
# 升序排序
openclaw data-processor data.json --sort-by price

# 降序排序
openclaw data-processor data.json --sort-by price --reverse
```

### 5. 统计摘要

计算数值字段的统计信息：

```bash
# 价格统计
openclaw data-processor data.json --stats price

# 输出包含：
# - 数量、总和、平均值、中位数
# - 标准差、最小值、最大值、范围
```

### 6. 输出选项

控制输出格式和位置：

```bash
# 保存到JSON文件
openclaw data-processor data.json --output results.json

# 保存到CSV文件
openclaw data-processor data.json --output results.csv --format csv

# 详细输出模式
openclaw data-processor data.json --verbose
```

## 示例数据

创建 `sample_data.json` 文件：

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

### 示例1：找出所有电子产品

```bash
openclaw data-processor sample_data.json --filter '{"category": "Electronics"}'
```

### 示例2：按类别计算平均价格

```bash
openclaw data-processor sample_data.json --group-by category --aggregate price --operation avg
```

### 示例3：价格统计信息

```bash
openclaw data-processor sample_data.json --stats price
```

### 示例4：按价格降序排序并保存

```bash
openclaw data-processor sample_data.json --sort-by price --reverse --output sorted.json
```

### 示例5：处理CSV文件

```bash
openclaw data-processor data.csv --filter '{"status": "active"}' --output active_users.csv --format csv
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

## 技术架构

### 文件结构

```
data-processor/
├── SKILL.md          # 技能说明文档
├── index.js          # Node.js入口文件
├── data_processor.py # Python数据处理核心
├── package.json      # 包配置
└── README.md         # 用户文档
```

### 核心组件

1. **DataProcessor类** (Python)
   - 数据验证和基本操作
   - 过滤、分组、聚合、排序算法
   - 统计计算功能

2. **FileHandler类** (Python)
   - JSON和CSV文件读写
   - 编码处理和错误恢复

3. **装饰器系统** (Python)
   - `@timing_decorator` - 性能监控
   - `@validate_input` - 输入验证

4. **Node.js桥接** (JavaScript)
   - 命令行参数解析
   - Python进程管理
   - 错误处理和输出格式化

## 性能优化

1. **内存管理**
   - 使用生成器处理大数据集
   - 支持批处理减少内存占用

2. **执行效率**
   - 算法优化，减少不必要的计算
   - 并行处理支持（未来版本）

3. **缓存机制**
   - 重复查询缓存（未来版本）

## 扩展开发

### 添加新功能

1. **数据库支持**
   ```python
   # 添加SQLite/MySQL连接
   class DatabaseHandler:
       def connect(self, connection_string):
           pass
   ```

2. **更多聚合函数**
   ```python
   # 添加方差、百分位数等
   def variance(self, values):
       pass
   ```

3. **数据可视化**
   ```python
   # 集成图表生成
   def generate_chart(self, data, chart_type):
       pass
   ```

### 创建测试

```python
# test_data_processor.py
import unittest
from data_processor import DataProcessor

class TestDataProcessor(unittest.TestCase):
    def test_filter(self):
        data = [{"id": 1, "status": "active"}]
        processor = DataProcessor(data)
        result = processor.filter_data({"status": "active"})
        self.assertEqual(len(result), 1)
```

## 常见问题

### Q: 处理大文件时内存不足？
A: 使用 `--batch-size` 参数分批处理：
```bash
openclaw data-processor large_data.json --batch-size 1000
```

### Q: JSON过滤条件怎么写？
A: 过滤条件必须是有效的JSON字符串：
```bash
# 正确
openclaw data-processor data.json --filter '{"status": "active"}'

# 错误（缺少引号）
openclaw data-processor data.json --filter {status: active}
```

### Q: 支持哪些文件格式？
A: 目前支持JSON和CSV格式，未来计划支持Excel、XML等。

### Q: 如何查看详细执行信息？
A: 使用 `--verbose` 参数：
```bash
openclaw data-processor data.json --verbose
```

## 版本历史

- **v1.0.0** (2026-04-11)
  - 初始版本发布
  - 支持基本数据处理操作
  - JSON和CSV文件支持

- **v1.1.0** (计划中)
  - 添加数据库支持
  - 更多聚合函数
  - 数据可视化功能

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License