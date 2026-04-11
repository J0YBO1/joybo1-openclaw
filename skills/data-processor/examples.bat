@echo off
echo data-processor 技能使用示例
echo ========================================

echo.
echo 示例1: 查看帮助信息
node index.js --help

echo.
echo 示例2: 读取示例数据
node index.js sample_data.json

echo.
echo 示例3: 过滤电子产品
node index.js sample_data.json --filter "{\"category\": \"Electronics\"}"

echo.
echo 示例4: 按类别分组
node index.js sample_data.json --group-by category

echo.
echo 示例5: 计算各类别平均价格
node index.js sample_data.json --group-by category --aggregate price --operation avg

echo.
echo 示例6: 按价格降序排序
node index.js sample_data.json --sort-by price --reverse

echo.
echo 示例7: 价格统计信息
node index.js sample_data.json --stats price

echo.
echo 示例8: 保存结果到文件
node index.js sample_data.json --filter "{\"category\": \"Electronics\"}" --output electronics.json

echo.
echo 所有示例执行完成!
pause