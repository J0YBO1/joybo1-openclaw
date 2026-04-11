#!/bin/bash
echo "Todo Manager 使用示例"
echo "========================================"

echo ""
echo "示例1: 基本任务管理"
echo ""
node index.js add "学习Python编程"
node index.js add "完成项目报告" --priority high --category 工作
node index.js list
node index.js done 1
node index.js list --completed
node index.js delete 2
node index.js clear

echo ""
echo "示例2: 高级任务管理"
echo ""
node index.js add "紧急bug修复" --priority urgent --category 开发 --tags "bug,紧急" --due-date tomorrow
node index.js add "编写项目文档" --priority medium --category 文档 --tags "文档,项目" --due-date 2026-04-20
node index.js add "团队会议" --priority low --category 会议 --due-date week

echo ""
echo "查看所有任务:"
node index.js list --all

echo ""
echo "查看高优先级任务:"
node index.js list --priority high --priority urgent

echo ""
echo "查看工作分类任务:"
node index.js list --category 工作

echo ""
echo "搜索任务:"
node index.js list --search bug

echo ""
echo "查看过期任务:"
node index.js list --overdue

echo ""
echo "详细显示任务:"
node index.js list --detailed

echo ""
echo "示例3: 任务编辑"
echo ""
node index.js edit 1 --priority high --status in_progress
node index.js view 1

echo ""
echo "示例4: 统计信息"
echo ""
node index.js stats

echo ""
echo "示例5: 备份与恢复"
echo ""
node index.js backup --name "示例备份"
node index.js restore --list

echo ""
echo "示例6: 数据导出"
echo ""
node index.js export --format json
node index.js export --format csv
node index.js export --format markdown

echo ""
echo "清理测试数据..."
node index.js clear

echo ""
echo "所有示例执行完成!"
echo ""
echo "注意：实际使用时请将\"node index.js\"替换为\"openclaw todo-manager\""