#!/usr/bin/env python3
"""
weather-query 技能 - Python实现
天气查询工具，支持实时天气、预报、空气质量
"""

import argparse
import json
import sys
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pathlib import Path
from functools import wraps
import requests
from urllib.parse import quote

# ==================== 配置 ====================

DEFAULT_CONFIG = {
    "default_city": "北京",
    "default_unit": "celsius",
    "default_lang": "zh",
    "api_provider": "open-meteo",
    "cache_duration": 1800,  # 30分钟
    "show_emoji": True,
    "timeout": 10,
    "retry_times": 3
}

# API配置
API_CONFIG = {
    "open-meteo": {
        "current_url": "https://api.open-meteo.com/v1/forecast",
        "forecast_url": "https://api.open-meteo.com/v1/forecast",
        "air_quality_url": "https://air-quality-api.open-meteo.com/v1/air-quality",
        "geocoding_url": "https://geocoding-api.open-meteo.com/v1/search"
    },
    "wttr": {
        "current_url": "https://wttr.in/{city}",
        "format": "j2"  # JSON格式
    }
}

# 城市坐标缓存（避免频繁查询）
CITY_COORDINATES = {
    "北京": {"name": "北京", "country": "中国", "latitude": 39.9042, "longitude": 116.4074},
    "上海": {"name": "上海", "country": "中国", "latitude": 31.2304, "longitude": 121.4737},
    "广州": {"name": "广州", "country": "中国", "latitude": 23.1291, "longitude": 113.2644},
    "深圳": {"name": "深圳", "country": "中国", "latitude": 22.5431, "longitude": 114.0579},
    "杭州": {"name": "杭州", "country": "中国", "latitude": 30.2741, "longitude": 120.1551},
    "南京": {"name": "南京", "country": "中国", "latitude": 32.0603, "longitude": 118.7969},
    "成都": {"name": "成都", "country": "中国", "latitude": 30.5728, "longitude": 104.0668},
    "武汉": {"name": "武汉", "country": "中国", "latitude": 30.5928, "longitude": 114.3055},
    "西安": {"name": "西安", "country": "中国", "latitude": 34.3416, "longitude": 108.9398},
    "重庆": {"name": "重庆", "country": "中国", "latitude": 29.5630, "longitude": 106.5516},
    "new york": {"name": "New York", "country": "USA", "latitude": 40.7128, "longitude": -74.0060},
    "london": {"name": "London", "country": "UK", "latitude": 51.5074, "longitude": -0.1278},
    "tokyo": {"name": "Tokyo", "country": "Japan", "latitude": 35.6762, "longitude": 139.6503},
    "paris": {"name": "Paris", "country": "France", "latitude": 48.8566, "longitude": 2.3522},
    "sydney": {"name": "Sydney", "country": "Australia", "latitude": -33.8688, "longitude": 151.2093}
}

# ==================== 装饰器 ====================

def timing_decorator(func):
    """计时装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        elapsed = end_time - start_time
        if 'verbose' in kwargs and kwargs['verbose']:
            print(f"[TIMING] {func.__name__} took {elapsed:.4f} seconds", file=sys.stderr)
        return result
    return wrapper

def retry_decorator(max_retries=3, delay=1):
    """重试装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        if 'verbose' in kwargs and kwargs['verbose']:
                            print(f"[RETRY] 第{attempt + 1}次尝试失败，{delay}秒后重试...", file=sys.stderr)
                        time.sleep(delay * (attempt + 1))  # 指数退避
            raise last_exception
        return wrapper
    return decorator

# ==================== 自定义异常 ====================

class WeatherError(Exception):
    """天气查询错误基类"""
    pass

class CityNotFoundError(WeatherError):
    """城市未找到错误"""
    pass

class APIError(WeatherError):
    """API错误"""
    pass

class NetworkError(WeatherError):
    """网络错误"""
    pass

# ==================== 工具函数 ====================

