#!/usr/bin/env python3
"""
批量重命名工具 - 优化版本
支持添加前缀、后缀、完全重命名、正则表达式替换、文件过滤等功能
"""

import os
import re
import argparse
import json
import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import sys


def get_new_filename(
    old_name: str,
    index: int,
    prefix: str = "",
    suffix: str = "",
    full: bool = False,
    no_index: bool = False,
    pattern: Optional[str] = None,
    replacement: Optional[str] = None
) -> str:
    """根据规则生成新文件名
    
    Args:
        old_name: 原文件名（包含扩展名）
        index: 文件序号（从0开始）
        prefix: 要添加的前缀
        suffix: 要添加的后缀
        full: 是否完全重命名（忽略原文件名）
        no_index: 是否不添加序号
        pattern: 正则表达式模式（用于替换）
        replacement: 替换字符串
        
    Returns:
        新文件名（包含扩展名）
        
    Raises:
        re.error: 当正则表达式无效时
    """
    # 分离文件名和扩展名
    name_part, ext = os.path.splitext(old_name)
    
    # 处理正则表达式替换
    if pattern and replacement:
        try:
            name_part = re.sub(pattern, replacement, name_part)
        except re.error as e:
            raise re.error(f"无效的正则表达式 '{pattern}': {e}")
    
    # 完全重命名时，忽略原文件名
    if full:
        base = ""
        add_index = True  # 完全重命名时强制添加序号避免冲突
    else:
        base = name_part
        add_index = not no_index
    
    # 构建新文件名
    if add_index:
        new_name = f"{prefix}{base}_{index:04d}{suffix}{ext}"
    else:
        new_name = f"{prefix}{base}{suffix}{ext}"
    
    return new_name


def get_files_in_directory(
    directory: str,
    extensions: Optional[List[str]] = None,
    exclude_extensions: Optional[List[str]] = None,
    recursive: bool = False
) -> List[str]:
    """获取目录中的文件列表
    
    Args:
        directory: 目录路径
        extensions: 只包含指定扩展名的文件（如 ['.txt', '.py']）
        exclude_extensions: 排除指定扩展名的文件
        recursive: 是否递归搜索子目录
        
    Returns:
        文件名列表（不包含路径）
        
    Raises:
        FileNotFoundError: 当目录不存在时
        PermissionError: 当没有目录访问权限时
    """
    directory_path = Path(directory)
    
    if not directory_path.exists():
        raise FileNotFoundError(f"目录不存在: {directory}")
    
    if not directory_path.is_dir():
        raise NotADirectoryError(f"不是目录: {directory}")
    
    files = []
    
    if recursive:
        # 递归搜索
        for root, _, filenames in os.walk(directory):
            for filename in filenames:
                file_path = Path(root) / filename
                if file_path.is_file():
                    files.append(str(file_path.relative_to(directory_path)))
    else:
        # 非递归搜索
        for item in directory_path.iterdir():
            if item.is_file():
                files.append(item.name)
    
    # 过滤扩展名
    if extensions:
        extensions = [ext.lower() if ext.startswith('.') else f'.{ext.lower()}' for ext in extensions]
        files = [f for f in files if Path(f).suffix.lower() in extensions]
    
    # 排除扩展名
    if exclude_extensions:
        exclude_extensions = [ext.lower() if ext.startswith('.') else f'.{ext.lower()}' for ext in exclude_extensions]
        files = [f for f in files if Path(f).suffix.lower() not in exclude_extensions]
    
    # 按名称排序
    files.sort()
    
    return files


def preview_rename(
    directory: str,
    files: List[str],
    prefix: str = "",
    suffix: str = "",
    full: bool = False,
    no_index: bool = False,
    pattern: Optional[str] = None,
    replacement: Optional[str] = None
) -> List[Tuple[str, str]]:
    """预览重命名结果
    
    Args:
        directory: 目录路径
        files: 文件列表
        prefix: 前缀
        suffix: 后缀
        full: 是否完全重命名
        no_index: 是否不添加序号
        pattern: 正则表达式模式
        replacement: 替换字符串
        
    Returns:
        包含 (原文件名, 新文件名) 的元组列表
    """
    results = []
    
    for i, old_name in enumerate(files):
        try:
            new_name = get_new_filename(
                old_name, i, prefix, suffix, full, no_index, pattern, replacement
            )
            results.append((old_name, new_name))
        except re.error as e:
            print(f"⚠️  文件 '{old_name}' 处理失败: {e}")
            results.append((old_name, f"错误: {str(e)}"))
    
    return results


