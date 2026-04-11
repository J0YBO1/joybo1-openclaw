/**
 * Python Runner Skill - Python脚本执行技能
 * 作者：joyboy
 * 创建时间：2026年4月10日
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const tmp = require('tmp');

// 危险模块列表（可配置）
const DANGEROUS_MODULES = [
  'os.system',
  'os.popen',
  'subprocess',
  'eval',
  'exec',
  '__import__',
  'open',
  'file',
  'shutil',
  'sys.exit',  // 允许，但需要监控
  'threading',
  'multiprocessing'
];

// 安全检查：检测危险代码模式
function checkCodeSafety(code) {
  const warnings = [];
  const errors = [];
  
  // 代码长度检查
  if (code.length > 10000) {
    warnings.push('代码长度超过10000字符，可能影响性能');
  }
  
  // 检测危险模块导入
  DANGEROUS_MODULES.forEach(module => {
    const regex = new RegExp(`\\b${module.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(code)) {
      warnings.push(`检测到可能危险的操作: ${module}`);
    }
  });
  
  // 检测无限循环模式
  const infiniteLoopPatterns = [
    /while\s*\(\s*true\s*\)/i,
    /while\s*1:/i,
    /for\s+.*\s+in\s+.*:\s*pass/i
  ];
  
  infiniteLoopPatterns.forEach(pattern => {
    if (pattern.test(code)) {
      warnings.push('检测到可能的无限循环模式');
    }
  });
  
  return { warnings, errors, safe: errors.length === 0 };
}

// 创建临时Python脚本文件
async function createTempScript(code, args = []) {
  return new Promise((resolve, reject) => {
    tmp.file({ prefix: 'python_', postfix: '.py', keep: false }, (err, filePath, fd, cleanupCallback) => {
      if (err) return reject(err);
      
      // 将用户代码的每一行缩进4个空格
      const indentedCode = code.split('\n').map(line => '    ' + line).join('\n');
      
      const scriptContent = `#!/usr/bin/env python3
import sys
import traceback

# 接收命令行参数
script_args = sys.argv[1:] if len(sys.argv) > 1 else []

try:
    # 用户代码开始
${indentedCode}
    # 用户代码结束
except Exception as e:
    print(f"\\n❌ 执行错误: {type(e).__name__}: {e}", file=sys.stderr)
    traceback.print_exc()
    sys.exit(1)
`;
      
      fs.writeFile(filePath, scriptContent, 'utf-8')
        .then(() => resolve({ filePath, cleanupCallback }))
        .catch(reject);
    });
  });
}

// 执行Python代码字符串
async function executePythonCode(code, options = {}) {
  const {
    args = [],
    timeout = 10000, // 10秒默认超时
    pythonCmd = 'python',
    cwd = process.cwd(),
    env = process.env
  } = options;
  
  // 安全检查
  const safetyCheck = checkCodeSafety(code);
  if (!safetyCheck.safe) {
    return {
      success: false,
      message: '❌ 代码安全检查失败',
      errors: safetyCheck.errors,
      warnings: safetyCheck.warnings
    };
  }
  
  // 创建临时脚本文件
  let tempFile;
  try {
    tempFile = await createTempScript(code, args);
    
    const startTime = Date.now();
    const commandArgs = [tempFile.filePath, ...args];
    
    return new Promise((resolve) => {
      const child = spawn(pythonCmd, commandArgs, {
        cwd,
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      let killedByTimeout = false;
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        killedByTimeout = true;
        child.kill('SIGTERM');
      }, timeout);
      
      // 收集输出
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        clearTimeout(timeoutId);
        const executionTime = Date.now() - startTime;
        
        // 清理临时文件
        if (tempFile.cleanupCallback) {
          tempFile.cleanupCallback();
        }
        
        const result = {
          success: code === 0 && !killedByTimeout,
          executionTime,
          exitCode: code,
          killedByTimeout,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          safety: safetyCheck
        };
        
        if (killedByTimeout) {
          result.message = `❌ 执行超时（${timeout}ms）`;
        } else if (code !== 0) {
          result.message = `❌ 执行失败，退出码: ${code}`;
        } else {
          result.message = '✅ Python代码执行成功';
        }
        
        resolve(result);
      });
      
      child.on('error', (error) => {
        clearTimeout(timeoutId);
        if (tempFile.cleanupCallback) {
          tempFile.cleanupCallback();
        }
        
        resolve({
          success: false,
          message: `❌ 执行过程出错: ${error.message}`,
          error: error.message,
          executionTime: Date.now() - startTime
        });
      });
    });
  } catch (error) {
    // 清理临时文件
    if (tempFile && tempFile.cleanupCallback) {
      tempFile.cleanupCallback();
    }
    
    return {
      success: false,
      message: `❌ 执行准备失败: ${error.message}`,
      error: error.message
    };
  }
}

// 执行Python脚本文件
async function executePythonFile(filePath, options = {}) {
  try {
    // 检查文件是否存在
    await fs.access(filePath);
    
    // 读取文件内容
    const code = await fs.readFile(filePath, 'utf-8');
    
    // 使用代码执行函数
    return await executePythonCode(code, options);
  } catch (error) {
    return {
      success: false,
      message: `❌ 读取脚本文件失败: ${error.message}`,
      error: error.message
    };
  }
}

// 格式化执行结果
function formatExecutionResult(result, options = {}) {
  const {
    code = '',
    file = '',
    args = [],
    timeout = 10000,
    pythonCmd = 'python'
  } = options;
  
  const output = {
    success: result.success,
    message: result.message,
    data: {
      executionInfo: {
        codePreview: code ? code.substring(0, 200) + (code.length > 200 ? '...' : '') : 'N/A',
        file: file || 'N/A',
        args: args,
        python: pythonCmd,
        timeout: `${timeout}ms`,
        executionTime: `${result.executionTime || 0}ms`
      },
      output: {
        stdout: result.stdout || '(无输出)',
        stderr: result.stderr || '(无错误)',
        exitCode: result.exitCode,
        killedByTimeout: result.killedByTimeout || false
      },
      safety: result.safety || { warnings: [], errors: [], safe: true },
      stats: {
        stdoutLines: result.stdout ? result.stdout.split('\n').length : 0,
        stderrLines: result.stderr ? result.stderr.split('\n').length : 0,
        stdoutLength: result.stdout ? result.stdout.length : 0,
        stderrLength: result.stderr ? result.stderr.length : 0
      }
    },
    tips: [
      '💡 使用 --timeout 参数调整执行超时时间',
      '💡 使用 --args 参数传递命令行参数',
      '💡 使用 --python 参数指定Python解释器路径'
    ]
  };
  
  // 添加安全警告提示
  if (result.safety && result.safety.warnings.length > 0) {
    output.tips.push('⚠️ 代码包含安全警告，请谨慎执行');
  }
  
  return output;
}

// 技能主函数
async function pythonRunnerSkill(params = {}) {
  const code = params.code;
  const file = params.file;
  const args = params.args ? params.args.split(' ') : [];
  const timeout = parseInt(params.timeout) || 10000;
  const pythonCmd = params.python || 'python';
  const cwd = params.cwd || process.cwd();
  
  // 验证参数
  if (!code && !file) {
    return {
      success: false,
      message: '❌ 错误：请提供Python代码或文件路径',
      example: 'python-runner --code "print(\"Hello\")" 或 python-runner --file "script.py"'
    };
  }
  
  if (code && file) {
    return {
      success: false,
      message: '❌ 错误：不能同时提供代码和文件参数',
      suggestion: '请选择使用 --code 或 --file 参数之一'
    };
  }
  
  let executionResult;
  
  try {
    if (code) {
      // 执行代码字符串
      executionResult = await executePythonCode(code, {
        args,
        timeout,
        pythonCmd,
        cwd
      });
    } else {
      // 执行脚本文件
      executionResult = await executePythonFile(file, {
        args,
        timeout,
        pythonCmd,
        cwd
      });
    }
    
    // 格式化结果
    return formatExecutionResult(executionResult, {
      code,
      file,
      args,
      timeout,
      pythonCmd
    });
  } catch (error) {
    return {
      success: false,
      message: `❌ 技能执行过程出错: ${error.message}`,
      error: error.message,
      suggestion: '请检查参数格式和系统环境'
    };
  }
}

// 导出技能函数
const skill = {
  name: 'python-runner',
  description: 'Python脚本执行技能，安全执行Python代码并返回结果',
  execute: pythonRunnerSkill,
  parameters: {
    code: {
      type: 'string',
      description: '要执行的Python代码字符串',
      optional: true
    },
    file: {
      type: 'string',
      description: '要执行的Python脚本文件路径',
      optional: true
    },
    args: {
      type: 'string',
      description: '传递给脚本的命令行参数（空格分隔）',
      optional: true
    },
    timeout: {
      type: 'number',
      description: '执行超时时间（毫秒，默认：10000）',
      optional: true,
      default: 10000
    },
    python: {
      type: 'string',
      description: 'Python解释器路径（默认：python）',
      optional: true,
      default: 'python'
    },
    cwd: {
      type: 'string',
      description: '工作目录（默认：当前目录）',
      optional: true
    }
  },
  examples: [
    {
      command: 'python-runner --code "print(\"Hello, World!\")"',
      description: '执行简单Python代码'
    },
    {
      command: 'python-runner --file "script.py" --args "arg1 arg2"',
      description: '执行Python脚本文件并传递参数'
    },
    {
      command: 'python-runner --code "for i in range(5): print(i)" --timeout 5000',
      description: '执行带超时控制的代码'
    },
    {
      command: 'python-runner --code "import math; print(math.pi)" --python "python3"',
      description: '指定Python解释器执行代码'
    }
  ]
};

module.exports = skill;