def load_config(config_path: Optional[str] = None) -> Dict[str, Any]:
    """加载配置文件"""
    config = DEFAULT_CONFIG.copy()
    
    # 尝试从环境变量加载
    env_city = os.getenv("WEATHER_DEFAULT_CITY")
    if env_city:
        config["default_city"] = env_city
    
    env_unit = os.getenv("WEATHER_DEFAULT_UNIT")
    if env_unit:
        config["default_unit"] = env_unit
    
    env_lang = os.getenv("WEATHER_DEFAULT_LANG")
    if env_lang:
        config["default_lang"] = env_lang
    
    # 尝试从配置文件加载
    if config_path and Path(config_path).exists():
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                file_config = json.load(f)
                config.update(file_config)
        except Exception:
            pass  # 忽略配置文件错误
    
    return config

def save_cache(cache_key: str, data: Any, cache_dir: Optional[str] = None) -> None:
    """保存缓存"""
    if not cache_dir:
        cache_dir = os.path.join(os.path.expanduser("~"), ".openclaw", "weather-cache")
    
    os.makedirs(cache_dir, exist_ok=True)
    cache_file = os.path.join(cache_dir, f"{cache_key}.json")
    
    cache_data = {
        "data": data,
        "timestamp": time.time()
    }
    
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False)
    except Exception:
        pass  # 忽略缓存错误

def load_cache(cache_key: str, cache_dir: Optional[str] = None, max_age: int = 1800) -> Optional[Any]:
    """加载缓存"""
    if not cache_dir:
        cache_dir = os.path.join(os.path.expanduser("~"), ".openclaw", "weather-cache")
    
    cache_file = os.path.join(cache_dir, f"{cache_key}.json")
    
    if not os.path.exists(cache_file):
        return None
    
    try:
        with open(cache_file, 'r', encoding='utf-8') as f:
            cache_data = json.load(f)
        
        # 检查缓存是否过期
        if time.time() - cache_data["timestamp"] > max_age:
            return None
        
        return cache_data["data"]
    except Exception:
        return None

