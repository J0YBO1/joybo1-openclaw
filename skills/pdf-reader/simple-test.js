#!/usr/bin/env node

/**
 * PDF Reader Skill 简单测试
 * 用于快速验证技能基本功能
 */

const { main } = require('./index.js');

// 模拟命令行参数
const testArgs = [
  'node',
  'index.js',
  '--path',
  'C:\\Users\\29248\\.openclaw\\media\\qqbot\\downloads\\黄冠的简历 (1)_1775793909797_7b6fe3.pdf',
  '--preview-lines',
  '20'
];

console.log('🔍 开始测试PDF Reader Skill...\n');
console.log('测试文件：黄冠的简历.pdf');
console.log('='.repeat(60));

// 保存原始参数
const originalArgv = process.argv;
const originalExit = process.exit;

// 模拟process.exit，避免测试时真的退出
process.exit = (code) => {
  console.log(`\n📊 测试完成，退出码：${code}`);
  // 恢复原始函数
  process.argv = originalArgv;
  process.exit = originalExit;
  
  if (code === 0) {
    console.log('✅ 技能测试成功！');
  } else {
    console.log('❌ 技能测试失败！');
  }
};

// 设置测试参数
process.argv = testArgs;

// 运行主函数
main().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});