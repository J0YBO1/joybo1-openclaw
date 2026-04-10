/**
 * File Reader Skill - 文件读取技能
 * 作者：joyboy
 * 创建时间：2026年4月10日
 */

const fs = require('fs').promises;
const path = require('path');
const { parse: parseCSV } = require('csv-parse/sync');
const yaml = require('js-yaml');
const toml = require('toml');

// 支持的文件格式和对应的扩展名
const SUPPORTED_FORMATS = {
  // 文本文件
  'txt': 'text',
  'md': 'markdown',
  'json': 'json',
  'js': 'javascript',
  'html': 'html',
  'css': 'css',
  'xml': 'xml',
  
  // 数据文件
  'csv': 'csv',
  'tsv': 'tsv',
  
  // 配置文件
  'yaml': 'yaml',
  'yml': 'yaml',
  'toml': 'toml',
  'ini': 'ini',
  
  // 代码文件
  'py': 'python',
  'java': 'java',
  'cpp': 'cpp',
  'go': 'go',
  'rs': 'rust'
};

// 获取文件扩展名
function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase().slice(1);
}

// 检测文件格式
function detectFileFormat(filePath, userFormat) {
  if (userFormat && SUPPORTED_FORMATS[userFormat.toLowerCase()]) {
    return userFormat.toLowerCase();
  }
  
  const ext = getFileExtension(filePath);
  if (SUPPORTED_FORMATS[ext]) {
    return ext;
  }
  
  return 'unknown';
}

// 读取文本文件
async function readTextFile(filePath, encoding = 'utf-8') {
  try {
    const content = await fs.readFile(filePath, encoding);
    return {
      success: true,
      content,
      type: 'text'
    };
  } catch (error) {
    return {
      success: false,
      error: `读取文件失败: ${error.message}`,
      type: 'text'
    };
  }
}

// 读取JSON文件
async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      success: true,
      content: JSON.stringify(parsed, null, 2), // 美化输出
      parsed,
      type: 'json'
    };
  } catch (error) {
    return {
      success: false,
      error: `解析JSON失败: ${error.message}`,
      type: 'json'
    };
  }
}

// 读取CSV文件
async function readCsvFile(filePath, delimiter = ',') {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const records = parseCSV(content, {
      columns: true,
      skip_empty_lines: true,
      delimiter: delimiter
    });
    
    return {
      success: true,
      content,
      parsed: records,
      type: 'csv',
      stats: {
        rows: records.length,
        columns: records.length > 0 ? Object.keys(records[0]).length : 0
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `解析CSV失败: ${error.message}`,
      type: 'csv'
    };
  }
}

// 读取YAML文件
async function readYamlFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = yaml.load(content);
    return {
      success: true,
      content,
      parsed,
      type: 'yaml'
    };
  } catch (error) {
    return {
      success: false,
      error: `解析YAML失败: ${error.message}`,
      type: 'yaml'
    };
  }
}

// 读取TOML文件
async function readTomlFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = toml.parse(content);
    return {
      success: true,
      content,
      parsed,
      type: 'toml'
    };
  } catch (error) {
    return {
      success: false,
      error: `解析TOML失败: ${error.message}`,
      type: 'toml'
    };
  }
}

// 根据格式选择读取器
async function readFileByFormat(filePath, format, options = {}) {
  const formatHandlers = {
    'json': readJsonFile,
    'csv': () => readCsvFile(filePath, ','),
    'tsv': () => readCsvFile(filePath, '\t'),
    'yaml': readYamlFile,
    'yml': readYamlFile,
    'toml': readTomlFile
  };
  
  const handler = formatHandlers[format];
  if (handler) {
    return await handler(filePath);
  }
  
  // 默认使用文本读取器
  return await readTextFile(filePath, options.encoding || 'utf-8');
}