def get_city_coordinates(city_name: str, verbose: bool = False) -> Dict[str, Any]:
    """获取城市坐标"""
    # 首先检查缓存
    city_lower = city_name.lower().strip()
    if city_lower in CITY_COORDINATES:
        return CITY_COORDINATES[city_lower]
    
    # 尝试从Open-Meteo地理编码API获取
    try:
        url = API_CONFIG["open-meteo"]["geocoding_url"]
        params = {
            "name": city_name,
            "count": 1,
            "language": "zh",
            "format": "json"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get("results") and len(data["results"]) > 0:
            result = data["results"][0]
            coordinates = {
                "name": result.get("name", city_name),
                "country": result.get("country", ""),
                "latitude": result.get("latitude", 0),
                "longitude": result.get("longitude", 0)
            }
            
            # 添加到缓存
            CITY_COORDINATES[city_lower] = coordinates
            return coordinates
    except Exception as e:
        if verbose:
            print(f"[WARN] 无法获取城市坐标: {e}", file=sys.stderr)
    
    raise CityNotFoundError(f"未找到城市 '{city_name}'")

# ==================== API客户端 ====================

class WeatherAPIClient:
    """天气API客户端"""
    
    def __init__(self, provider: str = "open-meteo", verbose: bool = False):
        self.provider = provider
        self.verbose = verbose
        self.config = API_CONFIG.get(provider, API_CONFIG["open-meteo"])
    
    @retry_decorator(max_retries=3, delay=1)
    @timing_decorator
    def get_current_weather(self, latitude: float, longitude: float, 
                           unit: str = "celsius", lang: str = "zh") -> Dict[str, Any]:
        """获取当前天气"""
        if self.provider == "open-meteo":
            return self._get_openmeteo_current(latitude, longitude, unit, lang)
        elif self.provider == "wttr":
            return self._get_wttr_current(latitude, longitude, unit, lang)
        else:
            raise APIError(f"不支持的API提供商: {self.provider}")
    
    @retry_decorator(max_retries=3, delay=1)
    @timing_decorator
    def get_forecast(self, latitude: float, longitude: float, 
                    days: int = 3, unit: str = "celsius", lang: str = "zh") -> List[Dict[str, Any]]:
        """获取天气预报"""
        if self.provider == "open-meteo":
            return self._get_openmeteo_forecast(latitude, longitude, days, unit, lang)
        else:
            # wttr.in不支持单独的预报API
            return []
    
    @retry_decorator(max_retries=3, delay=1)
    @timing_decorator
    def get_air_quality(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """获取空气质量"""
        try:
            url = API_CONFIG["open-meteo"]["air_quality_url"]
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "current": "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth",
                "timezone": "auto"
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            current = data.get("current", {})
            aqi = self._calculate_aqi(current)
            
            return {
                "aqi": aqi,
                "pm2_5": current.get("pm2_5", 0),
                "pm10": current.get("pm10", 0),
                "no2": current.get("nitrogen_dioxide", 0),
                "so2": current.get("sulphur_dioxide", 0),
                "co": current.get("carbon_monoxide", 0),
                "o3": current.get("ozone", 0)
            }
        except Exception as e:
            if self.verbose:
                print(f"[WARN] 无法获取空气质量: {e}", file=sys.stderr)
            return {"aqi": 0, "error": str(e)}
    
    def _get_openmeteo_current(self, latitude: float, longitude: float, 
                              unit: str, lang: str) -> Dict[str, Any]:
        """从Open-Meteo获取当前天气"""
        url = self.config["current_url"]
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,"
                      "precipitation,rain,showers,snowfall,weather_code,cloud_cover,"
                      "pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,"
                      "wind_gusts_10m,visibility,is_day",
            "timezone": "auto",
            "forecast_days": 1
        }
        
        if unit == "fahrenheit":
            params["temperature_unit"] = "fahrenheit"
            params["wind_speed_unit"] = "mph"
        else:
            params["temperature_unit"] = "celsius"
            params["wind_speed_unit"] = "kmh"
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        current = data.get("current", {})
        
        # 转换天气代码为中文描述
        weather_code = current.get("weather_code", 0)
        weather_desc = self._weather_code_to_desc(weather_code, lang)
        
        return {
            "temperature": current.get("temperature_2m", 0),
            "feels_like": current.get("apparent_temperature", 0),
            "humidity": current.get("relative_humidity_2m", 0),
            "wind_speed": current.get("wind_speed_10m", 0),
            "wind_direction": self._wind_degree_to_direction(current.get("wind_direction_10m", 0), lang),
            "weather": weather_desc,
            "visibility": current.get("visibility", 0) / 1000 if current.get("visibility") else 0,  # 米转公里
            "pressure": current.get("pressure_msl", 0),
            "cloud_cover": current.get("cloud_cover", 0),
            "precipitation": current.get("precipitation", 0),
            "is_day": current.get("is_day", 1) == 1,
            "uv_index": 0  # Open-Meteo需要单独查询UV
        }
    
    def _get_wttr_current(self, latitude: float, longitude: float, 
                         unit: str, lang: str) -> Dict[str, Any]:
        """从wttr.in获取当前天气"""
        # wttr.in需要城市名，而不是坐标
        # 这里我们使用一个虚拟的城市名，实际wttr.in会根据IP定位
        city = "~"  # ~表示自动定位
        
        url = self.config["current_url"].format(city=quote(city))
        params = {
            "format": self.config["format"],
            "lang": lang
        }
        
        if unit == "fahrenheit":
            params["u"] = "F"
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        current = data.get("current_condition", [{}])[0]
        
        return {
            "temperature": float(current.get("temp_C", 0)),
            "feels_like": float(current.get("FeelsLikeC", 0)),
            "humidity": int(current.get("humidity", 0)),
            "wind_speed": float(current.get("windspeedKmph", 0)),
            "wind_direction": current.get("winddir16Point", ""),
            "weather": current.get("weatherDesc", [{}])[0].get("value", ""),
            "visibility": float(current.get("visibility", 0)),
            "pressure": float(current.get("pressure", 0)),
            "precipitation": float(current.get("precipMM", 0)),
            "uv_index": int(current.get("uvIndex", 0))
        }
    
    def _get_openmeteo_forecast(self, latitude: float, longitude: float, 
                               days: int, unit: str, lang: str) -> List[Dict[str, Any]]:
        """从Open-Meteo获取天气预报"""
        url = self.config["forecast_url"]
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,"
                    "precipitation_sum,rain_sum,showers_sum,snowfall_sum,"
                    "precipitation_hours,precipitation_probability_max,"
                    "wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant",
            "timezone": "auto",
            "forecast_days": days
        }
        
        if unit == "fahrenheit":
            params["temperature_unit"] = "fahrenheit"
            params["wind_speed_unit"] = "mph"
        else:
            params["temperature_unit"] = "celsius"
            params["wind_speed_unit"] = "kmh"
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        daily = data.get("daily", {})
        time_list = daily.get("time", [])
        weather_codes = daily.get("weather_code", [])
        temp_max = daily.get("temperature_2m_max", [])
        temp_min = daily.get("temperature_2m_min", [])
        
        forecast = []
        for i in range(min(days, len(time_list))):
            weather_desc = self._weather_code_to_desc(weather_codes[i], lang)
            forecast.append({
                "date": time_list[i],
                "weather": weather_desc,
                "temperature_max": temp_max[i],
                "temperature_min": temp_min[i],
                "precipitation": daily.get("precipitation_sum", [0]*days)[i],
                "wind_speed": daily.get("wind_speed_10m_max", [0]*days)[i]
            })
        
        return forecast
    
    def _weather_code_to_desc(self, code: int, lang: str = "zh") -> str:
        """将天气代码转换为描述"""
        weather_codes = {
            0: {"zh": "晴", "en": "Clear sky"},
            1: {"zh": "晴", "en": "Mainly clear"},
            2: {"zh": "少云", "en": "Partly cloudy"},
            3: {"zh": "多云", "en": "Overcast"},
            45: {"zh": "雾", "en": "Fog"},
            48: {"zh": "雾", "en": "Depositing rime fog"},
            51: {"zh": "小雨", "en": "Drizzle"},
            53: {"zh": "中雨", "en": "Drizzle"},
            55: {"zh": "大雨", "en": "Drizzle"},
            56: {"zh": "冻雨", "en": "Freezing Drizzle"},
            57: {"zh": "冻雨", "en": "Freezing Drizzle"},
            61: {"zh": "小雨", "en": "Rain"},
            63: {"zh": "中雨", "en": "Rain"},
            65: {"zh": "大雨", "en": "Rain"},
            66: {"zh": "冻雨", "en": "Freezing Rain"},
            67: {"zh": "冻雨", "en": "Freezing Rain"},
            71: {"zh": "小雪", "en": "Snow"},
            73: {"zh": "中雪", "en": "Snow"},
            75: {"zh": "大雪", "en": "Snow"},
            77: {"zh": "冰雹", "en": "Snow grains"},
            80: {"zh": "阵雨", "en": "Rain showers"},
            81: {"zh": "阵雨", "en": "Rain showers"},
            82: {"zh": "暴雨", "en": "Rain showers"},
            85: {"zh": "阵雪", "en": "Snow showers"},
            86: {"zh": "阵雪", "en": "Snow showers"},
            95: {"zh": "雷阵雨", "en": "Thunderstorm"},
            96: {"zh": "雷阵雨", "en": "Thunderstorm"},
            99: {"zh": "雷阵雨", "en": "Thunderstorm"}
        }
        
        desc = weather_codes.get(code, {"zh": "未知", "en": "Unknown"})
        return desc.get(lang, desc["zh"])
    
    def _wind_degree_to_direction(self, degree: float, lang: str = "zh") -> str:
        """将风向角度转换为方向描述"""
        if lang == "en":
            directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                         "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
        else:
            directions = ["北", "北北东", "东北", "东北东", "东", "东南东", "东南", "南南东",
                         "南", "南南西", "西南", "西南西", "西", "西北西", "西北", "北北西"]
        
        index = round(degree / 22.5) % 16
        return directions[index]
    
    def _calculate_aqi(self, air_data: Dict[str, float]) -> int:
        """计算空气质量指数"""
        # 简化的AQI计算，实际应该使用更复杂的算法
        pm2_5 = air_data.get("pm2_5", 0)
        pm10 = air_data.get("pm10", 0)
        no2 = air_data.get("nitrogen_dioxide", 0)
        
        # 基于PM2.5的简单AQI计算
        if pm2_5 <= 12:
            aqi = int(pm2_5 * 50 / 12)
        elif pm2_5 <= 35.4:
            aqi = 50 + int((pm2_5 - 12) * 50 / 23.4)
        elif pm2_5 <= 55.4:
            aqi = 100 + int((pm2_5 - 35.4) * 100 / 20)
        elif pm2_5 <= 150.4:
            aqi = 200 + int((pm2_5 - 55.4) * 100 / 95)
        elif pm2_5 <= 250.4:
            aqi = 300 + int((pm2_5 - 150.4) * 100 / 100)
        else:
            aqi = 400 + int((pm2_5 - 250.4) * 100 / 149.6)
        
        return min(aqi, 500)

