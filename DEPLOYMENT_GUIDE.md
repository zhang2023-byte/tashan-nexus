# 🚀 服务器部署指南

完整的生产环境部署指南，包含安全配置、环境变量管理和服务器设置。

---

## 📋 目录

1. [安全检查清单](#安全检查清单)
2. [服务器环境准备](#服务器环境准备)
3. [部署步骤](#部署步骤)
4. [环境变量配置](#环境变量配置)
5. [进程管理](#进程管理)
6. [Nginx反向代理](#nginx反向代理)
7. [SSL证书配置](#ssl证书配置)
8. [监控和日志](#监控和日志)

---

## 🔒 安全检查清单

### ✅ 在部署前必须完成

- [x] 创建 `.gitignore` 文件（已完成）
- [x] 创建 `.env.example` 示例文件（已完成）
- [ ] 确认 `.env` 不在git追踪中
- [ ] 生成新的强JWT密钥
- [ ] 检查API key权限设置
- [ ] 配置服务器防火墙
- [ ] 设置HTTPS（SSL证书）

### ⚠️ API Key安全

**当前API Key**: `sk-ab4d196871d8494a800f56912d275be2`

**重要提醒**:
1. **永远不要提交 `.env` 到git**
2. 如果已提交，需要：
   - 立即撤销API key（在DeepSeek平台）
   - 生成新的API key
   - 清除git历史记录

---

## 🖥️ 服务器环境准备

### 1. 服务器要求

**最低配置**:
- **CPU**: 1核
- **内存**: 2GB RAM
- **存储**: 20GB
- **系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

**推荐配置**（生产环境）:
- **CPU**: 2核
- **内存**: 4GB RAM
- **存储**: 50GB SSD
- **带宽**: 5Mbps+

### 2. 安装必要软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # 应该显示 v18.x.x+
npm --version

# 安装PM2（进程管理器）
sudo npm install -g pm2

# 安装Nginx（可选，用于反向代理）
sudo apt install -y nginx

# 安装Git
sudo apt install -y git
```

---

## 🚀 部署步骤

### 步骤1: 上传代码到服务器

**方法A: 使用Git（推荐）**

```bash
# 在本地初始化git仓库（如果还没有）
cd /Users/willzhang/Documents/GitHub/TashanNexus/tashan-nexus
git init
git add .
git commit -m "Initial commit"

# 推送到GitHub/GitLab（确保.env已在.gitignore中）
git remote add origin <your-repo-url>
git push -u origin main

# 在服务器上克隆
ssh user@your-server-ip
cd /var/www
sudo git clone <your-repo-url> tashan-nexus
cd tashan-nexus
```

**方法B: 使用SCP直接上传**

```bash
# 在本地执行（排除node_modules和.env）
cd /Users/willzhang/Documents/GitHub/TashanNexus
tar --exclude='node_modules' --exclude='backend/.env' --exclude='*.sqlite' \
    -czf tashan-nexus.tar.gz tashan-nexus/

# 上传到服务器
scp tashan-nexus.tar.gz user@your-server-ip:/var/www/

# 在服务器上解压
ssh user@your-server-ip
cd /var/www
tar -xzf tashan-nexus.tar.gz
cd tashan-nexus
```

### 步骤2: 在服务器上配置环境变量

```bash
# 创建.env文件
cd /var/www/tashan-nexus/backend
nano .env

# 输入以下内容（使用你的实际值）
PORT=3001
JWT_SECRET=your_new_strong_random_jwt_secret_here
DATABASE_PATH=./database.sqlite
DEEPSEEK_API_KEY=sk-ab4d196871d8494a800f56912d275be2

# 保存并退出（Ctrl+X, Y, Enter）

# 设置严格的文件权限（重要！）
chmod 600 .env
```

**生成强JWT密钥**:
```bash
# 方法1: 使用openssl
openssl rand -base64 64

# 方法2: 使用Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 步骤3: 安装依赖

```bash
# 在项目根目录
cd /var/www/tashan-nexus

# 安装后端依赖
cd backend
npm install --production

# 安装前端依赖
cd ../frontend
npm install

# 构建前端生产版本
npm run build
```

### 步骤4: 初始化数据库

```bash
cd /var/www/tashan-nexus/backend

# 运行数据库初始化（会自动创建表）
node -e "require('./database')"

# 添加测试数据（可选）
node seed-enhanced-data.js
```

---

## ⚙️ 环境变量配置

### 开发环境 vs 生产环境

**开发环境** (`.env`):
```bash
PORT=3001
JWT_SECRET=development_secret
DATABASE_PATH=./database.sqlite
DEEPSEEK_API_KEY=sk-your-key-here
NODE_ENV=development
```

**生产环境** (`.env.production`):
```bash
PORT=3001
JWT_SECRET=<使用openssl生成的强随机密钥>
DATABASE_PATH=/var/data/tashan-nexus/database.sqlite
DEEPSEEK_API_KEY=sk-your-key-here
NODE_ENV=production
```

### 使用环境变量管理服务

**推荐: 使用系统环境变量（更安全）**

```bash
# 编辑系统环境变量
sudo nano /etc/environment

# 添加
TASHAN_JWT_SECRET="your_jwt_secret"
TASHAN_DEEPSEEK_KEY="sk-your-key"

# 在代码中读取
const jwtSecret = process.env.TASHAN_JWT_SECRET || process.env.JWT_SECRET;
```

---

## 🔄 进程管理（使用PM2）

### 配置PM2

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'tashan-backend',
      cwd: '/var/www/tashan-nexus/backend',
      script: 'server.js',
      instances: 2,                    // 使用2个实例（负载均衡）
      exec_mode: 'cluster',           // 集群模式
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/tashan/backend-error.log',
      out_file: '/var/log/tashan/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M'
    }
  ]
};
```

### 启动服务

```bash
# 创建日志目录
sudo mkdir -p /var/log/tashan
sudo chown -R $USER:$USER /var/log/tashan

# 使用PM2启动
cd /var/www/tashan-nexus
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs tashan-backend

# 设置开机自启
pm2 startup
pm2 save

# 其他常用命令
pm2 restart tashan-backend  # 重启
pm2 stop tashan-backend     # 停止
pm2 delete tashan-backend   # 删除
pm2 monit                   # 监控面板
```

---

## 🌐 Nginx反向代理

### 为什么需要Nginx？

1. **反向代理**: 隐藏后端端口，统一入口
2. **负载均衡**: 分发请求到多个后端实例
3. **静态文件服务**: 高效服务前端静态资源
4. **SSL终止**: 处理HTTPS加密
5. **安全性**: 防止直接暴露Node.js服务

### Nginx配置

创建 `/etc/nginx/sites-available/tashan-nexus`:

```nginx
# 后端API服务器
upstream backend {
    server 127.0.0.1:3001;
    # 如果有多个实例
    # server 127.0.0.1:3002;
    # server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 访问日志
    access_log /var/log/nginx/tashan-access.log;
    error_log /var/log/nginx/tashan-error.log;

    # 前端静态文件
    location / {
        root /var/www/tashan-nexus/frontend/dist;
        try_files $uri $uri/ /index.html;

        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端API代理
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 限制请求大小
    client_max_body_size 10M;
}
```

### 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/tashan-nexus /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

---

## 🔐 SSL证书配置（HTTPS）

### 使用Let's Encrypt（免费）

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 自动配置SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

配置完成后，Nginx会自动修改为：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # ... 其他配置 ...
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 监控和日志

### 1. PM2监控

```bash
# 实时监控
pm2 monit

# Web界面监控（可选）
pm2 install pm2-server-monit
```

### 2. 日志管理

```bash
# 查看PM2日志
pm2 logs tashan-backend

# 查看Nginx日志
sudo tail -f /var/log/nginx/tashan-access.log
sudo tail -f /var/log/nginx/tashan-error.log

# 设置日志轮转
sudo nano /etc/logrotate.d/tashan
```

`/etc/logrotate.d/tashan`:
```
/var/log/tashan/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### 3. 性能监控（可选）

```bash
# 安装监控工具
npm install -g clinic

# 性能分析
clinic doctor -- node server.js
```

---

## 🛡️ 安全加固

### 1. 防火墙配置

```bash
# 启用UFW防火墙
sudo ufw enable

# 允许SSH
sudo ufw allow 22/tcp

# 允许HTTP和HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 不允许直接访问Node.js端口
# (Nginx会在本地转发)

# 查看状态
sudo ufw status
```

### 2. 限制API访问频率

在Nginx中添加：

```nginx
# 在http块中
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# 在location /api块中
location /api {
    limit_req zone=api_limit burst=20 nodelay;
    # ... 其他配置
}
```

### 3. 定期备份

```bash
# 创建备份脚本
sudo nano /usr/local/bin/backup-tashan.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/tashan"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
cp /var/www/tashan-nexus/backend/database.sqlite \
   $BACKUP_DIR/database_$DATE.sqlite

# 备份.env
cp /var/www/tashan-nexus/backend/.env \
   $BACKUP_DIR/env_$DATE.backup

# 删除30天前的备份
find $BACKUP_DIR -name "*.sqlite" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# 设置权限
sudo chmod +x /usr/local/bin/backup-tashan.sh

# 添加到crontab（每天凌晨2点备份）
sudo crontab -e
# 添加: 0 2 * * * /usr/local/bin/backup-tashan.sh
```

---

## 🔄 更新部署

### 方法1: Git Pull（推荐）

```bash
cd /var/www/tashan-nexus

# 拉取最新代码
git pull origin main

# 更新依赖
cd backend && npm install
cd ../frontend && npm install && npm run build

# 重启服务
pm2 restart tashan-backend
```

### 方法2: 零停机部署

```bash
# 使用PM2的reload（不会中断服务）
pm2 reload tashan-backend
```

---

## 📝 部署检查清单

部署完成后，验证以下项目：

- [ ] 服务器可以通过域名访问
- [ ] HTTPS正常工作（绿锁图标）
- [ ] API接口正常响应
- [ ] 前端页面正常加载
- [ ] 用户注册登录功能正常
- [ ] 数据库读写正常
- [ ] PM2进程稳定运行
- [ ] 日志正常记录
- [ ] 防火墙规则正确
- [ ] 备份脚本定期执行

---

## 🆘 常见问题

### 1. 端口被占用
```bash
# 查找占用3001端口的进程
sudo lsof -i :3001
# 或
sudo netstat -tulpn | grep 3001

# 杀死进程
sudo kill -9 <PID>
```

### 2. 权限问题
```bash
# 修改目录所有者
sudo chown -R $USER:$USER /var/www/tashan-nexus

# 修改文件权限
chmod 755 /var/www/tashan-nexus
chmod 600 /var/www/tashan-nexus/backend/.env
```

### 3. Nginx 502 Bad Gateway
```bash
# 检查后端是否运行
pm2 status

# 检查端口是否监听
sudo netstat -tulpn | grep 3001

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

### 4. CORS错误
在 `backend/server.js` 中确认CORS配置：
```javascript
app.use(cors({
  origin: 'https://your-domain.com',  // 改为你的域名
  credentials: true
}));
```

---

## 📚 相关资源

- [PM2文档](https://pm2.keymetrics.io/docs/)
- [Nginx文档](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Node.js生产环境最佳实践](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**部署完成后，请立即更换所有敏感密钥！**

**更新日期**: 2026-01-04
