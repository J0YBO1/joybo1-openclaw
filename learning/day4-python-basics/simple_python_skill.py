#!/usr/bin/env python3
"""
简单的Python技能示例
展示如何创建一个可以被OpenClaw调用的Python技能
"""

import sys
import json
import argparse
import datetime
from typing import Dict, List, Optional, Union
from pathlib import Path


class SimplePythonSkill:
    """简单的Python技能类"""
    
    def __init__(self):
        self.name = "simple-python-skill"
        self.version = "1.0.0"
        self.author = "黄冠"
    
    def greet(self, name: str = "用户") -> Dict:
        """打招呼功能
        
        Args:
            name: 姓名
        
        Returns:
            问候结果
        """
        return {
            "message": f"你好，{name}！",
            "timestamp": datetime.datetime.now().isoformat(),
            "skill": self.name
        }
    
    def calculate(self, numbers: List[Union[int, float]]) -> Dict:
        """计算功能
        
        Args:
            numbers: 数字列表
        
        Returns:
            计算结果
        """
        if not numbers:
            return {
                "error": "没有提供数字",
                "success": False
            }
        
        try:
            return {
                "numbers": numbers,
                "count": len(numbers),
                "sum": sum(numbers),
                "average": sum(numbers) / len(numbers),
                "max": max(numbers),
                "min": min(numbers),
                "success": True
            }
        except Exception as e:
            return {
                "error": str(e),
                "success": False
            }
    
    def file_info(self, filepath: str) -> Dict:
        """文件信息功能
        
        Args:
            filepath: 文件路径
        
        Returns:
            文件信息
        """
        path = Path(filepath)
        
        if not path.exists():
            return {
                "error": f"文件不存在: {filepath}",
                "success": False
            }
        
        try:
            stats = path.stat()
            return {
                "filename": path.name,
                "filepath": str(path.absolute()),
                "size": stats.st_size,
                "size_human": self._format_size(stats.st_size),
                "created": datetime.datetime.fromtimestamp(stats.st_ctime).isoformat(),
                "modified": datetime.datetime.fromtimestamp(stats.st_mtime).isoformat(),
                "is_file": path.is_file(),
                "is_dir": path.is_dir(),
                "success": True
            }
        except Exception as e:
            return {
                "error": str(e),
                "success": False
            }
    
    def text_analysis(self, text: str) -> Dict:
        """文本分析功能
        
        Args:
            text: 文本内容
        
        Returns:
            分析结果
        """
        if not text:
            return {
                "error": "没有提供文本",
                "success": False
            }
        
        try:
            lines = text.splitlines()
            words = text.split()
            
            return {
                "text_preview": text[:100] + ("..." if len(text) > 100 else ""),
                "char_count": len(text),
                "line_count": len(lines),
                "word_count": len(words),
                "avg_word_length": sum(len(word) for word in words) / len(words) if words else 0,
                "success": True
            }
        except Exception as e:
            return {
                "error": str(e),
                "success": False
            }
    
    def _format_size(self, size_bytes: int) -> str:
        """格式化文件大小
        
        Args:
            size_bytes: 字节大小
        
        Returns:
            格式化后的字符串
        """
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} PB"