# ==================== 天气查询器 ====================

class WeatherQuery:
    """天气查询器"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None, verbose: bool = False):
        self.config = config or load_config()
        self.verbose = verbose
        self.client = WeatherAPIClient(
            provider=self.config["api_provider"],
            verbose=verbose
        )
    
    def query(self, city: Optional[str] = None, forecast_days: int = 0,
             air_quality: bool = False, unit: str = "celsius",
             lang: str = "zh", use_cache: bool = True) -> Dict[str, Any]:
        """查询天气"""
        # 确定城市
        if not city:
            city = self.config["default_city"]
        
        # 检查缓存
        cache_key = f"{city}_{forecast_days}_{air_quality}_{unit}_{lang}"
        if use_cache:
            cached = load_cache(cache_key, max_age=self.config["cache_duration"])
            if cached:
                if self.verbose:
                    print(f"[CACHE] 使用缓存数据", file=sys.stderr)
                return cached
        
        try:
            # 获取城市坐标
            location = get_city_coordinates(city, self.verbose)
            
            # 获取当前天气
            current = self.client.get_current_weather(
                location["latitude"], location["longitude"], unit, lang
            )
            
            # 获取天气预报
            forecast = []
            if forecast_days > 0:
                forecast = self.client.get_forecast(
                    location["latitude"], location["longitude"], forecast_days, unit, lang
                )
            
            # 获取空气质量
            air_data = {}
            if air_quality:
                air_data = self.client.get_air_quality(
                    location["latitude"], location["longitude"]
                )
            
            # 构建结果
            result = {
                "success": True,
                "timestamp": datetime.now().isoformat(),
                "location": location,
                "current": current,
                "forecast": forecast,
                "air_quality": air_data,
                "unit": unit,
                "lang": lang
            }
            
            # 保存缓存
            if use_cache:
                save_cache(cache_key, result)
            
            return result
            
        except CityNotFoundError as e:
            return {
                "success": False,
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "suggestion": "请检查城市名拼写，或使用英文名"
            }
        except (APIError, NetworkError) as e:
            return {
                "success": False,
                "timestamp": datetime.now().isoformat(),
                "error": f"天气查询失败: {str(e)}",
                "suggestion": "请检查网络连接，或稍后重试"
            }
        except Exception as e:
            return {
                "success": False,
                "timestamp": datetime.now().isoformat(),
                "error": f"内部错误: {str(e)}",
                "suggestion": "请稍后重试或联系开发者"
            }
    
    def query_multiple(self, cities: List[str], **kwargs) -> Dict[str, Any]:
        """查询多个城市天气"""
        results = []
        for city in cities:
            result = self.query(city=city, **kwargs)
            results.append(result)
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "cities": results,
            "count": len(results)
        }

# ==================== 命令行接口 ====================

def create_parser() -> argparse.ArgumentParser:
    """创建命令行解析器"""
    parser = argparse.ArgumentParser(
        description="天气查询工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 查询当前城市天气
  python weather_query.py
  
  # 查询指定城市天气
  python weather_query.py --city 北京
  python weather_query.py --city "New York"
  
  # 查询天气预报
  python weather_query.py --city 上海 --forecast
  
  # 查询空气质量
  python weather_query.py --city 广州 --air-quality
  
  # 查询多个城市
  python weather_query.py --cities "北京,上海,广州"
  
  # 输出JSON格式
  python weather_query.py --city 成都 --format json
        """
    )
    
    # 城市选项
    parser.add_argument("--city", help="城市名称")
    parser.add_argument("--cities", help="多个城市，用逗号分隔")
    parser.add_argument("--input", help="从文件读取城市列表")
    
    # 查询选项
    parser.add_argument("--forecast", "-f", action="store_true", help="显示天气预报")
    parser.add_argument("--days", type=int, default=3, help="预报天数 (1-7，默认: 3)")
    parser.add_argument("--air-quality", "-a", action="store_true", help="显示空气质量")
    
    # 输出选项
    parser.add_argument("--unit", choices=["celsius", "fahrenheit"], default="celsius", 
                       help="温度单位 (默认: celsius)")
    parser.add_argument("--lang", choices=["zh", "en"], default="zh", help="语言 (默认: zh)")
    parser.add_argument("--format", choices=["table", "json"], default="table", 
                       help="输出格式 (默认: table)")
    parser.add_argument("--output", "-o", help="输出到文件")
    
    # 其他选项
    parser.add_argument("--verbose", "-v", action="store_true", help="详细输出")
    parser.add_argument("--provider", choices=["open-meteo", "wttr"], default="open-meteo",
                       help="数据源 (默认: open-meteo)")
    parser.add_argument("--no-cache", action="store_true", help="禁用缓存")
    parser.add_argument("--config", help="配置文件路径")
    
    return parser

