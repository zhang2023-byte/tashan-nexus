#!/bin/bash

# 他山协会平台 - 启动脚本

echo "======================================"
echo "  他山协会学科交叉合作平台"
echo "  启动程序"
echo "======================================"
echo ""

# 检查依赖是否安装
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "❌ 检测到依赖未安装"
    echo "请先运行: ./install.sh"
    exit 1
fi

echo "🚀 正在启动后端服务器..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "✅ 后端服务器已启动 (PID: $BACKEND_PID)"
echo "   地址: http://localhost:3001"
cd ..
echo ""

# 等待后端启动
sleep 2

echo "🚀 正在启动前端开发服务器..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ 前端服务器已启动 (PID: $FRONTEND_PID)"
echo "   地址: http://localhost:5173"
cd ..
echo ""

echo "======================================"
echo "  ✨ 服务已全部启动！"
echo "======================================"
echo ""
echo "访问地址: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; echo '✅ 所有服务已停止'; exit 0" INT

# 保持脚本运行
wait
