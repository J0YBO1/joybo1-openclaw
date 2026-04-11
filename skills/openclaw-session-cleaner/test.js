#!/usr/bin/env node
/**
 * openclaw-session-cleaner 测试脚本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 测试配置
const TEST_CONFIG = {
  testDir: path.join(__dirname, 'test-sessions'),
  timeout: 10000
};

// 清理测试环境
function cleanupTestEnv() {
  if (fs.existsSync(TEST_CONFIG.testDir)) {
    fs.rmSync(TEST_CONFIG.testDir, { recursive: true, force: true });
  }
}

// 创建测试环境
function createTestEnv() {
  // 创建测试目录
  fs.mkdirSync(TEST_CONFIG.testDir, { recursive: true });
  
  // 创建测试session文件
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  // 创建main session（应该保留）
  fs.writeFileSync(
    path.join(TEST_CONFIG.testDir, 'main-current.jsonl'),
    JSON.stringify({ type: 'main', timestamp: now, data: '当前主会话' })
  );
  
  // 创建3天前的main session（应该保留）
  fs.writeFileSync(
    path.join(TEST_CONFIG.testDir, 'main-3days.jsonl'),
    JSON.stringify({ type: 'main', timestamp: now - (3 * oneDay), data: '3天前主会话' })
  );
  
  // 创建今天的cron session（应该保留）
  fs.writeFileSync(
    path.join(TEST_CONFIG.testDir, 'cron-today.jsonl'),
    JSON.stringify({ type: 'cron', timestamp: now, data: '今天cron会话' })
  );
  
  // 创建3天前的cron session（应该保留，如果keep-days=7）
  fs.writeFileSync(
    path.join(TEST_CONFIG.testDir, 'cron-3days.jsonl'),
    JSON.stringify({ type: 'cron', timestamp: now - (3 * oneDay), data: '3天前cron会话' })
  );
  
  // 创建10天前的cron session（应该清理）
  fs.writeFileSync(
    path.join(TEST_CONFIG.testDir, 'cron-10days.jsonl'),
    JSON.stringify({ type: 'cron', timestamp: now - (10 * oneDay), data: '10天前cron会话' })
  );
  
  // 创建15天前的cron session（应该清理）
  fs.writeFileSync(
    path.join(TEST_CONFIG.testDir, 'cron-15days.jsonl'),
    JSON.stringify({ type: 'cron', timestamp: now - (15 * oneDay), data: '15天前cron会话' })
  );
  
  // 创建其他文件
  fs.writeFileSync(
    path.join(TEST_CONFIG.testDir, 'config.json'),
    JSON.stringify({ setting: 'test' })
  );
  
  // 创建sessions.json
  const sessionsJson = {
    'main-current': { file: 'main-current.jsonl', type: 'main' },
    'main-3days': { file: 'main-3days.jsonl', type: 'main' },
    'cron-today': { file: 'cron-today.jsonl', type: 'cron' },
    'cron-3days': { file: 'cron-3days.jsonl', type: 'cron' },
    'cron-10days': { file: 'cron-10days.jsonl', type: 'cron' },
    'cron-15days': { file: 'cron-15days.jsonl', type: 'cron' },
    'deleted-session': { file: 'deleted-file.jsonl', type: 'cron' } // 不存在的文件引用
  };
  
  fs.writeFileSync(
    path.join(TEST_CONFIG.testDir, 'sessions.json'),
    JSON.stringify(sessionsJson, null, 2)
  );
  
  console.log('✅ 测试环境创建完成');
  console.log(`📁 测试目录: ${TEST_CONFIG.testDir}`);
}

// 运行命令
function runCommand(command, env = {}) {
  try {
    const fullEnv = { ...process.env, ...env };
    const output = execSync(command, { 
      encoding: 'utf8',
      timeout: TEST_CONFIG.timeout,
      env: fullEnv
    });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout?.toString() || error.stderr?.toString() || ''
    };
  }
}

// 测试1: 统计功能
function testStats() {
  console.log('\n=== 测试1: 统计功能 ===');
  
  const result = runCommand(`node "${path.join(__dirname, 'index.js')}" --stats-only`, {
    HOME: __dirname,
    USERPROFILE: __dirname
  });
  
  if (result.success) {
    const output = result.output;
    console.log('📊 统计输出:');
    console.log(output.substring(0, 500) + '...');
    
    // 检查关键信息
    if (output.includes('总文件数') && output.includes('.jsonl文件')) {
      console.log('✅ 测试通过: 统计功能正常');
      return true;
    } else {
      console.log('❌ 测试失败: 统计输出格式异常');
      return false;
    }
  } else {
    console.log('❌ 测试失败: 命令执行异常');
    console.log(`错误: ${result.error}`);
    return false;
  }
}

// 测试2: 干运行模式
function testDryRun() {
  console.log('\n=== 测试2: 干运行模式 ===');
  
  const result = runCommand(`node "${path.join(__dirname, 'index.js')}" --dry-run --keep-days 7 --force`, {
    HOME: __dirname,
    USERPROFILE: __dirname
  });
  
  if (result.success) {
    const output = result.output;
    
    // 检查是否包含预览信息
    if (output.includes('干运行模式') && output.includes('将删除') && output.includes('cron-10days') && output.includes('cron-15days')) {
      console.log('✅ 测试通过: 干运行模式正常');
      
      // 验证文件未被删除
      const files = fs.readdirSync(TEST_CONFIG.testDir);
      const shouldExist = ['cron-10days.jsonl', 'cron-15days.jsonl'];
      const allExist = shouldExist.every(file => files.includes(file));
      
      if (allExist) {
        console.log('✅ 文件未被删除（符合预期）');
        return true;
      } else {
        console.log('❌ 文件被意外删除');
        return false;
      }
    } else {
      console.log('❌ 测试失败: 干运行输出异常');
      return false;
    }
  } else {
    console.log('❌ 测试失败: 命令执行异常');
    console.log(`错误: ${result.error}`);
    return false;
  }
}

// 测试3: 实际清理
function testCleanup() {
  console.log('\n=== 测试3: 实际清理 ===');
  
  // 先备份测试环境
  const backupDir = TEST_CONFIG.testDir + '-backup';
  if (fs.existsSync(backupDir)) {
    fs.rmSync(backupDir, { recursive: true });
  }
  fs.cpSync(TEST_CONFIG.testDir, backupDir, { recursive: true });
  
  const result = runCommand(`node "${path.join(__dirname, 'index.js')}" --keep-days 7 --force`, {
    HOME: __dirname,
    USERPROFILE: __dirname
  });
  
  if (result.success) {
    const output = result.output;
    
    // 检查清理结果
    const files = fs.readdirSync(TEST_CONFIG.testDir);
    
    // 应该被保留的文件
    const shouldKeep = [
      'main-current.jsonl',
      'main-3days.jsonl', 
      'cron-today.jsonl',
      'cron-3days.jsonl',
      'config.json',
      'sessions.json'
    ];
    
    // 应该被删除的文件
    const shouldDelete = [
      'cron-10days.jsonl',
      'cron-15days.jsonl'
    ];
    
    const keptCorrectly = shouldKeep.every(file => files.includes(file));
    const deletedCorrectly = shouldDelete.every(file => !files.includes(file));
    
    if (keptCorrectly && deletedCorrectly) {
      console.log('✅ 测试通过: 清理功能正常');
      console.log(`   保留文件: ${shouldKeep.length} 个`);
      console.log(`   删除文件: ${shouldDelete.length} 个`);
      
      // 检查sessions.json是否重建
      try {
        const sessionsData = JSON.parse(fs.readFileSync(path.join(TEST_CONFIG.testDir, 'sessions.json'), 'utf8'));
        const deletedRefExists = 'deleted-session' in sessionsData;
        
        if (!deletedRefExists) {
          console.log('✅ sessions.json 已正确重建');
          return true;
        } else {
          console.log('❌ sessions.json 未正确重建');
          return false;
        }
      } catch (error) {
        console.log(`❌ 读取sessions.json失败: ${error.message}`);
        return false;
      }
    } else {
      console.log('❌ 测试失败: 文件清理结果异常');
      console.log(`   应该保留但缺失: ${shouldKeep.filter(f => !files.includes(f)).join(', ')}`);
      console.log(`   应该删除但存在: ${shouldDelete.filter(f => files.includes(f)).join(', ')}`);
      return false;
    }
  } else {
    console.log('❌ 测试失败: 命令执行异常');
    console.log(`错误: ${result.error}`);
    return false;
  }
}

// 测试4: 只重建索引
function testRebuildOnly() {
  console.log('\n=== 测试4: 只重建索引 ===');
  
  // 恢复测试环境
  cleanupTestEnv();
  createTestEnv();
  
  const result = runCommand(`node "${path.join(__dirname, 'index.js')}" --rebuild-only --force`, {
    HOME: __dirname,
    USERPROFILE: __dirname
  });
  
  if (result.success) {
    const output = result.output;
    
    if (output.includes('sessions.json 已重建') || output.includes('sessions.json 重建统计')) {
      console.log('✅ 测试通过: 索引重建功能正常');
      
      // 验证文件未被删除
      const files = fs.readdirSync(TEST_CONFIG.testDir);
      const allFilesExist = [
        'cron-10days.jsonl', 
        'cron-15days.jsonl',
        'deleted-file.jsonl' // 这个文件实际上不存在，但引用应该被移除
      ].every(file => file === 'deleted-file.jsonl' || files.includes(file));
      
      if (allFilesExist) {
        console.log('✅ 文件未被删除（符合预期）');
        return true;
      } else {
        console.log('❌ 文件被意外删除');
        return false;
      }
    } else {
      console.log('❌ 测试失败: 重建输出异常');
      return false;
    }
  } else {
    console.log('❌ 测试失败: 命令执行异常');
    console.log(`错误: ${result.error}`);
    return false;
  }
}

// 测试5: 错误处理
function testErrorHandling() {
  console.log('\n=== 测试5: 错误处理 ===');
  
  // 测试不存在的目录
  const result = runCommand(`node "${path.join(__dirname, 'index.js')}" --stats-only`, {
    HOME: '/nonexistent/path',
    USERPROFILE: '/nonexistent/path'
  });
  
  if (!result.success) {
    // 命令应该失败
    if (result.output.includes('Session目录不存在') || result.error.includes('ENOENT')) {
      console.log('✅ 测试通过: 错误处理正常（目录不存在）');
      return true;
    } else {
      console.log('❌ 测试失败: 错误处理异常');
      return false;
    }
  } else {
    console.log('❌ 测试失败: 命令应该失败但成功了');
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('开始 openclaw-session-cleaner 技能测试');
  console.log('='.repeat(50));
  
  try {
    // 准备测试环境
    cleanupTestEnv();
    createTestEnv();
    
    // 临时修改index.js中的路径配置
    const indexJsPath = path.join(__dirname, 'index.js');
    let indexJsContent = fs.readFileSync(indexJsPath, 'utf8');
    
    // 替换路径配置为测试目录
    indexJsContent = indexJsContent.replace(
      /const CONFIG = {[^}]+}/s,
      `const CONFIG = {
  sessionsDir: path.join(__dirname, 'test-sessions'),
  sessionsJson: path.join(__dirname, 'test-sessions', 'sessions.json'),
  mainSessionPrefix: 'main-',
  cronSessionPrefix: 'cron-',
  keepDays: 7,
  dryRun: false
}`
    );
    
    fs.writeFileSync(indexJsPath, indexJsContent);
    
    // 运行测试
    const tests = [
      { name: '统计功能', func: testStats },
      { name: '干运行模式', func: testDryRun },
      { name: '实际清理', func: testCleanup },
      { name: '只重建索引', func: testRebuildOnly },
      { name: '错误处理', func: testErrorHandling }
    ];
    
    let allPassed = true;
    for (const test of tests) {
      console.log(`\n运行测试: ${test.name}`);
      const passed = test.func();
      if (!passed) {
        allPassed = false;
        console.log(`❌ ${test.name} 测试失败`);
        break;
      }
    }
    
    // 恢复原始index.js
    const originalConfig = `const CONFIG = {
  sessionsDir: path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'agents', 'main', 'sessions'),
  sessionsJson: path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'agents', 'main', 'sessions.json'),
  mainSessionPrefix: 'main-',
  cronSessionPrefix: 'cron-',
  keepDays: 7,
  dryRun: false
}`;
    
    indexJsContent = indexJsContent.replace(
      /const CONFIG = {[^}]+}/s,
      originalConfig
    );
    fs.writeFileSync(indexJsPath, indexJsContent);
    
    // 清理测试环境
    cleanupTestEnv();
    
    // 输出结果
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
      console.log('🎉 所有测试通过!');
      console.log('openclaw-session-cleaner 技能功能正常');
    } else {
      console.log('💥 测试失败，请检查技能实现');
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
  runTests();
}

module.exports = {
  runTests,
  testStats,
  testDryRun,
  testCleanup,
  testRebuildOnly,
  testErrorHandling
};