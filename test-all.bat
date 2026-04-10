@echo off
echo ========================================
echo    joybo1-openclaw 技能测试脚本
echo ========================================
echo.

echo [1/4] 测试 file-reader 技能...
cd skills\file-reader
node test.js
if errorlevel 1 (
    echo ❌ file-reader测试失败
    pause
    exit /b 1
)
cd ..\..

echo [2/4] 测试 python-runner 技能...
cd skills\python-runner
node test.js
if errorlevel 1 (
    echo ❌ python-runner测试失败
    pause
    exit /b 1
)
cd ..\..

echo [3/4] 测试 pdf-reader 技能...
cd skills\pdf-reader
node test.js
if errorlevel 1 (
    echo ❌ pdf-reader测试失败
    pause
    exit /b 1
)
cd ..\..

echo [4/4] 测试 hello-world 技能...
cd skills\hello-world
node test.js
if errorlevel 1 (
    echo ❌ hello-world测试失败
    pause
    exit /b 1
)
cd ..\..

echo.
echo ========================================
echo ✅ 所有技能测试通过！
echo.
echo 🎉 恭喜！所有技能功能正常。
echo.
echo 📋 测试结果汇总：
echo - file-reader: ✅ 通过
echo - python-runner: ✅ 通过  
echo - pdf-reader: ✅ 通过
echo - hello-world: ✅ 通过
echo ========================================
echo.
pause