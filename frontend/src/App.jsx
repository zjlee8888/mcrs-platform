import { useState, Routes, Route, Navigate, useNavigate, useLocation, Link } from './hooks'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RequestsPage from './pages/RequestsPage'
import RequestDetailPage from './pages/RequestDetailPage'
import InstitutionsPage from './pages/InstitutionsPage'
import IndividualsPage from './pages/IndividualsPage'
import CompliancePage from './pages/CompliancePage'
import AuditPage from './pages/AuditPage'
import HKMAPage from './pages/HKMAPage'
import NewRequestPage from './pages/NewRequestPage'
import OngoingMonitoringPage from './pages/OngoingMonitoringPage'
import IAMManagementPage from './pages/IAMManagementPage'
import GuidePage from './pages/GuidePage'
import ProfessionalIcon from './components/ProfessionalIcon'

const APP_I18N = {
  en: {
    navDashboard: 'Dashboard',
    navRequests: 'Reference Requests',
    navInstitutions: 'Institutions',
    navIndividuals: 'Individuals',
    navCompliance: 'Compliance Dashboard',
    navAudit: 'Audit Log',
    navMonitoring: 'Ongoing Monitoring',
    navGuide: 'Guide & FAQ',
    navIam: 'IAM Management',
    navIntegrations: 'Integrations',
    sectionCompliance: 'Compliance',
    sectionIntegrations: 'Integrations',
    subtitle: 'Mandatory Reference Checking',
    platformTitle: 'Cross-Industry MRC Platform',
    signOut: 'Sign Out',
    newRequest: '+ New Request',
    role_platform_admin: 'Platform Admin',
    role_institution_admin: 'Institution Admin',
    role_hr_initiator: 'HR Initiator',
    role_compliance_reviewer: 'Compliance Reviewer',
    role_senior_approver: 'Senior Approver',
    role_auditor: 'Auditor',
    role_regulator_admin: 'Regulator Admin',
    role_regulator_viewer: 'Regulator Viewer',
    role_individual: 'Individual',
    demo: 'Demo',
  },
  tc: {
    navDashboard: '儀表板',
    navRequests: '背調請求',
    navInstitutions: '機構',
    navIndividuals: '個人',
    navCompliance: '合規儀表板',
    navAudit: '審計日誌',
    navGuide: '使用指南與常見問題',
    navMonitoring: '持續監察',
    navIam: 'IAM 管理',
    navIntegrations: '整合',
    sectionCompliance: '合規',
    sectionIntegrations: '整合',
    subtitle: '跨行業強制背景審查',
    platformTitle: '跨行業 MRC 平台',
    signOut: '登出',
    newRequest: '+ 新增請求',
    role_platform_admin: '平台管理員',
    role_institution_admin: '機構管理員',
    role_hr_initiator: '人力資源發起人',
    role_compliance_reviewer: '合規審閱人',
    role_senior_approver: '高級審批人',
    role_auditor: '審計員',
    role_regulator_admin: '監管管理員',
    role_regulator_viewer: '監管查看者',
    role_individual: '個人',
    demo: '示範',
  },
  zh: {
    navDashboard: '仪表板',
    navRequests: '背调请求',
    navInstitutions: '机构',
    navIndividuals: '个人',
    navCompliance: '合规仪表板',
    navAudit: '审计日志',
    navGuide: '使用指南与常见问题',
    navMonitoring: '持续监控',
    navIam: 'IAM 管理',
    navIntegrations: '集成',
    sectionCompliance: '合规',
    sectionIntegrations: '集成',
    subtitle: '跨行业强制背景审查',
    platformTitle: '跨行业 MRC 平台',
    signOut: '登出',
    newRequest: '+ 新建请求',
    role_platform_admin: '平台管理员',
    role_institution_admin: '机构管理员',
    role_hr_initiator: '人力资源发起人',
    role_compliance_reviewer: '合规审阅人',
    role_senior_approver: '高级审批人',
    role_auditor: '审计员',
    role_regulator_admin: '监管管理员',
    role_regulator_viewer: '监管查看者',
    role_individual: '个人',
    demo: '演示',
  },
};

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mrcs_user')); } catch { return null; }
  });
  const [institution, setInstitution] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mrcs_institution')); } catch { return null; }
  });
  const [lang, setLang] = useState(() => localStorage.getItem('mrcs_lang') || 'en');

  const handleLogin = (userData, institutionData) => {
    setUser(userData);
    setInstitution(institutionData);
    localStorage.setItem('mrcs_user', JSON.stringify(userData));
    if (institutionData) localStorage.setItem('mrcs_institution', JSON.stringify(institutionData));
  };

  const handleLogout = () => {
    setUser(null);
    setInstitution(null);
    localStorage.removeItem('mrcs_user');
    localStorage.removeItem('mrcs_institution');
    localStorage.removeItem('mrcs_token');
  };

  const handleLanguageChange = (nextLang) => {
    setLang(nextLang);
    localStorage.setItem('mrcs_lang', nextLang);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} lang={lang} onChangeLanguage={handleLanguageChange} />;
  }

  return (
    <AppLayout user={user} institution={institution} onLogout={handleLogout} lang={lang} onChangeLanguage={handleLanguageChange}>
      <Routes>
        <Route path="/" element={<DashboardPage user={user} lang={lang} />} />
        <Route path="/requests" element={<RequestsPage user={user} lang={lang} />} />
        <Route path="/requests/monitoring" element={<OngoingMonitoringPage user={user} lang={lang} />} />
        <Route path="/requests/new" element={<NewRequestPage user={user} lang={lang} />} />
        <Route path="/requests/:id" element={<RequestDetailPage user={user} lang={lang} />} />
        <Route path="/institutions" element={<InstitutionsPage user={user} lang={lang} />} />
        <Route path="/individuals" element={<IndividualsPage user={user} lang={lang} />} />
        <Route path="/compliance" element={<CompliancePage user={user} lang={lang} />} />
        <Route path="/audit" element={<AuditPage user={user} lang={lang} />} />
        <Route path="/guide" element={<GuidePage lang={lang} />} />
        <Route path="/settings/iam" element={<IAMManagementPage user={user} institution={institution} lang={lang} />} />
        <Route path="/hkma" element={<HKMAPage user={user} lang={lang} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppLayout>
  );
}

