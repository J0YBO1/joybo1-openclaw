#!/usr/bin/env node
/**
 * OpenClaw batch-rename 技能入口文件
 * 批量重命名工具 - 支持前缀/后缀、正则表达式替换、文件过滤等功能
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 技能配置
const SKILL_CONFIG = {
  name: 'batch-rename',
  version: '2.0.0',
  description: '批量文件重命名工具',
  author: '黄冠',
  emoji: '📄🔄'
};

/**
 * 解析命令行参数
 */
function parseArgs(args) {
  const parsed = {
    path: null,
    prefix: '',
    suffix: '',
    full: false,
    noIndex: false,
    pattern: null,
    replacement: '',
    ext: [],
    exclude: [],
    recursive: false,
    preview: true,
    execute: false,
    dryRun: false,
    log: false,
    verbose: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--path':
        parsed.path = args[++i];
        break;
      case '--prefix':
        parsed.prefix = args[++i];
        break;
      case '--suffix':
        parsed.suffix = args[++i];
        break;
      case '--pattern':
        parsed.pattern = args[++i];
        break;
      case '--replacement':
        parsed.replacement = args[++i];
        break;
      case '--ext':
        // 支持多个扩展名
        while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          parsed.ext.push(args[++i]);
        }
        break;
      case '--exclude':
        // 支持多个排除扩展名
        while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          parsed.exclude.push(args[++i]);
        }
        break;
      case '--full':
        parsed.full = true;
        break;
      case '--no-index':
        parsed.noIndex = true;
        break;
      case '--recursive':
        parsed.recursive = true;
        break;
      case '--preview':
        parsed.preview = true;
        break;
      case '--execute':
        parsed.execute = true;
        parsed.preview = false;
        break;
      case '--dry-run':
        parsed.dryRun = true;
        parsed.preview = false;
        break;
      case '--log':
        parsed.log = true;
        break;
      case '--verbose':
      case '-v':
        parsed.verbose = true;
        break;
      case '--help':
      case '-h':
        parsed.help = true;
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`❌ 未知参数: ${arg}`);
          console.error('使用 --help 查看可用参数');
          process.exit(1);
        }
    }
  }

  return parsed;
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
${SKILL_CONFIG.emoji} ${SKILL_CONFIG.name} v${SKILL_CONFIG.version}
${SKILL_CONFIG.description}

用法:
  batch-rename --path <目录路径> [选项]

基本选项:
  --path <路径>        要处理的目录路径 (必需)
  --prefix <文本>      要添加的前缀
  --suffix <文本>      要添加的后缀
  --full              完全重命名，忽略原文件名
  --no-index          不添加序号（--full 模式下无效）

正则表达式选项:
  --pattern <正则>     正则表达式模式，用于匹配文件名
  --replacement <文本> 替换字符串，与 --pattern 一起使用

文件过滤选项:
  --ext <扩展名...>    只处理指定扩展名的文件（可多个）
  --exclude <扩展名...> 排除指定扩展名的文件（可多个）
  --recursive         递归处理子目录

执行控制选项:
  --execute           执行重命名操作（默认只预览）
  --dry-run           模拟执行，不实际修改文件
  --log               保存重命名日志
  --verbose, -v       显示详细输出
  --help, -h          显示此帮助信息

示例:
  # 预览添加前缀
  batch-rename --path ./photos --prefix "vacation_"

  # 执行添加前缀
  batch-rename --path ./photos --prefix "vacation_" --execute

  # 正则表达式替换
  batch-rename --path ./files --pattern "\\\\d+" --replacement "NUM" --preview

  # 只处理图片文件
  batch-rename --path ./media --ext .jpg .png --prefix "img_" --execute

  # 递归处理并保存日志
  batch-rename --path ./data --recursive --prefix "backup_" --execute --log

安全提示:
  • 始终先使用预览模式检查结果
  • 重要文件请先备份
  • 使用 --log 参数保存操作记录
  • 复杂规则先用 --dry-run 测试
