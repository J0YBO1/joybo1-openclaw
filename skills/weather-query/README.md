# weather-query 技能

一个功能强大的天气查询工具，支持实时天气、天气预报和空气质量查询。

## 🌤️ 功能特性

### 核心功能
- **实时天气**：当前温度、湿度、风速、天气状况
- **天气预报**：未来1-7天天气预报
- **空气质量**：AQI指数和污染物浓度
- **全球覆盖**：支持全球主要城市

### 高级功能
- **多城市查询**：一次查询多个城市天气
- **单位切换**：摄氏度/华氏度自由切换
- **多语言支持**：中文/英文界面
- **缓存机制**：减少API调用，提高响应速度
- **多数据源**：支持Open-Meteo、wttr.in等数据源

## 🚀 快速开始

### 安装
```bash
# 技能会自动安装到OpenClaw
# 无需额外步骤
```

### 基本使用
```bash
# 查询默认城市天气（北京）
openclaw weather-query

# 查询指定城市
openclaw weather-query --city 上海
openclaw weather-query --city "New York"

# 查询天气预报
openclaw weather-query --city 广州 --forecast

# 查询空气质量
openclaw weather-query --city 深圳 --air-quality
```

## 📖 详细使用说明

### 查询选项

#### 1. 城市选择
```bash
# 单个城市
openclaw weather-query --city 北京

# 多个城市
openclaw weather-query --cities "北京,上海,广州"

# 从文件读取城市列表
openclaw weather-query --input cities.txt
```

#### 2. 天气预报
```bash
# 显示3天预报（默认）
openclaw weather-query --city 杭州 --forecast

# 显示7天预报
openclaw weather-query --city 南京 --forecast --days 7
```

#### 3. 空气质量
```bash
# 显示空气质量信息
openclaw weather-query --city 成都 --air-quality
```

#### 4. 单位设置
```bash
# 使用摄氏度（默认）
openclaw weather-query --city 武汉 --unit celsius

# 使用华氏度
openclaw weather-query --city 西安 --unit fahrenheit
```

#### 5. 语言设置
```bash
# 中文（默认）
openclaw weather-query --city 重庆 --lang zh

# 英文
openclaw weather-query --city Tokyo --lang en
```

### 输出选项

#### 1. 输出格式
```bash
# 表格格式（默认）
openclaw weather-query --city 北京 --format table

# JSON格式
openclaw weather-query --city 上海 --format json
```

#### 2. 保存到文件
```bash
# 保存为文本文件
openclaw weather-query --city 广州 --output weather.txt

# 保存为JSON文件
openclaw weather-query --city 深圳 --format json --output weather.json
```

#### 3. 详细输出
```bash
# 显示详细执行信息
openclaw weather-query --city 杭州 --verbose
```

### 高级选项

#### 1. 数据源选择
```bash
# 使用Open-Meteo（默认）
openclaw weather-query --city 北京 --provider open-meteo

# 使用wttr.in
openclaw weather-query --city 上海 --provider wttr
```

#### 2. 缓存控制
```bash
# 禁用缓存
openclaw weather-query --city 广州 --no-cache
```

#### 3. 配置文件
```bash
# 使用自定义配置文件
openclaw weather-query --config ~/.openclaw/weather-config.json
```

## ⚙️ 配置说明

### 环境变量
```bash
# 设置默认城市
export WEATHER_DEFAULT_CITY="北京"

# 设置默认温度单位
export WEATHER_DEFAULT_UNIT="celsius"

# 设置默认语言
export WEATHER_DEFAULT_LANG="zh"
```

### 配置文件
创建 `~/.openclaw/weather-config.json`：
```json
{
  "default_city": "北京",
  "default_unit": "celsius",
  "default_lang": "zh",
  "api_provider": "open-meteo",
  "cache_duration": 1800,
  "show_emoji": true,
  "timeout": 10,
  "retry_times": 3
}
```

## 📊 输出示例

### 表格输出
```
🌤️ 北京天气报告
========================================
📍 位置：北京，中国
🕐 时间：2026-04-11T16:15:00
🌡️ 温度：18°C (体感: 17°C)
💧 湿度：65%
💨 风速：12 km/h 东北风
☁️  天气：多云
👁️  能见度：10 km
📊 气压：1013 hPa
☀️  UV指数：5
🌫️  空气质量：AQI 45 (优)

📅 天气预报：
----------------------------------------
2026-04-12: 晴 15°C ~ 22°C
2026-04-13: 多云 16°C ~ 23°C
2026-04-14: 小雨 14°C ~ 20°C
```

