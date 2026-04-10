/**
 * Python Runner Skill 简单测试示例
 * 这个文件展示了如何使用 python-runner 技能
 */

const pythonRunnerSkill = require('./index.js').execute;

async function demonstrateSkill() {
  console.log('🚀 Python Runner Skill 演示\n');
  
  // 示例1：简单Python代码执行
  console.log('📋 示例1：简单Python代码执行');
  const result1 = await pythonRunnerSkill({
    code: 'print("🎯 Python Runner 技能演示")\nprint("-" * 30)\n\n# 基本计算\nprint("基本计算:")\nprint(f"2 + 3 = {2 + 3}")\nprint(f"10 * 5 = {10 * 5}")\nprint(f"100 / 7 = {100 / 7:.2f}")\n\n# 列表操作\nnumbers = [1, 2, 3, 4, 5]\nprint(f"\\n列表操作: {numbers}")\nprint(f"总和: {sum(numbers)}")\nprint(f"平均值: {sum(numbers)/len(numbers):.2f}")'
  });
  
  if (result1.success) {
    console.log('✅ 执行成功！');
    console.log('执行时间:', result1.data.executionInfo.executionTime);
    console.log('\n📄 输出结果:');
    console.log(result1.data.output.stdout);
    
    console.log('\n📊 统计信息:');
    console.log('- 输出行数:', result1.data.stats.stdoutLines);
    console.log('- 退出码:', result1.data.output.exitCode);
    console.log('- 安全警告:', result1.data.safety.warnings.length > 0 ? result1.data.safety.warnings : '无');
  } else {
    console.log('❌ 执行失败:', result1.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 示例2：数学计算演示
  console.log('📋 示例2：数学计算演示');
  const result2 = await pythonRunnerSkill({
    code: `import math

print("🧮 数学计算演示")
print("=" * 30)

# 常用数学常数
print(f"π (pi) = {math.pi}")
print(f"e = {math.e}")
print(f"黄金比例 φ = {(1 + math.sqrt(5)) / 2}")

# 三角函数
angle = 45  # 角度
rad = math.radians(angle)
print(f"\\n角度 {angle}° 的三角函数:")
print(f"sin({angle}°) = {math.sin(rad):.4f}")
print(f"cos({angle}°) = {math.cos(rad):.4f}")
print(f"tan({angle}°) = {math.tan(rad):.4f}")

# 对数计算
print(f"\\n对数计算:")
print(f"log₁₀(100) = {math.log10(100)}")
print(f"ln(e) = {math.log(math.e)}")
print(f"2¹⁰ = {math.pow(2, 10)}")`
  });
  
  if (result2.success) {
    console.log('✅ 数学计算成功！');
    console.log('\n📄 数学计算结果:');
    console.log(result2.data.output.stdout);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 示例3：错误处理演示
  console.log('📋 示例3：错误处理演示');
  
  // 3.1 语法错误
  console.log('\n🔍 场景1：语法错误');
  const error1 = await pythonRunnerSkill({
    code: 'print("缺少引号)'
  });
  
  console.log('结果:', error1.success ? '✅ 意外成功' : '❌ 正确失败');
  console.log('错误信息:', error1.data.output.stderr.substring(0, 100) + '...');
  
  // 3.2 运行时错误
  console.log('\n🔍 场景2：运行时错误');
  const error2 = await pythonRunnerSkill({
    code: 'x = 1 / 0'
  });
  
  console.log('结果:', error2.success ? '✅ 意外成功' : '❌ 正确失败');
  console.log('错误信息:', error2.data.output.stderr.substring(0, 100) + '...');
  
  // 3.3 超时错误
  console.log('\n🔍 场景3：超时错误（设置1秒超时）');
  const error3 = await pythonRunnerSkill({
    code: 'import time\ntime.sleep(3)\nprint("这行不会执行")',
    timeout: 1000
  });
  
  console.log('结果:', error3.success ? '✅ 意外成功' : '❌ 正确失败');
  console.log('超时状态:', error3.data.output.killedByTimeout ? '✅ 已超时' : '❌ 未超时');
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 示例4：参数传递演示
  console.log('📋 示例4：参数传递演示');
  const result4 = await pythonRunnerSkill({
    code: `import sys

print("📦 参数传递演示")
print("=" * 30)

# 获取所有参数
args = sys.argv[1:]
print(f"接收到 {len(args)} 个参数:")
for i, arg in enumerate(args, 1):
    print(f"  参数{i}: {arg}")

# 参数处理示例
if len(args) >= 2:
    try:
        num1 = float(args[0])
        num2 = float(args[1])
        print(f"\\n计算: {num1} + {num2} = {num1 + num2}")
        print(f"计算: {num1} * {num2} = {num1 * num2}")
    except ValueError:
        print("\\n⚠️ 参数无法转换为数字")`,
    args: '10 20'
  });
  
  if (result4.success) {
    console.log('✅ 参数传递成功！');
    console.log('\n📄 参数处理结果:');
    console.log(result4.data.output.stdout);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎯 技能使用总结：');
  console.log('1. 基本用法: python-runner --code "print(\'Hello\')"');
  console.log('2. 文件执行: python-runner --file "script.py"');
  console.log('3. 带参数执行: python-runner --code "代码" --args "参数1 参数2"');
  console.log('4. 超时控制: python-runner --code "代码" --timeout 5000');
  console.log('5. 指定解释器: python-runner --code "代码" --python "python3"');
  console.log('\n💡 提示：技能会自动进行安全检查，防止危险代码执行');
}

// 运行演示
demonstrateSkill().catch(error => {
  console.error('❌ 演示运行失败:', error);
});