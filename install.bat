@echo off
echo ========================================
echo    joybo1-openclaw 技能依赖安装脚本
echo ========================================
echo.

echo [1/5] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到Node.js
    echo 请先安装Node.js 16或更高版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js已安装: %node_version%

echo.
echo [2/5] 检查npm版本...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到npm
    echo 请确保npm已正确安装
    pause
    exit /b 1
)
echo ✅ npm已安装

echo.
echo [3/5] 开始安装技能依赖...
echo.

echo 📦 安装 file-reader 技能依赖...
cd skills\file-reader
call npm install
if errorlevel 1 (
    echo ❌ file-reader依赖安装失败
    pause
    exit /b 1
)
cd ..\..

echo 📦 安装 python-runner 技能依赖...
cd skills\python-runner
call npm install
if errorlevel 1 (
    echo ❌ python-runner依赖安装失败
    pause
    exit /b 1
)
cd ..\..

echo 📦 安装 pdf-reader 技能依赖...
cd skills\pdf-reader
call npm install
if errorlevel 1 (
    echo ❌ pdf-reader依赖安装失败
    pause
    exit /b 1
)
cd ..\..

echo 📦 安装 hello-world 技能依赖...
cd skills\hello-world
call npm install
if errorlevel 1 (
    echo ❌ hello-world依赖安装失败
    pause
    exit /b 1
)
cd ..\..

echo.
echo [4/5] 检查Python环境（python-runner需要）...
python --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  警告: 未检测到Python
    echo python-runner技能需要Python 3.6+
    echo 可以稍后安装: https://www.python.org/
) else (
    echo ✅ Python已安装
)

echo.
echo [5/5] 安装完成！
echo ========================================
echo ✅ 所有技能依赖安装成功！
echo.
echo 📚 使用说明:
echo 1. 查看详细文档: type USAGE.md 或 notepad USAGE.md
echo 2. 测试技能: 运行 test-all.bat
echo 3. 查看技能文档: 进入各技能目录查看README.md
echo.
echo 🚀 快速测试:
echo cd skills\file-reader
echo node test.js
echo ========================================
echo.
pause