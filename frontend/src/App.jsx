import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { matchAPI, authAPI } from './api';

function App() {
  const { user, login, register, logout, loading } = useAuth();
  const [view, setView] = useState('login');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

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

  useEffect(() => {
    if (user) {
      setView('dashboard');
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoadingMatches(true);
      const matchesRes = await matchAPI.getMatches();
      setMatches(matchesRes.data.matches || []);
    } catch (err) {
      setError('加载数据失败');
    } finally {
      setIsLoadingMatches(false);
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
                placeholder="支持自然语言，例如：我对机器学习、数据分析和生物信息学很感兴趣"
              />
            </div>
            <div className="form-group">
              <label>掌握技能</label>
              <textarea
                value={authForm.skills}
                onChange={(e) => setAuthForm({ ...authForm, skills: e.target.value })}
                placeholder="支持自然语言，例如：擅长Python编程、统计分析和实验设计"
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
                placeholder="支持自然语言，例如：需要生物信息学数据，希望有人指导实验设计"
              />
            </div>
            <div className="form-group">
              <label>希望找到什么样的合作者</label>
              <textarea
                value={authForm.looking_for}
                onChange={(e) => setAuthForm({ ...authForm, looking_for: e.target.value })}
                placeholder="支持自然语言，例如：希望找到有生物学或医学背景的数据科学家"
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
            <a href="#" onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}>我的匹配</a>
            <a href="#" onClick={() => setView('problems')} className={view === 'problems' ? 'active' : ''} style={{ opacity: 0.6 }}>问题广场 🚧</a>
            <a href="#" onClick={() => setView('leaderboard')} className={view === 'leaderboard' ? 'active' : ''} style={{ opacity: 0.6 }}>排行榜 🚧</a>
            <a href="#" onClick={() => setView('profile')} className={view === 'profile' ? 'active' : ''}>个人资料</a>
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
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>AI智能推荐匹配</h2>
              <button
                className="btn btn-secondary"
                onClick={loadData}
                disabled={isLoadingMatches}
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                🔄 刷新匹配
              </button>
            </div>
            {isLoadingMatches ? (
              <div className="alert alert-info">
                🤖 AI智能匹配正在进行中，请稍候...
                <br />
                <small style={{ marginTop: '0.5rem', display: 'block' }}>正在使用Qwen Embedding和DeepSeek LLM进行深度分析</small>
              </div>
            ) : matches.length === 0 ? (
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
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
            <h2 style={{ marginBottom: '1rem', color: '#666' }}>问题广场功能开发中</h2>
            <p style={{ fontSize: '1.1rem', color: '#888', marginBottom: '2rem' }}>
              我们正在努力开发任务发布、接取和积分奖励系统
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>即将上线的功能：</h3>
              <ul style={{
                textAlign: 'left',
                lineHeight: '2',
                listStyle: 'none',
                padding: 0
              }}>
                <li>✨ 发布学术问题和合作需求</li>
                <li>🤝 接取感兴趣的任务</li>
                <li>🏆 完成任务获得积分奖励</li>
                <li>💬 任务讨论和协作</li>
              </ul>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setView('dashboard')}
              style={{ marginTop: '2rem' }}
            >
              返回匹配页面
            </button>
          </div>
        )}

        {/* 排行榜 */}
        {view === 'leaderboard' && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
            <h2 style={{ marginBottom: '1rem', color: '#666' }}>排行榜功能开发中</h2>
            <p style={{ fontSize: '1.1rem', color: '#888', marginBottom: '2rem' }}>
              我们正在设计积分系统和排行榜展示
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>即将上线的功能：</h3>
              <ul style={{
                textAlign: 'left',
                lineHeight: '2',
                listStyle: 'none',
                padding: 0
              }}>
                <li>🏅 积分排行榜</li>
                <li>📊 个人贡献统计</li>
                <li>🎖️ 成就徽章系统</li>
                <li>⭐ 用户评价和信誉</li>
              </ul>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setView('dashboard')}
              style={{ marginTop: '2rem' }}
            >
              返回匹配页面
            </button>
          </div>
        )}

        {/* 个人资料 */}
        {view === 'profile' && (
          <div>
            <div className="profile-header">
              <h2>{user.name}</h2>
              <p>@{user.username}</p>
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
                    placeholder="可以使用自然语言描述，例如：我对机器学习和深度学习很感兴趣，尤其是自然语言处理和计算机视觉方向"
                    rows="3"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    💡 提示：支持自然语言描述，AI会理解您的兴趣并进行智能匹配
                  </small>
                </div>
                <div className="form-group">
                  <label>掌握技能</label>
                  <textarea
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    placeholder="可以使用自然语言描述，例如：熟练使用Python进行数据分析，掌握PyTorch和TensorFlow深度学习框架，有算法设计经验"
                    rows="3"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    💡 提示：详细描述您的技能，AI会为您匹配需要帮助的人
                  </small>
                </div>
                <div className="form-group">
                  <label>当前需求</label>
                  <textarea
                    value={profileForm.needs}
                    onChange={(e) => setProfileForm({ ...profileForm, needs: e.target.value })}
                    placeholder="可以使用自然语言描述，例如：需要生物信息学相关的数据集，希望有人帮助进行医学图像处理，需要实验设计方面的指导"
                    rows="3"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    💡 提示：清楚描述您的需求，AI会为您找到能提供帮助的人
                  </small>
                </div>
                <div className="form-group">
                  <label>寻找的合作者</label>
                  <textarea
                    value={profileForm.looking_for}
                    onChange={(e) => setProfileForm({ ...profileForm, looking_for: e.target.value })}
                    placeholder="可以使用自然语言描述，例如：希望找到有生物学或医学背景的合作者，或者是数据科学方向的实验专家"
                    rows="3"
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem' }}>
                    💡 提示：描述您理想的合作者特征，AI会进行精准匹配
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
