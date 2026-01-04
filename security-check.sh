#!/bin/bash

echo "========================================="
echo "  他山协会 - 安全检查脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查项目计数
PASSED=0
FAILED=0
WARNING=0

# 检查 .gitignore 是否存在
echo -n "✓ 检查 .gitignore 文件... "
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}存在${NC}"
    ((PASSED++))
else
    echo -e "${RED}不存在${NC}"
    echo "  建议: 创建 .gitignore 文件以防止敏感文件被提交"
    ((FAILED++))
fi

# 检查 .env 是否在 .gitignore 中
echo -n "✓ 检查 .env 是否在 .gitignore 中... "
if [ -f ".gitignore" ] && grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}是${NC}"
    ((PASSED++))
else
    echo -e "${RED}否${NC}"
    echo "  建议: 在 .gitignore 中添加 '.env' 行"
    ((FAILED++))
fi

# 检查是否已初始化 git
echo -n "✓ 检查 git 仓库状态... "
if [ -d ".git" ]; then
    echo -e "${YELLOW}已初始化${NC}"

    # 检查 .env 是否被追踪
    if git ls-files --error-unmatch backend/.env >/dev/null 2>&1; then
        echo -e "  ${RED}警告: backend/.env 已被 git 追踪！${NC}"
        echo "  需要立即执行:"
        echo "    git rm --cached backend/.env"
        echo "    git commit -m 'Remove .env from tracking'"
        ((FAILED++))
    else
        echo -e "  ${GREEN}backend/.env 未被追踪${NC}"
        ((PASSED++))
    fi
    ((WARNING++))
else
    echo -e "${GREEN}未初始化${NC}"
    echo "  (还未推送到远程仓库，API key安全)"
    ((PASSED++))
fi

# 检查 .env.example 是否存在
echo -n "✓ 检查 .env.example 文件... "
if [ -f "backend/.env.example" ]; then
    echo -e "${GREEN}存在${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}不存在${NC}"
    echo "  建议: 创建 .env.example 作为模板"
    ((WARNING++))
fi

# 检查 .env 文件权限
echo -n "✓ 检查 .env 文件权限... "
if [ -f "backend/.env" ]; then
    PERM=$(stat -f "%Lp" backend/.env 2>/dev/null || stat -c "%a" backend/.env 2>/dev/null)
    if [ "$PERM" = "600" ] || [ "$PERM" = "400" ]; then
        echo -e "${GREEN}$PERM (安全)${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}$PERM (建议设置为 600)${NC}"
        echo "  执行: chmod 600 backend/.env"
        ((WARNING++))
    fi
else
    echo -e "${YELLOW}backend/.env 不存在${NC}"
    ((WARNING++))
fi

# 检查 JWT_SECRET 强度
echo -n "✓ 检查 JWT_SECRET 强度... "
if [ -f "backend/.env" ]; then
    JWT_SECRET=$(grep "^JWT_SECRET=" backend/.env | cut -d'=' -f2)
    if [ -z "$JWT_SECRET" ]; then
        echo -e "${RED}未设置${NC}"
        ((FAILED++))
    elif [ ${#JWT_SECRET} -lt 32 ]; then
        echo -e "${YELLOW}太弱 (长度: ${#JWT_SECRET})${NC}"
        echo "  建议: 使用至少32个字符的随机字符串"
        echo "  生成命令: openssl rand -base64 64"
        ((WARNING++))
    else
        echo -e "${GREEN}强度足够 (长度: ${#JWT_SECRET})${NC}"
        ((PASSED++))
    fi
else
    echo -e "${YELLOW}跳过${NC}"
fi

# 检查 node_modules 是否被忽略
echo -n "✓ 检查 node_modules 是否在 .gitignore 中... "
if [ -f ".gitignore" ] && grep -q "node_modules" .gitignore; then
    echo -e "${GREEN}是${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}否${NC}"
    echo "  建议: 在 .gitignore 中添加 'node_modules/'"
    ((WARNING++))
fi

# 检查数据库文件是否被忽略
echo -n "✓ 检查 *.sqlite 是否在 .gitignore 中... "
if [ -f ".gitignore" ] && grep -q "\.sqlite" .gitignore; then
    echo -e "${GREEN}是${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}否${NC}"
    echo "  建议: 在 .gitignore 中添加 '*.sqlite'"
    ((WARNING++))
fi

# 检查 DEEPSEEK_API_KEY 是否存在
echo -n "✓ 检查 DEEPSEEK_API_KEY... "
if [ -f "backend/.env" ]; then
    API_KEY=$(grep "^DEEPSEEK_API_KEY=" backend/.env | cut -d'=' -f2)
    if [ -z "$API_KEY" ] || [ "$API_KEY" = "your_deepseek_api_key_here" ]; then
        echo -e "${YELLOW}未配置或使用默认值${NC}"
        ((WARNING++))
    elif [[ $API_KEY == sk-* ]]; then
        echo -e "${GREEN}已配置${NC}"
        echo -e "  ${YELLOW}提醒: 部署前请确保此密钥安全${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}格式可能不正确${NC}"
        ((WARNING++))
    fi
else
    echo -e "${YELLOW}跳过${NC}"
fi

# 总结
echo ""
echo "========================================="
echo "  检查结果汇总"
echo "========================================="
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${YELLOW}警告: $WARNING${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}⚠️  发现严重安全问题，请立即修复！${NC}"
    exit 1
elif [ $WARNING -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现一些建议项，请考虑改进${NC}"
    exit 0
else
    echo -e "${GREEN}✓ 安全检查全部通过！${NC}"
    exit 0
fi
