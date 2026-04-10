# joybo1-openclaw - OpenClaw 技能开发学习项目

![OpenClaw](https://img.shields.io/badge/OpenClaw-学习项目-blue)
![进度](https://img.shields.io/badge/进度-Day%204%2F15-green)
![许可证](https://img.shields.io/badge/许可证-MIT-lightgrey)

这是一个 OpenClaw 技能开发学习项目，按照 15 天实战计划进行系统学习。

## 🎯 项目目标

- 掌握 OpenClaw 技能开发全流程
- 每天完成一个实用技能开发
- 积累项目经验，准备相关岗位
- 建立完整的技能开发知识体系

## 📅 学习计划

### ✅ 已完成
- **Day 1**: hello-world 技能 - 环境验证和基础技能开发
- **Day 2**: file-reader 技能 - 文件操作和多格式支持
- **Day 3**: python-runner 技能 - Python代码安全执行
- **Day 4**: pdf-reader 技能 - PDF文件读取和文本提取

### 🔄 进行中
- **Day 5**: Python基础（上） - Skill开发需要的Python知识

### 📋 待完成
- Day 5-15: 按照计划逐步完成

## 📁 项目结构

```
joybo1-openclaw/
├── docs/                    # 项目文档
│   └── day1-summary.md     # Day 1 学习总结
├── skills/                  # OpenClaw 技能包
│   ├── hello-world/        # Day 1: 基础技能
│   ├── file-reader/        # Day 2: 文件读取技能
│   ├── python-runner/      # Day 3: Python执行技能
│   └── pdf-reader/         # Day 4: PDF读取技能
├── notes/                  # 学习笔记
│   └── git-learning-notes.md # Git 学习笔记
├── examples/               # 使用示例
├── plans/                  # 学习计划
│   └── 15-day-plan.md     # 15天详细计划
├── resources/              # 学习资源
│   └── useful-links.md    # 有用链接
├── .gitignore             # Git 忽略配置
├── LICENSE                # MIT 许可证
├── README.md              # 本文件
├── USAGE.md               # 详细使用说明
├── install.bat            # Windows安装脚本
├── install.sh             # Linux/Mac安装脚本
├── test-all.bat           # Windows测试脚本
├── test-all.sh            # Linux/Mac测试脚本
└── package.json           # 项目配置
```

## 🛠️ 技能介绍

### 1. hello-world 技能
- **功能**: 基础问候技能，验证开发环境
- **技术点**: OpenClaw技能结构、SKILL.md格式
- **使用方法**: `hello-world --name "用户名"`

### 2. file-reader 技能
- **功能**: 多格式文件读取和预览
- **技术点**: 文件系统操作、异步编程、错误处理
- **支持格式**: 文本、JSON、CSV、YAML、TOML等
- **使用方法**: `file-reader --path "文件路径" --lines 20`

### 3. python-runner 技能
- **功能**: Python代码安全执行
- **技术点**: 子进程调用、超时控制、安全检查
- **安全特性**: 危险代码检测、执行时间限制
- **使用方法**: `python-runner --code "print('Hello')" --timeout 5000`

### 4. pdf-reader 技能
- **功能**: PDF文件读取和文本提取
- **技术点**: PDF解析、文本提取、元数据读取
- **依赖库**: pdf-parse（专业PDF解析库）
- **使用方法**: `pdf-reader --path "文档.pdf" --preview-lines 50`

## 🚀 快速开始

### 环境要求
- Node.js 16+
- OpenClaw 最新版本
- Python 3.6+ (用于 python-runner 技能)

### 技能安装
```bash
# 克隆项目
git clone https://github.com/J0YBO1/joybo1-openclaw.git

# 安装技能依赖
cd joybo1-openclaw/skills/file-reader
npm install

cd ../python-runner
npm install

cd ../pdf-reader
npm install
```

### 技能测试
```bash
# 测试 file-reader 技能
cd skills/file-reader
node test.js

# 测试 python-runner 技能
cd ../python-runner
node test.js

# 测试 pdf-reader 技能
cd ../pdf-reader
node test.js
```

### 快速开始（推荐）
```bash
# Windows用户
install.bat          # 一键安装所有依赖
test-all.bat         # 运行所有测试

# Linux/Mac用户
chmod +x install.sh test-all.sh
./install.sh         # 一键安装所有依赖
./test-all.sh        # 运行所有测试

# 查看详细使用说明
cat USAGE.md         # Linux/Mac
type USAGE.md        # Windows
```

### 使用npm脚本
```bash
# 安装所有依赖
npm run install-all

# 运行所有测试
npm run test-all

# 单独测试某个技能
npm run test-file-reader
npm run test-python-runner
npm run test-pdf-reader
```

## 📚 学习资源

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [技能开发指南](https://docs.openclaw.ai/concepts/skills)

## 👤 作者

**joyboy** - OpenClaw 技能开发学习者

## 📄 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

_每天进步一点点，15天成为 OpenClaw 技能开发专家！_