# ==================== 格式化输出 ====================

def format_as_table(data: Dict[str, Any]) -> str:
    """将天气数据格式化为表格"""
    if not data.get("success"):
        return f"❌ {data.get('error', '未知错误')}\n💡 {data.get('suggestion', '')}"
    
    output = []
    
    # 头部
    location = data.get("location", {})
    output.append(f"🌤️ {location.get('name', '未知')}天气报告")
    output.append("=" * 40)
    
    # 位置信息
    if location.get("country"):
        output.append(f"📍 位置：{location['name']}，{location['country']}")
    else:
        output.append(f"📍 位置：{location.get('name', '未知')}")
    
    # 当前天气
    current = data.get("current", {})
    if current:
        output.append(f"🕐 时间：{data.get('timestamp', '未知')}")
        
        temp = current.get("temperature", 0)
        feels_like = current.get("feels_like", temp)
        output.append(f"🌡️ 温度：{temp}°C (体感: {feels_like}°C)")
        
        if current.get("humidity") is not None:
            output.append(f"💧 湿度：{current['humidity']}%")
        
        if current.get("wind_speed") is not None:
            wind_speed = current["wind_speed"]
            wind_dir = current.get("wind_direction", "")
            output.append(f"💨 风速：{wind_speed} km/h {wind_dir}")
        
        if current.get("weather"):
            output.append(f"☁️  天气：{current['weather']}")
        
        if current.get("visibility") is not None:
            output.append(f"👁️  能见度：{current['visibility']} km")
        
        if current.get("pressure") is not None:
            output.append(f"📊 气压：{current['pressure']} hPa")
        
        if current.get("uv_index") is not None:
            output.append(f"☀️  UV指数：{current['uv_index']}")
    
    # 空气质量
    air_quality = data.get("air_quality", {})
    if air_quality and air_quality.get("aqi"):
        aqi = air_quality["aqi"]
        level = get_aqi_level(aqi)
        output.append(f"🌫️  空气质量：AQI {aqi} ({level})")
    
    # 天气预报
    forecast = data.get("forecast", [])
    if forecast:
        output.append("\n📅 天气预报：")
        output.append("-" * 40)
        
        for day in forecast[:3]:  # 只显示前3天
            date = day.get("date", "未知")
            weather = day.get("weather", "未知")
            temp_min = day.get("temperature_min", 0)
            temp_max = day.get("temperature_max", 0)
            output.append(f"{date}: {weather} {temp_min}°C ~ {temp_max}°C")
    
    return "\n".join(output)

