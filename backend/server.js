const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./database');
const MatchingEngine = require('./matching');
const hybridMatching = require('./hybrid-matching');
const embeddingService = require('./embedding-service');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: '*',  // 允许所有来源访问（开发/局域网使用）
  credentials: true
}));
app.use(bodyParser.json());

// JWT认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的令牌' });
    }
    req.user = user;
    next();
  });
};

// ========== 用户相关API ==========

// 用户注册
app.post('/api/register', async (req, res) => {
  const { username, password, name, institution, degree, major, interests, skills, contact, needs, looking_for } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: '用户名、密码和姓名为必填项' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (username, password, name, institution, degree, major, interests, skills, contact, needs, looking_for)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, name, institution, degree, major, interests, skills, contact, needs, looking_for],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: '用户名已存在' });
          }
          return res.status(500).json({ error: '注册失败' });
        }

        const token = jwt.sign({ id: this.lastID, username }, process.env.JWT_SECRET);
        res.status(201).json({ message: '注册成功', token, userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 用户登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: '服务器错误' });
    }

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
      res.json({ message: '登录成功', token, userId: user.id });
    } catch (error) {
      console.error('[登录] 验证密码失败:', error);
      return res.status(500).json({ error: '服务器错误' });
    }
  });
});

// 获取当前用户信息
app.get('/api/user/me', authenticateToken, (req, res) => {
  db.get('SELECT id, username, name, institution, degree, major, interests, skills, contact, needs, looking_for, points FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: '服务器错误' });
      }
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      res.json(user);
    }
  );
});

// 更新用户信息
app.put('/api/user/me', authenticateToken, async (req, res) => {
  const { name, institution, degree, major, interests, skills, contact, needs, looking_for } = req.body;

  try {
    // 1. 更新基本信息
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET name = ?, institution = ?, degree = ?, major = ?, interests = ?, skills = ?, contact = ?, needs = ?, looking_for = ?
         WHERE id = ?`,
        [name, institution, degree, major, interests, skills, contact, needs, looking_for, req.user.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // 2. 异步生成embeddings（不阻塞响应）
    setImmediate(async () => {
      try {
        console.log(`[Embedding] 为用户 ${name} 生成embeddings...`);

        const embeddings = await embeddingService.generateUserEmbeddings({
          skills, interests, needs, looking_for
        });

        // 保存embeddings到数据库
        db.run(
          `UPDATE users SET
           skills_embedding = ?,
           interests_embedding = ?,
           needs_embedding = ?,
           looking_for_embedding = ?,
           embeddings_updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            embeddings.skills ? JSON.stringify(embeddings.skills) : null,
            embeddings.interests ? JSON.stringify(embeddings.interests) : null,
            embeddings.needs ? JSON.stringify(embeddings.needs) : null,
            embeddings.looking_for ? JSON.stringify(embeddings.looking_for) : null,
            req.user.id
          ],
          (err) => {
            if (err) {
              console.error('[Embedding] 保存失败:', err.message);
            } else {
              console.log('[Embedding] 保存成功');
            }
          }
        );
      } catch (error) {
        console.error('[Embedding] 生成失败:', error.message);
      }
    });

    // 3. 立即返回成功（不等待embedding生成）
    res.json({ message: '更新成功，AI匹配正在后台优化中' });

  } catch (err) {
    console.error('更新用户信息失败:', err);
    res.status(500).json({ error: '更新失败' });
  }
});

// ========== 匹配相关API ==========

// 获取推荐的匹配用户 - 使用混合智能匹配
app.get('/api/matches', authenticateToken, (req, res) => {
  console.log(`\n[API] 收到匹配请求，用户ID: ${req.user.id}`);

  // 获取当前用户信息（包含embeddings）
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, currentUser) => {
    if (err || !currentUser) {
      console.error('[API] 获取当前用户失败:', err);
      return res.status(500).json({ error: '获取用户信息失败' });
    }

    // 获取所有其他用户（包含embeddings）
    db.all(`SELECT id, username, name, institution, degree, major, interests, skills, contact, needs, looking_for, points,
            skills_embedding, interests_embedding, needs_embedding, looking_for_embedding
            FROM users WHERE id != ?`,
      [req.user.id],
      async (err, allUsers) => {
        if (err) {
          console.error('[API] 获取用户列表失败:', err);
          return res.status(500).json({ error: '获取用户列表失败' });
        }

        console.log(`[API] 找到 ${allUsers.length} 个候选用户`);

        try {
          // 使用混合智能匹配引擎
          const matches = await hybridMatching.findMatches(currentUser, allUsers);

          console.log(`[API] 返回 ${matches.length} 个匹配结果`);

          res.json({ matches });
        } catch (error) {
          console.error('[API] 混合匹配失败，降级到基础算法:', error.message);

          // 降级到基础算法
          const fallbackMatches = await MatchingEngine.findMatches(currentUser, allUsers);
          res.json({ matches: fallbackMatches });
        }
      }
    );
  });
});

// ========== 问题/任务相关API ==========

// 发布问题
app.post('/api/problems', authenticateToken, (req, res) => {
  const { title, description, required_skills, points_reward } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: '标题和描述为必填项' });
  }

  db.run(
    'INSERT INTO problems (user_id, title, description, required_skills, points_reward) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, title, description, required_skills, points_reward || 10],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '发布失败' });
      }
      res.status(201).json({ message: '问题发布成功', problemId: this.lastID });
    }
  );
});

