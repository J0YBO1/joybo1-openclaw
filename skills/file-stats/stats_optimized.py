#!/usr/bin/env python3
"""
文件统计工具 - 优化版本
统计文件的行数、单词数、字符数、文件大小和修改时间
"""

import argparse
import os
import json
import datetime
from pathlib import Path
from typing import Dict, Optional, Union, Any


def get_file_stats(filepath: str) -> Optional[Dict[str, Any]]:
    """获取文件的详细统计信息
    
    Args:
        filepath: 要统计的文件路径
        
    Returns:
        包含文件统计信息的字典，如果文件不存在则返回None
        
    Raises:
        FileNotFoundError: 当文件不存在时
        PermissionError: 当没有文件读取权限时
        UnicodeDecodeError: 当文件编码不是UTF-8时
    """
    # 检查文件是否存在
    path = Path(filepath)
    if not path.exists():
        return None
    
    try:
        # 获取文件系统信息
        stat_info = path.stat()
        
        # 读取文件内容
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 分割内容
        lines = content.splitlines()
        words = content.split()
        
        # 计算空行和注释行（简单版本）
        empty_lines = sum(1 for line in lines if not line.strip())
        comment_lines = sum(1 for line in lines if line.strip().startswith('#'))
        
        # 构建统计信息字典
        stats = {
            # 基本信息
            "filename": path.name,
            "filepath": str(path.absolute()),
            "exists": True,
            
            # 文件系统信息
            "size_bytes": stat_info.st_size,
            "size_human": _format_size(stat_info.st_size),
            "created": datetime.datetime.fromtimestamp(stat_info.st_ctime).isoformat(),
            "modified": datetime.datetime.fromtimestamp(stat_info.st_mtime).isoformat(),
            "accessed": datetime.datetime.fromtimestamp(stat_info.st_atime).isoformat(),
            
            # 内容统计
            "lines": len(lines),
            "words": len(words),
            "chars": len(content),
            "bytes": len(content.encode('utf-8')),
            
            # 高级统计
            "empty_lines": empty_lines,
            "comment_lines": comment_lines,
            "code_lines": len(lines) - empty_lines - comment_lines,
            
            # 平均值
            "avg_chars_per_line": len(content) / len(lines) if lines else 0,
            "avg_words_per_line": len(words) / len(lines) if lines else 0,
            "avg_word_length": sum(len(word) for word in words) / len(words) if words else 0,
            
            # 文件类型
            "extension": path.suffix.lower(),
            "is_text_file": _is_text_file(content),
        }
        
        return stats
        
    except PermissionError as e:
        return {
            "filename": path.name,
            "filepath": str(path.absolute()),
            "exists": True,
            "error": f"权限错误: {str(e)}",
            "has_permission": False
        }
    except UnicodeDecodeError as e:
        return {
            "filename": path.name,
            "filepath": str(path.absolute()),
            "exists": True,
            "error": f"编码错误: 文件可能不是UTF-8编码",
            "is_text_file": False,
            "size_bytes": path.stat().st_size if path.exists() else 0
        }
    except Exception as e:
        return {
            "filename": path.name,
            "filepath": str(path.absolute()),
            "exists": path.exists(),
            "error": f"未知错误: {str(e)}"
        }


def _format_size(size_bytes: int) -> str:
    """格式化文件大小
    
    Args:
        size_bytes: 字节大小
        
    Returns:
        格式化后的字符串 (如 "1.5 KB")
    """
    if size_bytes == 0:
        return "0 B"
    
    units = ['B', 'KB', 'MB', 'GB', 'TB']
    unit_index = 0
    size = float(size_bytes)
    
    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1
    
    return f"{size:.1f} {units[unit_index]}"


def _is_text_file(content: str, threshold: float = 0.95) -> bool:
    """判断是否为文本文件
    
    Args:
        content: 文件内容
        threshold: 文本字符比例阈值
        
    Returns:
        是否为文本文件
    """
    if not content:
        return True
    
    # 计算可打印字符的比例
    printable_chars = sum(1 for char in content if char.isprintable() or char in '\n\r\t')
    ratio = printable_chars / len(content)
    
    return ratio >= threshold


