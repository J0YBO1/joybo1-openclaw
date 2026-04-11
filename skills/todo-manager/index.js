#!/usr/bin/env node
/**
 * todo-manager 技能 - Node.js包装器
 * 提供更好的OpenClaw集成和错误处理
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 配置
const CONFIG = {
  pythonScript: path.join(__dirname, 'todo_enhanced.py'),
  dataFile: path.join(__dirname, 'todo_enhanced.json'),
  backupDir: path.join(__dirname, 'backups')
};

// 确保备份目录存在
if (!fs.existsSync(CONFIG.backupDir)) {
  fs.mkdirSync(CONFIG.backupDir, { recursive: true });
}

// 帮助信息
function showHelp() {
  console.log(`
📝 Todo Manager v2.0 - 增强版待办事项管理器
=============================================

基础命令:
  todo add <任务名> [选项]     添加新任务
  todo list [选项]            列出任务
  todo view <任务ID>          查看任务详情
  todo edit <任务ID> [选项]   编辑任务
  todo done <任务ID>          标记任务为完成
  todo delete <任务ID>        删除任务
  todo clear                  清空所有任务
  todo stats                  显示统计信息
  todo backup                 备份任务数据
  todo restore <备份文件>     恢复任务数据

添加任务选项:
  --description, -d <描述>     任务描述
  --priority, -p <优先级>      优先级: 低/中/高/紧急
  --category, -c <分类>        任务分类
  --tags <标签1,标签2,...>     任务标签
  --due-date <日期>            截止日期 (YYYY-MM-DD 或 today/tomorrow/week)

列出任务选项:
  --all, -a                   显示所有任务
  --pending, -p               只显示待办任务
  --completed, -c             只显示已完成任务
  --overdue, -o               只显示过期任务
  --priority <优先级>         按优先级筛选
  --category <分类>           按分类筛选
  --search <关键词>           搜索任务
  --sort <字段>               排序字段: name/priority/created/due
  --reverse, -r               反向排序
  --detailed, -d              详细显示模式
  --export <格式>             导出格式: json/csv/markdown

编辑任务选项:
  --name, -n <新名称>         修改任务名称
  --description, -d <描述>     修改任务描述
  --priority, -p <优先级>      修改优先级
  --status <状态>             修改状态: 待办/进行中/已完成/已取消
  --category, -c <分类>        修改分类
  --tags <标签1,标签2,...>     修改标签 (空字符串清空标签)
  --due-date <日期>            修改截止日期 (空字符串清除日期)

统计信息:
  todo stats                  显示任务统计
  todo stats --json           以JSON格式输出统计

备份与恢复:
  todo backup                 创建备份 (自动时间戳)
  todo backup --name <名称>    指定备份名称
  todo restore <备份文件>      从备份恢复
  todo restore --list         列出所有备份

示例:
  # 添加一个高优先级任务
  todo add "完成项目报告" --priority 高 --category 工作 --due-date 2026-04-15
  
  # 列出所有待办任务并按优先级排序
  todo list --pending --sort priority --reverse
  
  # 搜索包含"报告"的任务
  todo list --search 报告
  
  # 查看任务详情
  todo view 1
  
  # 编辑任务
  todo edit 1 --priority 紧急 --status 进行中
  
  # 标记任务完成
  todo done 1
  
  # 显示统计
  todo stats
  
  # 创建备份
  todo backup
  `);
}

// 运行Python脚本
function runPythonScript(args, options = {}) {
  const pythonArgs = args.join(' ');
  const command = `python "${CONFIG.pythonScript}" ${pythonArgs}`;
  
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: __dirname,
      ...options
    });
    
    return {
      success: true,
      output: output.trim()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout?.toString() || error.stderr?.toString() || ''
    };
  }
}

// 备份任务数据
function backupTasks(backupName = null) {
  if (!fs.existsSync(CONFIG.dataFile)) {
    console.log('📭 没有任务数据可备份');
    return false;
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const name = backupName || `backup-${timestamp}`;
  const backupFile = path.join(CONFIG.backupDir, `${name}.json`);
  
  try {
    const data = fs.readFileSync(CONFIG.dataFile, 'utf8');
    fs.writeFileSync(backupFile, data, 'utf8');
    
    const stats = fs.statSync(CONFIG.dataFile);
    console.log(`✅ 备份创建成功: ${name}.json`);
    console.log(`   📁 位置: ${backupFile}`);
    console.log(`   📊 大小: ${formatSize(stats.size)}`);
    console.log(`   ⏰ 时间: ${new Date().toLocaleString()}`);
    
    return true;
  } catch (error) {
    console.error(`❌ 备份失败: ${error.message}`);
    return false;
  }
}

// 列出备份
function listBackups() {
  if (!fs.existsSync(CONFIG.backupDir)) {
    console.log('📭 备份目录不存在');
    return [];
  }
  
  const files = fs.readdirSync(CONFIG.backupDir)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(CONFIG.backupDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file.replace('.json', ''),
        path: filePath,
        size: stats.size,
        mtime: stats.mtime,
        formattedSize: formatSize(stats.size),
        formattedTime: stats.mtime.toLocaleString()
      };
    })
    .sort((a, b) => b.mtime - a.mtime);
  
  if (files.length === 0) {
    console.log('📭 没有找到备份文件');
    return [];
  }
  
  console.log('\n📂 可用备份:');
  console.log('=' .repeat(80));
  
  files.forEach((backup, index) => {
    console.log(`${index + 1}. ${backup.name}`);
    console.log(`   大小: ${backup.formattedSize} | 时间: ${backup.formattedTime}`);
    console.log(`   路径: ${backup.path}`);
    if (index < files.length - 1) console.log('');
  });
  
  console.log('=' .repeat(80));
  console.log(`总计: ${files.length} 个备份`);
  
  return files;
}

// 恢复备份
function restoreBackup(backupName) {
  let backupFile;
  
  // 检查是否是完整路径
  if (fs.existsSync(backupName)) {
    backupFile = backupName;
  } else {
    // 检查备份目录
    const backupPath = path.join(CONFIG.backupDir, `${backupName}.json`);
    if (fs.existsSync(backupPath)) {
      backupFile = backupPath;
    } else {
      // 尝试匹配部分名称
      const files = fs.readdirSync(CONFIG.backupDir)
        .filter(file => file.includes(backupName) && file.endsWith('.json'));
      
      if (files.length === 0) {
        console.log(`❌ 未找到备份: ${backupName}`);
        return false;
      } else if (files.length > 1) {
        console.log(`❌ 找到多个匹配的备份:`);
        files.forEach(file => console.log(`   - ${file.replace('.json', '')}`));
        console.log('请指定完整的备份名称');
        return false;
      } else {
        backupFile = path.join(CONFIG.backupDir, files[0]);
      }
    }
  }
  
  try {
    // 先备份当前数据
    if (fs.existsSync(CONFIG.dataFile)) {
      const currentBackup = path.join(CONFIG.backupDir, `pre-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
      fs.copyFileSync(CONFIG.dataFile, currentBackup);
      console.log(`📋 当前数据已备份到: ${path.basename(currentBackup)}`);
    }
    
    // 恢复备份
    const backupData = fs.readFileSync(backupFile, 'utf8');
    fs.writeFileSync(CONFIG.dataFile, backupData, 'utf8');
    
    const stats = fs.statSync(backupFile);
    console.log(`✅ 恢复成功: ${path.basename(backupFile)}`);
    console.log(`   📊 大小: ${formatSize(stats.size)}`);
    console.log(`   ⏰ 备份时间: ${fs.statSync(backupFile).mtime.toLocaleString()}`);
    
    return true;
  } catch (error) {
    console.error(`❌ 恢复失败: ${error.message}`);
    return false;
  }
}

// 导出数据
function exportData(format = 'json') {
  if (!fs.existsSync(CONFIG.dataFile)) {
    console.log('📭 没有任务数据可导出');
    return false;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf8'));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportFile = path.join(__dirname, `todo-export-${timestamp}.${format}`);
    
    let exportContent;
    
    switch (format.toLowerCase()) {
      case 'json':
        exportContent = JSON.stringify(data, null, 2);
        break;
        
      case 'csv':
        exportContent = convertToCSV(data);
        break;
        
      case 'markdown':
        exportContent = convertToMarkdown(data);
        break;
        
      default:
        console.log(`❌ 不支持的导出格式: ${format}`);
        return false;
    }
    
    fs.writeFileSync(exportFile, exportContent, 'utf8');
    console.log(`✅ 导出成功: ${path.basename(exportFile)}`);
    console.log(`   📁 位置: ${exportFile}`);
    console.log(`   📊 大小: ${formatSize(exportContent.length)}`);
    
    return true;
  } catch (error) {
    console.error(`❌ 导出失败: ${error.message}`);
    return false;
  }
}

// 转换为CSV
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }
  
  const headers = ['ID', '名称', '描述', '优先级', '状态', '分类', '标签', '创建时间', '更新时间', '截止日期', '完成时间'];
  const rows = [headers.join(',')];
  
  for (const task of data) {
    const row = [
      task.id,
      `"${task.name.replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
      task.priority,
      task.status,
      `"${task.category}"`,
      `"${(task.tags || []).join(';')}"`,
      task.created_at,
      task.updated_at,
      task.due_date || '',
      task.completed_at || ''
    ];
    rows.push(row.join(','));
  }
  
  return rows.join('\n');
}

// 转换为Markdown
function convertToMarkdown(data) {
  if (!data || data.length === 0) {
    return '# 待办事项\n\n暂无任务';
  }
  
  let markdown = `# 待办事项\n\n`;
  markdown += `导出时间: ${new Date().toLocaleString()}\n`;
  markdown += `任务总数: ${data.length}\n\n`;
  
  // 按状态分组
  const byStatus = {};
  for (const task of data) {
    const status = task.status;
    if (!byStatus[status]) {
      byStatus[status] = [];
    }
    byStatus[status].push(task);
  }
  
  for (const [status, tasks] of Object.entries(byStatus)) {
    markdown += `## ${status} (${tasks.length}个)\n\n`;
    
    for (const task of tasks) {
      markdown += `### ${task.name}\n\n`;
      markdown += `- **ID**: ${task.id}\n`;
      markdown += `- **优先级**: ${task.priority}\n`;
      markdown += `- **分类**: ${task.category}\n`;
      
      if (task.description) {
        markdown += `- **描述**: ${task.description}\n`;
      }
      
      if (task.tags && task.tags.length > 0) {
        markdown += `- **标签**: ${task.tags.map(t => `#${t}`).join(' ')}\n`;
      }
      
      markdown += `- **创建时间**: ${task.created_at}\n`;
      markdown += `- **更新时间**: ${task.updated_at}\n`;
      
      if (task.due_date) {
        markdown += `- **截止日期**: ${task.due_date}\n`;
      }
      
      if (task.completed_at) {
        markdown += `- **完成时间**: ${task.completed_at}\n`;
      }
      
      markdown += '\n';
    }
  }
  
  return markdown;
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }
  
  const command = args[0];
  const commandArgs = args.slice(1);
  
  switch (command) {
    case 'add':
    case 'list':
    case 'view':
    case 'edit':
    case 'done':
    case 'delete':
    case 'clear':
    case 'stats':
      // 直接传递给Python脚本
      const result = runPythonScript(args);
      if (result.success) {
        console.log(result.output);
      } else {
        console.error(`❌ 执行失败: ${result.error}`);
        if (result.output) {
          console.log(result.output);
        }
      }
      break;
      
    case 'backup':
      const backupNameIndex = commandArgs.indexOf('--name');
      let backupName = null;
      if (backupNameIndex !== -1 && commandArgs[backupNameIndex + 1]) {
        backupName = commandArgs[backupNameIndex + 1];
      }
      backupTasks(backupName);
      break;
      
    case 'restore':
      if (commandArgs.includes('--list')) {
        listBackups();
      } else if (commandArgs.length > 0) {
        const backupName = commandArgs[0];
        restoreBackup(backupName);
      } else {
        console.log('❌ 请指定要恢复的备份名称');
        console.log('   使用 todo restore --list 查看可用备份');
      }
      break;
      
    case 'export':
      const formatIndex = commandArgs.indexOf('--format');
      let format = 'json';
      if (formatIndex !== -1 && commandArgs[formatIndex + 1]) {
        format = commandArgs[formatIndex + 1];
      }
      exportData(format);
      break;
      
    default:
      console.log(`❌ 未知命令: ${command}`);
      console.log('使用 todo --help 查看可用命令');
      break;
  }
}

// 异常处理
process.on('unhandledRejection', (error) => {
  console.error(`未处理的拒绝: ${error.message}`);
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error(`执行出错: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runPythonScript,
  backupTasks,
  listBackups,
  restoreBackup,
  exportData,
  formatSize
};