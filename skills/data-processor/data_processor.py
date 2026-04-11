#!/usr/bin/env python3
"""
data-processor 技能 - Python实现
高级数据处理工具
"""

import argparse
import json
import sys
import csv
import statistics
from datetime import datetime
from typing import List, Dict, Any, Optional, Generator
from pathlib import Path
from functools import wraps
import time

# ==================== 装饰器 ====================

def timing_decorator(func):
    """计时装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        elapsed = end_time - start_time
        if 'verbose' in kwargs and kwargs['verbose']:
            print(f"[TIMING] {func.__name__} took {elapsed:.4f} seconds", file=sys.stderr)
        return {
            "result": result,
            "execution_time": elapsed,
            "function": func.__name__
        }
    return wrapper

def validate_input(func):
    """输入验证装饰器"""
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        # 对于DataProcessor的方法，验证self.data
        if not self.data:
            raise ValueError("输入数据不能为空")
        if not isinstance(self.data, list):
            raise TypeError("输入数据必须是列表")
        return func(self, *args, **kwargs)
    return wrapper

# ==================== 自定义异常 ====================

class DataProcessorError(Exception):
    """数据处理错误基类"""
    pass

class InvalidDataError(DataProcessorError):
    """无效数据错误"""
    pass

class FileFormatError(DataProcessorError):
    """文件格式错误"""
    pass

# ==================== 数据处理类 ====================

class DataProcessor:
    """高级数据处理类"""
    
    def __init__(self, data: List[Dict[str, Any]]):
        self.data = data
        self._validate_data()
    
    def _validate_data(self):
        """验证数据格式"""
        if not isinstance(self.data, list):
            raise InvalidDataError("数据必须是列表")
        
        for i, item in enumerate(self.data):
            if not isinstance(item, dict):
                raise InvalidDataError(f"第{i}个元素必须是字典")
    
    @validate_input
    @timing_decorator
    def filter_data(self, condition: Dict[str, Any], verbose: bool = False) -> List[Dict[str, Any]]:
        """
        根据条件过滤数据
        condition: {"key": "value"} 或 {"key": {"op": "gt", "value": 10}}
        """
        filtered = []
        for item in self.data:
            match = True
            for key, value in condition.items():
                if key not in item:
                    match = False
                    break
                
                if isinstance(value, dict):
                    # 支持比较操作
                    op = value.get("op", "eq")
                    compare_value = value.get("value")
                    
                    if op == "eq" and item[key] != compare_value:
                        match = False
                        break
                    elif op == "gt" and item[key] <= compare_value:
                        match = False
                        break
                    elif op == "lt" and item[key] >= compare_value:
                        match = False
                        break
                    elif op == "contains" and compare_value not in str(item[key]):
                        match = False
                        break
                elif item[key] != value:
                    match = False
                    break
            
            if match:
                filtered.append(item)
        
        return filtered
    
    @validate_input
    @timing_decorator
    def group_by(self, key: str, verbose: bool = False) -> Dict[str, List[Dict[str, Any]]]:
        """按键分组数据"""
        grouped = {}
        for item in self.data:
            group_key = item.get(key)
            if group_key not in grouped:
                grouped[group_key] = []
            grouped[group_key].append(item)
        return grouped
    
    @validate_input
    @timing_decorator
    def aggregate(self, group_key: str, agg_key: str, 
                  operation: str = "sum", verbose: bool = False) -> Dict[str, Any]:
        """聚合数据"""
        grouped = self.group_by(group_key, verbose=verbose)["result"]
        result = {}
        
        for key, items in grouped.items():
            values = [item.get(agg_key) for item in items 
                     if agg_key in item and isinstance(item[agg_key], (int, float))]
            
            if not values:
                result[key] = None
                continue
            
            if operation == "sum":
                result[key] = sum(values)
            elif operation == "avg":
                result[key] = statistics.mean(values)
            elif operation == "min":
                result[key] = min(values)
            elif operation == "max":
                result[key] = max(values)
            elif operation == "count":
                result[key] = len(values)
            else:
                raise ValueError(f"不支持的聚合操作: {operation}")
        
        return result
    
    @validate_input
    @timing_decorator
    def sort_by(self, key: str, reverse: bool = False, verbose: bool = False) -> List[Dict[str, Any]]:
        """按键排序数据"""
        return sorted(self.data, key=lambda x: x.get(key, ""), reverse=reverse)
    
    def statistical_summary(self, key: str) -> Dict[str, Any]:
        """统计摘要"""
        values = [item.get(key) for item in self.data 
                 if key in item and isinstance(item[key], (int, float))]
        
        if not values:
            return {"error": f"键 '{key}' 没有数值数据"}
        
        return {
            "count": len(values),
            "sum": sum(values),
            "mean": statistics.mean(values),
            "median": statistics.median(values),
            "stdev": statistics.stdev(values) if len(values) > 1 else 0,
            "min": min(values),
            "max": max(values),
            "range": max(values) - min(values)
        }

# ==================== 文件处理类 ====================

class FileHandler:
    """文件处理类"""
    
    @staticmethod
    def read_json(filepath: str) -> List[Dict[str, Any]]:
        """读取JSON文件"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not isinstance(data, list):
                data = [data]
            
            return data
        except json.JSONDecodeError as e:
            raise FileFormatError(f"JSON解析错误: {e}")
        except Exception as e:
            raise FileFormatError(f"文件读取错误: {e}")
    
    @staticmethod
    def read_csv(filepath: str) -> List[Dict[str, Any]]:
        """读取CSV文件"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                return list(reader)
        except Exception as e:
            raise FileFormatError(f"CSV读取错误: {e}")
    
    @staticmethod
    def write_json(filepath: str, data: Any, indent: int = 2) -> None:
        """写入JSON文件"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=indent, ensure_ascii=False)
    
    @staticmethod
    def write_csv(filepath: str, data: List[Dict[str, Any]]) -> None:
        """写入CSV文件"""
        if not data:
            return
        
        fieldnames = data[0].keys()
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)

