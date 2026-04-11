@echo off
cd /d "%~dp0"

echo 测试1: 使用单引号（推荐）
python data_processor.py sample_data.json --filter '{"category": "Electronics"}'

echo.
echo 测试2: 使用双引号（需要转义）
python data_processor.py sample_data.json --filter "{\"category\": \"Electronics\"}"

echo.
echo 测试3: 测试错误格式
python data_processor.py sample_data.json --filter "{'category': 'Electronics'}"

pause