def main():
    """主函数 - OpenClaw技能入口点"""
    parser = argparse.ArgumentParser(
        description='简单的Python技能示例',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s --greet --name "黄冠"
  %(prog)s --calculate --numbers 1 2 3 4 5
  %(prog)s --file-info --path "example.txt"
  %(prog)s --text-analysis --text "Hello World"
        """
    )
    
    # 功能选择
    parser.add_argument('--greet', action='store_true', help='打招呼功能')
    parser.add_argument('--calculate', action='store_true', help='计算功能')
    parser.add_argument('--file-info', action='store_true', help='文件信息功能')
    parser.add_argument('--text-analysis', action='store_true', help='文本分析功能')
    
    # 参数
    parser.add_argument('--name', type=str, help='姓名（用于greet功能）')
    parser.add_argument('--numbers', type=float, nargs='+', help='数字列表（用于calculate功能）')
    parser.add_argument('--path', type=str, help='文件路径（用于file-info功能）')
    parser.add_argument('--text', type=str, help='文本内容（用于text-analysis功能）')
    
    # 输出选项
    parser.add_argument('--output', type=str, choices=['json', 'text', 'pretty'], default='json', help='输出格式')
    parser.add_argument('--verbose', '-v', action='store_true', help='详细输出')
    
    args = parser.parse_args()
    
    # 创建技能实例
    skill = SimplePythonSkill()
    
    # 执行相应的功能
    result = {
        "skill": skill.name,
        "version": skill.version,
        "author": skill.author,
        "timestamp": datetime.datetime.now().isoformat(),
        "success": True
    }
    
    try:
        if args.greet:
            result["function"] = "greet"
            result["data"] = skill.greet(args.name or "用户")
        
        elif args.calculate:
            result["function"] = "calculate"
            if args.numbers:
                result["data"] = skill.calculate(args.numbers)
            else:
                result["success"] = False
                result["error"] = "请提供数字列表（--numbers 1 2 3）"
        
        elif args.file_info:
            result["function"] = "file_info"
            if args.path:
                result["data"] = skill.file_info(args.path)
            else:
                result["success"] = False
                result["error"] = "请提供文件路径（--path /path/to/file）"
        
        elif args.text_analysis:
            result["function"] = "text_analysis"
            if args.text:
                result["data"] = skill.text_analysis(args.text)
            else:
                result["success"] = False
                result["error"] = "请提供文本内容（--text \"你的文本\"）"
        
        else:
            result["success"] = False
            result["error"] = "请选择一个功能（--greet, --calculate, --file-info, --text-analysis）"
        
        # 检查数据是否成功
        if result.get("data") and not result["data"].get("success", True):
            result["success"] = False
            result["error"] = result["data"].get("error", "未知错误")
        
    except Exception as e:
        result["success"] = False
        result["error"] = str(e)
    
    # 输出结果
    if args.output == 'json':
        print(json.dumps(result, ensure_ascii=False, indent=2 if args.verbose else None))
    
    elif args.output == 'pretty':
        print("=" * 60)
        print(f"技能: {result['skill']} v{result['version']}")
        print(f"作者: {result['author']}")
        print(f"时间: {result['timestamp']}")
        print(f"功能: {result.get('function', '无')}")
        print(f"状态: {'✅ 成功' if result['success'] else '❌ 失败'}")
        print("-" * 60)
        
        if result['success']:
            data = result.get('data', {})
            if result['function'] == 'greet':
                print(f"消息: {data.get('message', '')}")
            elif result['function'] == 'calculate':
                print(f"数字: {data.get('numbers', [])}")
                print(f"数量: {data.get('count', 0)}")
                print(f"总和: {data.get('sum', 0)}")
                print(f"平均: {data.get('average', 0):.2f}")
                print(f"最大: {data.get('max', 0)}")
                print(f"最小: {data.get('min', 0)}")
            elif result['function'] == 'file_info':
                print(f"文件名: {data.get('filename', '')}")
                print(f"文件大小: {data.get('size_human', '')}")
                print(f"创建时间: {data.get('created', '')}")
                print(f"修改时间: {data.get('modified', '')}")
            elif result['function'] == 'text_analysis':
                print(f"文本预览: {data.get('text_preview', '')}")
                print(f"字符数: {data.get('char_count', 0)}")
                print(f"行数: {data.get('line_count', 0)}")
                print(f"单词数: {data.get('word_count', 0)}")
                print(f"平均单词长度: {data.get('avg_word_length', 0):.1f}")
        else:
            print(f"错误: {result.get('error', '未知错误')}")
        
        print("=" * 60)
    
    else:  # text输出
        if result['success']:
            data = result.get('data', {})
            if result['function'] == 'greet':
                print(data.get('message', ''))
            elif result['function'] == 'calculate':
                print(f"计算结果:")
                print(f"  数字: {data.get('numbers', [])}")
                print(f"  总和: {data.get('sum', 0)}")
                print(f"  平均: {data.get('average', 0):.2f}")
            elif result['function'] == 'file_info':
                print(f"文件信息:")
                print(f"  名称: {data.get('filename', '')}")
                print(f"  大小: {data.get('size_human', '')}")
                print(f"  修改: {data.get('modified', '')}")
            elif result['function'] == 'text_analysis':
                print(f"文本分析:")
                print(f"  字符数: {data.get('char_count', 0)}")
                print(f"  单词数: {data.get('word_count', 0)}")
                print(f"  行数: {data.get('line_count', 0)}")
        else:
            print(f"错误: {result.get('error', '未知错误')}")
    
    # 返回退出码
    return 0 if result['success'] else 1


if __name__ == "__main__":
    sys.exit(main())