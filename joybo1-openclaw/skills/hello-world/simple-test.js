// 简单测试hello-world技能
console.log('🚀 测试hello-world技能包...\n');

// 直接测试技能函数
async function testSkill() {
    const skill = require('./index.js');
    
    console.log('📋 技能信息：');
    console.log('名称：', skill.name);
    console.log('描述：', skill.description);
    console.log('参数：', JSON.stringify(skill.parameters, null, 2));
    
    console.log('\n🎯 测试执行：');
    
    // 测试无参数
    console.log('1. 无参数调用：');
    const result1 = await skill.execute();
    console.log(result1.message);
    
    // 测试带参数
    console.log('\n2. 带参数调用：');
    const result2 = await skill.execute({ name: '黄冠' });
    console.log(result2.message);
    
    console.log('\n✅ 技能包测试完成！');
}

testSkill().catch(console.error);