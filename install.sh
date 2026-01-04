#!/bin/bash

# 他山协会平台 - 一键安装脚本

echo "======================================"
echo "  他山协会学科交叉合作平台"
echo "  安装程序"
echo "======================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到Node.js"
    echo "请先安装Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"
echo "✅ npm版本: $(npm -v)"
echo ""

# 修复npm权限问题
echo "🔧 检查npm权限..."
if [ ! -w ~/.npm ]; then
    echo "⚠️  检测到npm权限问题，尝试修复..."
    sudo chown -R $(whoami) ~/.npm
    if [ $? -eq 0 ]; then
        echo "✅ npm权限已修复"
    else
        echo "⚠️  权限修复失败，但将继续尝试安装"
    fi
fi
echo ""

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi
echo "✅ 后端依赖安装成功"
cd ..
echo ""

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi
echo "✅ 前端依赖安装成功"
cd ..
echo ""

echo "======================================"
echo "  🎉 安装完成！"
echo "======================================"
echo ""
echo "启动方式:"
echo ""
echo "方法1 - 分别启动（推荐用于开发）："
echo "  终端1: cd backend && npm run dev"
echo "  终端2: cd frontend && npm run dev"
echo ""
echo "方法2 - 使用启动脚本："
echo "  ./start.sh"
echo ""
echo "访问地址:"
echo "  前端: http://localhost:5173"
echo "  后端API: http://localhost:3001"
echo ""
echo "📚 查看使用文档:"
echo "  - README.md - 项目说明"
echo "  - QUICK_START.md - 快速开始"
echo "  - DEMO_GUIDE.md - 演示指南"
echo ""
echo "祝使用愉快！🚀"
