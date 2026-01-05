const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 使用环境变量中的数据库路径，如果未设置则使用默认路径
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log(`[数据库] 使用数据库路径: ${dbPath}`);

// 初始化数据库表
db.serialize(() => {
  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      institution TEXT,
      degree TEXT,
      major TEXT,
      interests TEXT,
      skills TEXT,
      contact TEXT,
      needs TEXT,
      looking_for TEXT,
      points INTEGER DEFAULT 0,
      skills_embedding TEXT,
      interests_embedding TEXT,
      needs_embedding TEXT,
      looking_for_embedding TEXT,
      embeddings_updated_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 为现有数据库添加embedding字段（如果不存在）
  db.run(`ALTER TABLE users ADD COLUMN skills_embedding TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('添加skills_embedding字段失败:', err.message);
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN interests_embedding TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('添加interests_embedding字段失败:', err.message);
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN needs_embedding TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('添加needs_embedding字段失败:', err.message);
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN looking_for_embedding TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('添加looking_for_embedding字段失败:', err.message);
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN embeddings_updated_at DATETIME`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('添加embeddings_updated_at字段失败:', err.message);
    }
  });

  // 问题/任务表
  db.run(`
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      required_skills TEXT,
      points_reward INTEGER DEFAULT 10,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 任务接取记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS problem_solutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER NOT NULL,
      solver_id INTEGER NOT NULL,
      status TEXT DEFAULT 'in_progress',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (problem_id) REFERENCES problems(id),
      FOREIGN KEY (solver_id) REFERENCES users(id)
    )
  `);

  // 匹配推荐表
  db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      matched_user_id INTEGER NOT NULL,
      match_score REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (matched_user_id) REFERENCES users(id)
    )
  `);
});

module.exports = db;