function AppLayout({ children, user, institution, onLogout, lang, onChangeLanguage }) {
  const location = useLocation();
  const navigate = useNavigate();
  const t = APP_I18N[lang] || APP_I18N.en;

  const roleLabel = {
    platform_admin: t.role_platform_admin,
    institution_admin: t.role_institution_admin,
    hr_initiator: t.role_hr_initiator,
    compliance_reviewer: t.role_compliance_reviewer,
    senior_approver: t.role_senior_approver,
    auditor: t.role_auditor,
    regulator_admin: t.role_regulator_admin,
    regulator_viewer: t.role_regulator_viewer,
    individual: t.role_individual,
  };

  const isRegulator = ['regulator_admin', 'regulator_viewer'].includes(user.role);
  const isAdmin = user.role === 'platform_admin';

  const navItems = [
    { label: t.navDashboard, path: '/', icon: 'dashboard' },
    { label: t.navRequests, path: '/requests', icon: 'requests' },
    { label: t.navMonitoring, path: '/requests/monitoring', icon: 'monitoring' },
    { label: t.navInstitutions, path: '/institutions', icon: 'institutions' },
    { label: t.navIndividuals, path: '/individuals', icon: 'individuals' },
    { section: t.sectionCompliance },
    { label: t.navCompliance, path: '/compliance', icon: 'compliance' },
    { label: t.navAudit, path: '/audit', icon: 'audit' },
    { label: t.navGuide, path: '/guide', icon: 'guide' },
    { label: t.navIam, path: '/settings/iam', icon: 'iam' },
    { section: t.sectionIntegrations },
    { label: t.navIntegrations, path: '/hkma', icon: 'integrations' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>MRCS</h1>
          <div className="subtitle">{t.subtitle}</div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) =>
            item.section ? (
              <div key={i} className="nav-section">{item.section}</div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="icon"><ProfessionalIcon name={item.icon} /></span>
                {item.label}
              </Link>
            )
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{user.name_en}</span>
            {Boolean(user.is_demo_account) && (
              <span className="badge badge-purple" style={{ fontSize: 11 }}>{t.demo}</span>
            )}
          </div>
          <div className="user-role">
            {roleLabel[user.role]}
            {institution && ` · ${institution.name_en}`}
            {user.regulator && ` · ${user.regulator}`}
          </div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: 8, color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }} onClick={onLogout}>
            {t.signOut}
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="top-bar">
          <div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {t.platformTitle}
              {institution && ` — ${institution.name_en}`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                className={`btn btn-sm ${lang === 'en' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => onChangeLanguage('en')}
                style={{ minWidth: 40 }}
              >
                EN
              </button>
              <button
                type="button"
                className={`btn btn-sm ${lang === 'tc' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => onChangeLanguage('tc')}
                style={{ minWidth: 40 }}
              >
                繁
              </button>
              <button
                type="button"
                className={`btn btn-sm ${lang === 'zh' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => onChangeLanguage('zh')}
                style={{ minWidth: 40 }}
              >
                简
              </button>
            </div>
            {!isRegulator && user.role !== 'auditor' && (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/requests/new')}>
                {t.newRequest}
              </button>
            )}
          </div>
        </div>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

export default App;
