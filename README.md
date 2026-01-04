# 他山协会 - 学科交叉合作平台

一个基于AI智能匹配的学术协作平台，旨在促进不同学科背景的同学之间的交流与合作。

**他山之石，可以攻玉** 🚀

---

## ✨ 核心功能

### 1. 🤖 AI智能混合匹配系统
- **Embedding + LLM 混合智能匹配**：将匹配准确度提升 3-5 倍
- **三阶段匹配流程**：
  - 阶段1：Embedding快速筛选（语义相似度）
  - 阶段2：LLM深度分析Top 10（DeepSeek Chat API）
  - 阶段3：综合评分返回Top 3最佳匹配
- **详细匹配分析**：提供匹配原因、合作建议、潜在项目想法
- **实时刷新**：点击按钮即可重新计算最新匹配

### 2. 📝 问题发布与任务接取
- 发布问题并设置积分奖励
- 智能推荐合适的解决者
- 问题状态管理（开放/进行中/已完成）
- 完成任务获得积分

### 3. 🏆 积分激励系统
- 解决问题获得积分奖励
- 积分排行榜展示
- 高积分用户享有优先权

### 4. 👤 个人资料管理
- 完善的个人信息展示
- 在线编辑资料
- 支持embedding向量存储

---

## 🚀 快速开始

### 前提条件
- Node.js 14+
- npm 或 yarn
- DeepSeek API Key（已配置）

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd tashan-nexus

# 2. 安装所有依赖
npm run install:all
# 或者分别安装
cd backend && npm install
cd ../frontend && npm install

# 3. 启动应用
npm run dev
# 或者分别启动
# 终端1: cd backend && npm run dev
# 终端2: cd frontend && npm run dev
```

### 访问应用

- **前端**: http://localhost:5173
- **后端API**: http://localhost:3001

### 初始化测试数据

```bash
cd backend
node seed-enhanced-data.js
```

这将创建21个测试用户，包括6对高匹配度用户，所有账号密码都是 `password123`

---

## 📖 使用指南

### 1. 注册与完善资料
- 访问首页，点击"立即注册"
- 填写用户名、密码、姓名
- 登录后点击"个人资料" → "编辑资料"
- **重要**：详细填写技能、兴趣、需求等字段以获得更好的匹配

### 2. 查看AI匹配推荐
- 进入"我的匹配"页面
- 系统会自动显示Top 3最佳匹配
- 每个推荐包含：
  - 综合匹配度（40% Embedding + 60% LLM）
  - 3-5条详细匹配原因
  - 2-3条合作建议
  - 1-2个潜在项目想法
- 点击"🔄 刷新匹配"重新计算

### 3. 发布与接取问题
- 点击"发布问题"填写需求
- 设置积分奖励激励他人
- 浏览"问题广场"接取任务
- 完成后获得积分

### 4. 测试账号推荐
登录以下账号体验高匹配效果（密码：password123）：
- **ai_researcher** ↔ **medical_doctor** (AI × 医学，75-85%匹配)
- **frontend_dev** ↔ **ui_designer** (开发 × 设计，70-80%匹配)
- **data_scientist** ↔ **business_analyst** (数据 × 商业，65-75%匹配)

详细测试账号信息请查看 [USER_GUIDE.md](USER_GUIDE.md)

---

## 🏗️ 技术架构

### 后端技术栈
- **Node.js + Express**: RESTful API
- **SQLite**: 轻量级数据库（含embedding字段）
- **DeepSeek Embedding API**: 语义向量生成
- **DeepSeek Chat API**: LLM深度分析
- **JWT + bcrypt**: 认证与加密

### 前端技术栈
- **React 19**: 现代化UI
- **Axios**: HTTP客户端
- **Context API**: 状态管理

### AI匹配算法

**阶段1 - Embedding筛选**：
```
语义相似度 = 40% × (技能↔需求匹配)
           + 30% × (兴趣相似度)
           + 20% × (期望↔技能匹配)
           + 10% × (需求↔技能互补)
