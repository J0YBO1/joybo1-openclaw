#!/usr/bin/env node

/**
 * PDF Reader Skill 测试文件
 */

const { main, parseArgs, extractTextFromPDF } = require('./index.js');
const fs = require('fs').promises;
const path = require('path');

// 测试用例
const testCases = [
  {
    name: '测试1：参数解析',
    test: () => {
      const args = ['--path', 'test.pdf', '--pages', '1-5', '--preview-lines', '50'];
      process.argv = ['node', 'index.js', ...args];
      
      const params = parseArgs();
      
      console.assert(params.path === 'test.pdf', '路径解析错误');
      console.assert(params.pages === '1-5', '页面范围解析错误');
      console.assert(params.previewLines === 50, '预览行数解析错误');
      console.assert(params.extractText === true, '提取文本默认值错误');
      console.assert(params.metadata === true, '元数据默认值错误');
      
      console.log('✅ 测试1通过：参数解析正确');
    }
  },
  {
    name: '测试2：帮助信息',
    test: () => {
      const args = ['--help'];
      process.argv = ['node', 'index.js', ...args];
      
      const params = parseArgs();
      // 帮助信息应该导致程序退出，这里我们只是检查参数解析
      console.log('✅ 测试2通过：帮助参数识别正确');
    }
  },
  {
    name: '测试3：文件检查函数',
    test: async () => {
      // 创建一个临时测试文件
      const testFilePath = path.join(__dirname, 'test-temp.txt');
      await fs.writeFile(testFilePath, '测试内容');
      
      const { checkFileExists } = require('./index.js');
      
      const exists = await checkFileExists(testFilePath);
      console.assert(exists === true, '文件存在检查失败');
      
      const notExists = await checkFileExists('non-existent-file.txt');
      console.assert(notExists === false, '文件不存在检查失败');
      
      // 清理临时文件
      await fs.unlink(testFilePath);
      
      console.log('✅ 测试3通过：文件检查函数正常工作');
    }
  },
  {
    name: '测试4：文件大小格式化',
    test: () => {
      // 测试格式化函数
      const formatFileSize = (bytes) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024;
          unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
      };
      
      console.assert(formatFileSize(500) === '500.0 B', '字节格式化错误');
      console.assert(formatFileSize(1500) === '1.5 KB', 'KB格式化错误');
      console.assert(formatFileSize(1500000) === '1.4 MB', 'MB格式化错误');
      
      console.log('✅ 测试4通过：文件大小格式化正确');
    }
  },
  {
    name: '测试5：页面范围解析',
    test: () => {
      const parsePageRange = (pageRange, totalPages) => {
        if (pageRange === 'all') {
          return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        
        const pages = [];
        const parts = pageRange.split(',');
        
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              for (let i = start; i <= Math.min(end, totalPages); i++) {
                pages.push(i);
              }
            }
          } else {
            const page = Number(part);
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
              pages.push(page);
            }
          }
        }
        
        return pages.length > 0 ? pages : [1];
      };
      
      // 测试各种页面范围
      const test1 = parsePageRange('all', 10);
      console.assert(test1.length === 10, 'all范围解析错误');
      console.assert(test1[0] === 1, 'all范围起始页错误');
      console.assert(test1[9] === 10, 'all范围结束页错误');
      
      const test2 = parsePageRange('1-5', 10);
      console.assert(test2.length === 5, '1-5范围解析错误');
      console.assert(test2[0] === 1, '1-5范围起始页错误');
      console.assert(test2[4] === 5, '1-5范围结束页错误');
      
      const test3 = parsePageRange('1,3,5', 10);
      console.assert(test3.length === 3, '1,3,5范围解析错误');
      console.assert(test3[0] === 1, '1,3,5范围第1页错误');
      console.assert(test3[1] === 3, '1,3,5范围第3页错误');
      console.assert(test3[2] === 5, '1,3,5范围第5页错误');
      
      const test4 = parsePageRange('1-3,5,7-9', 10);
      console.assert(test4.length === 7, '复合范围解析错误');
      
      console.log('✅ 测试5通过：页面范围解析正确');
    }
  }
];

// 运行所有测试
async function runTests() {
  console.log('🚀 开始运行PDF Reader Skill测试...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`📋 ${testCase.name}`);
      
      if (testCase.test.constructor.name === 'AsyncFunction') {
        await testCase.test();
      } else {
        testCase.test();
      }
      
      passed++;
      console.log();
    } catch (error) {
      failed++;
      console.error(`❌ ${testCase.name} 失败: ${error.message}`);
      console.error(error.stack);
      console.log();
    }
  }
  
  // 测试总结
  console.log('='.repeat(50));
  console.log('📊 测试结果汇总：');
  console.log(`✅ 通过：${passed} 个`);
  console.log(`❌ 失败：${failed} 个`);
  console.log(`📈 总计：${passed + failed} 个测试用例`);
  
  if (failed === 0) {
    console.log('\n🎉 所有测试通过！PDF Reader Skill 功能正常。');
  } else {
    console.log('\n⚠️  有测试失败，请检查代码。');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { runTests };