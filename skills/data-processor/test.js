#!/usr/bin/env node
/**
 * data-processor 技能测试
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 测试配置
const TEST_CONFIG = {
  testData: [
    { id: 1, name: "Laptop", category: "Electronics", price: 999.99, stock: 10 },
    { id: 2, name: "Python Book", category: "Books", price: 39.99, stock: 25 },
    { id: 3, name: "Coffee", category: "Food", price: 4.99, stock: 100 },
    { id: 4, name: "Mouse", category: "Electronics", price: 29.99, stock: 15 },
    { id: 5, name: "Notebook", category: "Stationery", price: 2.99, stock: 50 },
    { id: 6, name: "Headphones", category: "Electronics", price: 89.99, stock: 8 },
    { id: 7, name: "Tea", category: "Food", price: 3.99, stock: 75 },
    { id: 8, name: "JavaScript Book", category: "Books", price: 49.99, stock: 20 }
  ],
  testFiles: {
    json: 'test_data.json',
    csv: 'test_data.csv'
  }
};

// 清理函数
function cleanup() {
  Object.values(TEST_CONFIG.testFiles).forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
  
  if (fs.existsSync('test_output.json')) {
    fs.unlinkSync('test_output.json');
  }
  
  if (fs.existsSync('test_output.csv')) {
    fs.unlinkSync('test_output.csv');
  }
}

// 创建测试文件
function createTestFiles() {
  // 创建JSON测试文件
  fs.writeFileSync(
    TEST_CONFIG.testFiles.json,
    JSON.stringify(TEST_CONFIG.testData, null, 2)
  );
  
  // 创建CSV测试文件
  const csvHeader = Object.keys(TEST_CONFIG.testData[0]).join(',');
  const csvRows = TEST_CONFIG.testData.map(item => 
    Object.values(item).map(val => 
      typeof val === 'string' ? `"${val}"` : val
    ).join(',')
  );
  const csvContent = [csvHeader, ...csvRows].join('\n');
  fs.writeFileSync(TEST_CONFIG.testFiles.csv, csvContent);
  
  console.log('测试文件创建完成');
}

// 运行命令并解析结果
function runCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    return JSON.parse(output);
  } catch (error) {
    console.error(`命令执行失败: ${command}`);
    console.error(`错误: ${error.message}`);
    
    // 尝试从stderr获取错误信息
    if (error.stderr) {
      console.error(`标准错误: ${error.stderr.toString()}`);
    }
    
    return null;
  }
}

// 测试函数
function testBasicFunctionality() {
  console.log('\n=== 测试基本功能 ===');
  
  // 测试1: 读取JSON文件
  console.log('测试1: 读取JSON文件');
  const result1 = runCommand(`node index.js ${TEST_CONFIG.testFiles.json}`);
  if (result1 && result1.success && result1.record_count === 8) {
    console.log('✅ 测试通过: JSON文件读取正常');
  } else {
    console.log('❌ 测试失败: JSON文件读取异常');
    return false;
  }
  
  // 测试2: 过滤数据
  console.log('\n测试2: 过滤电子产品');
  const result2 = runCommand(`node index.js ${TEST_CONFIG.testFiles.json} --filter '{"category": "Electronics"}'`);
  if (result2 && result2.success && result2.record_count === 3) {
    console.log('✅ 测试通过: 数据过滤正常');
  } else {
    console.log('❌ 测试失败: 数据过滤异常');
    return false;
  }
  
  // 测试3: 分组数据
  console.log('\n测试3: 按类别分组');
  const result3 = runCommand(`node index.js ${TEST_CONFIG.testFiles.json} --group-by category`);
  if (result3 && result3.success && result3.data) {
    const categories = Object.keys(result3.data);
    if (categories.length >= 3) { // Electronics, Books, Food, Stationery
      console.log('✅ 测试通过: 数据分组正常');
    } else {
      console.log('❌ 测试失败: 分组结果异常');
      return false;
    }
  } else {
    console.log('❌ 测试失败: 数据分组异常');
    return false;
  }
  
  // 测试4: 排序数据
  console.log('\n测试4: 按价格排序');
  const result4 = runCommand(`node index.js ${TEST_CONFIG.testFiles.json} --sort-by price --reverse`);
  if (result4 && result4.success && result4.record_count === 8) {
    const prices = result4.data.map(item => item.price);
    const isDescending = prices.every((price, i) => 
      i === 0 || price <= prices[i - 1]
    );
    if (isDescending) {
      console.log('✅ 测试通过: 数据排序正常');
    } else {
      console.log('❌ 测试失败: 排序顺序异常');
      return false;
    }
  } else {
    console.log('❌ 测试失败: 数据排序异常');
    return false;
  }
  
  // 测试5: 统计摘要
  console.log('\n测试5: 价格统计');
  const result5 = runCommand(`node index.js ${TEST_CONFIG.testFiles.json} --stats price`);
  if (result5 && result5.success && result5.data && result5.data.count === 8) {
    console.log('✅ 测试通过: 统计计算正常');
  } else {
    console.log('❌ 测试失败: 统计计算异常');
    return false;
  }
  
  return true;
}

function testFileOutput() {
  console.log('\n=== 测试文件输出 ===');
  
  // 测试6: 输出到JSON文件
  console.log('测试6: 输出到JSON文件');
  const result6 = runCommand(`node index.js ${TEST_CONFIG.testFiles.json} --output test_output.json`);
  if (result6 && result6.success && fs.existsSync('test_output.json')) {
    const fileContent = JSON.parse(fs.readFileSync('test_output.json', 'utf8'));
    if (fileContent.record_count === 8) {
      console.log('✅ 测试通过: JSON文件输出正常');
    } else {
      console.log('❌ 测试失败: JSON文件内容异常');
      return false;
    }
  } else {
    console.log('❌ 测试失败: JSON文件输出异常');
    return false;
  }
  
  // 测试7: 输出到CSV文件
  console.log('\n测试7: 输出到CSV文件');
  const result7 = runCommand(`node index.js ${TEST_CONFIG.testFiles.json} --output test_output.csv --format csv`);
  if (result7 && result7.success && fs.existsSync('test_output.csv')) {
    const fileContent = fs.readFileSync('test_output.csv', 'utf8');
    const lines = fileContent.trim().split('\n');
    if (lines.length === 9) { // 表头 + 8行数据
      console.log('✅ 测试通过: CSV文件输出正常');
    } else {
      console.log('❌ 测试失败: CSV文件内容异常');
      return false;
    }
  } else {
    console.log('❌ 测试失败: CSV文件输出异常');
    return false;
  }
  
  return true;
}

function testCSVInput() {
  console.log('\n=== 测试CSV输入 ===');
  
  // 测试8: 读取CSV文件
  console.log('测试8: 读取CSV文件');
  const result8 = runCommand(`node index.js ${TEST_CONFIG.testFiles.csv}`);
  if (result8 && result8.success && result8.record_count === 8) {
    console.log('✅ 测试通过: CSV文件读取正常');
  } else {
    console.log('❌ 测试失败: CSV文件读取异常');
    return false;
  }
  
  // 测试9: CSV文件过滤
  console.log('\n测试9: CSV文件过滤');
  const result9 = runCommand(`node index.js ${TEST_CONFIG.testFiles.csv} --filter '{"category": "Books"}'`);
  if (result9 && result9.success && result9.record_count === 2) {
    console.log('✅ 测试通过: CSV文件过滤正常');
  } else {
    console.log('❌ 测试失败: CSV文件过滤异常');
    return false;
  }
  
  return true;
}

function testErrorHandling() {
  console.log('\n=== 测试错误处理 ===');
  
  // 测试10: 文件不存在
  console.log('测试10: 文件不存在错误');
  const result10 = runCommand('node index.js nonexistent.json');
  if (result10 && !result10.success && result10.type === 'data_processor_error') {
    console.log('✅ 测试通过: 文件不存在错误处理正常');
  } else {
    console.log('❌ 测试失败: 文件不存在错误处理异常');
    return false;
  }
  
  // 测试11: 无效的JSON过滤条件
  console.log('\n测试11: 无效的JSON过滤条件');
  const result11 = runCommand(`node index.js ${TEST_CONFIG.testFiles.json} --filter '{invalid json}'`);
  if (result11 && !result11.success) {
    console.log('✅ 测试通过: 无效JSON错误处理正常');
  } else {
    console.log('❌ 测试失败: 无效JSON错误处理异常');
    return false;
  }
  
  return true;
}

// 主测试函数
async function runTests() {
  console.log('开始 data-processor 技能测试');
  console.log('=' .repeat(50));
  
  try {
    // 清理旧文件
    cleanup();
    
    // 创建测试文件
    createTestFiles();
    
    // 运行测试
    const tests = [
      { name: '基本功能', func: testBasicFunctionality },
      { name: '文件输出', func: testFileOutput },
      { name: 'CSV输入', func: testCSVInput },
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
    
    // 清理测试文件
    cleanup();
    
    // 输出结果
    console.log('\n' + '=' .repeat(50));
    if (allPassed) {
      console.log('🎉 所有测试通过!');
      console.log('data-processor 技能功能正常');
    } else {
      console.log('💥 测试失败，请检查技能实现');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    cleanup();
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testBasicFunctionality,
  testFileOutput,
  testCSVInput,
  testErrorHandling
};