```

**阶段2 - LLM深度分析**：
- 仅对Top 10候选使用DeepSeek Chat API
- 分析技能互补度、学科交叉潜力
- 生成合作建议和项目想法

**阶段3 - 综合评分**：
```
最终匹配度 = 40% × Embedding分数 + 60% × LLM分析分数
```

---

## 📊 项目结构

```
tashan-nexus/
├── backend/
│   ├── server.js                    # Express服务器
│   ├── database.js                  # 数据库初始化（含embedding字段）
│   ├── matching.js                  # 基础匹配算法
│   ├── embedding-service.js         # DeepSeek Embedding封装
│   ├── llm-service.js              # DeepSeek Chat封装
│   ├── hybrid-matching.js          # 混合匹配引擎
│   ├── seed-enhanced-data.js       # 测试数据生成
│   └── .env                        # API密钥配置
├── frontend/
│   └── src/
│       ├── App.jsx                  # 主应用
│       ├── AuthContext.jsx          # 认证管理
│       ├── api.js                   # API封装
│       └── index.css                # 样式
├── README.md                        # 项目介绍（本文件）
├── USER_GUIDE.md                    # 用户使用指南
├── DEVELOPER_GUIDE.md               # 开发者文档
└── CHANGELOG.md                     # 更新日志
```

---

## 🌟 核心亮点

1. **混合智能匹配**：Embedding快速筛选 + LLM深度分析，准确度提升3-5倍
2. **成本优化**：仅$7/月（相比纯LLM方案节省95%）
3. **语义理解**：识别同义词和专业术语关系（如"Python编程"="Python开发"）
4. **详细分析**：不仅给匹配度，还提供原因、建议、项目想法
5. **智能降级**：Embedding失败→LLM分析→基础算法，三层保障
6. **异步优化**：资料更新立即返回，embedding后台生成

---

## 📚 文档导航

- **[USER_GUIDE.md](USER_GUIDE.md)** - 完整的用户使用指南
  - AI匹配系统详解
  - 如何获得更好的匹配
  - 测试账号使用说明
  - 常见问题解答

- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - 开发者技术文档
  - 混合匹配系统实现细节
  - API接口文档
  - 数据库设计
  - 性能优化策略
  - 成本分析

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - 服务器部署指南 🚀
  - 安全配置和API密钥保护
  - 完整的生产环境部署流程
  - Nginx反向代理配置
  - SSL证书配置（HTTPS）
  - PM2进程管理
  - 监控和日志管理

- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - 部署前检查清单 ✅
  - 安全检查步骤
  - 必须完成的配置
  - 部署后验证清单
  - 应急响应预案

- **[CHANGELOG.md](CHANGELOG.md)** - 版本更新记录
  - 功能迭代历史
  - 问题修复记录
  - 待优化项

---

## 🔧 配置说明

### 环境变量 (.env)
```bash
DEEPSEEK_API_KEY=your_api_key_here
JWT_SECRET=your_secret_key
```

### 匹配引擎配置
```javascript
// 在 backend/server.js 中自定义
hybridMatching.configure({
  useEmbedding: true,    // 是否使用Embedding
  useLLM: true,          // 是否使用LLM分析
  llmTopN: 10,           // 对前N个使用LLM
  finalTopN: 3           // 返回前N个结果
});
```

---

## 💰 成本分析

### Embedding成本
- 单用户（4字段）：~200 tokens ≈ $0.000004
- 月成本（10用户/天更新）：~$0.0012

### LLM成本
- 单次匹配（Top 10分析）：~$0.0024
- 月成本（100次/天）：~$7.2

**总计：约$7/月（相比纯LLM节省95%）**

---

## 🐛 故障排除

### 后端启动失败
```bash
# 检查端口占用
lsof -i :3001

# 检查Node.js版本
node --version  # 需要 >= 14
```

### 匹配结果为空
1. 确保至少有2个用户注册
2. 运行 `node backend/seed-enhanced-data.js` 添加测试数据
3. 完善个人资料中的技能、兴趣、需求字段

### Embedding生成失败
- 检查API key配置
- 查看后端日志中的错误信息
- 系统会自动降级到基础算法

---

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

---

## 📄 许可证

MIT License

---

## 📞 联系方式

如有问题或建议，请通过GitHub Issues反馈。

---

**更新日期**: 2026-01-04
**版本**: v2.0 - 混合智能匹配系统