# ==================== 生成器函数 ====================

def batch_generator(data: List[Any], batch_size: int = 100) -> Generator[List[Any], None, None]:
    """分批生成数据"""
    for i in range(0, len(data), batch_size):
        yield data[i:i + batch_size]

def filter_generator(data: List[Dict[str, Any]], 
                    condition: Dict[str, Any]) -> Generator[Dict[str, Any], None, None]:
    """过滤生成器"""
    for item in data:
        match = True
        for key, value in condition.items():
            if key not in item or item[key] != value:
                match = False
                break
        
        if match:
            yield item

# ==================== 命令行接口 ====================

def create_parser() -> argparse.ArgumentParser:
    """创建命令行解析器"""
    parser = argparse.ArgumentParser(
        description="高级数据处理工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 过滤数据
  python data_processor.py data.json --filter '{"status": "active"}'
  
  # 分组并聚合
  python data_processor.py data.json --group-by category --aggregate price --operation avg
  
  # 统计摘要
  python data_processor.py data.json --stats price
  
  # 排序并输出
  python data_processor.py data.json --sort-by price --reverse --output results.json
        """
    )
    
    parser.add_argument("input_file", help="输入文件路径 (JSON或CSV)")
    parser.add_argument("--output", "-o", help="输出文件路径")
    parser.add_argument("--format", choices=["json", "csv"], default="json", 
                       help="输出格式 (默认: json)")
    
    # 操作选项
    parser.add_argument("--filter", type=str, help="过滤条件 (JSON格式，如: '{\"category\": \"Electronics\"}')")
    parser.add_argument("--group-by", help="分组键")
    parser.add_argument("--aggregate", help="聚合键")
    parser.add_argument("--operation", choices=["sum", "avg", "min", "max", "count"], 
                       default="sum", help="聚合操作")
    parser.add_argument("--sort-by", help="排序键")
    parser.add_argument("--reverse", action="store_true", help="降序排序")
    parser.add_argument("--stats", help="统计摘要的键")
    
    # 其他选项
    parser.add_argument("--verbose", "-v", action="store_true", help="详细输出")
    parser.add_argument("--batch-size", type=int, default=100, help="批处理大小")
    
    return parser

# ==================== 主函数 ====================

def main():
    """主函数"""
    parser = create_parser()
    args = parser.parse_args()
    
    try:
        # 读取数据
        input_path = Path(args.input_file)
        if not input_path.exists():
            print(f"错误: 文件不存在 - {args.input_file}")
            sys.exit(1)
        
        if args.input_file.endswith('.json'):
            data = FileHandler.read_json(args.input_file)
        elif args.input_file.endswith('.csv'):
            data = FileHandler.read_csv(args.input_file)
        else:
            print("错误: 不支持的文件格式，请使用JSON或CSV文件")
            sys.exit(1)
        
        if args.verbose:
            print(f"读取了 {len(data)} 条记录", file=sys.stderr)
        
        # 创建处理器
        processor = DataProcessor(data)
        
        result = None
        operation = "原始数据"
        
        # 执行操作
        if args.filter:
            try:
                # 解析JSON过滤条件
                filter_condition = json.loads(args.filter)
                filter_result = processor.filter_data(filter_condition, verbose=args.verbose)
                result = filter_result["result"]
                operation = f"过滤: {args.filter}"
                if args.verbose:
                    print(f"过滤后剩余 {len(result)} 条记录", file=sys.stderr)
            except json.JSONDecodeError as e:
                error_output = {
                    "success": False,
                    "timestamp": datetime.now().isoformat(),
                    "error": f"过滤条件JSON解析错误: {e}\n请确保使用正确的JSON格式，如: '{{\"category\": \"Electronics\"}}'",
                    "type": "json_parse_error"
                }
                print(json.dumps(error_output, ensure_ascii=False))
                sys.exit(1)
        
        elif args.group_by and args.aggregate:
            agg_result = processor.aggregate(
                args.group_by, args.aggregate, args.operation, verbose=args.verbose
            )
            result = agg_result["result"]
            operation = f"聚合: 按{args.group_by}分组，{args.operation}({args.aggregate})"
        
        elif args.group_by:
            group_result = processor.group_by(args.group_by, verbose=args.verbose)
            result = group_result["result"]
            operation = f"分组: 按{args.group_by}"
        
        elif args.sort_by:
            sort_result = processor.sort_by(args.sort_by, args.reverse, verbose=args.verbose)
            result = sort_result["result"]
            operation = f"排序: 按{args.sort_by} {'降序' if args.reverse else '升序'}"
        
        elif args.stats:
            result = processor.statistical_summary(args.stats)
            operation = f"统计: {args.stats}"
        
        else:
            result = data
        
        # 输出结果
        output = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "operation": operation,
            "input_file": args.input_file,
            "record_count": len(result) if isinstance(result, list) else 1,
            "data": result
        }
        
        if args.output:
            if args.format == "json":
                FileHandler.write_json(args.output, output)
                if args.verbose:
                    print(f"结果已保存到: {args.output}", file=sys.stderr)
            else:
                if isinstance(result, list):
                    FileHandler.write_csv(args.output, result)
                    if args.verbose:
                        print(f"结果已保存到: {args.output}", file=sys.stderr)
                else:
                    print("错误: CSV格式只支持列表数据")
                    sys.exit(1)
        
        # 总是输出JSON到stdout（供Node.js调用）
        print(json.dumps(output, ensure_ascii=False))
    
    except DataProcessorError as e:
        error_output = {
            "success": False,
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "type": "data_processor_error"
        }
        print(json.dumps(error_output, ensure_ascii=False))
        sys.exit(1)
    
    except Exception as e:
        error_output = {
            "success": False,
            "timestamp": datetime.now().isoformat(),
            "error": f"内部错误: {str(e)}",
            "type": "internal_error"
        }
        print(json.dumps(error_output, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()