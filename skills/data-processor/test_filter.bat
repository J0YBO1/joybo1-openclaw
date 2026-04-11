@echo off
echo 测试过滤功能
echo ========================================

echo.
echo 测试1: 过滤电子产品
python data_processor.py sample_data.json --filter "{\"category\": \"Electronics\"}"

echo.
echo 测试2: 过滤书籍
python data_processor.py sample_data.json --filter "{\"category\": \"Books\"}"

echo.
echo 测试3: 价格大于100的产品
python data_processor.py sample_data.json --filter "{\"price\": {\"op\": \"gt\", \"value\": 100}}"

pause