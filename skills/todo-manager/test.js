#!/usr/bin/env node
/**
 * todo-manager 测试脚本
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  testDataFile: path.join(__dirname, 'test_todo.json'),
  timeout: 5000
};

// 清理测试环境
function cleanupTestEnv() {
  const filesToClean = [
    TEST_CONFIG.testDataFile,
    path.join(__dirname, 'todo_enhanced.json'),
    path.join(__dirname, 'backups'),
    path.join(__dirname, 'todo-export-*.json'),
    path.join(__dirname, 'todo-export-*.csv'),
    path.join(__dirname, 'todo-export-*.md')
  ];
  
  filesToClean.forEach(file => {
    if (fs.existsSync(file)) {
      if (fs.statSync(file).isDirectory()) {
        fs.rmSync(file, { recursive: true, force: true });
      } else {
        fs.unlinkSync(file);
      }
    }
  });
}

// 运行命令
function runCommand(command, env = {}) {
  try {
    const fullEnv = { ...process.env, ...env };
    const output = execSync(command, { 
      encoding: 'utf8',
      timeout: TEST_CONFIG.timeout,
      env: fullEnv,
      cwd: __dirname
    });
    return { success: true, output: output.trim() };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout?.toString() || error.stderr?.toString() || ''
    };
  }
}

// 测试1: 基本功能测试
function testBasicFunctions() {
  console.log('\n=== 测试1: 基本功能 ===');
  
  const tests = [
    {
      name: '添加任务',
      command: 'node index.js add "测试任务1"',
      check: output => output.includes('任务已添加') && output.includes('测试任务1')
    },
    {
      name: '查看任务',
      command: 'node index.js list',
      check: output => output.includes('测试任务1') && output.includes('⏳')
    },
    {
      name: '查看任务详情',
      command: 'node index.js view 1',
      check: output => output.includes('任务 #1') && output.includes('测试任务1')
    },
    {
      name: '标记任务完成',
      command: 'node index.js done 1',
      check: output => output.includes('任务已完成') && output.includes('测试任务1')
    },
    {
      name: '查看已完成任务',
      command: 'node index.js list --completed',
      check: output => output.includes('测试任务1') && output.includes('✅')
    },
    {
      name: '删除任务',
      command: 'node index.js delete 1',
      check: output => output.includes('任务 #1 已删除')
    },
    {
      name: '清空任务',
      command: 'node index.js clear',
      check: output => output.includes('已清空')
    }
  ];
  
  let allPassed = true;
  for (const test of tests) {
    console.log(`运行: ${test.name}`);
    const result = runCommand(test.command);
    
    if (result.success && test.check(result.output)) {
      console.log(`  ✅ ${test.name} 通过`);
    } else {
      console.log(`  ❌ ${test.name} 失败`);
      console.log(`     输出: ${result.output.substring(0, 200)}...`);
      if (result.error) console.log(`     错误: ${result.error}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// 测试2: 高级功能测试
function testAdvancedFunctions() {
  console.log('\n=== 测试2: 高级功能 ===');
  
  // 先添加一些测试任务
  const setupCommands = [
    'node index.js add "高优先级任务" --priority high --category 工作 --tags "重要,紧急" --due-date tomorrow',
    'node index.js add "中优先级任务" --priority medium --category 学习 --tags "学习,编程"',
    'node index.js add "低优先级任务" --priority low --category 生活 --due-date 2026-01-01', // 过期任务
    'node index.js add "已完成任务" --priority medium --category 工作',
    'node index.js done 4' // 标记第4个任务为完成
  ];
  
  for (const cmd of setupCommands) {
    runCommand(cmd);
  }
  
  const tests = [
    {
      name: '按优先级筛选',
      command: 'node index.js list --priority high',
      check: output => output.includes('高优先级任务') && !output.includes('中优先级任务')
    },
    {
      name: '按分类筛选',
      command: 'node index.js list --category 工作',
      check: output => output.includes('高优先级任务') && output.includes('已完成任务')
    },
    {
      name: '搜索任务',
      command: 'node index.js list --search 优先级',
      check: output => output.includes('高优先级任务') && output.includes('中优先级任务') && output.includes('低优先级任务')
    },
    {
      name: '查看过期任务',
      command: 'node index.js list --overdue',
      check: output => output.includes('低优先级任务') && output.includes('过期')
    },
    {
      name: '详细显示模式',
      command: 'node index.js list --detailed',
      check: output => output.includes('任务 #') && output.includes('优先级:') && output.includes('分类:')
    },
    {
      name: '排序功能',
      command: 'node index.js list --sort priority --reverse',
      check: output => {
        const lines = output.split('\n');
        const taskLines = lines.filter(l => l.includes('任务'));
        return taskLines.length > 0;
      }
    }
  ];
  
  let allPassed = true;
  for (const test of tests) {
    console.log(`运行: ${test.name}`);
    const result = runCommand(test.command);
    
    if (result.success && test.check(result.output)) {
      console.log(`  ✅ ${test.name} 通过`);
    } else {
      console.log(`  ❌ ${test.name} 失败`);
      console.log(`     输出: ${result.output.substring(0, 200)}...`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// 测试3: 编辑功能测试
function testEditFunctions() {
  console.log('\n=== 测试3: 编辑功能 ===');
  
  // 添加一个测试任务
  runCommand('node index.js add "待编辑任务" --category 测试 --priority medium');
  
  const tests = [
    {
      name: '编辑任务名称',
      command: 'node index.js edit 5 --name "新任务名称"',
      check: output => output.includes('任务已更新') && output.includes('新任务名称')
    },
    {
      name: '编辑任务优先级',
      command: 'node index.js edit 5 --priority urgent',
      check: output => output.includes('任务已更新')
    },
    {
      name: '编辑任务状态',
      command: 'node index.js edit 5 --status in_progress',
      check: output => output.includes('任务已更新')
    },
    {
      name: '编辑任务分类',
      command: 'node index.js edit 5 --category 新分类',
      check: output => output.includes('任务已更新')
    },
    {
      name: '编辑任务标签',
      command: 'node index.js edit 5 --tags "标签1,标签2,标签3"',
      check: output => output.includes('任务已更新')
    },
    {
      name: '清除任务标签',
      command: 'node index.js edit 5 --tags ""',
      check: output => output.includes('任务已更新')
    },
    {
      name: '编辑截止日期',
      command: 'node index.js edit 5 --due-date 2026-12-31',
      check: output => output.includes('任务已更新')
    },
    {
      name: '清除截止日期',
      command: 'node index.js edit 5 --due-date ""',
      check: output => output.includes('任务已更新')
    }
  ];
  
  let allPassed = true;
  for (const test of tests) {
    console.log(`运行: ${test.name}`);
    const result = runCommand(test.command);
    
    if (result.success && test.check(result.output)) {
      console.log(`  ✅ ${test.name} 通过`);
    } else {
      console.log(`  ❌ ${test.name} 失败`);
      console.log(`     输出: ${result.output.substring(0, 200)}...`);
      if (result.error) console.log(`     错误: ${result.error}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// 测试4: 统计功能测试
function testStatsFunctions() {
  console.log('\n=== 测试4: 统计功能 ===');
  
  const tests = [
    {
      name: '基本统计',
      command: 'node index.js stats',
      check: output => output.includes('任务统计信息') && output.includes('总任务数:')
    },
    {
      name: 'JSON统计',
      command: 'node index.js stats --json',
      check: output => {
        try {
          const data = JSON.parse(output);
          return typeof data.total === 'number' && typeof data.by_priority === 'object';
        } catch {
          return false;
        }
      }
    }
  ];
  
  let allPassed = true;
  for (const test of tests) {
    console.log(`运行: ${test.name}`);
    const result = runCommand(test.command);
    
    if (result.success && test.check(result.output)) {
      console.log(`  ✅ ${test.name} 通过`);
    } else {
      console.log(`  ❌ ${test.name} 失败`);
      console.log(`     输出: ${result.output.substring(0, 200)}...`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// 测试5: 备份恢复功能测试
function testBackupFunctions() {
  console.log('\n=== 测试5: 备份恢复功能 ===');
  
  // 先清空并添加一个测试任务
  runCommand('node index.js clear');
  runCommand('node index.js add "备份测试任务" --category 测试');
  
  const tests = [
    {
      name: '创建备份',
      command: 'node index.js backup',
      check: output => output.includes('备份创建成功')
    },
    {
      name: '列出备份',
      command: 'node index.js restore --list',
      check: output => output.includes('可用备份') && output.includes('备份测试任务')
    },
    {
      name: '删除任务后恢复',
      setup: 'node index.js delete 1',
      command: 'node index.js restore backup-',
      check: output => output.includes('恢复成功')
    },
    {
      name: '验证恢复结果',
      command: 'node index.js list',
      check: output => output.includes('备份测试任务')
    }
  ];
  
  let allPassed = true;
  for (const test of tests) {
    console.log(`运行: ${test.name}`);
    
    // 执行setup命令
    if (test.setup) {
      runCommand(test.setup);
    }
    
    const result = runCommand(test.command);
    
    if (result.success && test.check(result.output)) {
      console.log(`  ✅ ${test.name} 通过`);
    } else {
      console.log(`  ❌ ${test.name} 失败`);
      console.log(`     输出: ${result.output.substring(0, 200)}...`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// 测试6: 导出功能测试
function testExportFunctions() {
  console.log('\n=== 测试6: 导出功能 ===');
  
  const tests = [
    {
      name: '导出JSON',
      command: 'node index.js export --format json',
      check: output => output.includes('导出成功') && output.includes('.json')
    },
    {
      name: '导出CSV',
      command: 'node index.js export --format csv',
      check: output => output.includes('导出成功') && output.includes('.csv')
    },
    {
      name: '导出Markdown',
      command: 'node index.js export --format markdown',
      check: output => output.includes('导出成功') && output.includes('.md')
    }
  ];
  
  let allPassed = true;
  for (const test of tests) {
    console.log(`运行: ${test.name}`);
    const result = runCommand(test.command);
    
    if (result.success && test.check(result.output)) {
      console.log(`  ✅ ${test.name} 通过`);
      
      // 清理导出文件
      const exportMatch = result.output.match(/导出成功: (.+)/);
      if (exportMatch) {
        const exportFile = path.join(__dirname, exportMatch[1]);
        if (fs.existsSync(exportFile)) {
          fs.unlinkSync(exportFile);
        }
      }
    } else {
      console.log(`  ❌ ${test.name} 失败`);
      console.log(`     输出: ${result.output.substring(0, 200)}...`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// 测试7: 错误处理测试
function testErrorHandling() {
  console.log('\n=== 测试7: 错误处理 ===');
  
  const tests = [
    {
      name: '无效任务ID',
      command: 'node index.js view 999',
      check: output => output.includes('未找到任务')
    },
    {
      name: '无效优先级',
      command: 'node index.js add "测试" --priority invalid',
      check: output => output.includes('invalid choice')
    },
    {
      name: '无效日期格式',
      command: 'node index.js add "测试" --due-date 2026/04/15',
      check: output => output.includes('无效的日期格式')
    },
    {
      name: '重复任务',
      command: 'node index.js add "重复任务测试"',
      setup: 'node index.js add "重复任务测试"',
      check: output => output.includes('已存在')
    }
  ];
  
  let allPassed = true;
  for (const test of tests) {
    console.log(`运行: ${test.name}`);
    
    // 执行setup命令
    if (test.setup) {
      runCommand(test.setup);
    }
    
    const result = runCommand(test.command);
    
    // 对于错误处理测试，我们期望命令失败或有错误信息
    if ((!result.success || test.check(result.output))) {
      console.log(`  ✅ ${test.name} 通过（正确处理错误）`);
    } else {
      console.log(`  ❌ ${test.name} 失败（未正确处理错误）`);
      console.log(`     输出: ${result.output.substring(0, 200)}...`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// 主测试函数
async function runAllTests() {
  console.log('开始 todo-manager 技能测试');
  console.log('='.repeat(60));
  
  try {
    // 清理测试环境
    cleanupTestEnv();
    
    // 运行所有测试
    const testSuites = [
      { name: '基本功能', func: testBasicFunctions },
      { name: '高级功能', func: testAdvancedFunctions },
      { name: '编辑功能', func: testEditFunctions },
      { name: '统计功能', func: testStatsFunctions },
      { name: '备份恢复', func: testBackupFunctions },
      { name: '导出功能', func: testExportFunctions },
      { name: '错误处理', func: testErrorHandling }
    ];
    
    let allPassed = true;
    const results = [];
    
    for (const suite of testSuites) {
      console.log(`\n运行测试套件: ${suite.name}`);
      const passed = suite.func();
      results.push({ suite: suite.name, passed });
      
      if (!passed) {
        allPassed = false;
        console.log(`❌ ${suite.name} 测试失败`);
      }
    }
    
    // 最终清理
    cleanupTestEnv();
    
    // 输出结果
    console.log('\n' + '='.repeat(60));
    console.log('测试结果汇总:');
    console.log('='.repeat(60));
    
    results.forEach(result => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.suite}`);
    });
    
    console.log('='.repeat(60));
    
    if (allPassed) {
      console.log('🎉 所有测试通过!');
      console.log('todo-manager 技能功能正常，可以发布');
    } else {
      console.log('💥 部分测试失败，请检查技能实现');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    cleanupTestEnv();
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testBasicFunctions,
  testAdvancedFunctions,
  testEditFunctions,
  testStatsFunctions,
  testBackupFunctions,
  testExportFunctions,
  testErrorHandling,
  cleanupTestEnv
};