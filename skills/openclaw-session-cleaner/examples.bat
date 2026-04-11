@echo off
echo OpenClaw Session Cleaner 使用示例
echo ========================================

echo.
echo 示例1: 查看session统计信息
node index.js --stats-only

echo.
echo 示例2: 预览清理操作（不实际执行）
node index.js --dry-run --keep-days 7

echo.
echo 示例3: 清理7天前的session并重建索引
node index.js --keep-days 7 --force

echo.
echo 示例4: 只重建sessions.json索引
node index.js --rebuild-only

echo.
echo 示例5: 详细模式查看
node index.js --stats-only --verbose

echo.
echo 所有示例执行完成!
echo.
echo 注意：实际使用时请将"node index.js"替换为"openclaw session-cleaner"
pause