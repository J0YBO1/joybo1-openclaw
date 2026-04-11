#!/usr/bin/env node
/**
 * weather-query 技能 - 主入口文件
 * 天气查询工具，支持实时天气、预报、空气质量
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 技能配置
const SKILL_CONFIG = {
  name: 'weather-query',
  version: '1.0.0',
  description: '天气查询工具',
  pythonScript: path.join(__dirname, 'weather_query.py')
};

// 帮助信息
function showHelp() {
  console.log(`
${SKILL_CONFIG.name} v${SKILL_CONFIG.version}
${SKILL_CONFIG.description}

用法:
  openclaw weather-query [选项]

选项:
  --help, -h              显示帮助信息
  --city <name>           城市名称 (默认: 自动检测)
  --cities <list>         多个城市，用逗号分隔
  --input <file>          从文件读取城市列表
  --forecast, -f          显示天气预报
  --days <num>            预报天数 (1-7，默认: 3)
  --air-quality, -a       显示空气质量
  --unit <unit>           温度单位 (celsius/fahrenheit，默认: celsius)
  --lang <lang>           语言 (zh/en，默认: zh)
  --format <format>       输出格式 (table/json，默认: table)
  --output, -o <file>     输出到文件
  --verbose, -v           详细输出
  --provider <name>       数据源 (open-meteo/wttr，默认: open-meteo)
  --no-cache              禁用缓存
  --config <file>         配置文件路径

示例:
  # 查询当前城市天气
  openclaw weather-query
  
  # 查询指定城市天气
  openclaw weather-query --city 北京
  openclaw weather-query --city "New York"
  
  # 查询天气预报
  openclaw weather-query --city 上海 --forecast
  
  # 查询空气质量
  openclaw weather-query --city 广州 --air-quality
  
  # 查询多个城市
  openclaw weather-query --cities "北京,上海,广州"
  
  # 输出JSON格式
  openclaw weather-query --city 成都 --format json
  
  # 保存到文件
  openclaw weather-query --city 武汉 --output weather.json
  `);
}

// 检查Python脚本是否存在
function checkPythonScript() {
  if (!fs.existsSync(SKILL_CONFIG.pythonScript)) {
    console.error(`错误: Python脚本不存在 - ${SKILL_CONFIG.pythonScript}`);
    console.error('请确保 weather_query.py 文件在技能目录中');
    process.exit(1);
  }
}

// 运行Python脚本
function runPythonScript(args) {
  return new Promise((resolve, reject) => {
    const pythonArgs = [SKILL_CONFIG.pythonScript, ...args];
    
    if (process.env.VERBOSE) {
      console.log(`执行命令: python ${pythonArgs.join(' ')}`);
    }
    
    const pythonProcess = spawn('python', pythonArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // 尝试解析JSON输出
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          // 如果不是JSON，直接返回文本
          resolve(stdout.trim());
        }
      } else {
        let errorMessage = stderr || `Python脚本退出代码: ${code}`;
        
        // 尝试从stdout解析错误信息
        if (stdout) {
          try {
            const errorData = JSON.parse(stdout);
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // 不是JSON格式，使用原始错误
          }
        }
        
        reject(new Error(errorMessage));
      }
    });
    
    pythonProcess.on('error', (err) => {
      reject(new Error(`无法启动Python进程: ${err.message}`));
    });
  });
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const parsedArgs = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    // 处理布尔参数
    if (arg === '--verbose' || arg === '-v') {
      parsedArgs.push('--verbose');
    } else if (arg === '--forecast' || arg === '-f') {
      parsedArgs.push('--forecast');
    } else if (arg === '--air-quality' || arg === '-a') {
      parsedArgs.push('--air-quality');
    } else if (arg === '--no-cache') {
      parsedArgs.push('--no-cache');
    } 
    // 处理带值的参数
    else if (arg.startsWith('--')) {
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        parsedArgs.push(arg, nextArg);
        i++; // 跳过下一个参数
      } else {
        parsedArgs.push(arg);
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        parsedArgs.push(arg, nextArg);
        i++; // 跳过下一个参数
      } else {
        parsedArgs.push(arg);
      }
    } else {
      // 位置参数（如城市名）
      parsedArgs.push(`--city=${arg}`);
    }
  }
  
  return parsedArgs;
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  // 显示帮助
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    showHelp();
    return;
  }
  
  // 检查Python脚本
  checkPythonScript();
  
  try {
    // 设置详细模式环境变量
    if (args.includes('--verbose') || args.includes('-v')) {
      process.env.VERBOSE = '1';
    }
    
    // 解析参数
    const pythonArgs = parseArgs();
    
    // 运行Python脚本
    const result = await runPythonScript(pythonArgs);
    
    // 输出结果
    if (typeof result === 'object') {
      // 如果是JSON对象，检查是否需要特殊处理
      if (result.format === 'table' || args.includes('--format') && args[args.indexOf('--format') + 1] === 'table') {
        // 表格格式输出
        console.log(formatAsTable(result));
      } else {
        // JSON格式输出
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      // 文本输出
      console.log(result);
    }
    
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

// 格式化表格输出
function formatAsTable(data) {
  if (!data.success) {
    return `❌ ${data.error}`;
  }
  
  let output = '';
  
  if (data.location) {
    output += `🌤️ ${data.location.city}天气报告\n`;
    output += '='.repeat(40) + '\n';
    output += `📍 位置：${data.location.city}，${data.location.country || ''}\n`;
    if (data.location.latitude && data.location.longitude) {
      output += `📌 坐标：${data.location.latitude}, ${data.location.longitude}\n`;
    }
  }
  
  if (data.current) {
    output += `🕐 时间：${data.timestamp || '未知'}\n`;
    output += `🌡️ 温度：${data.current.temperature}°C`;
    if (data.current.feels_like) {
      output += ` (体感: ${data.current.feels_like}°C)`;
    }
    output += '\n';
    
    if (data.current.humidity !== undefined) {
      output += `💧 湿度：${data.current.humidity}%\n`;
    }
    
    if (data.current.wind_speed) {
      output += `💨 风速：${data.current.wind_speed} km/h`;
      if (data.current.wind_direction) {
        output += ` (${data.current.wind_direction})`;
      }
      output += '\n';
    }
    
    if (data.current.weather) {
      output += `☁️  天气：${data.current.weather}\n`;
    }
    
    if (data.current.visibility) {
      output += `👁️  能见度：${data.current.visibility} km\n`;
    }
    
    if (data.current.pressure) {
      output += `📊 气压：${data.current.pressure} hPa\n`;
    }
    
    if (data.current.uv_index !== undefined) {
      output += `☀️  UV指数：${data.current.uv_index}\n`;
    }
  }
  
  if (data.air_quality && data.air_quality.aqi) {
    output += `🌫️  空气质量：AQI ${data.air_quality.aqi} (${getAQILevel(data.air_quality.aqi)})\n`;
  }
  
  if (data.forecast && data.forecast.length > 0) {
    output += '\n📅 天气预报：\n';
    output += '-'.repeat(40) + '\n';
    
    for (const day of data.forecast.slice(0, 3)) {
      output += `${day.date}: ${day.weather} ${day.temperature_min}°C ~ ${day.temperature_max}°C\n`;
    }
  }
  
  return output;
}

// 获取AQI等级
function getAQILevel(aqi) {
  if (aqi <= 50) return '优';
  if (aqi <= 100) return '良';
  if (aqi <= 150) return '轻度污染';
  if (aqi <= 200) return '中度污染';
  if (aqi <= 300) return '重度污染';
  return '严重污染';
}

// 异常处理
process.on('unhandledRejection', (error) => {
  console.error(`未处理的拒绝: ${error.message}`);
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main, showHelp, runPythonScript, formatAsTable };