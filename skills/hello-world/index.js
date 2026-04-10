/**
 * Hello World Skill - 我的第一个OpenClaw技能包
 * 作者：黄冠
 * 创建时间：2026年4月9日
 */

// 技能主函数
async function helloWorldSkill(params = {}) {
    const name = params.name || '开发者';
    const currentDate = new Date().toLocaleDateString('zh-CN');
    
    // 构建问候语
    const greeting = `
👋 你好${name}！这是我的第一个OpenClaw技能包！

🎯 技能信息：
- 名称：hello-world
- 描述：学习用的示例技能包
- 创建者：黄冠
- 创建时间：${currentDate}
- 版本：1.0.0

💡 功能说明：
这是一个简单的Hello World技能，用于验证OpenClaw技能开发环境。
你可以通过传递 --name 参数来自定义问候对象。

🚀 下一步：
1. 学习更多OpenClaw技能开发技巧
2. 开发实用的文件处理技能
3. 封装现有工具为技能包
4. 准备OpenClaw开发岗位面试

📚 学习资源：
- OpenClaw官方文档
- 技能开发指南
- GitHub示例项目

祝你学习顺利，早日掌握OpenClaw开发技能！ 🎉
    `.trim();
    
    return {
        success: true,
        message: greeting,
        data: {
            skillName: 'hello-world',
            creator: '黄冠',
            createdAt: currentDate,
            version: '1.0.0',
            parameters: params
        }
    };
}

// 导出技能函数
const skill = {
    name: 'hello-world',
    description: '我的第一个OpenClaw技能包',
    execute: helloWorldSkill,
    parameters: {
        name: {
            type: 'string',
            description: '问候的对象名称',
            optional: true,
            default: '开发者'
        }
    },
    examples: [
        {
            command: 'hello-world',
            description: '基本问候'
        },
        {
            command: 'hello-world --name "黄冠"',
            description: '个性化问候'
        }
    ]
};

module.exports = skill;