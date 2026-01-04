@echo off
REM 他山协会平台 - Windows启动脚本

echo ======================================
echo   他山协会学科交叉合作平台
echo   启动程序
echo ======================================
echo.

REM 检查依赖
if not exist "backend\node_modules" (
    echo X 检测到后端依赖未安装
    echo 请先运行 install.bat
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo X 检测到前端依赖未安装
    echo 请先运行 install.bat
    pause
    exit /b 1
)

echo [*] 正在启动后端服务器...
cd backend
start "后端服务器" cmd /k npm run dev
cd ..
echo [OK] 后端服务器已启动
echo     地址: http://localhost:3001
echo.

REM 等待后端启动
timeout /t 3 /nobreak >nul

echo [*] 正在启动前端开发服务器...
cd frontend
start "前端服务器" cmd /k npm run dev
cd ..
echo [OK] 前端服务器已启动
echo     地址: http://localhost:5173
echo.

echo ======================================
echo   服务已全部启动！
echo ======================================
echo.
echo 访问地址: http://localhost:5173
echo.
echo 关闭窗口以停止服务
echo.
pause
