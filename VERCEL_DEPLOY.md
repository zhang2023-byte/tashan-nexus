# 🚀 Vercel 部署指南

## 📋 部署前准备

### 1. 确认 Git 状态

```bash
# 在项目根目录
cd /Users/willzhang/Documents/GitHub/TashanNexus/tashan-nexus

# 检查 .env 是否被 .gitignore 排除（重要！）
git status

# 确保 backend/.env 不在待提交列表中
# 如果看到 .env，立即执行：
git rm --cached backend/.env
git add .gitignore
git commit -m "Remove .env from git tracking"
```

### 2. 初始化 Git 仓库（如果还没有）

```bash
# 初始化仓库
git init

# 添加所有文件（.env 会被 .gitignore 自动排除）
git add .

# 提交
git commit -m "Initial commit for Vercel deployment"
```

### 3. 推送到 GitHub

```bash
# 在 GitHub 创建新仓库，然后执行：
git remote add origin https://github.com/你的用户名/TashanNexus.git
git branch -M main
git push -u origin main
```

---

## 🌐 Vercel 部署步骤

### 方法 1: 使用 Vercel 网站部署（推荐，最简单）

**第一步：注册/登录 Vercel**

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击 "Sign Up" 使用 GitHub 账号登录
3. 授权 Vercel 访问你的 GitHub 仓库

**第二步：导入项目**

1. 点击 "Add New Project"
2. 选择 "Import Git Repository"
3. 找到并选择 `TashanNexus` 仓库
4. 点击 "Import"

**第三步：配置项目**

在配置页面：

1. **Project Name**: `tashan-nexus`（或自定义）
2. **Framework Preset**: `Other`
3. **Root Directory**: `./` （默认）
4. **Build Command**: 留空（使用 vercel.json 配置）
5. **Output Directory**: 留空（使用 vercel.json 配置）

**第四步：配置环境变量（重要！）**

点击 "Environment Variables" 添加以下变量：

| 名称 | 值 | 说明 |
|------|------|------|
| `JWT_SECRET` | `生成的强随机密钥` | JWT 加密密钥 |
| `DEEPSEEK_API_KEY` | `sk-your-key-here` | DeepSeek API 密钥 |
| `PORT` | `3001` | 后端端口 |
| `DATABASE_PATH` | `/tmp/database.sqlite` | 数据库路径 |
| `NODE_ENV` | `production` | 环境标识 |

**生成 JWT_SECRET**:
```bash
# 在本地终端运行
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# 复制输出的字符串
```

**第五步：部署**

1. 点击 "Deploy" 按钮
2. 等待 2-3 分钟构建完成
3. 看到 "🎉 Congratulations!" 就成功了！

**第六步：访问你的网站**

Vercel 会给你一个 URL，类似：
- `https://tashan-nexus.vercel.app`

---

### 方法 2: 使用 Vercel CLI（终端命令）

**安装 Vercel CLI**:
```bash
npm i -g vercel
```

**登录**:
```bash
vercel login
```

**部署**:
```bash
cd /Users/willzhang/Documents/GitHub/TashanNexus/tashan-nexus

# 第一次部署
vercel

# 根据提示操作：
# - 确认项目设置
# - 等待部署完成

# 生产环境部署
vercel --prod
```

**配置环境变量（CLI）**:
```bash
vercel env add JWT_SECRET
# 输入密钥

vercel env add DEEPSEEK_API_KEY
# 输入 API key

vercel env add DATABASE_PATH
# 输入 /tmp/database.sqlite
```

---

## ⚠️ 重要注意事项

### 1. 数据库限制

Vercel 是无服务器（Serverless）环境，**不支持持久化 SQLite**。

**问题**：每次部署后数据会丢失

**临时解决方案**：
- 使用 `/tmp` 目录（临时存储，适合测试）
- 每次冷启动会重新初始化数据库

**长期解决方案**（推荐）：
1. **使用 Vercel Postgres**（免费额度）
   ```bash
   # 安装 Vercel 的 Postgres SDK
   npm install @vercel/postgres
   ```

2. **使用 PlanetScale**（免费 MySQL）
   - 注册 [PlanetScale](https://planetscale.com)
   - 创建数据库
   - 修改代码使用 MySQL

3. **使用 Supabase**（免费 PostgreSQL）
   - 注册 [Supabase](https://supabase.com)
   - 创建项目
   - 使用 PostgreSQL 连接

### 2. 文件上传限制

Vercel 有 **4.5MB 请求体限制**，如果需要上传大文件：
- 使用 Vercel Blob Storage
- 或使用 Cloudinary/AWS S3

### 3. 冷启动时间

无服务器函数会有冷启动（~2-5秒），首次访问可能较慢。

---

## 🔧 故障排除

### 问题 1: 部署失败

**检查构建日志**：
- Vercel Dashboard → 你的项目 → Deployments → 点击失败的部署
- 查看 "Build Logs"

**常见错误**：
- `Module not found`: 检查 `package.json` 依赖是否完整
- `Build failed`: 确保 `vercel.json` 配置正确

### 问题 2: API 请求 404

**检查**：
1. 确认 `vercel.json` 路由配置正确
2. 确认前端 API 地址使用 `/api`
3. 查看 Vercel Dashboard 的 "Functions" 标签

### 问题 3: 环境变量未生效

**解决**：
1. Vercel Dashboard → Settings → Environment Variables
2. 确认变量已添加
3. 重新部署（Deployments → Redeploy）

### 问题 4: CORS 错误

在 `backend/server.js` 中：
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://tashan-nexus.vercel.app'  // 改为你的 Vercel 域名
    : '*',
  credentials: true
}));
```

---

## 🎯 部署后测试清单

- [ ] 访问首页，页面正常加载
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] API 请求正常响应（打开浏览器控制台 Network 标签检查）
- [ ] 没有 CORS 错误
- [ ] 没有 404 错误

---

## 🔄 更新部署

**方法 1: Git Push 自动部署**

```bash
# 修改代码后
git add .
git commit -m "Update features"
git push origin main

# Vercel 会自动检测到推送并重新部署
```

**方法 2: 手动触发**

- Vercel Dashboard → Deployments → Redeploy

**方法 3: CLI**

```bash
vercel --prod
```

---

## 📊 监控和日志

### 查看运行日志

1. Vercel Dashboard → 你的项目 → Functions
2. 点击任意函数查看实时日志
3. 或使用 CLI：
   ```bash
   vercel logs
   ```

### 性能监控

- Dashboard → Analytics 查看访问统计
- Dashboard → Speed Insights 查看性能指标

---

## 💡 优化建议

### 1. 使用自定义域名

1. Vercel Dashboard → Settings → Domains
2. 添加你的域名（如 `tashan.com`）
3. 在域名提供商添加 DNS 记录

### 2. 启用分析

```bash
npm install @vercel/analytics
```

在 `frontend/src/main.jsx`:
```javascript
import { inject } from '@vercel/analytics';
inject();
```

### 3. 添加 SEO

在 `frontend/index.html`:
```html
<head>
  <title>他山协会 - 学科交叉合作平台</title>
  <meta name="description" content="促进跨学科学术合作的智能匹配平台">
  <meta property="og:image" content="/preview.png">
</head>
```

---

## 🆘 需要帮助？

- [Vercel 文档](https://vercel.com/docs)
- [Vercel 社区](https://github.com/vercel/vercel/discussions)
- [联系 Vercel 支持](https://vercel.com/support)

---

**部署成功后，记得分享你的网站链接！** 🎉
