#!/usr/bin/env node
/**
 * data-processor 技能 - 主入口文件
 * 调用Python脚本进行高级数据处理
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 技能配置
const SKILL_CONFIG = {
  name: 'data-processor',
  version: '1.0.0',
  description: '高级数据处理工具',
  pythonScript: path.join(__dirname, 'data_processor.py')
};

// 帮助信息
function showHelp() {
  console.log(`
${SKILL_CONFIG.name} v${SKILL_CONFIG.version}
${SKILL_CONFIG.description}

用法:
  openclaw data-processor <input-file> [选项]

选项:
  --help, -h              显示帮助信息
  --output, -o <file>     输出文件路径
  --format <format>       输出格式 (json/csv，默认: json)
  --filter <json>         过滤条件 (JSON格式)
  --group-by <key>        分组键
  --aggregate <key>       聚合键
  --operation <op>        聚合操作 (sum/avg/min/max/count，默认: sum)
  --sort-by <key>         排序键
  --reverse               降序排序
  --stats <key>           统计摘要的键
  --verbose, -v           详细输出
  --batch-size <size>     批处理大小 (默认: 100)

示例:
  # 过滤数据
  openclaw data-processor data.json --filter '{"status": "active"}'
  
  # 分组并聚合
  openclaw data-processor data.json --group-by category --aggregate price --operation avg
  
  # 统计摘要
  openclaw data-processor data.json --stats price
  
  # 排序并输出
  openclaw data-processor data.json --sort-by price --reverse --output results.json
  `);
}

// 检查Python脚本是否存在
function checkPythonScript() {
  if (!fs.existsSync(SKILL_CONFIG.pythonScript)) {
    console.error(`错误: Python脚本不存在 - ${SKILL_CONFIG.pythonScript}`);
    console.error('请确保 data_processor.py 文件在技能目录中');
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
    
    // 运行Python脚本
    const result = await runPythonScript(args);
    
    // 输出结果
    if (typeof result === 'object') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(result);
    }
    
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
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

module.exports = { main, showHelp, runPythonScript };