def execute_rename(
    directory: str,
    rename_list: List[Tuple[str, str]],
    dry_run: bool = True
) -> Dict[str, List[str]]:
    """执行重命名操作
    
    Args:
        directory: 目录路径
        rename_list: 重命名列表，包含 (原文件名, 新文件名)
        dry_run: 是否为干运行（只模拟不实际执行）
        
    Returns:
        包含成功、跳过、失败文件列表的字典
    """
    directory_path = Path(directory)
    results = {
        "success": [],
        "skipped": [],
        "failed": []
    }
    
    for old_name, new_name in rename_list:
        old_path = directory_path / old_name
        new_path = directory_path / new_name
        
        # 检查原文件是否存在
        if not old_path.exists():
            print(f"❌ 跳过: 原文件不存在 - {old_name}")
            results["failed"].append(f"{old_name} -> {new_name} (原文件不存在)")
            continue
        
        # 检查新文件是否已存在
        if new_path.exists():
            print(f"⚠️  跳过: 文件已存在 - {new_name}")
            results["skipped"].append(f"{old_name} -> {new_name} (文件已存在)")
            continue
        
        # 检查新旧文件名是否相同
        if old_name == new_name:
            print(f"ℹ️  跳过: 文件名未变化 - {old_name}")
            results["skipped"].append(f"{old_name} -> {new_name} (文件名未变化)")
            continue
        
        if dry_run:
            print(f"📋 模拟: {old_name} -> {new_name}")
            results["success"].append(f"{old_name} -> {new_name} (模拟)")
        else:
            try:
                old_path.rename(new_path)
                print(f"✅ 成功: {old_name} -> {new_name}")
                results["success"].append(f"{old_name} -> {new_name}")
            except Exception as e:
                print(f"❌ 失败: {old_name} -> {new_name} - 错误: {e}")
                results["failed"].append(f"{old_name} -> {new_name} (错误: {e})")
    
    return results


def save_rename_log(
    directory: str,
    results: Dict[str, List[str]],
    prefix: str = "",
    suffix: str = "",
    full: bool = False,
    no_index: bool = False,
    pattern: Optional[str] = None,
    replacement: Optional[str] = None
) -> str:
    """保存重命名日志
    
    Args:
        directory: 目录路径
        results: 重命名结果
        prefix: 使用的前缀
        suffix: 使用的后缀
        full: 是否完全重命名
        no_index: 是否不添加序号
        pattern: 使用的正则表达式
        replacement: 使用的替换字符串
        
    Returns:
        日志文件路径
    """
    log_data = {
        "timestamp": datetime.datetime.now().isoformat(),
        "directory": directory,
        "parameters": {
            "prefix": prefix,
            "suffix": suffix,
            "full": full,
            "no_index": no_index,
            "pattern": pattern,
            "replacement": replacement
        },
        "results": results
    }
    
    log_filename = f"rename_log_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    log_path = Path(directory) / log_filename
    
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump(log_data, f, ensure_ascii=False, indent=2)
    
    return str(log_path)


