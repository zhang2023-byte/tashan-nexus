import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { matchAPI, problemAPI, leaderboardAPI, authAPI } from './api';

function App() {
  const { user, login, register, logout, loading } = useAuth();
  const [view, setView] = useState('login');
  const [matches, setMatches] = useState([]);
  const [problems, setProblems] = useState([]);
  const [myProblems, setMyProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // 登录/注册表单
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    name: '',
    institution: '',
    degree: '',
    major: '',
    interests: '',
    skills: '',
    contact: '',
    needs: '',
    looking_for: ''
  });

  // 个人资料编辑表单
  const [profileForm, setProfileForm] = useState({
    name: '',
    institution: '',
    degree: '',
    major: '',
    interests: '',
    skills: '',
    contact: '',
    needs: '',
    looking_for: ''
  });

  // 发布问题表单
  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    points_reward: 10
  });

  useEffect(() => {
    if (user) {
      setView('dashboard');
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [matchesRes, problemsRes, myProblemsRes, leaderboardRes] = await Promise.all([
        matchAPI.getMatches(),
        problemAPI.getAll(),
        problemAPI.getMy(),
        leaderboardAPI.get()
      ]);
      setMatches(matchesRes.data.matches || []);
      setProblems(problemsRes.data.problems || []);
      setMyProblems(myProblemsRes.data.problems || []);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
    } catch (err) {
      setError('加载数据失败');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({ username: authForm.username, password: authForm.password });
      setSuccess('登录成功！');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || '登录失败');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(authForm);
      setSuccess('注册成功！');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || '注册失败');
    }
  };

  const handlePublishProblem = async (e) => {
    e.preventDefault();
    try {
      await problemAPI.create(problemForm);
      setSuccess('问题发布成功！');
      setProblemForm({ title: '', description: '', required_skills: '', points_reward: 10 });
      loadData();
    } catch (err) {
      setError('发布失败');
    }
  };

  const handleAcceptProblem = async (problemId) => {
    try {
      await problemAPI.accept(problemId);
      setSuccess('成功接取问题！');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || '接取失败');
    }
  };

  const handleCompleteProblem = async (problemId) => {
    try {
      await problemAPI.complete(problemId);
      setSuccess('问题已标记为完成！');
      loadData();
    } catch (err) {
      setError('操作失败');
    }
  };

  const startEditingProfile = () => {
    setProfileForm({
      name: user.name || '',
      institution: user.institution || '',
      degree: user.degree || '',
      major: user.major || '',
      interests: user.interests || '',
      skills: user.skills || '',
      contact: user.contact || '',
      needs: user.needs || '',
      looking_for: user.looking_for || ''
    });
    setIsEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
    setProfileForm({
      name: '',
      institution: '',
      degree: '',
      major: '',
      interests: '',
      skills: '',
      contact: '',
      needs: '',
      looking_for: ''
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateProfile(profileForm);
      setSuccess('个人资料更新成功！');
      setError('');
      setIsEditingProfile(false);

      // 重新获取用户信息
      const userRes = await authAPI.getProfile();
      localStorage.setItem('user', JSON.stringify(userRes.data));
      window.location.reload(); // 刷新页面以更新所有状态
    } catch (err) {
      setError(err.response?.data?.error || '更新失败');
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  // 登录页面
  if (!user && view === 'login') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">他山协会</h1>
          <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>学科交叉合作平台</h3>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>用户名</label>
              <input
                type="text"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>密码</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>登录</button>
          </form>
          <div className="auth-links">
            还没有账号？<a href="#" onClick={() => setView('register')}>立即注册</a>
          </div>
        </div>
      </div>
    );
  }

  // 注册页面
  if (!user && view === 'register') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">用户注册</h1>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>用户名 *</label>
              <input
                type="text"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>密码 *</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>姓名 *</label>
              <input
                type="text"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>培养单位</label>
              <input
                type="text"
                value={authForm.institution}
                onChange={(e) => setAuthForm({ ...authForm, institution: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>学历</label>
              <select value={authForm.degree} onChange={(e) => setAuthForm({ ...authForm, degree: e.target.value })}>
                <option value="">请选择</option>
                <option value="本科">本科</option>
                <option value="硕士">硕士</option>
                <option value="博士">博士</option>
              </select>
            </div>
            <div className="form-group">
              <label>专业</label>
              <input
                type="text"
                value={authForm.major}
                onChange={(e) => setAuthForm({ ...authForm, major: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>兴趣爱好</label>
              <textarea
                value={authForm.interests}
                onChange={(e) => setAuthForm({ ...authForm, interests: e.target.value })}
                placeholder="例如：机器学习、数据分析、生物信息学"
              />
            </div>
            <div className="form-group">
              <label>掌握技能</label>
              <textarea
                value={authForm.skills}
                onChange={(e) => setAuthForm({ ...authForm, skills: e.target.value })}
                placeholder="例如：Python编程、统计分析、实验设计"
              />
            </div>
            <div className="form-group">
              <label>联系方式</label>
              <input
                type="text"
                value={authForm.contact}
                onChange={(e) => setAuthForm({ ...authForm, contact: e.target.value })}
                placeholder="邮箱、微信等"
              />
            </div>
            <div className="form-group">
              <label>当前需求</label>
              <textarea
                value={authForm.needs}
                onChange={(e) => setAuthForm({ ...authForm, needs: e.target.value })}
                placeholder="你目前遇到什么问题或需要什么帮助"
              />
            </div>
            <div className="form-group">
              <label>希望找到什么样的合作者</label>
              <textarea
                value={authForm.looking_for}
                onChange={(e) => setAuthForm({ ...authForm, looking_for: e.target.value })}
                placeholder="描述你理想的合作者"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>注册</button>
          </form>
          <div className="auth-links">
            已有账号？<a href="#" onClick={() => setView('login')}>立即登录</a>
          </div>
        </div>
      </div>
    );
  }

  // 主界面
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-content">
          <h1>他山协会 - 学科交叉合作平台</h1>
          <nav>
            <a href="#" onClick={() => setView('dashboard')}>我的匹配</a>
            <a href="#" onClick={() => setView('problems')}>问题广场</a>
            <a href="#" onClick={() => setView('my-problems')}>我的问题</a>
            <a href="#" onClick={() => setView('publish')}>发布问题</a>
            <a href="#" onClick={() => setView('leaderboard')}>排行榜</a>
            <a href="#" onClick={() => setView('profile')}>个人资料</a>
            <a href="#" onClick={logout}>退出</a>
          </nav>
        </div>
      </nav>

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* 我的匹配 */}
        {view === 'dashboard' && (
          <div>
            <div className="profile-header">
              <h2>欢迎, {user.name}!</h2>
              <p>{user.institution} · {user.major}</p>
              <div className="profile-points">当前积分: {user.points}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>AI智能推荐匹配</h2>
              <button
                className="btn btn-secondary"
                onClick={loadData}
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                🔄 刷新匹配
              </button>
            </div>
            {matches.length === 0 ? (
              <div className="alert alert-info">
                系统中暂无其他用户。您可以：
                <br />
                1. 邀请更多同学加入平台
                <br />
                2. 或运行测试数据脚本添加模拟用户：<code>cd backend && node seed-data.js</code>
              </div>
            ) : (
              <>
                {matches.length < 3 && (
                  <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                    💡 提示：完善你的个人资料（特别是技能、兴趣、需求），可以获得更精准的匹配推荐！
                    <a href="#" onClick={() => setView('profile')} style={{ color: '#007bff', textDecoration: 'underline', marginLeft: '0.5rem' }}>
                      点击完善资料 →
                    </a>
                  </div>
                )}
                {matches.map((match, index) => (
                  <div key={index} className="match-card">
                    <div className="match-score">匹配度: {(match.score * 100).toFixed(1)}%</div>
                    <div className="match-info">
                      <h3>{match.user.name}</h3>
                      <p><strong>单位:</strong> {match.user.institution || '未填写'}</p>
                      <p><strong>专业:</strong> {match.user.major || '未填写'}</p>
                      <p><strong>技能:</strong> {match.user.skills || '未填写'}</p>
                      <p><strong>联系方式:</strong> {match.user.contact || '未填写'}</p>
                    </div>
                    <div className="match-reasons">
                      <strong>匹配原因:</strong>
                      <ul>
                        {match.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* 问题广场 */}
        {view === 'problems' && (
          <div>
            <h2 style={{ marginBottom: '1rem' }}>问题广场</h2>
            {problems.length === 0 ? (
              <div className="alert alert-info">暂无问题</div>
            ) : (
              problems.map((problem) => (
                <div key={problem.id} className="problem-card">
                  <div className="problem-header">
                    <h3 className="problem-title">{problem.title}</h3>
                    <span className="problem-points">奖励 {problem.points_reward} 积分</span>
                  </div>
                  <div className="problem-meta">
                    <span>发布者: {problem.author_name}</span>
                    <span>发布者积分: {problem.author_points}</span>
                    <span className={`status-badge status-${problem.status}`}>
                      {problem.status === 'open' ? '待接取' : problem.status === 'in_progress' ? '进行中' : '已完成'}
                    </span>
                  </div>
                  <p className="problem-description">{problem.description}</p>
                  {problem.required_skills && (
                    <div className="problem-skills">
                      <strong>所需技能:</strong> {problem.required_skills}
                    </div>
                  )}
                  {problem.status === 'open' && problem.user_id !== user.id && (
                    <button
                      className="btn btn-success"
                      onClick={() => handleAcceptProblem(problem.id)}
                    >
                      接取任务
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 我的问题 */}
        {view === 'my-problems' && (
          <div>
            <h2 style={{ marginBottom: '1rem' }}>我的问题</h2>
            {myProblems.length === 0 ? (
              <div className="alert alert-info">你还没有发布任何问题</div>
            ) : (
              myProblems.map((problem) => (
                <div key={problem.id} className="problem-card">
                  <div className="problem-header">
                    <h3 className="problem-title">{problem.title}</h3>
                    <span className="problem-points">奖励 {problem.points_reward} 积分</span>
                  </div>
                  <div className="problem-meta">
                    <span className={`status-badge status-${problem.status}`}>
                      {problem.status === 'open' ? '待接取' : problem.status === 'in_progress' ? '进行中' : '已完成'}
                    </span>
                  </div>
                  <p className="problem-description">{problem.description}</p>
                  {problem.status === 'in_progress' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleCompleteProblem(problem.id)}
                    >
                      标记为完成
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 发布问题 */}
        {view === 'publish' && (
          <div className="card">
            <h2 className="card-title">发布新问题</h2>
            <form onSubmit={handlePublishProblem}>
              <div className="form-group">
                <label>问题标题 *</label>
                <input
                  type="text"
                  value={problemForm.title}
                  onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>问题描述 *</label>
                <textarea
                  value={problemForm.description}
                  onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                  required
                  rows="6"
                />
              </div>
              <div className="form-group">
                <label>所需技能</label>
                <input
                  type="text"
                  value={problemForm.required_skills}
                  onChange={(e) => setProblemForm({ ...problemForm, required_skills: e.target.value })}
                  placeholder="例如：Python、数据分析、统计学"
                />
              </div>
              <div className="form-group">
                <label>积分奖励</label>
                <input
                  type="number"
                  value={problemForm.points_reward}
                  onChange={(e) => setProblemForm({ ...problemForm, points_reward: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              <button type="submit" className="btn btn-primary">发布问题</button>
            </form>
          </div>
        )}

        {/* 排行榜 */}
        {view === 'leaderboard' && (
          <div>
            <h2 style={{ marginBottom: '1rem' }}>积分排行榜</h2>
            {leaderboard.map((item, index) => (
              <div key={item.id} className="leaderboard-item">
                <div className={`leaderboard-rank ${index < 3 ? 'top-3' : ''}`}>#{index + 1}</div>
                <div className="leaderboard-info">
                  <h4>{item.name}</h4>
                  <p>{item.institution} · {item.major}</p>
                </div>
                <div className="leaderboard-points">{item.points} 积分</div>
              </div>
            ))}
          </div>
        )}

        {/* 个人资料 */}
        {view === 'profile' && (
          <div>
            <div className="profile-header">
              <h2>{user.name}</h2>
              <p>@{user.username}</p>
              <div className="profile-points">当前积分: {user.points}</div>
            </div>

            {!isEditingProfile ? (
              // 查看模式
              <>
                <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
                  <button className="btn btn-primary" onClick={startEditingProfile}>
                    ✏️ 编辑资料
                  </button>
                </div>
                <div className="card">
                  <h3 className="card-title">基本信息</h3>
                  <p><strong>培养单位:</strong> {user.institution || '未填写'}</p>
                  <p><strong>学历:</strong> {user.degree || '未填写'}</p>
                  <p><strong>专业:</strong> {user.major || '未填写'}</p>
                  <p><strong>联系方式:</strong> {user.contact || '未填写'}</p>
                </div>
                <div className="card">
                  <h3 className="card-title">兴趣爱好</h3>
                  <p>{user.interests || '未填写'}</p>
                </div>
                <div className="card">
                  <h3 className="card-title">掌握技能</h3>
                  <p>{user.skills || '未填写'}</p>
                </div>
                <div className="card">
                  <h3 className="card-title">当前需求</h3>
                  <p>{user.needs || '未填写'}</p>
                </div>
                <div className="card">
                  <h3 className="card-title">寻找的合作者</h3>
                  <p>{user.looking_for || '未填写'}</p>
                </div>
              </>
            ) : (
              // 编辑模式
              <form onSubmit={handleUpdateProfile} className="auth-form">
                <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                  💡 提示：填写详细的技能、兴趣和需求，可以获得更精准的AI匹配推荐！
                </div>

                <h3 style={{ marginBottom: '1rem' }}>基本信息</h3>
                <div className="form-group">
                  <label>姓名 *</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>培养单位</label>
                  <input
                    type="text"
                    value={profileForm.institution}
                    onChange={(e) => setProfileForm({ ...profileForm, institution: e.target.value })}
                    placeholder="例如: 清华大学"
                  />
                </div>
                <div className="form-group">
                  <label>学历</label>
                  <select
                    value={profileForm.degree}
                    onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                  >
                    <option value="">请选择</option>
                    <option value="本科">本科</option>
                    <option value="硕士">硕士</option>
                    <option value="博士">博士</option>
                    <option value="博士后">博士后</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>专业</label>
                  <input
                    type="text"
                    value={profileForm.major}
                    onChange={(e) => setProfileForm({ ...profileForm, major: e.target.value })}
                    placeholder="例如: 计算机科学"
                  />
                </div>
                <div className="form-group">
                  <label>联系方式</label>
                  <input
                    type="text"
                    value={profileForm.contact}
                    onChange={(e) => setProfileForm({ ...profileForm, contact: e.target.value })}
                    placeholder="例如: zhangsan@example.com 或微信号"
                  />
                </div>

                <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>个人特征（重要！影响匹配效果）</h3>
                <div className="form-group">
                  <label>兴趣爱好</label>
                  <textarea
                    value={profileForm.interests}
                    onChange={(e) => setProfileForm({ ...profileForm, interests: e.target.value })}
                    placeholder="用空格分隔关键词，例如: 机器学习 深度学习 自然语言处理 计算机视觉"
                    rows="3"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    提示：使用关键词而非完整句子，用空格分隔
                  </small>
                </div>
                <div className="form-group">
                  <label>掌握技能</label>
                  <textarea
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    placeholder="用空格分隔关键词，例如: Python PyTorch TensorFlow 数据分析 算法设计"
                    rows="3"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    提示：列出您擅长的技能，这将帮助系统推荐需要您帮助的人
                  </small>
                </div>
                <div className="form-group">
                  <label>当前需求</label>
                  <textarea
                    value={profileForm.needs}
                    onChange={(e) => setProfileForm({ ...profileForm, needs: e.target.value })}
                    placeholder="用空格分隔关键词，例如: 生物信息学数据 医学图像处理 实验设计帮助"
                    rows="3"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    提示：描述您当前需要什么帮助或资源
                  </small>
                </div>
                <div className="form-group">
                  <label>寻找的合作者</label>
                  <textarea
                    value={profileForm.looking_for}
                    onChange={(e) => setProfileForm({ ...profileForm, looking_for: e.target.value })}
                    placeholder="用空格分隔关键词，例如: 生物学背景 医学专业 数据科学家 实验专家"
                    rows="3"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    提示：描述您期望找到什么背景的合作者
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                    💾 保存修改
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEditingProfile}
                    style={{ flex: 1 }}
                  >
                    ❌ 取消
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
