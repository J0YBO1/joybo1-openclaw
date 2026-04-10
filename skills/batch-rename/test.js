#!/usr/bin/env node
/**
 * batch-rename 技能测试脚本
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试目录
const TEST_DIR = path.join(__dirname, 'test_rename');
const TEST_FILES = [
  'test1.txt',
  'test2.txt',
  'test3.txt',
  'image.jpg',
  'document.pdf'
];

/**
 * 创建测试文件
 */
function createTestFiles() {
  console.log('🧪 创建测试文件...');
  
  // 确保测试目录存在
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }
  
  // 清理旧文件
  const files = fs.readdirSync(TEST_DIR);
  files.forEach(file => {
    const filePath = path.join(TEST_DIR, file);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  });
  
  // 创建新测试文件
  TEST_FILES.forEach(filename => {
    const filePath = path.join(TEST_DIR, filename);
    fs.writeFileSync(filePath, `测试内容: ${filename}\n创建时间: ${new Date().toISOString()}`);
    console.log(`  ✅ 创建: ${filename}`);
  });
  
  console.log(`📁 测试目录: ${TEST_DIR}`);
  console.log(`📄 测试文件: ${TEST_FILES.length} 个`);
}

/**
 * 运行命令并返回结果
 */
function runCommand(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['index.js', ...args], {
      cwd: __dirname,
      stdio: 'pipe',
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      resolve({
        code,
        stdout,
        stderr,
        args
      });
    });
    
    child.on('error', reject);
  });
}

/**
 * 测试基本功能
 */
async function testBasicFunctions() {
  console.log('\n🔍 测试基本功能');
  console.log('=' .repeat(50));
  
  const tests = [
    {
      name: '帮助信息',
      args: ['--help'],
      expectedCode: 0,
      expectedOutput: '用法:'
    },
    {
      name: '预览模式（默认）',
      args: ['--path', TEST_DIR, '--prefix', 'pre_'],
      expectedCode: 0,
      expectedOutput: '预览重命名结果'
    },
    {
      name: '添加前缀和后缀',
      args: ['--path', TEST_DIR, '--prefix', 'pre_', '--suffix', '_suf'],
      expectedCode: 0,
      expectedOutput: 'pre_.*_suf'
    },
    {
      name: '完全重命名',
      args: ['--path', TEST_DIR, '--prefix', 'full_', '--full'],
      expectedCode: 0,
      expectedOutput: 'full__0000'
    },
    {
      name: '不添加序号',
      args: ['--path', TEST_DIR, '--prefix', 'noindex_', '--no-index'],
      expectedCode: 0,
      expectedOutput: 'noindex_test'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);
    console.log(`命令: node index.js ${test.args.join(' ')}`);
    
    const result = await runCommand(test.args);
    
    if (result.code === test.expectedCode && 
        (test.expectedOutput === undefined || 
         result.stdout.includes(test.expectedOutput) ||
         new RegExp(test.expectedOutput).test(result.stdout))) {
      console.log('✅ 测试通过');
      passed++;
    } else {
      console.log('❌ 测试失败');
      console.log(`  预期退出码: ${test.expectedCode}, 实际: ${result.code}`);
      console.log(`  预期输出包含: ${test.expectedOutput}`);
      if (result.stderr) {
        console.log(`  错误输出: ${result.stderr.trim()}`);
      }
      failed++;
    }
  }
  
  return { passed, failed };
}

/**
 * 测试文件过滤功能
 */
async function testFilterFunctions() {
  console.log('\n🔍 测试文件过滤功能');
  console.log('=' .repeat(50));
  
  const tests = [
    {
      name: '扩展名过滤（只处理.txt）',
      args: ['--path', TEST_DIR, '--ext', '.txt', '--prefix', 'txt_'],
      expectedCode: 0,
      expectedFiles: 3  // 3个txt文件
    },
    {
      name: '排除扩展名',
      args: ['--path', TEST_DIR, '--exclude', '.txt', '--prefix', 'notxt_'],
      expectedCode: 0,
      expectedFiles: 2  // 2个非txt文件
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);
    console.log(`命令: node index.js ${test.args.join(' ')}`);
    
    const result = await runCommand(test.args);
    
    // 检查输出中显示的文件数量
    const match = result.stdout.match(/找到 (\d+) 个文件/);
    const fileCount = match ? parseInt(match[1]) : 0;
    
    if (result.code === test.expectedCode && fileCount === test.expectedFiles) {
      console.log(`✅ 测试通过 (找到 ${fileCount} 个文件)`);
      passed++;
    } else {
      console.log('❌ 测试失败');
      console.log(`  预期文件数: ${test.expectedFiles}, 实际: ${fileCount}`);
      if (result.stderr) {
        console.log(`  错误输出: ${result.stderr.trim()}`);
      }
      failed++;
    }
  }
  
  return { passed, failed };
}

/**
 * 测试安全功能
 */
async function testSafetyFunctions() {
  console.log('\n🔍 测试安全功能');
  console.log('=' .repeat(50));
  
  const tests = [
    {
      name: '目录不存在',
      args: ['--path', '/nonexistent/path'],
      expectedCode: 1,
      expectedOutput: '目录不存在'
    },
    {
      name: '模拟执行（dry-run）',
      args: ['--path', TEST_DIR, '--prefix', 'dry_', '--dry-run'],
      expectedCode: 0,
      expectedOutput: '模拟执行'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);
    console.log(`命令: node index.js ${test.args.join(' ')}`);
    
    const result = await runCommand(test.args);
    
    const output = result.stdout + result.stderr;
    
    if (result.code === test.expectedCode && 
        output.includes(test.expectedOutput)) {
      console.log('✅ 测试通过');
      passed++;
    } else {
      console.log('❌ 测试失败');
      console.log(`  预期退出码: ${test.expectedCode}, 实际: ${result.code}`);
      console.log(`  预期输出包含: ${test.expectedOutput}`);
      console.log(`  实际输出: ${output.trim()}`);
      failed++;
    }
  }
  
  return { passed, failed };
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log('🚀 开始 batch-rename 技能测试');
  console.log('=' .repeat(60));
  
  // 创建测试文件
  createTestFiles();
  
  // 运行各个测试套件
  const results = {
    basic: await testBasicFunctions(),
    filter: await testFilterFunctions(),
    safety: await testSafetyFunctions()
  };
  
  // 统计结果
  const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
  const totalTests = totalPassed + totalFailed;
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 测试结果汇总');
  console.log('=' .repeat(60));
  
  console.log(`基本功能: ${results.basic.passed}/${results.basic.passed + results.basic.failed} 通过`);
  console.log(`过滤功能: ${results.filter.passed}/${results.filter.passed + results.filter.failed} 通过`);
  console.log(`安全功能: ${results.safety.passed}/${results.safety.passed + results.safety.failed} 通过`);
  
  console.log('\n' + '=' .repeat(60));
  console.log(`总计: ${totalPassed}/${totalTests} 测试通过`);
  
  if (totalFailed === 0) {
    console.log('🎉 所有测试通过！技能功能正常。');
    process.exit(0);
  } else {
    console.log(`⚠️  ${totalFailed} 个测试失败`);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  });
}

// 导出测试函数
module.exports = {
  createTestFiles,
  testBasicFunctions,
  testFilterFunctions,
  testSafetyFunctions,
  runAllTests
};