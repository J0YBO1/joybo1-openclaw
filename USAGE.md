# joybo1-openclaw 使用说明

![OpenClaw](https://img.shields.io/badge/OpenClaw-技能集合-blue)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)
![进度](https://img.shields.io/badge/技能数量-4个-orange)

这是一个包含4个实用OpenClaw技能的项目集合，涵盖了文件处理、代码执行、PDF解析等常见需求。

## 🚀 快速开始

### 环境要求
- **Node.js**: 版本16或更高
- **npm**: 版本8或更高（通常随Node.js一起安装）
- **Python**: 3.6+（仅python-runner技能需要）

### 一键安装（Windows）
```bash
# 运行安装脚本
install.bat
```

### 一键安装（Linux/Mac）
```bash
# 给脚本执行权限
chmod +x install.sh

# 运行安装脚本
./install.sh
```

### 手动安装
```bash
# 进入项目目录
cd joybo1-openclaw

# 安装每个技能的依赖
cd skills/file-reader && npm install
cd ../python-runner && npm install
cd ../pdf-reader && npm install
cd ../hello-world && npm install
```

## 📦 技能介绍

### 1. hello-world 技能
**功能**: 基础问候技能，验证开发环境

**使用方法**:
```bash
cd skills/hello-world
node index.js --name "你的名字"
```

**示例输出**:
```
👋 Hello, 黄冠!
🎉 这是你的第一个OpenClaw技能！
```

### 2. file-reader 技能
**功能**: 多格式文件读取和预览

**支持格式**: 文本、JSON、CSV、YAML、TOML、XML、HTML等

**使用方法**:
```bash
cd skills/file-reader
node index.js --path "文件路径" --lines 20
```

**常用参数**:
- `--path`: 文件路径（必需）
- `--lines`: 预览行数（默认：50）
- `--format`: 文件格式（自动检测）

**示例**:
```bash
node index.js --path "data.json" --lines 10
```

### 3. python-runner 技能
**功能**: Python代码安全执行

**安全特性**: 超时控制、危险代码检测、沙箱环境

**使用方法**:
```bash
cd skills/python-runner
node index.js --code "print('Hello, World!')"
```

**常用参数**:
- `--code`: Python代码字符串
- `--file`: Python脚本文件路径
- `--timeout`: 执行超时时间（毫秒，默认：5000）
- `--safe-mode`: 安全模式（默认：开启）

**示例**:
```bash
# 执行单行代码
node index.js --code "import math; print(math.pi)"

# 执行脚本文件
node index.js --file "script.py" --timeout 10000
```

### 4. pdf-reader 技能
**功能**: PDF文件读取和文本提取

**依赖库**: pdf-parse（专业PDF解析库）

**使用方法**:
```bash
cd skills/pdf-reader
node index.js --path "文档.pdf" --preview-lines 30
```

**常用参数**:
- `--path`: PDF文件路径（必需）
- `--pages`: 页面范围，如"1-5"或"1,3,5"（默认：所有页面）
- `--preview-lines`: 预览文本行数（默认：100）
- `--metadata`: 显示元数据信息（默认：开启）

**示例**:
```bash
# 读取PDF前3页
node index.js --path "report.pdf" --pages "1-3"

# 只显示元数据
node index.js --path "document.pdf" --no-extract-text --metadata
```

## 🧪 技能测试

### 运行所有测试
```bash
# 使用测试脚本
test-all.bat  # Windows
./test-all.sh # Linux/Mac
```

### 单独测试每个技能
```bash
# 测试file-reader
cd skills/file-reader
node test.js

# 测试python-runner
cd ../python-runner
node test.js

# 测试pdf-reader
cd ../pdf-reader
node test.js
```

## 🔧 作为OpenClaw技能使用

### 方法1：复制到OpenClaw技能目录
```bash
# 将技能复制到OpenClaw的skills目录
cp -r skills/* ~/.openclaw/workspace/skills/

# Windows
xcopy skills\* %USERPROFILE%\.openclaw\workspace\skills\ /E
```

### 方法2：配置OpenClaw加载外部路径
在OpenClaw配置文件中添加：
```json
{
  "skills": {
    "paths": [
      "C:/path/to/joybo1-openclaw/skills"
    ]
  }
}
```

## 📁 项目结构
```
joybo1-openclaw/
├── skills/                  # 技能目录
│   ├── hello-world/        # 基础问候技能
│   ├── file-reader/        # 文件读取技能
│   ├── python-runner/      # Python执行技能
│   └── pdf-reader/         # PDF读取技能
├── docs/                   # 学习文档
├── notes/                  # 学习笔记
├── examples/               # 使用示例
├── install.bat            # Windows安装脚本
├── install.sh             # Linux/Mac安装脚本
├── test-all.bat           # Windows测试脚本
├── test-all.sh            # Linux/Mac测试脚本
├── USAGE.md               # 本使用说明
└── README.md              # 项目介绍
```

## 🐛 故障排除

### 常见问题

#### Q1: npm install 失败
**解决方案**:
```bash
# 清理npm缓存
npm cache clean --force

# 重新安装
npm install
```

#### Q2: pdf-reader 无法解析PDF
**解决方案**:
```bash
# 确保已安装pdf-parse库
cd skills/pdf-reader
npm install pdf-parse
```

#### Q3: python-runner 无法执行Python代码
**解决方案**:
1. 确认Python已安装: `python --version`
2. 确认Python在系统PATH中
3. 尝试使用完整Python路径

#### Q4: 技能在OpenClaw中不显示
**解决方案**:
1. 确认技能目录结构正确
2. 确认SKILL.md文件存在且格式正确
3. 重启OpenClaw Gateway: `openclaw gateway restart`

### 获取帮助
- 查看技能详细文档: 每个技能目录下的README.md
- 查看测试文件: 了解技能的正确用法
- 查看示例: examples/目录中的使用示例

## 🤝 贡献指南

### 报告问题
1. 在GitHub Issues中创建新问题
2. 描述问题的详细步骤
3. 提供错误信息和环境信息

### 提交改进
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 📄 许可证

本项目基于MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👤 作者

**joyboy** - OpenClaw技能开发学习者

---

_希望这些技能能帮助你提高工作效率！如果有任何问题，请查看详细文档或提交Issue。_