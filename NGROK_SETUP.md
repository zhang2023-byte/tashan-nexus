# 使用 ngrok 临时分享你的应用

## 快速开始

### 1. 安装 ngrok

```bash
# macOS
brew install ngrok

# 或从官网下载: https://ngrok.com/download
```

### 2. 注册并配置（可选但推荐）

访问 https://dashboard.ngrok.com/signup 注册账号，获取 authtoken：

```bash
ngrok authtoken YOUR_AUTH_TOKEN
```

免费版限制：
- 同时最多1个在线隧道
- 隧道URL每次启动会变化
- 有 ngrok 的品牌页面

### 3. 启动应用

打开**三个**终端窗口：

#### 终端1 - 启动后端
```bash
cd tashan-nexus/backend
npm start
```

看到 `他山协会服务器运行在 http://localhost:3001` 表示后端启动成功

#### 终端2 - 启动前端
```bash
cd tashan-nexus/frontend
npm run dev
```

看到 `Local: http://localhost:5173/` 表示前端启动成功

#### 终端3 - 启动 ngrok 隧道
```bash
ngrok http 5173
```

### 4. 分享链接

ngrok 会显示类似这样的输出：

```
Session Status    online
Account           Your Name (Plan: Free)
Version           3.x.x
Region            Asia Pacific (ap)
Forwarding        https://abc123.ngrok-free.app -> http://localhost:5173
```

**把 `https://abc123.ngrok-free.app` 这个链接分享给其他用户即可！**

## 工作原理

```
用户浏览器
    ↓
https://abc123.ngrok-free.app
    ↓
ngrok 隧道
    ↓
localhost:5173 (前端 Vite 服务器)
    ↓ /api 请求通过 Vite 代理转发
localhost:3001 (后端 Express 服务器)
    ↓
database.sqlite
```

所有 API 请求会被 Vite 的代理自动转发到后端，用户只需要访问一个 URL！

## 测试账号

数据库初始化后会自动创建两个测试账号：

- 用户名: `test`，密码: `123456`
- 用户名: `admin`，密码: `admin123`

你也可以注册新账号。

## 注意事项

⚠️ **重要安全提示：**

1. **不要分享敏感数据** - ngrok 是公网可访问的，任何人都能通过链接访问
2. **临时使用** - 适合演示和测试，不适合长期运行
3. **数据会保留** - 数据库文件在本地，关闭服务器后数据不会丢失
4. **每次重启 URL 会变** - 免费版的 ngrok 每次启动会生成新的随机 URL

## 常见问题

### Q: ngrok 显示 "ERR_NGROK_108"
A: 免费账号只能同时运行1个隧道。检查是否有其他 ngrok 进程在运行：
```bash
ps aux | grep ngrok
kill <进程ID>  # 如果有的话
```

### Q: 用户访问时显示 "Visit Site" 按钮
A: 这是 ngrok 免费版的警告页面，点击 "Visit Site" 即可继续访问

### Q: API 请求失败
A: 确保后端服务器（3001端口）正在运行

### Q: 数据库连接失败
A: 确保在 `backend` 目录下有 `database.sqlite` 文件

## 停止服务

在各个终端按 `Ctrl + C` 停止对应的服务：
- 终端1: 停止后端
- 终端2: 停止前端
- 终端3: 停止 ngrok

## 升级到付费版（可选）

付费版优势：
- 固定域名（URL不变）
- 自定义域名
- 更多并发隧道
- 移除品牌页面

访问 https://ngrok.com/pricing 了解更多
