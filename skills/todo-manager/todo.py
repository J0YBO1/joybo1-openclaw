import json
import os
import argparse

import os
TODO_FILE = os.path.join(os.path.dirname(__file__), 'todo.json')

def load_tasks():
    """从文件加载任务列表"""
    if not os.path.exists(TODO_FILE):
        return []
    try:
        with open(TODO_FILE,'r',encoding='utf-8') as f:
            content = f.read().strip()
            if not content:
                return []
            return json.loads(content)
    except (json.JSONDecodeError,FileExistsError):
        return []

def save_tasks(tasks):
    """将任务列表保存到文件"""
    with open(TODO_FILE,'w',encoding='utf-8') as f:
        json.dump(tasks,f,ensure_ascii=False,indent=2)

def add_task(task_name):
    """添加新任务"""
    if not task_name:
        print("错误：请输入任务名称")
        return
    tasks = load_tasks()
    for task in tasks:
        if task["name"] == task_name:
            print(f"错误：任务 '{task_name}' 已存在")
            return
    new_id = max([task["id"] for task in tasks], default=0) + 1
    task = {
        "id": new_id,
        "name": task_name,  
        "completed": False
    }
    tasks.append(task)
    save_tasks(tasks)
    print(f"任务 '{task_name}' 已添加")

def list_tasks():
    """列出所有任务"""
    tasks = load_tasks()
    if not tasks:
        print("📭 暂无待办事项")
        return
    print("📋 待办事项列表:")
    print("-" * 30)
    for task in tasks:
        status = "✅" if task["completed"] else "❌"
        print(f"{task['id']}. {task['name']} [{status}]")
    print("-" * 30)
def delete_task(task_id):
    """删除任务"""
    tasks = load_tasks()
    for i,task in enumerate(tasks):
        if task["id"] == task_id:
            del tasks[i]
            save_tasks(tasks)
            print(f"任务 '{task['name']}' 已删除")
            return
    print(f"错误：未找到ID为 {task_id} 的任务")
def clear_tasks():
    """清空所有任务"""
    tasks = load_tasks()
    if not tasks:
        print("📭 已经没有待办事项了")
        return
    count = len(tasks)
    save_tasks([])
    print(f"已清空 {count} 个待办事项")

def complete_task(task_id):
    """标记任务为完成"""
    tasks = load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            if task["completed"]:
                print(f"任务 '{task['name']}' 已经完成")
                return
            task["completed"] = True
            save_tasks(tasks)
            print(f"任务 '{task['name']}' 已标记为完成")
            return
    print(f"错误：未找到ID为 {task_id} 的任务")

def main():
    parser = argparse.ArgumentParser(description='代办事项管理器')
    parser.add_argument('command',choices=['add','list','delete','clear','done'],help='命令')
    parser.add_argument('args', nargs='?',default='', help='命令参数（任务名或ID）')
    args = parser.parse_args()

    if args.command == 'add':
        add_task(args.args)
    elif args.command == 'list':
        list_tasks()        
    elif args.command == 'done':
        try:
            complete_task(int(args.args))
        except ValueError:
            print("错误：done命令需要一个整数ID参数")
    elif args.command == 'delete':
        try:
            delete_task(int(args.args)) 
        except ValueError:
            print("错误：delete命令需要一个整数ID参数")
    elif args.command == 'clear':
        clear_tasks()
if __name__ == "__main__":
    main()