# weather-query 技能

实时天气查询工具，支持全球城市天气查询、天气预报、空气质量等信息。

## 功能特性

- ✅ **实时天气**：当前温度、湿度、风速、天气状况
- ✅ **天气预报**：未来3天天气预报
- ✅ **空气质量**：AQI指数和空气质量等级
- ✅ **多数据源**：支持多个天气API（Open-Meteo、wttr.in等）
- ✅ **城市搜索**：支持中文和英文城市名
- ✅ **单位选择**：摄氏度/华氏度切换
- ✅ **详细输出**：表格和JSON格式输出
- ✅ **错误处理**：完善的错误提示和重试机制

## 安装依赖

```bash
# 安装Python依赖
pip install requests python-dateutil

# 或者使用requirements.txt
pip install -r requirements.txt
```

## 使用方法

### 基本命令

```bash
# 查看帮助
openclaw weather-query --help

# 查询当前城市天气（自动检测）
openclaw weather-query

# 查询指定城市天气
openclaw weather-query --city 北京
openclaw weather-query --city "New York"

# 查询天气预报
openclaw weather-query --city 上海 --forecast

# 查询空气质量
openclaw weather-query --city 广州 --air-quality

# 使用华氏度
openclaw weather-query --city 深圳 --unit fahrenheit

# 详细输出
openclaw weather-query --city 杭州 --verbose
```

### 高级用法

```bash
# 查询未来3天预报
openclaw weather-query --city 南京 --days 3

# 指定语言（中文/英文）
openclaw weather-query --city 东京 --lang zh
openclaw weather-query --city Tokyo --lang en

# 输出JSON格式
openclaw weather-query --city 成都 --format json

# 保存到文件
openclaw weather-query --city 武汉 --output weather.json
```

### 批量查询

```bash
# 查询多个城市
openclaw weather-query --cities "北京,上海,广州"

# 从文件读取城市列表
openclaw weather-query --input cities.txt
```

## 配置说明

### 环境变量（可选）

```bash
# 设置默认城市
export WEATHER_DEFAULT_CITY="北京"

# 设置默认单位（celsius/fahrenheit）
export WEATHER_DEFAULT_UNIT="celsius"

# 设置默认语言（zh/en）
export WEATHER_DEFAULT_LANG="zh"

# 设置API密钥（如果需要）
export OPENWEATHER_API_KEY="your_api_key"
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
  "show_emoji": true
}
```

## 输出示例

### 表格输出

```
🌤️ 北京天气报告
====================
📍 位置：北京，中国
🕐 时间：2026-04-11 16:15:00
🌡️ 温度：18°C (64°F)
💧 湿度：65%
💨 风速：12 km/h (3级)
🌪️ 风向：东北风
☁️  天气：多云
👁️  能见度：10 km
📊 气压：1013 hPa
🌡️ 体感温度：17°C
```

### JSON输出

```json
{
  "success": true,
  "timestamp": "2026-04-11T16:15:00",
  "location": {
    "city": "北京",
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
  "forecast": [...],
  "air_quality": {...}
}
```

## 数据源

### 默认数据源：Open-Meteo
- 免费、无需API密钥
- 全球覆盖
- 实时数据和7天预报
- 支持多种气象参数

### 备用数据源：wttr.in
- 简单的命令行接口
- 支持ASCII艺术输出
- 无需API密钥
- 响应速度快

### 可选数据源：OpenWeatherMap
- 需要API密钥
- 更详细的数据
- 历史天气数据
- 分钟级预报

## 错误处理

### 常见错误及解决方法

1. **城市未找到**
   ```
   错误: 未找到城市 'XXXX'
   建议: 检查城市名拼写，或使用英文名
   ```

2. **网络连接失败**
   ```
   错误: 无法连接到天气服务
   建议: 检查网络连接，或稍后重试
   ```

3. **API限制**
   ```
   错误: API请求次数超限
   建议: 等待一段时间后重试，或使用其他数据源
   ```

### 重试机制

- 自动重试3次
- 指数退避策略
- 多数据源故障转移

## 性能优化

1. **缓存机制**：天气数据缓存30分钟
2. **批量查询**：多个城市合并查询
3. **连接池**：HTTP连接复用
4. **压缩传输**：gzip压缩响应

## 扩展开发

### 添加新数据源

1. 创建新的API适配器类
2. 实现统一的接口方法
3. 添加到数据源管理器

### 添加新功能

1. **天气预警**：极端天气提醒
2. **历史天气**：查询历史天气数据
3. **天气对比**：多个城市天气对比
4. **位置服务**：GPS定位自动查询

## 测试

```bash
# 运行单元测试
python test_weather.py

# 运行集成测试
python test_integration.py

# 测试命令行接口
node test.js
```

## 版本历史

- v1.0.0 (2026-04-11): 初始版本，支持基本天气查询
- v1.1.0 (计划): 添加空气质量、天气预报功能
- v1.2.0 (计划): 添加多数据源支持、缓存机制

## 注意事项

1. **数据准确性**：天气数据仅供参考，实际天气可能有所不同
2. **API限制**：免费API有调用频率限制
3. **隐私保护**：不会记录用户查询历史
4. **网络依赖**：需要互联网连接才能获取天气数据