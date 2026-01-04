@echo off
REM 他山协会平台 - Windows安装脚本

echo ======================================
echo   他山协会学科交叉合作平台
echo   安装程序
echo ======================================
echo.

REM 检查Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X 错误: 未检测到Node.js
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js已安装
node -v
npm -v
echo.

REM 安装后端依赖
echo [*] 安装后端依赖...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo X 后端依赖安装失败
    pause
    exit /b 1
)
echo [OK] 后端依赖安装成功
cd ..
echo.

REM 安装前端依赖
echo [*] 安装前端依赖...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo X 前端依赖安装失败
    pause
    exit /b 1
)
echo [OK] 前端依赖安装成功
cd ..
echo.

echo ======================================
echo   安装完成！
echo ======================================
echo.
echo 启动方式:
echo   双击运行 start.bat
echo.
echo 或分别启动:
echo   后端: cd backend ^&^& npm run dev
echo   前端: cd frontend ^&^& npm run dev
echo.
echo 访问地址:
echo   前端: http://localhost:5173
echo   后端API: http://localhost:3001
echo.
pause