def get_aqi_level(aqi: int) -> str:
    """获取AQI等级"""
    if aqi <= 50:
        return "优"
    elif aqi <= 100:
        return "良"
    elif aqi <= 150:
        return "轻度污染"
    elif aqi <= 200:
        return "中度污染"
    elif aqi <= 300:
        return "重度污染"
    else:
        return "严重污染"

# ==================== 主函数 ====================

def main():
    """主函数"""
    parser = create_parser()
    args = parser.parse_args()
    
    try:
        # 加载配置
        config = load_config(args.config)
        
        # 更新配置
        if args.provider:
            config["api_provider"] = args.provider
        
        # 创建查询器
        query = WeatherQuery(config=config, verbose=args.verbose)
        
        # 确定查询的城市
        cities = []
        
        if args.cities:
            # 多个城市
            cities = [city.strip() for city in args.cities.split(",") if city.strip()]
        elif args.input:
            # 从文件读取
            try:
                with open(args.input, 'r', encoding='utf-8') as f:
                    cities = [line.strip() for line in f if line.strip()]
            except Exception as e:
                error_output = {
                    "success": False,
                    "timestamp": datetime.now().isoformat(),
                    "error": f"无法读取文件: {str(e)}"
                }
                print(json.dumps(error_output, ensure_ascii=False))
                sys.exit(1)
        elif args.city:
            # 单个城市
            cities = [args.city]
        else:
            # 默认城市
            cities = [config["default_city"]]
        
        # 执行查询
        if len(cities) == 1:
            # 单个城市查询
            result = query.query(
                city=cities[0],
                forecast_days=args.days if args.forecast else 0,
                air_quality=args.air_quality,
                unit=args.unit,
                lang=args.lang,
                use_cache=not args.no_cache
            )
        else:
            # 多个城市查询
            result = query.query_multiple(
                cities=cities,
                forecast_days=args.days if args.forecast else 0,
                air_quality=args.air_quality,
                unit=args.unit,
                lang=args.lang,
                use_cache=not args.no_cache
            )
        
        # 输出结果
        if args.output:
            # 保存到文件
            with open(args.output, 'w', encoding='utf-8') as f:
                if args.format == "table":
                    f.write(format_as_table(result))
                else:
                    json.dump(result, f, indent=2, ensure_ascii=False)
            
            if args.verbose:
                print(f"结果已保存到: {args.output}", file=sys.stderr)
        
        # 控制台输出
        if args.format == "table":
            print(format_as_table(result))
        else:
            print(json.dumps(result, ensure_ascii=False))
        
    except KeyboardInterrupt:
        print("\n操作已取消")
        sys.exit(0)
    except Exception as e:
        error_output = {
            "success": False,
            "timestamp": datetime.now().isoformat(),
            "error": f"内部错误: {str(e)}"
        }
        print(json.dumps(error_output, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()