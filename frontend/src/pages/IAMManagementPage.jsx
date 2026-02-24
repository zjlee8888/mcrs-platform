import { useState } from 'react';

export default function IAMManagementPage({ user, institution, lang = 'en' }) {
  const I18N = {
    en: {
      title: 'IAM Management',
      subtitle: 'Identity and access management settings',
      accessProfile: 'Access Profile',
      role: 'Role',
      institution: 'Institution',
      regulator: 'Regulator Scope',
      authSettings: 'Authentication Settings',
      mfa: 'MFA Requirement',
      sessionTimeout: 'Session Timeout',
      passwordPolicy: 'Password Policy',
      enabled: 'Enabled',
      disabled: 'Disabled',
      minutes30: '30 minutes',
      strong: 'Strong (min 8 chars, mixed case, number, symbol)',
      permissions: 'Permissions Snapshot',
      canCreateRequests: 'Can create reference requests',
      canReviewMonitoring: 'Can review ongoing monitoring',
      canViewAudit: 'Can view audit logs',
    },
    tc: {
      title: 'IAM 管理',
      subtitle: '身份與存取管理設定',
      accessProfile: '存取設定檔',
      role: '角色',
      institution: '機構',
      regulator: '監管範圍',
      authSettings: '認證設定',
      mfa: 'MFA 要求',
      sessionTimeout: '工作階段逾時',
      passwordPolicy: '密碼政策',
      enabled: '啟用',
      disabled: '停用',
      minutes30: '30 分鐘',
      strong: '高強度（最少 8 字元、大小寫、數字、符號）',
      permissions: '權限快照',
      canCreateRequests: '可建立背調請求',
      canReviewMonitoring: '可審查持續監察',
      canViewAudit: '可查看審計日誌',
    },
    zh: {
      title: 'IAM 管理',
      subtitle: '身份与访问管理设置',
      accessProfile: '访问配置',
      role: '角色',
      institution: '机构',
      regulator: '监管范围',
      authSettings: '认证设置',
      mfa: 'MFA 要求',
      sessionTimeout: '会话超时',
      passwordPolicy: '密码策略',
      enabled: '启用',
      disabled: '停用',
      minutes30: '30 分钟',
      strong: '高强度（至少 8 位、大小写、数字、符号）',
      permissions: '权限快照',
      canCreateRequests: '可创建背调请求',
      canReviewMonitoring: '可审查持续监控',
      canViewAudit: '可查看审计日志',
    },
  };

  // Language fallback is intentional so unsupported locale values still render safely.
  const t = I18N[lang] || I18N.en;
  const [mfaEnabled] = useState(true);

  // Permission snapshot is derived client-side from canonical backend role strings.
  // If IAM UI appears incorrect, inspect `user.role` first and then these arrays.
  const canCreateRequests = ['platform_admin', 'institution_admin', 'hr_initiator', 'compliance_reviewer', 'senior_approver'].includes(user.role);
  const canReviewMonitoring = ['platform_admin', 'institution_admin', 'hr_initiator', 'compliance_reviewer'].includes(user.role);
  const canViewAudit = ['platform_admin', 'auditor', 'regulator_admin', 'regulator_viewer', 'institution_admin', 'compliance_reviewer'].includes(user.role);

  return (
    <div>
      <div className="page-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>{t.accessProfile}</h3></div>
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-item"><label>{t.role}</label><div className="value">{user.role}</div></div>
              <div className="detail-item"><label>{t.institution}</label><div className="value">{institution?.name_en || '—'}</div></div>
              <div className="detail-item"><label>{t.regulator}</label><div className="value">{user.regulator || '—'}</div></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>{t.authSettings}</h3></div>
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-item"><label>{t.mfa}</label><div className="value">{mfaEnabled ? t.enabled : t.disabled}</div></div>
              <div className="detail-item"><label>{t.sessionTimeout}</label><div className="value">{t.minutes30}</div></div>
              <div className="detail-item"><label>{t.passwordPolicy}</label><div className="value">{t.strong}</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><h3>{t.permissions}</h3></div>
        <div className="card-body">
          <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            <li>{t.canCreateRequests}: <strong>{canCreateRequests ? t.enabled : t.disabled}</strong></li>
            <li>{t.canReviewMonitoring}: <strong>{canReviewMonitoring ? t.enabled : t.disabled}</strong></li>
            <li>{t.canViewAudit}: <strong>{canViewAudit ? t.enabled : t.disabled}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
