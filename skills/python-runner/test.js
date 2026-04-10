/**
 * Python Runner Skill 测试文件
 */

const pythonRunnerSkill = require('./index.js').execute;

// 测试用例
async function runTests() {
  console.log('🧪 开始测试 python-runner 技能...\n');
  
  let passed = 0;
  let total = 0;
  
  // 测试1：缺少必要参数
  console.log('📋 测试1：缺少代码或文件参数');
  total++;
  const test1 = await pythonRunnerSkill({});
  if (!test1.success && test1.message.includes('请提供Python代码或文件路径')) {
    console.log('✅ 通过');
    passed++;
  } else {
    console.log('❌ 失败');
    console.log('预期: 缺少参数错误');
    console.log('实际:', test1.message);
  }
  console.log('');
  
  // 测试2：简单Python代码执行
  console.log('📋 测试2：简单Python代码执行');
  total++;
  const test2 = await pythonRunnerSkill({
    code: 'print("Hello, Python!"); x = 1 + 2; print(f"1 + 2 = {x}")'
  });
  
  if (test2.success && test2.data.output.stdout.includes('Hello, Python')) {
    console.log('✅ 通过');
    passed++;
    console.log('输出:', test2.data.output.stdout);
  } else {
    console.log('❌ 失败');
    console.log('结果:', test2);
  }
  console.log('');
  
  // 测试3：Python计算测试
  console.log('📋 测试3：Python计算测试');
  total++;
  const test3 = await pythonRunnerSkill({
    code: 'import math\nprint(f"π ≈ {math.pi:.4f}")\nprint(f"e ≈ {math.e:.4f}")'
  });
  
  if (test3.success && test3.data.output.stdout.includes('π ≈')) {
    console.log('✅ 通过');
    passed++;
    console.log('输出:', test3.data.output.stdout);
  } else {
    console.log('❌ 失败');
    console.log('结果:', test3.data.output);
  }
  console.log('');
  
  // 测试4：错误代码测试
  console.log('📋 测试4：错误代码测试');
  total++;
  const test4 = await pythonRunnerSkill({
    code: 'print("开始"); raise ValueError("测试错误"); print("这行不会执行")'
  });
  
  if (!test4.success && test4.data.output.stderr.includes('ValueError')) {
    console.log('✅ 通过 - 正确捕获错误');
    passed++;
    console.log('错误输出:', test4.data.output.stderr.substring(0, 100) + '...');
  } else {
    console.log('❌ 失败');
    console.log('预期: 捕获ValueError');
    console.log('实际:', test4.data.output);
  }
  console.log('');
  
  // 测试5：超时测试（快速超时）
  console.log('📋 测试5：超时测试');
  total++;
  const test5 = await pythonRunnerSkill({
    code: 'import time\ntime.sleep(2)\nprint("这行应该不会执行")',
    timeout: 100  // 100ms超时
  });
  
  if (!test5.success && test5.data.output.killedByTimeout) {
    console.log('✅ 通过 - 正确触发超时');
    passed++;
  } else {
    console.log('❌ 失败');
    console.log('预期: 执行超时');
    console.log('实际:', test5.data.output);
  }
  console.log('');
  
  // 测试6：参数传递测试
  console.log('📋 测试6：参数传递测试');
  total++;
  const test6 = await pythonRunnerSkill({
    code: 'import sys\nprint("参数:", sys.argv[1:])',
    args: 'arg1 arg2 arg3'
  });
  
  if (test6.success && test6.data.output.stdout.includes('arg1')) {
    console.log('✅ 通过');
    passed++;
    console.log('输出:', test6.data.output.stdout);
  } else {
    console.log('❌ 失败');
    console.log('结果:', test6.data.output);
  }
  console.log('');
  
  // 测试7：安全检查测试
  console.log('📋 测试7：安全检查测试');
  total++;
  const test7 = await pythonRunnerSkill({
    code: 'import os\nprint("当前目录:", os.getcwd())'
  });
  
  if (test7.success) {
    console.log('✅ 通过 - 安全模块允许执行');
    passed++;
    console.log('安全警告:', test7.data.safety.warnings);
  } else {
    console.log('❌ 失败');
    console.log('结果:', test7);
  }
  console.log('');
  
  // 测试8：文件执行测试
  console.log('📋 测试8：文件执行测试');
  total++;
  const fs = require('fs').promises;
  const testFile = './test_script.py';
  const testContent = `# 测试脚本
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("Python Runner"))
    print("测试完成")
`;
  
  try {
    await fs.writeFile(testFile, testContent, 'utf-8');
    
    const test8 = await pythonRunnerSkill({
      file: testFile
    });
    
    if (test8.success && test8.data.output.stdout.includes('Hello, Python Runner')) {
      console.log('✅ 通过');
      passed++;
      console.log('输出:', test8.data.output.stdout);
    } else {
      console.log('❌ 失败');
      console.log('结果:', test8.data.output);
    }
    
    // 清理测试文件
    await fs.unlink(testFile);
  } catch (error) {
    console.log('❌ 测试文件操作失败:', error.message);
  }
  
  console.log('');
  console.log('='.repeat(50));
  console.log('🎯 测试总结：');
  console.log(`总计: ${total} 个测试`);
  console.log(`通过: ${passed} 个`);
  console.log(`失败: ${total - passed} 个`);
  console.log(`通过率: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('\n🎉 所有测试通过！');
  } else {
    console.log('\n⚠️ 部分测试失败，需要检查');
  }
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试运行失败:', error);
  process.exit(1);
});