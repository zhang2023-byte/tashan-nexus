// 数据库管理脚本
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');

// 显示使用说明
function showHelp() {
  console.log(`
========================================
  他山协会数据库管理工具
========================================

使用方法：
  node manage-data.js <命令>

可用命令：

📊 查看数据：
  status          - 查看数据库状态（用户数量、表信息）
  list-users      - 列出所有用户

🗑️  清理数据：
  clear-all       - 清空所有用户数据（保留表结构）
  clear-test      - 仅删除测试/模拟用户数据
  delete-db       - 完全删除数据库文件

💾 备份数据：
  backup          - 备份当前数据库
  restore         - 从备份恢复数据库
  export          - 导出用户数据为JSON

🔧 其他：
  help            - 显示此帮助信息

示例：
  node manage-data.js status
  node manage-data.js backup
  node manage-data.js clear-test

========================================
`);
}

// 查看数据库状态
function showStatus() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ 数据库文件不存在');
    return;
  }

  const db = new sqlite3.Database(dbPath);

  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error('❌ 查询失败:', err.message);
      db.close();
      return;
    }

    console.log('\n📊 数据库状态');
    console.log('================');
    console.log(`数据库位置: ${dbPath}`);
    console.log(`文件大小: ${(fs.statSync(dbPath).size / 1024).toFixed(2)} KB`);
    console.log(`用户数量: ${row.count}`);

    db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, tables) => {
      if (!err) {
        console.log(`数据表: ${tables.map(t => t.name).join(', ')}`);
      }
      db.close();
    });
  });
}

// 列出所有用户
function listUsers() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ 数据库文件不存在');
    return;
  }

  const db = new sqlite3.Database(dbPath);

  db.all('SELECT id, username, name, institution, major, created_at FROM users ORDER BY id', (err, users) => {
    if (err) {
      console.error('❌ 查询失败:', err.message);
      db.close();
      return;
    }

    console.log('\n👥 用户列表');
    console.log('================');
    users.forEach(user => {
      console.log(`ID: ${user.id} | ${user.name} (@${user.username}) | ${user.institution} - ${user.major}`);
      console.log(`   注册时间: ${user.created_at}`);
    });
    console.log(`\n共 ${users.length} 个用户`);
    db.close();
  });
}

// 清空所有数据
function clearAll() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ 数据库文件不存在');
    return;
  }

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('⚠️  确定要清空所有用户数据吗？(输入 yes 确认): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      const db = new sqlite3.Database(dbPath);

      db.run('DELETE FROM users', (err) => {
        if (err) {
          console.error('❌ 清空失败:', err.message);
        } else {
          console.log('✅ 所有用户数据已清空');
        }
        db.close();
        readline.close();
      });
    } else {
      console.log('❌ 操作已取消');
      readline.close();
    }
  });
}

// 删除测试用户
function clearTestUsers() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ 数据库文件不存在');
    return;
  }

  const db = new sqlite3.Database(dbPath);

  // 删除常见的测试用户名
  const testUsernames = [
    'zhangsan', 'lisi', 'wangwu', 'zhaoliu', 'sunqi', 'zhouba', 'wujiu', 'zhengshi',
    'zhang', 'test', 'demo', 'admin', 'user1', 'user2'
  ];

  const placeholders = testUsernames.map(() => '?').join(',');
  const sql = `DELETE FROM users WHERE username IN (${placeholders})`;

  db.run(sql, testUsernames, function(err) {
    if (err) {
      console.error('❌ 删除失败:', err.message);
    } else {
      console.log(`✅ 已删除 ${this.changes} 个测试用户`);
    }
    db.close();
  });
}

// 备份数据库
function backupDatabase() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ 数据库文件不存在');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = path.join(__dirname, `database.backup.${timestamp}.sqlite`);

  fs.copyFileSync(dbPath, backupPath);
  console.log(`✅ 数据库已备份到: ${backupPath}`);
}

// 导出数据为JSON
function exportData() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ 数据库文件不存在');
    return;
  }

  const db = new sqlite3.Database(dbPath);

  db.all('SELECT * FROM users', (err, users) => {
    if (err) {
      console.error('❌ 导出失败:', err.message);
      db.close();
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const exportPath = path.join(__dirname, `users.export.${timestamp}.json`);

    // 移除密码字段
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    fs.writeFileSync(exportPath, JSON.stringify(safeUsers, null, 2));
    console.log(`✅ 用户数据已导出到: ${exportPath}`);
    console.log(`   共导出 ${users.length} 个用户（密码已移除）`);
    db.close();
  });
}

// 删除数据库文件
function deleteDatabase() {
  if (!fs.existsSync(dbPath)) {
    console.log('❌ 数据库文件不存在');
    return;
  }

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('⚠️  确定要完全删除数据库文件吗？(输入 DELETE 确认): ', (answer) => {
    if (answer === 'DELETE') {
      fs.unlinkSync(dbPath);
      console.log('✅ 数据库文件已删除');
    } else {
      console.log('❌ 操作已取消');
    }
    readline.close();
  });
}

// 主函数
function main() {
  const command = process.argv[2];

  switch (command) {
    case 'status':
      showStatus();
      break;
    case 'list-users':
      listUsers();
      break;
    case 'clear-all':
      clearAll();
      break;
    case 'clear-test':
      clearTestUsers();
      break;
    case 'backup':
      backupDatabase();
      break;
    case 'export':
      exportData();
      break;
    case 'delete-db':
      deleteDatabase();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

main();
