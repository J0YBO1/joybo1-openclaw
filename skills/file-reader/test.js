/**
 * File Reader Skill 测试文件
 */

const fileReaderSkill = require('./index.js').execute;

// 测试用例
async function runTests() {
  console.log('🧪 开始测试 file-reader 技能...\n');
  
  // 测试1：缺少必要参数
  console.log('📋 测试1：缺少文件路径参数');
  const test1 = await fileReaderSkill({});
  console.log('结果:', test1.success ? '✅ 通过' : '❌ 失败');
  console.log('消息:', test1.message);
  console.log('');
  
  // 测试2：文件不存在
  console.log('📋 测试2：文件不存在');
  const test2 = await fileReaderSkill({ path: 'nonexistent-file.txt' });
  console.log('结果:', !test2.success ? '✅ 通过' : '❌ 失败');
  console.log('消息:', test2.message);
  console.log('');
  
  // 测试3：创建并测试文本文件
  console.log('📋 测试3：文本文件读取');
  const fs = require('fs').promises;
  
  // 创建测试文件
  const testFilePath = './test-file.txt';
  const testContent = '这是一个测试文件\n第二行内容\n第三行内容\n第四行内容\n第五行内容';
  
  await fs.writeFile(testFilePath, testContent, 'utf-8');
  
  const test3 = await fileReaderSkill({ 
    path: testFilePath,
    lines: 3
  });
  
  console.log('结果:', test3.success ? '✅ 通过' : '❌ 失败');
  if (test3.success) {
    console.log('文件信息:');
    console.log('- 名称:', test3.data.fileInfo.name);
    console.log('- 大小:', test3.data.fileInfo.size);
    console.log('- 行数:', test3.data.fileInfo.lines);
    console.log('预览内容:');
    console.log(test3.data.content);
  } else {
    console.log('错误:', test3.message);
  }
  console.log('');
  
  // 测试4：JSON文件测试
  console.log('📋 测试4：JSON文件测试');
  const jsonFilePath = './test-data.json';
  const jsonData = {
    name: '测试数据',
    version: '1.0.0',
    items: [
      { id: 1, name: '项目A' },
      { id: 2, name: '项目B' },
      { id: 3, name: '项目C' }
    ]
  };
  
  await fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
  
  const test4 = await fileReaderSkill({ 
    path: jsonFilePath,
    format: 'json'
  });
  
  console.log('结果:', test4.success ? '✅ 通过' : '❌ 失败');
  if (test4.success) {
    console.log('格式检测:', test4.data.fileInfo.format);
    console.log('解析数据:', test4.data.formatSpecific.hasParsedData ? '✅ 已解析' : '❌ 未解析');
  }
  console.log('');
  
  // 清理测试文件
  console.log('🧹 清理测试文件...');
  try {
    await fs.unlink(testFilePath);
    await fs.unlink(jsonFilePath);
    console.log('✅ 测试文件清理完成');
  } catch (error) {
    console.log('⚠️ 清理文件时出错:', error.message);
  }
  
  console.log('\n🎯 测试总结：');
  console.log('1. 参数验证测试:', test1.success === false ? '✅ 通过' : '❌ 失败');
  console.log('2. 文件存在性测试:', test2.success === false ? '✅ 通过' : '❌ 失败');
  console.log('3. 文本文件读取测试:', test3.success ? '✅ 通过' : '❌ 失败');
  console.log('4. JSON文件读取测试:', test4.success ? '✅ 通过' : '❌ 失败');
  
  const allPassed = !test1.success && !test2.success && test3.success && test4.success;
  console.log('\n📊 总体结果:', allPassed ? '🎉 所有测试通过！' : '⚠️ 部分测试失败');
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试运行失败:', error);
  process.exit(1);
});