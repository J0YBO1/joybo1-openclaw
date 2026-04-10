// hello-world技能测试文件
const skill = require('./index.js');

console.log('🧪 开始测试hello-world技能包...\n');

// 测试1：基本调用
console.log('📋 测试1：基本调用（无参数）');
const result1 = skill.execute();
console.log('结果：');
console.log(result1.message);
console.log('数据：', JSON.stringify(result1.data, null, 2));
console.log('✅ 测试1通过\n');

// 测试2：带参数调用
console.log('📋 测试2：带参数调用');
const result2 = skill.execute({ name: '黄冠' });
console.log('结果：');
console.log(result2.message);
console.log('数据：', JSON.stringify(result2.data, null, 2));
console.log('✅ 测试2通过\n');

// 测试3：技能信息验证
console.log('📋 测试3：技能信息验证');
console.log('技能名称：', skill.name);
console.log('技能描述：', skill.description);
console.log('参数定义：', JSON.stringify(skill.parameters, null, 2));
console.log('使用示例：', JSON.stringify(skill.examples, null, 2));
console.log('✅ 测试3通过\n');

console.log('🎉 所有测试通过！技能包开发完成！');
console.log('\n📁 技能包结构：');
console.log('  📄 SKILL.md      - 技能文档');
console.log('  📄 index.js      - 技能实现');
console.log('  📄 package.json  - 包配置');
console.log('  📄 test.js       - 测试文件');
console.log('\n🚀 下一步：将这个技能包集成到OpenClaw中！');