`);
}

/**
 * 验证参数
 */
function validateArgs(args) {
  const errors = [];

  if (!args.path) {
    errors.push('必须指定 --path 参数');
  } else if (!fs.existsSync(args.path)) {
    errors.push(`目录不存在: ${args.path}`);
  } else {
    try {
      const stat = fs.statSync(args.path);
      if (!stat.isDirectory()) {
        errors.push(`不是目录: ${args.path}`);
      }
    } catch (err) {
      errors.push(`无法访问目录: ${args.path} (${err.message})`);
    }
  }

  if (args.pattern && !args.replacement) {
    errors.push('使用 --pattern 时必须同时指定 --replacement');
  }

  if (args.execute && args.dryRun) {
    errors.push('不能同时使用 --execute 和 --dry-run');
  }

  if (args.full && args.noIndex) {
    console.warn('⚠️  注意: --no-index 在 --full 模式下无效，将自动添加序号');
  }

  return errors;
}

/**
 * 运行Python脚本
 */
function runPythonScript(args) {
  return new Promise((resolve, reject) => {
    // 构建Python命令参数
    const pythonArgs = [
      path.join(__dirname, 'rename_optimized.py'),
      '--path', args.path
    ];

    if (args.prefix) pythonArgs.push('--prefix', args.prefix);
    if (args.suffix) pythonArgs.push('--suffix', args.suffix);
    if (args.full) pythonArgs.push('--full');
    if (args.noIndex) pythonArgs.push('--no-index');
    if (args.pattern) pythonArgs.push('--pattern', args.pattern);
    if (args.replacement) pythonArgs.push('--replacement', args.replacement);
    
    if (args.ext.length > 0) {
      pythonArgs.push('--ext', ...args.ext);
    }
    
    if (args.exclude.length > 0) {
      pythonArgs.push('--exclude', ...args.exclude);
    }
    
    if (args.recursive) pythonArgs.push('--recursive');
    if (args.execute) pythonArgs.push('--execute');
    if (args.dryRun) pythonArgs.push('--dry-run');
    if (args.log) pythonArgs.push('--log');
    if (args.verbose) pythonArgs.push('--verbose');

    // 检查Python脚本是否存在
    const scriptPath = path.join(__dirname, 'rename_optimized.py');
    if (!fs.existsSync(scriptPath)) {
      reject(new Error(`Python脚本不存在: ${scriptPath}`));
      return;
    }

    console.log(`🚀 启动批量重命名工具...`);
    if (args.verbose) {
      console.log(`📝 命令: python ${pythonArgs.join(' ')}`);
    }

    const pythonProcess = spawn('python', pythonArgs, {
      stdio: 'inherit',
      shell: true
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python脚本执行失败，退出码: ${code}`));
      }
    });

    pythonProcess.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error('未找到Python，请确保Python已安装并添加到PATH'));
      } else {
        reject(err);
      }
    });
  });
}

/**
 * 主函数
 */
async function main() {
  try {
    // 解析参数
    const args = parseArgs(process.argv.slice(2));

    // 显示帮助
    if (args.help) {
      showHelp();
      return;
    }

    // 验证参数
    const errors = validateArgs(args);
    if (errors.length > 0) {
      console.error('❌ 参数错误:');
      errors.forEach(error => console.error(`  • ${error}`));
      console.error('\n使用 --help 查看完整用法');
      process.exit(1);
    }

    // 显示技能信息
    console.log(`\n${SKILL_CONFIG.emoji} ${SKILL_CONFIG.name} v${SKILL_CONFIG.version}`);
    console.log('=' .repeat(50));

    // 运行Python脚本
    await runPythonScript(args);

    console.log('\n✨ 操作完成');
    
  } catch (error) {
    console.error(`\n❌ 错误: ${error.message}`);
    if (process.argv.includes('--verbose')) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// 如果是直接运行，执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error(`致命错误: ${error.message}`);
    process.exit(1);
  });
}

// 导出模块
module.exports = {
  SKILL_CONFIG,
  parseArgs,
  showHelp,
  validateArgs,
  runPythonScript,
  main
};