// 获取文件信息
async function getFileInfo(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      exists: true,
      size: stats.size,
      sizeFormatted: formatFileSize(stats.size),
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 预览内容（限制行数）
function previewContent(content, maxLines = 50) {
  if (!content) return '';
  
  const lines = content.split('\n');
  if (lines.length <= maxLines) {
    return content;
  }
  
  const preview = lines.slice(0, maxLines).join('\n');
  return preview + `\n\n... (已省略 ${lines.length - maxLines} 行，共 ${lines.length} 行)`;
}

// 技能主函数
async function fileReaderSkill(params = {}) {
  const filePath = params.path;
  const format = params.format;
  const maxLines = parseInt(params.lines) || 50;
  const encoding = params.encoding || 'utf-8';
  
  // 验证参数
  if (!filePath) {
    return {
      success: false,
      message: '❌ 错误：请提供文件路径（使用 --path 参数）',
      example: 'file-reader --path "data.json"'
    };
  }
  
  // 获取文件信息
  const fileInfo = await getFileInfo(filePath);
  
  if (!fileInfo.exists) {
    return {
      success: false,
      message: `❌ 错误：文件不存在或无法访问\n路径：${filePath}`,
      suggestion: '请检查文件路径是否正确，以及是否有读取权限'
    };
  }
  
  if (fileInfo.isDirectory) {
    return {
      success: false,
      message: `❌ 错误：指定路径是目录，不是文件\n路径：${filePath}`,
      suggestion: '请提供具体的文件路径'
    };
  }
  
  // 检测文件格式
  const detectedFormat = detectFileFormat(filePath, format);
  
  if (detectedFormat === 'unknown') {
    return {
      success: false,
      message: `❌ 错误：不支持的文件格式\n文件：${filePath}\n扩展名：${getFileExtension(filePath)}`,
      suggestion: '支持的文件格式：' + Object.keys(SUPPORTED_FORMATS).join(', ')
    };
  }
  
  // 读取文件
  const startTime = Date.now();
  const readResult = await readFileByFormat(filePath, detectedFormat, { encoding });
  const readTime = Date.now() - startTime;
  
  if (!readResult.success) {
    return {
      success: false,
      message: `❌ 读取文件失败\n文件：${filePath}\n格式：${detectedFormat}\n错误：${readResult.error}`,
      suggestion: '请检查文件内容是否符合格式要求'
    };
  }
  
  // 构建结果
  const contentPreview = previewContent(readResult.content, maxLines);
  const lineCount = readResult.content.split('\n').length;
  const charCount = readResult.content.length;
  
  const result = {
    success: true,
    message: `📄 文件读取成功：${path.basename(filePath)}`,
    data: {
      fileInfo: {
        path: filePath,
        name: path.basename(filePath),
        size: fileInfo.sizeFormatted,
        format: detectedFormat,
        formatName: SUPPORTED_FORMATS[detectedFormat] || detectedFormat,
        modified: fileInfo.modified.toLocaleString('zh-CN'),
        lines: lineCount,
        characters: charCount
      },
      content: contentPreview,
      stats: {
        readTime: `${readTime}ms`,
        previewLines: Math.min(maxLines, lineCount),
        totalLines: lineCount,
        totalCharacters: charCount
      },
      formatSpecific: readResult.parsed ? {
        hasParsedData: true,
        dataType: Array.isArray(readResult.parsed) ? 'array' : 'object',
        itemCount: Array.isArray(readResult.parsed) ? readResult.parsed.length : 'N/A'
      } : {
        hasParsedData: false
      }
    },
    tips: [
      `💡 使用 --lines 参数调整预览行数（当前：${maxLines}行）`,
      `💡 使用 --format 参数指定文件格式（检测到：${detectedFormat}）`,
      `💡 使用 --encoding 参数指定编码（当前：${encoding}）`
    ]
  };
  
  return result;
}

// 导出技能函数
const skill = {
  name: 'file-reader',
  description: '文件读取技能，支持多种文件格式的读取和预览',
  execute: fileReaderSkill,
  parameters: {
    path: {
      type: 'string',
      description: '要读取的文件路径',
      optional: false
    },
    format: {
      type: 'string',
      description: '文件格式（自动检测，可手动指定）',
      optional: true
    },
    lines: {
      type: 'number',
      description: '预览行数（默认：50行）',
      optional: true,
      default: 50
    },
    encoding: {
      type: 'string',
      description: '文件编码（默认：utf-8）',
      optional: true,
      default: 'utf-8'
    }
  },
  examples: [
    {
      command: 'file-reader --path "data.json"',
      description: '读取JSON文件'
    },
    {
      command: 'file-reader --path "data.csv" --lines 20',
      description: '读取CSV文件，预览20行'
    },
    {
      command: 'file-reader --path "config.yaml" --format yaml',
      description: '指定格式读取YAML文件'
    }
  ]
};

module.exports = skill;