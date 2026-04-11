#!/usr/bin/env node
/**
 * weather-query 技能测试
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 测试配置
const TEST_CONFIG = {
  testCities: ["北京", "上海", "广州"],
  timeout: 30000  // 30秒超时
};

// 清理函数
function cleanup() {
  // 清理测试文件
  const testFiles = ['test_output.json', 'test_output.txt', 'cities.txt'];
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}

// 运行命令并解析结果
function runCommand(command) {
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      timeout: TEST_CONFIG.timeout
    });
    
    // 尝试解析JSON输出
    try {
      return JSON.parse(output);
    } catch (e) {
      // 如果不是JSON，返回文本
      return output.trim();
    }
  } catch (error) {
    console.error(`命令执行失败: ${command}`);
    console.error(`错误: ${error.message}`);
    
    if (error.stderr) {
      console.error(`标准错误: ${error.stderr.toString()}`);
    }
    
    return null;
  }
}

// 测试基本功能
function testBasicFunctionality() {
  console.log('\n=== 测试基本功能 ===');
  
  // 测试1: 查看帮助
  console.log('测试1: 查看帮助信息');
  const result1 = runCommand('node index.js --help');
  if (result1 && typeof result1 === 'string' && result1.includes('用法:')) {
    console.log('✅ 测试通过: 帮助信息显示正常');
  } else {
    console.log('❌ 测试失败: 帮助信息异常');
    return false;
  }
  
  // 测试2: 查询默认城市
  console.log('\n测试2: 查询默认城市天气');
  const result2 = runCommand('node index.js');
  if (result2 && (typeof result2 === 'object' || (typeof result2 === 'string' && result2.includes('天气报告')))) {
    console.log('✅ 测试通过: 默认城市查询正常');
  } else {
    console.log('❌ 测试失败: 默认城市查询异常');
    return false;
  }
  
  return true;
}

function testCityQueries() {
  console.log('\n=== 测试城市查询 ===');
  
  // 测试3: 查询北京天气
  console.log('测试3: 查询北京天气');
  const result3 = runCommand('node index.js --city 北京');
  if (result3 && (typeof result3 === 'object' || (typeof result3 === 'string' && result3.includes('北京')))) {
    console.log('✅ 测试通过: 北京天气查询正常');
  } else {
    console.log('❌ 测试失败: 北京天气查询异常');
    return false;
  }
  
  // 测试4: 查询上海天气（表格格式）
  console.log('\n测试4: 查询上海天气（表格格式）');
  const result4 = runCommand('node index.js --city 上海 --format table');
  if (result4 && (typeof result4 === 'string' && result4.includes('上海'))) {
    console.log('✅ 测试通过: 上海天气查询正常');
  } else {
    console.log('❌ 测试失败: 上海天气查询异常');
    return false;
  }
  
  // 测试5: 查询广州天气（JSON格式）
  console.log('\n测试5: 查询广州天气（JSON格式）');
  const result5 = runCommand('node index.js --city 广州 --format json');
  if (result5 && typeof result5 === 'object' && result5.location && result5.location.name === '广州') {
    console.log('✅ 测试通过: 广州天气查询正常');
  } else {
    console.log('❌ 测试失败: 广州天气查询异常');
    return false;
  }
  
  return true;
}

function testAdvancedFeatures() {
  console.log('\n=== 测试高级功能 ===');
  
  // 测试6: 查询天气预报
  console.log('测试6: 查询天气预报');
  const result6 = runCommand('node index.js --city 北京 --forecast');
  if (result6 && (typeof result6 === 'object' || (typeof result6 === 'string' && result6.includes('天气预报')))) {
    console.log('✅ 测试通过: 天气预报查询正常');
  } else {
    console.log('❌ 测试失败: 天气预报查询异常');
    return false;
  }
  
  // 测试7: 查询多个城市
  console.log('\n测试7: 查询多个城市');
  const result7 = runCommand('node index.js --cities "北京,上海"');
  if (result7 && (typeof result7 === 'object' || (typeof result7 === 'string' && result7.includes('北京') && result7.includes('上海')))) {
    console.log('✅ 测试通过: 多城市查询正常');
  } else {
    console.log('❌ 测试失败: 多城市查询异常');
    return false;
  }
  
  // 测试8: 输出到文件
  console.log('\n测试8: 输出到文件');
  const result8 = runCommand('node index.js --city 北京 --output test_output.json --format json');
  if (result8 && fs.existsSync('test_output.json')) {
    const fileContent = JSON.parse(fs.readFileSync('test_output.json', 'utf8'));
    if (fileContent.location && fileContent.location.name === '北京') {
      console.log('✅ 测试通过: 文件输出正常');
    } else {
      console.log('❌ 测试失败: 文件内容异常');
      return false;
    }
  } else {
    console.log('❌ 测试失败: 文件输出异常');
    return false;
  }
  
  return true;
}

function testErrorHandling() {
  console.log('\n=== 测试错误处理 ===');
  
  // 测试9: 查询不存在的城市
  console.log('测试9: 查询不存在的城市');
  const result9 = runCommand('node index.js --city "不存在城市名"');
  if (result9 && (typeof result9 === 'object' && !result9.success) || 
      (typeof result9 === 'string' && result9.includes('错误'))) {
    console.log('✅ 测试通过: 错误处理正常');
  } else {
    console.log('❌ 测试失败: 错误处理异常');
    return false;
  }
  
  // 测试10: 从文件读取城市列表
  console.log('\n测试10: 从文件读取城市列表');
  
  // 创建测试文件
  fs.writeFileSync('cities.txt', '北京\n上海\n广州\n');
  
  const result10 = runCommand('node index.js --input cities.txt');
  if (result10 && (typeof result10 === 'object' || (typeof result10 === 'string' && result10.includes('北京')))) {
    console.log('✅ 测试通过: 文件输入正常');
  } else {
    console.log('❌ 测试失败: 文件输入异常');
    return false;
  }
  
  return true;
}

// 直接测试Python脚本
function testPythonScript() {
  console.log('\n=== 测试Python脚本 ===');
  
  const pythonScript = path.join(__dirname, 'weather_query.py');
  
  // 测试11: Python脚本基本功能
  console.log('测试11: Python脚本基本功能');
  try {
    const result11 = execSync(`python "${pythonScript}" --city 北京 --format json`, {
      encoding: 'utf8',
      timeout: TEST_CONFIG.timeout
    });
    
    const data = JSON.parse(result11);
    if (data.success && data.location.name === '北京') {
      console.log('✅ 测试通过: Python脚本运行正常');
    } else {
      console.log('❌ 测试失败: Python脚本输出异常');
      return false;
    }
  } catch (error) {
    console.log('❌ 测试失败: Python脚本执行异常');
    console.error(error.message);
    return false;
  }
  
  // 测试12: Python脚本错误处理
  console.log('\n测试12: Python脚本错误处理');
  try {
    const result12 = execSync(`python "${pythonScript}" --city "不存在城市" --format json`, {
      encoding: 'utf8',
      timeout: TEST_CONFIG.timeout
    });
    
    const data = JSON.parse(result12);
    if (!data.success && data.error) {
      console.log('✅ 测试通过: Python脚本错误处理正常');
    } else {
      console.log('❌ 测试失败: Python脚本错误处理异常');
      return false;
    }
  } catch (error) {
    console.log('❌ 测试失败: Python脚本执行异常');
    console.error(error.message);
    return false;
  }
  
  return true;
}

// 主测试函数
async function runTests() {
  console.log('开始 weather-query 技能测试');
  console.log('=' .repeat(50));
  
  try {
    // 清理旧文件
    cleanup();
    
    // 运行测试
    const tests = [
      { name: '基本功能', func: testBasicFunctionality },
      { name: '城市查询', func: testCityQueries },
      { name: '高级功能', func: testAdvancedFeatures },
      { name: '错误处理', func: testErrorHandling },
      { name: 'Python脚本', func: testPythonScript }
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
      console.log('weather-query 技能功能正常');
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
  testCityQueries,
  testAdvancedFeatures,
  testErrorHandling,
  testPythonScript
};