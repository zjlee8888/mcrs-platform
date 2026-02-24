import { useState } from 'react';
import { api, setToken } from '../api';

const I18N = {
  en: {
    signIn: 'Sign In',
    subtitle: 'Cross-Industry Mandatory Reference Checking System',
    email: 'Email Address',
    password: 'Password',
    emailPlaceholder: 'you@institution.com',
    signingIn: 'Signing in...',
    loginFailed: 'Login failed',
    demo: 'Demo Accounts (click to autofill):',
  },
  tc: {
    signIn: '登入',
    subtitle: '跨行業強制背景審查系統',
    email: '電郵地址',
    password: '密碼',
    emailPlaceholder: 'you@institution.com',
    signingIn: '登入中...',
    loginFailed: '登入失敗',
    demo: '示範帳戶（點擊自動填入）：',
  },
  zh: {
    signIn: '登录',
    subtitle: '跨行业强制背景审查系统',
    email: '邮箱地址',
    password: '密码',
    emailPlaceholder: 'you@institution.com',
    signingIn: '登录中...',
    loginFailed: '登录失败',
    demo: '演示账户（点击自动填入）：',
  },
};

export default function LoginPage({ onLogin, lang = 'en', onChangeLanguage }) {
  const t = I18N[lang] || I18N.en;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      onLogin(data.user, data.institution);
    } catch (err) {
      setError(err.message || t.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Platform Admin', email: 'admin@mrcs-platform.hk', password: 'Admin123!' },
    { label: 'HKMA Regulator', email: 'regulator@hkma.gov.hk', password: 'Hkma123!' },
    { label: 'HSBC HR', email: 'hr@hsbc.com.hk', password: 'Hsbc123!' },
    { label: 'HSBC Compliance', email: 'compliance@hsbc.com.hk', password: 'Hsbc123!' },
    { label: 'AIA HR', email: 'hr@aia.com.hk', password: 'Aia123!' },
    { label: 'Goldman Compliance', email: 'compliance@gs.com.hk', password: 'Gs123!' },
  ];

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">MRCS PLATFORM</div>
        <h1>{t.signIn}</h1>
        <p className="login-subtitle">{t.subtitle}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <select className="form-control" style={{ width: 120 }} value={lang} onChange={(e) => onChangeLanguage?.(e.target.value)}>
            <option value="en">EN</option>
            <option value="tc">TC</option>
            <option value="zh">ZH</option>
          </select>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t.email}</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
            />
          </div>
          <div className="form-group">
            <label>{t.password}</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? t.signingIn : t.signIn}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{t.demo}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: 11 }}
                onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
