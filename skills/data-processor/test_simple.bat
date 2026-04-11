@echo off
cd /d "%~dp0"
echo Testing filter function...
echo.

echo Test 1: Filter Electronics
python data_processor.py sample_data.json --filter "{\"category\": \"Electronics\"}"

echo.
echo Test 2: Filter Books  
python data_processor.py sample_data.json --filter "{\"category\": \"Books\"}"

echo.
echo Test 3: Price > 100
python data_processor.py sample_data.json --filter "{\"price\": {\"op\": \"gt\", \"value\": 100}}"

pause