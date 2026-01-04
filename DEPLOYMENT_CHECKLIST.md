# ✅ 部署前安全检查清单

在部署到服务器前，请确保完成以下所有步骤。

---

## 🔒 必须完成的安全步骤

### 1. 保护敏感文件 ✅

- [x] 已创建 `.gitignore` 文件
- [x] `.env` 已添加到 `.gitignore`
- [x] `*.sqlite` 已添加到 `.gitignore`
- [x] `node_modules/` 已添加到 `.gitignore`

### 2. 更新JWT密钥 ⚠️

**当前JWT密钥强度**: 太弱（长度28）

**建议操作**:

```bash
# 生成新的强JWT密钥
openssl rand -base64 64

# 将生成的密钥更新到 backend/.env
nano backend/.env
# 替换 JWT_SECRET= 后面的值
```

**已为你生成一个强密钥**:
```
XL+QV2BKLPZRuFaMAJZw7eyqAO9VpwmS3gPzGygxqHpcJPVE7ru3+y6QFFt/7AV4wjgj4TxX78+ubhhAzkgTyg==
```

### 3. API Key安全

**当前状态**: ✅ 已配置，未推送到git

**部署时注意**:
- [ ] 确认DeepSeek API key有足够的配额
- [ ] 在DeepSeek平台设置使用限制（可选）
- [ ] 考虑为生产环境使用单独的API key

### 4. 文件权限

**当前状态**: ✅ `.env` 权限为600（安全）

**部署时执行**:
```bash
# 在服务器上设置严格权限
chmod 600 /var/www/tashan-nexus/backend/.env
chmod 644 /var/www/tashan-nexus/backend/.env.example
```

---

## 📋 部署步骤快速检查

### 准备阶段

- [ ] 运行 `./security-check.sh` 确保本地安全
- [ ] 更新JWT密钥到强随机值
- [ ] 准备好服务器（Ubuntu/CentOS等）
- [ ] 购买域名并配置DNS（可选）

### 上传代码

**方法1: 使用Git（推荐）**

```bash
# 本地初始化git
git init
git add .
git commit -m "Initial commit"

# 推送到GitHub/GitLab（私有仓库）
git remote add origin <your-private-repo-url>
git push -u origin main

# 在服务器克隆
ssh user@server
git clone <your-private-repo-url> /var/www/tashan-nexus
```

**方法2: 使用SCP**

```bash
# 打包（排除敏感文件）
tar --exclude='node_modules' \
    --exclude='backend/.env' \
    --exclude='*.sqlite' \
    --exclude='.git' \
    -czf tashan-nexus.tar.gz .

# 上传
scp tashan-nexus.tar.gz user@server:/var/www/

# 在服务器解压
ssh user@server
cd /var/www
tar -xzf tashan-nexus.tar.gz
mv tashan-nexus-package tashan-nexus
```

### 服务器配置

- [ ] 安装Node.js 18+
- [ ] 安装PM2进程管理器
- [ ] 安装Nginx（可选）
- [ ] 配置防火墙（UFW/iptables）

### 环境变量配置

```bash
# 在服务器上创建.env
cd /var/www/tashan-nexus/backend
nano .env

# 输入以下内容（使用你的实际值）
PORT=3001
JWT_SECRET=<粘贴上面生成的强密钥>
DATABASE_PATH=./database.sqlite
DEEPSEEK_API_KEY=sk-ab4d196871d8494a800f56912d275be2

# 设置严格权限
chmod 600 .env
```

### 安装依赖和启动

```bash
# 安装依赖
cd /var/www/tashan-nexus/backend
npm install --production

cd /var/www/tashan-nexus/frontend
npm install
npm run build

# 初始化数据库
cd /var/www/tashan-nexus/backend
node -e "require('./database')"

# 添加测试数据（可选）
node seed-enhanced-data.js

# 使用PM2启动
pm2 start server.js --name tashan-backend
pm2 save
pm2 startup
```

### Nginx配置（推荐）

```bash
# 创建Nginx配置
sudo nano /etc/nginx/sites-available/tashan-nexus

# 参考 DEPLOYMENT_GUIDE.md 中的配置

# 启用站点
sudo ln -s /etc/nginx/sites-available/tashan-nexus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL证书（HTTPS）

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 自动配置SSL
sudo certbot --nginx -d your-domain.com
```

---

## 🔍 部署后验证

### 功能测试

- [ ] 访问 http://your-domain.com 能看到首页
- [ ] HTTPS正常工作（绿锁图标）
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] AI匹配功能正常
- [ ] 问题发布功能正常
- [ ] 积分系统正常

### 安全测试

- [ ] 无法直接访问 :3001 端口（被防火墙阻止）
- [ ] `.env` 文件不可通过web访问
- [ ] SQL注入测试通过
- [ ] XSS攻击测试通过
- [ ] CORS配置正确

### 性能测试

```bash
# 使用AB测试工具
ab -n 1000 -c 10 https://your-domain.com/

# 检查响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/api/matches
```

---

## 📊 监控设置

### PM2监控

```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs tashan-backend

# 实时监控
pm2 monit
```

### 日志查看

```bash
# Nginx访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 应用日志
pm2 logs tashan-backend --lines 100
```

---

## 🔄 日常维护

### 备份

```bash
# 数据库备份
cp /var/www/tashan-nexus/backend/database.sqlite \
   /var/backups/tashan/database_$(date +%Y%m%d).sqlite

# 定期自动备份（crontab）
0 2 * * * /usr/local/bin/backup-tashan.sh
```

### 更新部署

```bash
# 拉取最新代码
cd /var/www/tashan-nexus
git pull origin main

# 更新依赖
cd backend && npm install
cd ../frontend && npm install && npm run build

# 零停机重启
pm2 reload tashan-backend
```

---

## ⚠️ 应急响应

### API Key泄露

如果API key不慎泄露：

1. **立即撤销旧密钥**
   - 登录DeepSeek平台
   - 删除或禁用泄露的密钥

2. **生成新密钥**
   - 创建新的API key
   - 更新服务器 `.env` 文件

3. **重启服务**
   ```bash
   pm2 restart tashan-backend
   ```

4. **清除git历史**（如果已提交）
   ```bash
   # 使用BFG Repo-Cleaner
   bfg --replace-text passwords.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

### 服务器被攻击

1. 立即停止服务
   ```bash
   pm2 stop tashan-backend
   sudo systemctl stop nginx
   ```

2. 检查日志
   ```bash
   sudo tail -1000 /var/log/nginx/access.log | grep "404\|500"
   pm2 logs tashan-backend --lines 500
   ```

3. 修复漏洞，更新密钥

4. 重新启动

---

## 📞 支持资源

- [完整部署指南](DEPLOYMENT_GUIDE.md)
- [用户使用指南](USER_GUIDE.md)
- [开发者文档](DEVELOPER_GUIDE.md)

---

**记住**: 安全无小事，部署前请仔细检查每一项！

**最后更新**: 2026-01-04
