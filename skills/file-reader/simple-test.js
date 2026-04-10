/**
 * File Reader Skill 简单测试示例
 * 这个文件展示了如何使用 file-reader 技能
 */

const fileReaderSkill = require('./index.js').execute;

async function demonstrateSkill() {
  console.log('🚀 File Reader Skill 演示\n');
  
  // 示例1：读取当前文件
  console.log('📋 示例1：读取当前文件（simple-test.js）');
  const result1 = await fileReaderSkill({
    path: __filename,
    lines: 10
  });
  
  if (result1.success) {
    console.log('✅ 读取成功！');
    console.log('文件信息:');
    console.log(`- 名称: ${result1.data.fileInfo.name}`);
    console.log(`- 大小: ${result1.data.fileInfo.size}`);
    console.log(`- 格式: ${result1.data.fileInfo.formatName}`);
    console.log(`- 行数: ${result1.data.fileInfo.lines}`);
    console.log('\n📄 内容预览（前10行）:');
    console.log(result1.data.content);
  } else {
    console.log('❌ 读取失败:', result1.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 示例2：创建并读取一个配置文件
  console.log('📋 示例2：创建并读取配置文件');
  const fs = require('fs').promises;
  
  // 创建一个示例配置文件
  const configContent = `# 应用配置
app:
  name: "MyApp"
  version: "1.0.0"
  debug: true

database:
  host: "localhost"
  port: 5432
  name: "mydb"

server:
  port: 3000
  host: "0.0.0.0"
`;
  
  const configPath = './demo-config.yaml';
  await fs.writeFile(configPath, configContent, 'utf-8');
  
  const result2 = await fileReaderSkill({
    path: configPath,
    format: 'yaml',
    lines: 15
  });
  
  if (result2.success) {
    console.log('✅ 配置文件读取成功！');
    console.log(`文件: ${result2.data.fileInfo.name}`);
    console.log(`大小: ${result2.data.fileInfo.size}`);
    console.log('\n📄 配置文件内容:');
    console.log(result2.data.content);
  } else {
    console.log('❌ 读取失败:', result2.message);
  }
  
  // 清理示例文件
  try {
    await fs.unlink(configPath);
    console.log('\n🧹 已清理示例配置文件');
  } catch (error) {
    console.log('\n⚠️ 清理文件时出错:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 示例3：错误处理演示
  console.log('📋 示例3：错误处理演示');
  
  // 3.1 文件不存在
  console.log('\n🔍 场景1：文件不存在');
  const error1 = await fileReaderSkill({
    path: './this-file-does-not-exist.txt'
  });
  console.log('结果:', error1.success ? '✅ 意外成功' : '❌ 正确失败');
  console.log('消息:', error1.message);
  
  // 3.2 不支持的格式
  console.log('\n🔍 场景2：不支持的格式');
  const unsupportedFile = './test.xyz';
  await fs.writeFile(unsupportedFile, 'test content', 'utf-8');
  
  const error2 = await fileReaderSkill({
    path: unsupportedFile
  });
  console.log('结果:', error2.success ? '✅ 意外成功' : '❌ 正确失败');
  console.log('消息:', error2.message);
  
  // 清理
  await fs.unlink(unsupportedFile);
  
  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎯 技能使用总结：');
  console.log('1. 基本用法: file-reader --path "文件路径"');
  console.log('2. 限制预览行数: file-reader --path "文件路径" --lines 20');
  console.log('3. 指定格式: file-reader --path "文件路径" --format json');
  console.log('4. 指定编码: file-reader --path "文件路径" --encoding gbk');
  console.log('\n💡 提示：技能会自动检测文件格式，也支持手动指定格式');
}

// 运行演示
demonstrateSkill().catch(error => {
  console.error('❌ 演示运行失败:', error);
});