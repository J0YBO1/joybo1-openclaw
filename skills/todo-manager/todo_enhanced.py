#!/usr/bin/env python3
"""
增强版待办事项管理器 - 简化版
支持优先级、分类、截止日期等核心功能
"""

import json
import os
import argparse
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

# 数据模型
PRIORITIES = {
    "low": "🟢 低",
    "medium": "🟡 中", 
    "high": "🟠 高",
    "urgent": "🔴 紧急"
}

STATUSES = {
    "pending": "⏳ 待办",
    "in_progress": "🔄 进行中",
    "completed": "✅ 已完成",
    "cancelled": "❌ 已取消"
}

class TodoManager:
    """待办事项管理器"""
    
    def __init__(self, data_file: str = None):
        if data_file is None:
            data_file = os.path.join(os.path.dirname(__file__), 'todo_enhanced.json')
        self.data_file = data_file
        self.tasks = []
        self.load_tasks()
    
    def load_tasks(self) -> None:
        """加载任务列表"""
        if not os.path.exists(self.data_file):
            self.tasks = []
            return
        
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if not content:
                    self.tasks = []
                    return
                self.tasks = json.loads(content)
        except (json.JSONDecodeError, FileNotFoundError):
            self.tasks = []
    
    def save_tasks(self) -> None:
        """保存任务列表"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.tasks, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ 保存失败: {e}")
    
    def get_next_id(self) -> int:
        """获取下一个ID"""
        if not self.tasks:
            return 1
        return max(task['id'] for task in self.tasks) + 1
    
    def add_task(self, name: str, **kwargs) -> Dict:
        """添加新任务"""
        # 检查重复
        for task in self.tasks:
            if task['name'] == name and task['status'] != 'completed':
                raise ValueError(f"任务 '{name}' 已存在")
        
        task_id = self.get_next_id()
        now = datetime.now().isoformat()
        
        task = {
            'id': task_id,
            'name': name,
            'description': kwargs.get('description', ''),
            'priority': kwargs.get('priority', 'medium'),
            'status': kwargs.get('status', 'pending'),
            'category': kwargs.get('category', '默认'),
            'tags': kwargs.get('tags', []),
            'created_at': now,
            'updated_at': now,
            'due_date': kwargs.get('due_date'),
            'completed_at': None
        }
        
        self.tasks.append(task)
        self.save_tasks()
        return task
    
    def get_task(self, task_id: int) -> Optional[Dict]:
        """获取任务"""
        for task in self.tasks:
            if task['id'] == task_id:
                return task
        return None
    
    def update_task(self, task_id: int, **kwargs) -> Optional[Dict]:
        """更新任务"""
        task = self.get_task(task_id)
        if not task:
            return None
        
        for key, value in kwargs.items():
            if key in task and key not in ['id', 'created_at']:
                task[key] = value
        
        task['updated_at'] = datetime.now().isoformat()
        
        # 如果标记为完成，设置完成时间
        if kwargs.get('status') == 'completed' and not task['completed_at']:
            task['completed_at'] = task['updated_at']
        
        self.save_tasks()
        return task
    
    def delete_task(self, task_id: int) -> bool:
        """删除任务"""
        for i, task in enumerate(self.tasks):
            if task['id'] == task_id:
                del self.tasks[i]
                self.save_tasks()
                return True
        return False
    
    def complete_task(self, task_id: int) -> Optional[Dict]:
        """标记任务为完成"""
        return self.update_task(task_id, status='completed')
    
    def search_tasks(self, keyword: str) -> List[Dict]:
        """搜索任务"""
        keyword = keyword.lower()
        results = []
        for task in self.tasks:
            if (keyword in task['name'].lower() or 
                keyword in task['description'].lower() or
                any(keyword in tag.lower() for tag in task['tags'])):
                results.append(task)
        return results
    
    def get_overdue_tasks(self) -> List[Dict]:
        """获取过期任务"""
        overdue = []
        today = datetime.now().date()
        
        for task in self.tasks:
            if task['due_date'] and task['status'] != 'completed':
                try:
                    due_date = datetime.fromisoformat(task['due_date']).date()
                    if due_date < today:
                        overdue.append(task)
                except ValueError:
                    continue
        
        return overdue
    
    def get_statistics(self) -> Dict:
        """获取统计信息"""
        stats = {
            'total': len(self.tasks),
            'pending': 0,
            'in_progress': 0,
            'completed': 0,
            'cancelled': 0,
            'overdue': len(self.get_overdue_tasks()),
            'by_priority': {key: 0 for key in PRIORITIES},
            'by_category': {}
        }
        
        for task in self.tasks:
            # 状态统计
            if task['status'] in stats:
                stats[task['status']] += 1
            
            # 优先级统计
            if task['priority'] in stats['by_priority']:
                stats['by_priority'][task['priority']] += 1
            
            # 分类统计
            category = task['category']
            if category not in stats['by_category']:
                stats['by_category'][category] = 0
            stats['by_category'][category] += 1
        
        return stats

def format_task(task: Dict, detailed: bool = False) -> str:
    """格式化任务输出"""
    status_icon = {
        'pending': '⏳',
        'in_progress': '🔄',
        'completed': '✅',
        'cancelled': '❌'
    }.get(task['status'], '❓')
    
    priority_icon = {
        'low': '🟢',
        'medium': '🟡',
        'high': '🟠',
        'urgent': '🔴'
    }.get(task['priority'], '⚪')
    
    if detailed:
        lines = []
        lines.append(f"\n{'='*60}")
        lines.append(f"📝 任务 #{task['id']}: {task['name']}")
        lines.append(f"{'='*60}")
        lines.append(f"  状态: {status_icon} {STATUSES.get(task['status'], task['status'])}")
        lines.append(f"  优先级: {priority_icon} {PRIORITIES.get(task['priority'], task['priority'])}")
        lines.append(f"  分类: 📂 {task['category']}")
        
        if task['description']:
            lines.append(f"  描述: {task['description']}")
        
        if task['tags']:
            tags_str = ' '.join(f"#{tag}" for tag in task['tags'])
            lines.append(f"  标签: {tags_str}")
        
        lines.append(f"  创建时间: 📅 {task['created_at']}")
        lines.append(f"  更新时间: 🔄 {task['updated_at']}")
        
        if task['due_date']:
            due_date = datetime.fromisoformat(task['due_date'])
            today = datetime.now()
            days_left = (due_date - today).days
            
            if days_left < 0:
                lines.append(f"  截止日期: ⚠️  {task['due_date']} (已过期{-days_left}天)")
            elif days_left == 0:
                lines.append(f"  截止日期: ⚠️  {task['due_date']} (今天截止)")
            elif days_left <= 3:
                lines.append(f"  截止日期: ⚠️  {task['due_date']} ({days_left}天后截止)")
            else:
                lines.append(f"  截止日期: 📅 {task['due_date']} ({days_left}天后截止)")
        
        if task['completed_at']:
            lines.append(f"  完成时间: ✅ {task['completed_at']}")
        
        lines.append(f"{'='*60}")
        return '\n'.join(lines)
    else:
        # 简洁模式
        due_info = ""
        if task['due_date']:
            due_date = datetime.fromisoformat(task['due_date'])
            today = datetime.now()
            days_left = (due_date - today).days
            if days_left < 0:
                due_info = f" ⚠️过期{-days_left}天"
            elif days_left <= 3:
                due_info = f" ⏰{days_left}天"
        
        tags_info = ""
        if task['tags']:
            tags_info = f" {' '.join(f'#{tag}' for tag in task['tags'][:2])}"
            if len(task['tags']) > 2:
                tags_info += f" +{len(task['tags'])-2}"
        
        return (f"{task['id']:3d}. {status_icon}{priority_icon} {task['name'][:40]:40s} "
                f"[{task['category']:8s}]{due_info}{tags_info}")

def main():
    parser = argparse.ArgumentParser(description='增强版待办事项管理器')
    subparsers = parser.add_subparsers(dest='command', help='命令')
    
    # 添加任务
    add_parser = subparsers.add_parser('add', help='添加新任务')
    add_parser.add_argument('name', help='任务名称')
    add_parser.add_argument('--description', '-d', help='任务描述')
    add_parser.add_argument('--priority', '-p', choices=PRIORITIES.keys(), default='medium', help='优先级')
    add_parser.add_argument('--category', '-c', default='默认', help='任务分类')
    add_parser.add_argument('--tags', help='标签，用逗号分隔')
    add_parser.add_argument('--due-date', help='截止日期 (YYYY-MM-DD 或 today/tomorrow/week)')
    
    # 列出任务
    list_parser = subparsers.add_parser('list', help='列出任务')
    list_parser.add_argument('--all', '-a', action='store_true', help='显示所有任务')
    list_parser.add_argument('--pending', '-p', action='store_true', help='只显示待办任务')
    list_parser.add_argument('--completed', '-c', action='store_true', help='只显示已完成任务')
    list_parser.add_argument('--overdue', '-o', action='store_true', help='只显示过期任务')
    list_parser.add_argument('--priority', choices=PRIORITIES.keys(), help='按优先级筛选')
    list_parser.add_argument('--category', help='按分类筛选')
    list_parser.add_argument('--search', help='搜索任务')
    list_parser.add_argument('--sort', choices=['name', 'priority', 'created', 'due'], help='排序字段')
    list_parser.add_argument('--reverse', '-r', action='store_true', help='反向排序')
    list_parser.add_argument('--detailed', '-d', action='store_true', help='详细显示')
    
    # 查看任务
    view_parser = subparsers.add_parser('view', help='查看任务详情')
    view_parser.add_argument('task_id', type=int, help='任务ID')
    
    # 编辑任务
    edit_parser = subparsers.add_parser('edit', help='编辑任务')
    edit_parser.add_argument('task_id', type=int, help='任务ID')
    edit_parser.add_argument('--name', '-n', help='新名称')
    edit_parser.add_argument('--description', '-d', help='新描述')
    edit_parser.add_argument('--priority', '-p', choices=PRIORITIES.keys(), help='新优先级')
    edit_parser.add_argument('--status', choices=STATUSES.keys(), help='新状态')
    edit_parser.add_argument('--category', '-c', help='新分类')
    edit_parser.add_argument('--tags', help='新标签，用逗号分隔（空字符串清空标签）')
    edit_parser.add_argument('--due-date', help='新截止日期（空字符串清除日期）')
    
    # 完成任务
    done_parser = subparsers.add_parser('done', help='标记任务为完成')
    done_parser.add_argument('task_id', type=int, help='任务ID')
    
    # 删除任务
    delete_parser = subparsers.add_parser('delete', help='删除任务')
    delete_parser.add_argument('task_id', type=int, help='任务ID')
    
    # 清空任务
    subparsers.add_parser('clear', help='清空所有任务')
    
    # 统计信息
    stats_parser = subparsers.add_parser('stats', help='显示统计信息')
    stats_parser.add_argument('--json', action='store_true', help='以JSON格式输出')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    manager = TodoManager()
    
    try:
        if args.command == 'add':
            kwargs = {}
            if args.description:
                kwargs['description'] = args.description
            if args.priority:
                kwargs['priority'] = args.priority
            if args.category:
                kwargs['category'] = args.category
            if args.tags:
                kwargs['tags'] = [tag.strip() for tag in args.tags.split(',')]
            if args.due_date:
                # 解析日期
                if args.due_date.lower() == 'today':
                    due_date = datetime.now()
                elif args.due_date.lower() == 'tomorrow':
                    due_date = datetime.now() + timedelta(days=1)
                elif args.due_date.lower() == 'week':
                    due_date = datetime.now() + timedelta(days=7)
                else:
                    try:
                        due_date = datetime.fromisoformat(args.due_date)
                    except ValueError:
                        try:
                            due_date = datetime.strptime(args.due_date, '%Y-%m-%d')
                        except ValueError:
                            print(f"❌ 无效的日期格式: {args.due_date}")
                            return
                kwargs['due_date'] = due_date.isoformat()
            
            task = manager.add_task(args.name, **kwargs)
            print(f"✅ 任务已添加: #{task['id']} {task['name']}")
            
            if args.due_date:
                due_date = datetime.fromisoformat(task['due_date'])
                days_left = (due_date - datetime.now()).days
                if days_left <= 3:
                    print(f"   ⏰ 注意: 任务将在{days_left}天后截止")
        
        elif args.command == 'list':
            tasks = manager.tasks
            
            # 筛选
            if args.pending:
                tasks = [t for t in tasks if t['status'] == 'pending']
            elif args.completed:
                tasks = [t for t in tasks if t['status'] == 'completed']
            elif args.overdue:
                tasks = manager.get_overdue_tasks()
            elif args.priority:
                tasks = [t for t in tasks if t['priority'] == args.priority]
            elif args.category:
                tasks = [t for t in tasks if t['category'] == args.category]
            elif args.search:
                tasks = manager.search_tasks(args.search)
            elif not args.all:
                # 默认显示待办和进行中的任务
                tasks = [t for t in tasks if t['status'] in ['pending', 'in_progress']]
            
            # 排序
            if args.sort:
                reverse = args.reverse
                if args.sort == 'priority':
                    priority_order = {p: i for i, p in enumerate(PRIORITIES.keys())}
                    tasks.sort(key=lambda t: priority_order.get(t['priority'], 99), reverse=reverse)
                elif args.sort == 'created':
                    tasks.sort(key=lambda t: t['created_at'], reverse=reverse)
                elif args.sort == 'due':
                    tasks.sort(key=lambda t: t['due_date'] or '9999-12-31', reverse=reverse)
                elif args.sort == 'name':
                    tasks.sort(key=lambda t: t['name'].lower(), reverse=reverse)
            
            # 显示
            if not tasks:
                print("📭 暂无任务")
                return
            
            print(f"\n📋 任务列表 ({len(tasks)}个)")
            print("=" * 80)
            
            for task in tasks:
                print(format_task(task, args.detailed))
            
            if not args.detailed:
                print("\n💡 使用 --detailed 查看详细信息")
        
        elif args.command == 'view':
            task = manager.get_task(args.task_id)
            if not task:
                print(f"❌ 未找到任务 #{args.task_id}")
                return
            print(format_task(task, detailed=True))
        
        elif args.command == 'edit':
            updates = {}
            if args.name:
                updates['name'] = args.name
            if args.description is not None:
                updates['description'] = args.description
            if args.priority:
                updates['priority'] = args.priority
            if args.status:
                updates['status'] = args.status
            if args.category:
                updates['category'] = args.category
            if args.tags is not None:
                if args.tags == "":
                    updates['tags'] = []
                else:
                    updates['tags'] = [tag.strip() for tag in args.tags.split(',')]
            if args.due_date is not None:
                if args.due_date == "":
                    updates['due_date'] = None
                else:
                    try:
                        due_date = datetime.fromisoformat(args.due_date)
                        updates['due_date'] = due_date.isoformat()
                    except ValueError:
                        print(f"❌ 无效的日期格式: {args.due_date}")
                        return
            
            if not updates:
                print("ℹ️  没有提供更新内容")
                return
            
            task = manager.update_task(args.task_id, **updates)
            if task:
                print(f"✅ 任务已更新: #{task['id']} {task['name']}")
            else:
                print(f"❌ 未找到任务 #{args.task_id}")
        
        elif args.command == 'done':
            task = manager.complete_task(args.task_id)
            if task:
                print(f"✅ 任务已完成: #{task['id']} {task['name']}")
            else:
                print(f"❌ 未找到任务 #{args.task_id}")
        
        elif args.command == 'delete':
            if manager.delete_task(args.task_id):
                print(f"✅ 任务 #{args.task_id} 已删除")
            else:
                print(f"❌ 未找到任务 #{args.task_id}")
        
        elif args.command == 'clear':
            count = len(manager.tasks)
            manager.tasks = []
            manager.save_tasks()
            print(f"✅ 已清空 {count} 个任务")
        
        elif args.command == 'stats':
            stats = manager.get_statistics()
            
            if args.json:
                print(json.dumps(stats, ensure_ascii=False, indent=2))
                return
            
            print("\n📊 任务统计信息")
            print("=" * 60)
            print(f"总任务数: {stats['total']}")
            print(f"待办: {stats['pending']} | 进行中: {stats['in_progress']} | 已完成: {stats['completed']} | 已取消: {stats['cancelled']}")
            print(f"过期任务: {stats['overdue']}")
            
            print("\n📈 优先级分布:")
            for priority, count in stats['by_priority'].items():
                if count > 0:
                    icon = {
                        'low': '🟢', 'medium': '🟡', 
                        'high': '🟠', 'urgent': '🔴'
                    }.get(priority, '⚪')
                    print(f"  {icon} {PRIORITIES.get(priority, priority)}: {count}")
            
            if stats['by_category']:
                print("\n📂 分类分布:")
                for category, count in sorted(stats['by_category'].items()):
                    print(f"  📂 {category}: {count}")
            
            print("=" * 60)
    
    except ValueError as e:
        print(f"❌ {e}")
    except Exception as e:
        print(f"❌ 发生错误: {e}")

if __name__ == '__main__':
    main()