def main() -> int:
    """主函数
    
    Returns:
        退出码 (0表示成功，非0表示错误)
    """
    parser = argparse.ArgumentParser(
        description='批量重命名工具 - 支持前缀、后缀、正则替换、文件过滤等功能',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s --path /path/to/dir --prefix "photo_" --preview
  %(prog)s --path /path/to/dir --suffix "_backup" --execute
  %(prog)s --path /path/to/dir --prefix "img_" --full --execute
  %(prog)s --path /path/to/dir --pattern "\\d+" --replacement "NUM" --preview
  %(prog)s --path /path/to/dir --ext .txt .jpg --prefix "doc_" --preview
  %(prog)s --path /path/to/dir --exclude .tmp .bak --suffix "_clean" --execute
  %(prog)s --path /path/to/dir --recursive --prefix "all_" --preview
        """
    )
    
    # 基本参数
    parser.add_argument(
        '--path',
        required=True,
        help='要处理的目录路径'
    )
    
    parser.add_argument(
        '--prefix',
        default='',
        help='要添加的前缀'
    )
    
    parser.add_argument(
        '--suffix',
        default='',
        help='要添加的后缀'
    )
    
    parser.add_argument(
        '--full',
        action='store_true',
        help='完全重命名，忽略原文件名（自动添加序号）'
    )
    
    parser.add_argument(
        '--no-index',
        action='store_true',
        help='不添加序号（--full 模式下无效）'
    )
    
    # 正则表达式替换
    parser.add_argument(
        '--pattern',
        help='正则表达式模式，用于替换文件名中的内容'
    )
    
    parser.add_argument(
        '--replacement',
        default='',
        help='替换字符串，与 --pattern 一起使用'
    )
    
    # 文件过滤
    parser.add_argument(
        '--ext',
        nargs='+',
        help='只处理指定扩展名的文件（如 .txt .jpg）'
    )
    
    parser.add_argument(
        '--exclude',
        nargs='+',
        help='排除指定扩展名的文件'
    )
    
    parser.add_argument(
        '--recursive',
        action='store_true',
        help='递归处理子目录'
    )
    
    # 执行控制
    parser.add_argument(
        '--preview',
        action='store_true',
        default=True,
        help='预览模式（默认）'
    )
    
    parser.add_argument(
        '--execute',
        action='store_true',
        help='执行重命名操作'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='模拟执行，不实际修改文件'
    )
    
    parser.add_argument(
        '--log',
        action='store_true',
        help='保存重命名日志'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='显示详细输出'
    )
    
    args = parser.parse_args()
    
    try:
        # 显示基本信息
        if args.verbose:
            print("=" * 60)
            print("批量重命名工具")
            print("=" * 60)
            print(f"目录: {args.path}")
            print(f"前缀: '{args.prefix}'")
            print(f"后缀: '{args.suffix}'")
            print(f"完全重命名: {args.full}")
            print(f"不添加序号: {args.no_index}")
            if args.pattern:
                print(f"正则模式: '{args.pattern}' -> '{args.replacement}'")
            if args.ext:
                print(f"扩展名过滤: {args.ext}")
            if args.exclude:
                print(f"排除扩展名: {args.exclude}")
            print(f"递归搜索: {args.recursive}")
            print("=" * 60)
        
        # 获取文件列表
        files = get_files_in_directory(
            args.path,
            extensions=args.ext,
            exclude_extensions=args.exclude,
            recursive=args.recursive
        )
        
        if not files:
            print("⚠️  没有找到符合条件的文件")
            return 0
        
        print(f"📁 找到 {len(files)} 个文件")
        
        # 预览重命名结果
        rename_list = preview_rename(
            args.path,
            files,
            prefix=args.prefix,
            suffix=args.suffix,
            full=args.full,
            no_index=args.no_index,
            pattern=args.pattern,
            replacement=args.replacement
        )
        
        # 显示预览结果
        print("\n📋 预览重命名结果:")
        print("-" * 60)
        for old_name, new_name in rename_list:
            if old_name == new_name:
                print(f"  {old_name} -> {new_name} (未变化)")
            else:
                print(f"  {old_name} -> {new_name}")
        
        # 执行重命名
        if args.execute or args.dry_run:
            dry_run = args.dry_run or (not args.execute)
            
            print(f"\n{'🚀 执行重命名操作:' if args.execute else '🧪 模拟执行:'}")
            print("-" * 60)
            
            results = execute_rename(args.path, rename_list, dry_run=dry_run)
            
            # 显示结果统计
            print(f"\n📊 操作完成:")
            print(f"  ✅ 成功: {len(results['success'])}")
            print(f"  ⚠️  跳过: {len(results['skipped'])}")
            print(f"  ❌ 失败: {len(results['failed'])}")
            
            # 保存日志
            if args.log:
                log_path = save_rename_log(
                    args.path,
                    results,
                    prefix=args.prefix,
                    suffix=args.suffix,
                    full=args.full,
                    no_index=args.no_index,
                    pattern=args.pattern,
                    replacement=args.replacement
                )
                print(f"\n📝 日志已保存: {log_path}")
        
        else:
            print("\n💡 提示: 这是预览模式，不会修改文件")
            print("要执行重命名，请使用 --execute 参数")
            print("要模拟执行，请使用 --dry-run 参数")
        
        return 0
        
    except FileNotFoundError as e:
        print(f"❌ 错误: {e}")
        return 1
    except PermissionError as e:
        print(f"❌ 权限错误: {e}")
        return 1
    except re.error as e:
        print(f"❌ 正则表达式错误: {e}")
        return 1
    except Exception as e:
        if args.verbose:
            import traceback
            traceback.print_exc()
        print(f"❌ 未知错误: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())