### JSON输出
```json
{
  "success": true,
  "timestamp": "2026-04-11T16:15:00",
  "location": {
    "name": "北京",
    "country": "中国",
    "latitude": 39.9042,
    "longitude": 116.4074
  },
  "current": {
    "temperature": 18,
    "feels_like": 17,
    "humidity": 65,
    "wind_speed": 12,
    "wind_direction": "东北风",
    "weather": "多云",
    "visibility": 10,
    "pressure": 1013,
    "uv_index": 5
  },
  "forecast": [
    {
      "date": "2026-04-12",
      "weather": "晴",
      "temperature_max": 22,
      "temperature_min": 15
    }
  ],
  "air_quality": {
    "aqi": 45,
    "pm2_5": 12.5,
    "pm10": 25.3
  }
}
```

## 🔧 技术架构

### 文件结构
```
weather-query/
├── SKILL.md              # 技能说明文档
├── index.js              # Node.js入口文件
├── weather_query.py      # Python核心逻辑
├── package.json          # 包配置
├── README.md             # 用户文档
├── test.js               # 测试脚本
├── requirements.txt      # Python依赖
└── examples/             # 示例文件
```

### 核心组件
1. **WeatherAPIClient** - API客户端
   - 多数据源支持
   - 重试机制
   - 错误处理

2. **WeatherQuery** - 查询器
   - 缓存管理
   - 城市坐标解析
   - 结果格式化

3. **命令行接口** - 用户界面
   - 参数解析
   - 输出格式化
   - 错误提示

### 数据源
1. **Open-Meteo** (默认)
   - 免费、无需API密钥
   - 全球覆盖
   - 实时数据和7天预报

2. **wttr.in** (备用)
   - 简单的命令行接口
   - 支持ASCII艺术输出
   - 响应速度快

## 🧪 测试

### 运行测试
```bash
# 运行单元测试
python test_weather.py

# 运行集成测试
python test_integration.py

# 测试命令行接口
node test.js
```

### 测试用例
```python
# 测试城市坐标获取
test_get_city_coordinates()

# 测试天气查询
test_query_weather()

# 测试缓存机制
test_cache_function()

# 测试错误处理
test_error_handling()
```

## 🐛 故障排除

### 常见问题

#### 1. 城市未找到
```
错误: 未找到城市 'XXXX'
建议: 检查城市名拼写，或使用英文名
```

**解决方案**：
- 检查城市名拼写
- 使用英文城市名
- 确保城市在支持列表中

#### 2. 网络连接失败
```
错误: 无法连接到天气服务
建议: 检查网络连接，或稍后重试
```

**解决方案**：
- 检查网络连接
- 尝试使用其他数据源
- 等待一段时间后重试

#### 3. API限制
```
错误: API请求次数超限
建议: 等待一段时间后重试，或使用其他数据源
```

**解决方案**：
- 启用缓存减少API调用
- 切换到其他数据源
- 等待限制重置

### 调试模式
```bash
# 启用详细输出
openclaw weather-query --city 北京 --verbose

# 查看缓存文件
ls ~/.openclaw/weather-cache/
```

## 🔄 更新日志

### v1.0.0 (2026-04-11)
- 初始版本发布
- 支持实时天气查询
- 支持天气预报
- 支持空气质量查询
- 多城市查询支持
- 缓存机制

### v1.1.0 (计划中)
- 添加天气预警功能
- 添加历史天气查询
- 添加天气对比功能
- 添加位置服务（GPS定位）

### v1.2.0 (计划中)
- 添加更多数据源
- 添加图表输出
- 添加定时天气提醒
- 添加天气数据分析

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork本仓库
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

### 代码规范
- 遵循PEP 8 Python代码规范
- 添加适当的注释
- 编写单元测试
- 更新相关文档

## 📄 许可证

MIT License

## 📞 支持

如有问题或建议，请：
1. 查看本文档的故障排除部分
2. 提交GitHub Issue
3. 联系开发者

---

**温馨提示**：天气数据仅供参考，实际天气可能有所不同。请以当地气象部门发布的信息为准。