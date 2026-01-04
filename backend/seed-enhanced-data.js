// 增强版测试数据脚本 - 包含高匹配度用户对
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function seedEnhancedData() {
  console.log('开始添加增强版模拟数据（包含高匹配度用户对）...\n');

  // 增强版用户数据 - 设计了多个高匹配度的用户对
  const users = [
    // === 高匹配组1：AI与生物医学交叉 ===
    {
      username: 'ai_researcher',
      password: 'password123',
      name: 'Alex Chen',
      institution: '清华大学',
      degree: '博士',
      major: '计算机科学与技术',
      interests: '深度学习 医学图像处理 计算机视觉 生物信息学 神经网络',
      skills: 'Python PyTorch TensorFlow Keras CNN RNN 图像分割 医学AI',
      needs: '医学影像数据 临床病例 生物标注数据 医学专业指导',
      looking_for: '医学影像专家 临床医生 生物信息学研究者',
      contact: 'alex.chen@example.com',
      points: 180
    },
    {
      username: 'medical_doctor',
      password: 'password123',
      name: 'Dr. Wang',
      institution: '北京协和医学院',
      degree: '博士',
      major: '医学影像学',
      interests: '医学图像分析 放射学 CT MRI 病理诊断 AI辅助诊断',
      skills: '医学影像诊断 DICOM 影像标注 临床诊断 病例分析',
      needs: 'AI算法开发 深度学习模型 图像处理自动化 Python编程',
      looking_for: '人工智能专家 计算机视觉研究者 深度学习工程师',
      contact: 'dr.wang@hospital.com',
      points: 160
    },

    // === 高匹配组2：前端开发与UI设计 ===
    {
      username: 'frontend_dev',
      password: 'password123',
      name: 'Sarah Li',
      institution: '上海交通大学',
      degree: '硕士',
      major: '软件工程',
      interests: 'Web开发 前端框架 用户体验 响应式设计 交互设计',
      skills: 'React Vue.js JavaScript TypeScript HTML CSS Webpack Node.js',
      needs: 'UI设计方案 用户体验优化 设计素材 视觉设计指导',
      looking_for: 'UI设计师 UX设计师 平面设计师',
      contact: 'sarah.li@example.com',
      points: 140
    },
    {
      username: 'ui_designer',
      password: 'password123',
      name: 'Emily Zhang',
      institution: '中央美术学院',
      degree: '硕士',
      major: '交互设计',
      interests: '用户界面设计 用户体验 视觉设计 交互原型 设计系统',
      skills: 'Figma Sketch Adobe XD Photoshop Illustrator 原型设计 用户研究',
      needs: '前端实现 React开发 CSS动画 交互效果编程 网站开发',
      looking_for: '前端开发工程师 Web开发者 全栈工程师',
      contact: 'emily.zhang@design.com',
      points: 130
    },

    // === 高匹配组3：数据科学与商业分析 ===
    {
      username: 'data_scientist',
      password: 'password123',
      name: 'Michael Liu',
      institution: '复旦大学',
      degree: '博士',
      major: '统计学',
      interests: '数据挖掘 机器学习 预测分析 数据可视化 商业智能',
      skills: 'Python R SQL Pandas NumPy Scikit-learn 统计建模 A/B测试',
      needs: '商业场景 真实数据集 业务需求分析 市场洞察',
      looking_for: '商业分析师 产品经理 市场研究人员',
      contact: 'michael.liu@example.com',
      points: 170
    },
    {
      username: 'business_analyst',
      password: 'password123',
      name: 'Jessica Wu',
      institution: '北京大学',
      degree: '硕士',
      major: '市场营销',
      interests: '商业分析 市场研究 用户行为分析 数据驱动决策 产品策略',
      skills: 'Excel Tableau PowerBI 市场调研 用户画像 竞品分析 需求分析',
      needs: '数据建模 机器学习算法 Python数据分析 预测模型 统计分析',
      looking_for: '数据科学家 算法工程师 统计学专家',
      contact: 'jessica.wu@company.com',
      points: 150
    },

    // === 高匹配组4：NLP与语言学 ===
    {
      username: 'nlp_engineer',
      password: 'password123',
      name: 'David Zhou',
      institution: '中国科学院',
      degree: '博士',
      major: '计算机科学',
      interests: '自然语言处理 大语言模型 文本分析 机器翻译 对话系统',
      skills: 'Python NLP Transformers BERT GPT Hugging Face 词向量 语义分析',
      needs: '语言学理论 语料标注 多语言数据 语法分析 语言现象解释',
      looking_for: '语言学家 翻译专家 语料库研究者',
      contact: 'david.zhou@ai-lab.com',
      points: 190
    },
    {
      username: 'linguist',
      password: 'password123',
      name: 'Prof. Lin',
      institution: '北京外国语大学',
      degree: '博士',
      major: '语言学',
      interests: '句法学 语义学 语料库语言学 计算语言学 机器翻译',
      skills: '语言分析 语料标注 语法理论 多语言研究 翻译理论',
      needs: 'NLP工具 文本挖掘 自动标注 语料处理自动化 机器学习应用',
      looking_for: 'NLP工程师 计算机语言学家 算法开发者',
      contact: 'prof.lin@bfsu.edu.cn',
      points: 165
    },

    // === 高匹配组5：机器人与控制工程 ===
    {
      username: 'robotics_engineer',
      password: 'password123',
      name: 'Tom Wang',
      institution: '浙江大学',
      degree: '博士',
      major: '机械工程',
      interests: '机器人学 运动控制 机械设计 嵌入式系统 自动化',
      skills: 'ROS C++ Arduino 机械设计 SolidWorks 控制算法 传感器融合',
      needs: '计算机视觉算法 深度学习感知 路径规划 SLAM算法',
      looking_for: '计算机视觉专家 AI算法工程师 深度学习研究者',
      contact: 'tom.wang@robotics.com',
      points: 175
    },
    {
      username: 'cv_researcher',
      password: 'password123',
      name: 'Lisa Chen',
      institution: '香港科技大学',
      degree: '博士',
      major: '计算机视觉',
      interests: '计算机视觉 目标检测 SLAM 3D重建 机器人视觉',
      skills: 'Python OpenCV PyTorch YOLO PointCloud PCL 立体视觉 深度估计',
      needs: '机器人平台 硬件测试环境 实际应用场景 工程实现经验',
      looking_for: '机器人工程师 嵌入式开发 硬件工程师',
      contact: 'lisa.chen@hkust.edu.hk',
      points: 185
    },

    // === 高匹配组6：量化金融与编程 ===
    {
      username: 'quant_trader',
      password: 'password123',
      name: 'Kevin Zhang',
      institution: '上海财经大学',
      degree: '硕士',
      major: '金融工程',
      interests: '量化交易 算法交易 金融建模 风险管理 衍生品定价',
      skills: 'Python量化 Pandas TA-Lib 回测框架 金融数学 统计套利',
      needs: '高频交易系统 算法优化 并行计算 低延迟编程 C++开发',
      looking_for: '系统架构师 C++开发者 高性能计算专家',
      contact: 'kevin.zhang@quant-fund.com',
      points: 195
    },
    {
      username: 'cpp_developer',
      password: 'password123',
      name: 'James Liu',
      institution: '北京邮电大学',
      degree: '硕士',
      major: '计算机科学',
      interests: '高性能计算 系统编程 并行计算 算法优化 分布式系统',
      skills: 'C++ C 多线程 内存优化 算法设计 Linux STL Boost',
      needs: '实际应用场景 金融领域知识 交易系统需求 业务理解',
      looking_for: '量化交易员 金融工程师 算法交易专家',
      contact: 'james.liu@tech-company.com',
      points: 155
    },

    // === 保留原有的经典互补用户（优化关键词） ===
    {
      username: 'zhangsan',
      password: 'password123',
      name: '张三',
      institution: '清华大学',
      degree: '博士',
      major: '计算机科学',
      interests: 'Python编程 机器学习 深度学习 数据分析 生物信息学',
      skills: 'Python PyTorch TensorFlow 算法设计 数据挖掘 机器学习',
      needs: '生物信息学数据 RNA测序数据 基因数据分析 医学图像',
      looking_for: '生物学背景 医学专业 生物信息学 基因研究',
      contact: 'zhangsan@example.com',
      points: 150
    },
    {
      username: 'lisi',
      password: 'password123',
      name: '李四',
      institution: '北京大学',
      degree: '硕士',
      major: '生物信息学',
      interests: '基因组学 蛋白质结构 进化生物学 生物数据分析 计算生物学',
      skills: '生物实验 RNA测序 基因编辑 CRISPR 生物数据',
      needs: 'Python数据分析 机器学习算法 深度学习 数据挖掘',
      looking_for: '计算机专业 数据科学家 机器学习 算法工程师',
      contact: 'lisi@example.com',
      points: 80
    }
  ];

  // 对应的问题数据
  const problems = [
    {
      username: 'ai_researcher',
      title: '需要标注的肺部CT影像数据集',
      description: '我们在开发肺部结节检测算法，需要大量标注好的CT影像。希望找到有医学影像背景的合作者帮助标注和验证。',
      required_skills: '医学影像诊断 CT阅片 病理分析',
      points_reward: 80
    },
    {
      username: 'medical_doctor',
      title: '开发AI辅助诊断工具',
      description: '医院希望开发一个AI辅助诊断系统，需要深度学习专家协助设计CNN模型。我们有大量标注数据。',
      required_skills: 'Python深度学习 医学图像处理 PyTorch CNN',
      points_reward: 100
    },
    {
      username: 'frontend_dev',
      title: '网站设计方案和UI组件库',
      description: '正在开发一个教育平台，需要专业的UI设计师提供设计方案和组件设计规范。',
      required_skills: 'UI设计 Figma 设计系统 用户体验',
      points_reward: 60
    },
    {
      username: 'ui_designer',
      title: 'React实现复杂交互动画',
      description: '设计稿中有很多复杂的交互动画效果，需要前端工程师帮助实现CSS和JavaScript动画。',
      required_skills: 'React JavaScript CSS动画 前端开发',
      points_reward: 55
    },
    {
      username: 'data_scientist',
      title: '用户行为数据业务解读',
      description: '已经建立了预测模型，但需要商业分析师帮助解读结果并提供商业洞察和应用建议。',
      required_skills: '商业分析 市场洞察 数据解读',
      points_reward: 45
    },
    {
      username: 'business_analyst',
      title: '客户流失预测模型开发',
      description: '公司有大量用户数据，希望建立流失预测模型。需要数据科学家协助建模和算法开发。',
      required_skills: 'Python机器学习 预测模型 数据建模',
      points_reward: 70
    },
    {
      username: 'nlp_engineer',
      title: '多语言语料标注和语法分析',
      description: '在做跨语言NLP研究，需要语言学家帮助分析语法结构并标注语料。',
      required_skills: '语言学 语料标注 语法分析 多语言',
      points_reward: 50
    },
    {
      username: 'linguist',
      title: '古汉语自动分词工具开发',
      description: '研究古代文献需要处理大量古汉语文本，希望开发自动分词和句法分析工具。',
      required_skills: 'NLP Python 中文分词 算法开发',
      points_reward: 65
    },
    {
      username: 'robotics_engineer',
      title: '机器人视觉SLAM算法实现',
      description: '机器人项目需要实现视觉SLAM算法，我们有硬件平台，需要计算机视觉专家协助。',
      required_skills: '计算机视觉 SLAM 深度学习 目标检测',
      points_reward: 90
    },
    {
      username: 'cv_researcher',
      title: '需要机器人测试平台',
      description: '开发了新的视觉算法，需要在真实机器人平台上测试。寻找有硬件平台的合作者。',
      required_skills: 'ROS 机器人平台 嵌入式系统',
      points_reward: 40
    },
    {
      username: 'quant_trader',
      title: '高频交易系统性能优化',
      description: '量化策略已经成型，但Python回测太慢。需要C++专家帮助优化为低延迟系统。',
      required_skills: 'C++ 高性能计算 多线程 系统优化',
      points_reward: 120
    },
    {
      username: 'cpp_developer',
      title: '想学习量化交易策略开发',
      description: '有很强的编程能力，想了解量化交易领域。希望找导师指导如何入门量化交易。',
      required_skills: '量化交易 金融工程 策略开发',
      points_reward: 30
    }
  ];

  try {
    // 插入用户
    console.log('正在添加用户（包含6对高匹配度用户）...');
    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (username, password, name, institution, degree, major, interests, skills, needs, looking_for, contact, points)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.username,
            hashedPassword,
            user.name,
            user.institution,
            user.degree,
            user.major,
            user.interests,
            user.skills,
            user.needs,
            user.looking_for,
            user.contact,
            user.points
          ],
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                console.log('  跳过: 用户 ' + user.username + ' 已存在');
                resolve();
              } else {
                reject(err);
              }
            } else {
              console.log('  ✓ ' + user.name + ' (' + user.username + ') - ' + user.major + ' - ' + user.points + '分');
              resolve();
            }
          }
        );
      });
    }

    // 获取用户ID映射
    const userIdMap = await new Promise((resolve, reject) => {
      db.all('SELECT id, username FROM users', (err, rows) => {
        if (err) reject(err);
        const map = {};
        rows.forEach(row => map[row.username] = row.id);
        resolve(map);
      });
    });

    // 插入问题
    console.log('\n正在添加问题...');
    for (const problem of problems) {
      const userId = userIdMap[problem.username];
      if (!userId) {
        console.log('  跳过: 用户 ' + problem.username + ' 不存在');
        continue;
      }

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO problems (user_id, title, description, required_skills, points_reward, status)
           VALUES (?, ?, ?, ?, ?, 'open')`,
          [userId, problem.title, problem.description, problem.required_skills, problem.points_reward],
          function(err) {
            if (err) {
              console.log('  警告: 添加问题失败: ' + problem.title);
              reject(err);
            } else {
              console.log('  ✓ ' + problem.title + ' (' + problem.username + ', ' + problem.points_reward + '分)');
              resolve();
            }
          }
        );
      });
    }

    // 显示统计信息
    const userCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err);
        resolve(row.count);
      });
    });

    const problemCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM problems', (err, row) => {
        if (err) reject(err);
        resolve(row.count);
      });
    });

    console.log('\n' + '='.repeat(70));
    console.log('增强版模拟数据添加完成！');
    console.log('='.repeat(70));
    console.log('数据库统计:');
    console.log('   - 总用户数: ' + userCount);
    console.log('   - 总问题数: ' + problemCount);

    console.log('\n高匹配度用户对（预期匹配度 > 60%）:');
    console.log('   1. ai_researcher <-> medical_doctor (AI医学交叉)');
    console.log('   2. frontend_dev <-> ui_designer (前端与设计)');
    console.log('   3. data_scientist <-> business_analyst (数据与商业)');
    console.log('   4. nlp_engineer <-> linguist (NLP与语言学)');
    console.log('   5. robotics_engineer <-> cv_researcher (机器人与视觉)');
    console.log('   6. quant_trader <-> cpp_developer (金融与编程)');
    console.log('   7. zhangsan <-> lisi (计算机与生物) [经典组合]');

    console.log('\n测试账号 (所有密码: password123):');
    console.log('   核心高匹配用户:');
    console.log('   - ai_researcher / medical_doctor (AI与医学)');
    console.log('   - frontend_dev / ui_designer (开发与设计)');
    console.log('   - data_scientist / business_analyst (数据与商业)');
    console.log('   - nlp_engineer / linguist (NLP与语言学)');
    console.log('   - robotics_engineer / cv_researcher (机器人与视觉)');
    console.log('   - quant_trader / cpp_developer (量化与编程)');
    console.log('   - zhangsan / lisi (原有组合)');

    console.log('\n测试建议:');
    console.log('   1. 用 ai_researcher 登录 -> 应看到 medical_doctor 匹配度 70%+');
    console.log('   2. 用 frontend_dev 登录 -> 应看到 ui_designer 匹配度 75%+');
    console.log('   3. 用 data_scientist 登录 -> 应看到 business_analyst 匹配度 65%+');
    console.log('   4. 查看问题广场 -> 应看到12个高质量的互补问题');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('添加数据时出错:', error);
  } finally {
    db.close();
  }
}

// 执行种子数据脚本
seedEnhancedData();