// 获取所有开放的问题
app.get('/api/problems', authenticateToken, (req, res) => {
  db.all(
    `SELECT p.*, u.name as author_name, u.points as author_points
     FROM problems p
     JOIN users u ON p.user_id = u.id
     WHERE p.status = 'open'
     ORDER BY u.points DESC, p.created_at DESC`,
    (err, problems) => {
      if (err) {
        return res.status(500).json({ error: '获取问题列表失败' });
      }
      res.json({ problems });
    }
  );
});

// 获取我发布的问题
app.get('/api/problems/my', authenticateToken, (req, res) => {
  db.all(
    `SELECT p.*, u.name as author_name
     FROM problems p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = ?
     ORDER BY p.created_at DESC`,
    [req.user.id],
    (err, problems) => {
      if (err) {
        return res.status(500).json({ error: '获取问题列表失败' });
      }
      res.json({ problems });
    }
  );
});

// 接取问题
app.post('/api/problems/:id/accept', authenticateToken, (req, res) => {
  const problemId = req.params.id;

  // 检查问题是否存在且为开放状态
  db.get('SELECT * FROM problems WHERE id = ? AND status = "open"', [problemId], (err, problem) => {
    if (err) {
      return res.status(500).json({ error: '服务器错误' });
    }
    if (!problem) {
      return res.status(404).json({ error: '问题不存在或已被接取' });
    }
    if (problem.user_id === req.user.id) {
      return res.status(400).json({ error: '不能接取自己发布的问题' });
    }

    // 创建解决方案记录
    db.run(
      'INSERT INTO problem_solutions (problem_id, solver_id) VALUES (?, ?)',
      [problemId, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: '接取失败' });
        }

        // 更新问题状态
        db.run('UPDATE problems SET status = "in_progress" WHERE id = ?', [problemId], (err) => {
          if (err) {
            return res.status(500).json({ error: '更新状态失败' });
          }
          res.json({ message: '成功接取问题', solutionId: this.lastID });
        });
      }
    );
  });
});

// 完成问题（发布者确认）
app.post('/api/problems/:id/complete', authenticateToken, (req, res) => {
  const problemId = req.params.id;

  // 检查是否是问题发布者
  db.get('SELECT * FROM problems WHERE id = ? AND user_id = ?', [problemId, req.user.id], (err, problem) => {
    if (err) {
      return res.status(500).json({ error: '服务器错误' });
    }
    if (!problem) {
      return res.status(404).json({ error: '问题不存在或无权操作' });
    }

    // 获取解决者信息
    db.get('SELECT * FROM problem_solutions WHERE problem_id = ?', [problemId], (err, solution) => {
      if (err || !solution) {
        return res.status(500).json({ error: '未找到解决方案记录' });
      }

      // 更新问题状态
      db.run('UPDATE problems SET status = "completed" WHERE id = ?', [problemId]);

      // 更新解决方案状态
      db.run('UPDATE problem_solutions SET status = "completed", completed_at = CURRENT_TIMESTAMP WHERE id = ?', [solution.id]);

      // 给解决者加积分
      db.run('UPDATE users SET points = points + ? WHERE id = ?', [problem.points_reward, solution.solver_id], (err) => {
        if (err) {
          return res.status(500).json({ error: '积分更新失败' });
        }
        res.json({ message: '问题已标记为完成，积分已发放' });
      });
    });
  });
});

// 获取推荐的问题解决者
app.get('/api/problems/:id/recommended-solvers', authenticateToken, (req, res) => {
  const problemId = req.params.id;

  db.get('SELECT * FROM problems WHERE id = ?', [problemId], (err, problem) => {
    if (err || !problem) {
      return res.status(404).json({ error: '问题不存在' });
    }

    // 获取发布者积分
    db.get('SELECT points FROM users WHERE id = ?', [problem.user_id], (err, poster) => {
      if (err) {
        return res.status(500).json({ error: '服务器错误' });
      }

      // 获取所有用户
      db.all('SELECT id, username, name, institution, degree, major, interests, skills, contact, points FROM users',
        async (err, allUsers) => {
          if (err) {
            return res.status(500).json({ error: '获取用户列表失败' });
          }

          const recommendations = await MatchingEngine.findSolversForProblem(problem, allUsers, poster.points);
          res.json({ recommendations });
        }
      );
    });
  });
});

// ========== 积分排行榜 ==========
app.get('/api/leaderboard', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, name, institution, major, points FROM users ORDER BY points DESC LIMIT 20',
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: '获取排行榜失败' });
      }
      res.json({ leaderboard: users });
    }
  );
});

// 配置混合匹配引擎 - 使用Qwen embedding + 高匹配度时使用DeepSeek LLM
hybridMatching.configure({
  useEmbedding: true,   // 启用embedding (使用Qwen)
  useLLM: true,         // 启用LLM深度分析 (使用DeepSeek)
  llmTopN: 10,          // 对Top 10候选进行LLM分析
  finalTopN: 10         // 返回最终Top 10匹配结果
});

console.log('[配置] 已启用混合匹配策略: Qwen Embedding + DeepSeek LLM');

// 启动服务器
app.listen(PORT, () => {
  console.log(`他山协会服务器运行在 http://localhost:${PORT}`);
});