def format_output(stats: Dict[str, Any], output_format: str = 'text') -> str:
    """格式化输出
    
    Args:
        stats: 统计信息字典
        output_format: 输出格式 ('text', 'json', 'detailed')
        
    Returns:
        格式化后的字符串
    """
    if output_format == 'json':
        return json.dumps(stats, ensure_ascii=False, indent=2)
    
    elif output_format == 'detailed':
        output = []
        output.append("=" * 60)
        output.append(f"文件统计报告: {stats.get('filename', '未知文件')}")
        output.append("=" * 60)
        
        # 基本信息
        output.append("\n📁 基本信息:")
        output.append(f"  文件路径: {stats.get('filepath', '未知')}")
        output.append(f"  文件大小: {stats.get('size_human', '0 B')} ({stats.get('size_bytes', 0)} 字节)")
        output.append(f"  修改时间: {stats.get('modified', '未知')}")
        output.append(f"  创建时间: {stats.get('created', '未知')}")
        output.append(f"  文件类型: {stats.get('extension', '无')}")
        
        # 内容统计
        output.append("\n📊 内容统计:")
        output.append(f"  总行数: {stats.get('lines', 0)}")
        output.append(f"  代码行: {stats.get('code_lines', 0)}")
        output.append(f"  注释行: {stats.get('comment_lines', 0)}")
        output.append(f"  空行数: {stats.get('empty_lines', 0)}")
        output.append(f"  单词数: {stats.get('words', 0)}")
        output.append(f"  字符数: {stats.get('chars', 0)}")
        output.append(f"  字节数: {stats.get('bytes', 0)}")
        
        # 平均值
        output.append("\n📈 平均值:")
        output.append(f"  平均每行字符数: {stats.get('avg_chars_per_line', 0):.1f}")
        output.append(f"  平均每行单词数: {stats.get('avg_words_per_line', 0):.1f}")
        output.append(f"  平均单词长度: {stats.get('avg_word_length', 0):.1f}")
        
        # 状态信息
        if stats.get('error'):
            output.append(f"\n⚠️  警告: {stats.get('error')}")
        
        output.append("=" * 60)
        return '\n'.join(output)
    
    else:  # text格式
        if 'error' in stats:
            return f"错误: {stats['error']}"
        
        output = []
        output.append(f"📄 文件: {stats.get('filename', '未知文件')}")
        output.append(f"📦 大小: {stats.get('size_human', '0 B')}")
        output.append(f"📅 修改: {stats.get('modified', '未知')}")
        output.append(f"📊 统计: {stats.get('lines', 0)}行, {stats.get('words', 0)}单词, {stats.get('chars', 0)}字符")
        
        if stats.get('code_lines', 0) > 0:
            output.append(f"💻 代码: {stats.get('code_lines', 0)}行代码, {stats.get('comment_lines', 0)}行注释")
        
        return '\n'.join(output)


def main() -> int:
    """主函数
    
    Returns:
        退出码 (0表示成功，非0表示错误)
    """
    parser = argparse.ArgumentParser(
        description='文件统计工具 - 统计文件的行数、单词数、字符数、文件大小和修改时间',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s --path example.txt
  %(prog)s --path script.py --format json
  %(prog)s --path document.md --format detailed
  %(prog)s --path *.py (支持通配符)
        """
    )
    
    parser.add_argument(
        '--path',
        required=True,
        help='要统计的文件路径（支持通配符）'
    )
    
    parser.add_argument(
        '--format',
        choices=['text', 'json', 'detailed'],
        default='text',
        help='输出格式: text(简洁), json(机器可读), detailed(详细报告)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='显示详细错误信息'
    )
    
    args = parser.parse_args()
    
    try:
        # 处理通配符
        import glob
        filepaths = glob.glob(args.path)
        
        if not filepaths:
            print(f"错误: 没有找到匹配的文件: {args.path}")
            return 1
        
        results = []
        for filepath in filepaths:
            stats = get_file_stats(filepath)
            if stats is None:
                print(f"文件不存在: {filepath}")
                continue
            
            results.append(stats)
            
            # 输出单个文件结果
            if len(filepaths) == 1:
                print(format_output(stats, args.format))
            else:
                # 多个文件时只显示基本信息
                if stats.get('error'):
                    print(f"❌ {filepath}: {stats.get('error')}")
                else:
                    print(f"✅ {filepath}: {stats.get('lines', 0)}行, {stats.get('size_human', '0 B')}")
        
        # 多个文件时显示汇总
        if len(filepaths) > 1:
            print(f"\n📋 统计完成: 共处理 {len(results)} 个文件")
            total_lines = sum(r.get('lines', 0) for r in results)
            total_size = sum(r.get('size_bytes', 0) for r in results)
            print(f"总计: {total_lines} 行, {_format_size(total_size)}")
        
        return 0
        
    except Exception as e:
        if args.verbose:
            print(f"错误详情: {str(e)}")
            import traceback
            traceback.print_exc()
        else:
            print(f"错误: {str(e)}")
        return 1


if __name__ == "__main__":
    exit(main())