#!/bin/bash
echo "weather-query 技能使用示例"
echo "========================================"

echo ""
echo "示例1: 查看帮助信息"
node index.js --help

echo ""
echo "示例2: 查询默认城市天气（北京）"
node index.js

echo ""
echo "示例3: 查询指定城市天气"
node index.js --city 上海
node index.js --city "New York"

echo ""
echo "示例4: 查询天气预报"
node index.js --city 广州 --forecast

echo ""
echo "示例5: 查询空气质量"
node index.js --city 深圳 --air-quality

echo ""
echo "示例6: 查询多个城市"
node index.js --cities "北京,上海,广州"

echo ""
echo "示例7: 输出JSON格式"
node index.js --city 成都 --format json

echo ""
echo "示例8: 保存到文件"
node index.js --city 武汉 --output weather.json --format json

echo ""
echo "所有示例执行完成!"