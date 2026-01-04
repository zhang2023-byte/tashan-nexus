// 数据库种子数据脚本 - 用于测试
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function seedData() {
  console.log('开始添加模拟数据...\n');

  // 模拟用户数据
  const users = [
    {
      username: 'zhangsan',
      password: 'password123',
      name: '张三',
      institution: '清华大学',
      degree: '博士',
      major: '计算机科学',
      interests: 'Python编程 机器学习 深度学习 数据分析',
      skills: 'Python PyTorch TensorFlow 算法设计 数据挖掘',
      needs: '生物信息学数据 医学图像处理经验',
      looking_for: '生物学背景的合作者 医学专业人士',
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
      interests: '基因组学 蛋白质结构 进化生物学',
      skills: '生物实验 RNA测序 基因编辑 CRISPR',
      needs: 'Python数据分析 机器学习算法',
      looking_for: '计算机专业人士 数据科学家',
      contact: 'lisi@example.com',
      points: 80
    },
    {
      username: 'wangwu',
      password: 'password123',
      name: '王五',
      institution: '复旦大学',
      degree: '博士',
      major: '物理学',
      interests: '量子计算 凝聚态物理 理论物理',
      skills: 'MATLAB 数值模拟 量子算法 数学建模',
      needs: '实验数据处理 可视化工具开发',
      looking_for: '编程能力强的合作者',
      contact: 'wangwu@example.com',
      points: 120
    },
    {
      username: 'zhaoliu',
      password: 'password123',
      name: '赵六',
      institution: '上海交通大学',
      degree: '硕士',
      major: '经济学',
      interests: '计量经济学 金融建模 行为经济学',
      skills: 'R语言 Stata 经济数据分析 统计建模',
      needs: 'Python金融分析 量化交易策略',
      looking_for: '金融工程背景 编程专家',
      contact: 'zhaoliu@example.com',
      points: 60
    },
    {
      username: 'sunqi',
      password: 'password123',
      name: '孙七',
      institution: '浙江大学',
      degree: '博士',
      major: '材料科学',
      interests: '纳米材料 新能源材料 材料表征',
      skills: '材料合成 XRD SEM TEM 材料分析',
      needs: '材料模拟计算 第一性原理计算',
      looking_for: '物理化学背景 计算材料学专家',
      contact: 'sunqi@example.com',
      points: 90
    },
    {
      username: 'zhouba',
      password: 'password123',
      name: '周八',
      institution: '中国科学院',
      degree: '博士后',
      major: '人工智能',
      interests: '自然语言处理 计算机视觉 强化学习',
      skills: 'Python深度学习 Transformer模型 PyTorch 论文写作',
      needs: '跨学科应用场景 真实数据集',
      looking_for: '各领域专家 数据提供者',
      contact: 'zhouba@example.com',
      points: 200
    },
    {
      username: 'wujiu',
      password: 'password123',
      name: '吴九',
      institution: '南京大学',
      degree: '硕士',
      major: '心理学',
      interests: '认知神经科学 脑机接口 情绪计算',
      skills: '心理实验设计 EEG数据采集 统计分析',
      needs: '信号处理算法 机器学习分类',
      looking_for: '信号处理专家 AI算法工程师',
      contact: 'wujiu@example.com',
      points: 45
    },
    {
      username: 'zhengshi',
      password: 'password123',
      name: '郑十',
      institution: '武汉大学',
      degree: '博士',
      major: '遥感科学',
      interests: '卫星图像分析 地理信息系统 环境监测',
      skills: '遥感数据处理 GIS ENVI ArcGIS',
      needs: '深度学习图像识别 目标检测算法',
      looking_for: '计算机视觉专家',
      contact: 'zhengshi@example.com',
      points: 110
    }
  ];

  // 模拟问题数据
  const problems = [
    {
      username: 'zhangsan',
      title: '需要帮助处理RNA-seq数据',
      description: '我有一批RNA测序数据需要进行差异表达分析，但我不熟悉生物信息学流程。数据已经过质控，需要使用DESeq2或edgeR进行分析。',
      required_skills: '生物信息学 R语言 RNA-seq分析',
      points_reward: 30
    },
    {
      username: 'lisi',
      title: '寻求Python机器学习模型开发',
      description: '我有一批蛋白质序列数据，想用机器学习预测蛋白质功能。需要特征工程和模型训练经验。',
      required_skills: 'Python 机器学习 scikit-learn 生物特征提取',
      points_reward: 50
    },
    {
      username: 'wangwu',
      title: '量子模拟数据可视化工具',
      description: '需要开发一个交互式的量子态可视化工具，能够展示量子比特的演化过程。最好使用Python或JavaScript。',
      required_skills: 'Python可视化 Plotly或D3.js 前端开发',
      points_reward: 40
    },
    {
      username: 'zhaoliu',
      title: '金融时间序列预测模型',
      description: '想要建立一个基于LSTM的股票价格预测模型，需要深度学习和金融数据处理经验。',
      required_skills: 'Python深度学习 LSTM 金融数据分析',
      points_reward: 60
    },
    {
      username: 'sunqi',
      title: '材料性能第一性原理计算',
      description: '需要使用VASP进行材料能带结构计算，我提供材料结构文件，需要有DFT计算经验的人协助。',
      required_skills: 'VASP DFT计算 材料模拟',
      points_reward: 45
    },
    {
      username: 'wujiu',
      title: 'EEG信号的机器学习分类',
      description: '我有一批脑电信号数据，想要训练一个分类器识别不同的情绪状态。需要信号处理和机器学习背景。',
      required_skills: 'Python信号处理 机器学习分类 神经科学',
      points_reward: 35
    },
    {
      username: 'zhengshi',
      title: '卫星图像的深度学习目标检测',
      description: '需要在遥感图像中检测建筑物和道路，希望使用YOLO或Faster R-CNN等模型。有标注好的数据集。',
      required_skills: '深度学习 计算机视觉 目标检测 PyTorch',
      points_reward: 55
    }
  ];

  try {
    // 插入用户
    console.log('正在添加用户...');
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
                console.log('  警告: 用户 ' + user.username + ' 已存在，跳过');
                resolve();
              } else {
                reject(err);
              }
            } else {
              console.log('  已添加: ' + user.name + ' (' + user.username + ') - ' + user.major + ' - ' + user.points + '积分');
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
        console.log('  警告: 用户 ' + problem.username + ' 不存在，跳过问题');
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
              console.log('  已添加: ' + problem.title + ' (发布者: ' + problem.username + ', 奖励: ' + problem.points_reward + '分)');
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

    console.log('\n==================================================');
    console.log('模拟数据添加完成！');
    console.log('==================================================');
    console.log('数据库统计:');
    console.log('   - 总用户数: ' + userCount);
    console.log('   - 总问题数: ' + problemCount);
    console.log('\n测试账号 (所有密码都是: password123):');
    console.log('   - zhangsan (张三) - 计算机科学博士 - 150积分');
    console.log('   - lisi (李四) - 生物信息学硕士 - 80积分');
    console.log('   - wangwu (王五) - 物理学博士 - 120积分');
    console.log('   - zhaoliu (赵六) - 经济学硕士 - 60积分');
    console.log('   - sunqi (孙七) - 材料科学博士 - 90积分');
    console.log('   - zhouba (周八) - 人工智能博士后 - 200积分 [高分]');
    console.log('   - wujiu (吴九) - 心理学硕士 - 45积分');
    console.log('   - zhengshi (郑十) - 遥感科学博士 - 110积分');
    console.log('\n测试建议:');
    console.log('   1. 用 lisi 登录，查看匹配 -> 应该会推荐 zhangsan (技能互补)');
    console.log('   2. 用 zhangsan 登录，查看问题广场 -> 应该看到多个开放问题');
    console.log('   3. 用 zhouba 登录 (200积分) -> 享受高积分用户优先权');
    console.log('   4. 尝试接取问题 -> 完成后获得积分奖励');
    console.log('==================================================\n');

  } catch (error) {
    console.error('添加数据时出错:', error);
  } finally {
    db.close();
  }
}

// 执行种子数据脚本
seedData();
