// 数据库初始化和种子数据
const db = require('./database');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // 检查是否已有用户
    db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
      if (err) {
        console.error('[初始化] 检查用户失败:', err);
        reject(err);
        return;
      }

      if (row.count > 0) {
        console.log(`[初始化] 数据库已有 ${row.count} 个用户，跳过初始化`);
        resolve();
        return;
      }

      console.log('[初始化] 数据库为空，创建测试用户...');

      try {
        // 创建测试用户
        const testUsers = [
          {
            username: 'test',
            password: await bcrypt.hash('123456', 10),
            name: '测试用户',
            institution: '测试大学',
            degree: '本科',
            major: '计算机科学',
            interests: '人工智能、机器学习',
            skills: 'Python、JavaScript、React',
            contact: 'test@example.com',
            needs: '需要数据分析方面的帮助',
            looking_for: '寻找有统计学背景的合作者',
            points: 100
          },
          {
            username: 'admin',
            password: await bcrypt.hash('admin123', 10),
            name: '管理员',
            institution: '他山协会',
            degree: '研究生',
            major: '软件工程',
            interests: '跨学科合作、项目管理',
            skills: 'Node.js、数据库设计、项目管理',
            contact: 'admin@tashan.com',
            needs: '需要前端开发支持',
            looking_for: '寻找全栈开发者',
            points: 500
          }
        ];

        for (const user of testUsers) {
          await new Promise((res, rej) => {
            db.run(
              `INSERT INTO users (username, password, name, institution, degree, major, interests, skills, contact, needs, looking_for, points)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                user.username, user.password, user.name, user.institution,
                user.degree, user.major, user.interests, user.skills,
                user.contact, user.needs, user.looking_for, user.points
              ],
              (err) => {
                if (err) {
                  console.error(`[初始化] 创建用户 ${user.username} 失败:`, err);
                  rej(err);
                } else {
                  console.log(`[初始化] ✓ 创建用户: ${user.username}`);
                  res();
                }
              }
            );
          });
        }

        console.log('[初始化] 测试用户创建完成');
        console.log('[初始化] 可用登录账号:');
        console.log('  - 用户名: test, 密码: 123456');
        console.log('  - 用户名: admin, 密码: admin123');

        resolve();
      } catch (error) {
        console.error('[初始化] 创建测试用户失败:', error);
        reject(error);
      }
    });
  });
}

module.exports = { initializeDatabase };
