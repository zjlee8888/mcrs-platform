import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProfessionalIcon from '../components/ProfessionalIcon';

const STATUS_BADGES = {
  draft: 'badge-gray',
  consent_obtained: 'badge-blue',
  sent: 'badge-blue',
  acknowledged: 'badge-yellow',
  in_progress: 'badge-orange',
  response_provided: 'badge-purple',
  reviewed: 'badge-green',
  closed: 'badge-green',
  cancelled: 'badge-red',
};

const STATUS_LABELS = {
  en: {
    draft: 'Draft',
    consent_obtained: 'Consent Obtained',
    sent: 'Sent',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    response_provided: 'Response Provided',
    reviewed: 'Reviewed',
    closed: 'Closed',
    cancelled: 'Cancelled',
  },
  tc: {
    draft: '草稿',
    consent_obtained: '已取得同意',
    sent: '已發送',
    acknowledged: '已確認',
    in_progress: '進行中',
    response_provided: '已提供回覆',
    reviewed: '已審閱',
    closed: '已完成',
    cancelled: '已取消',
  },
  zh: {
    draft: '草稿',
    consent_obtained: '已取得同意',
    sent: '已发送',
    acknowledged: '已确认',
    in_progress: '进行中',
    response_provided: '已提供回复',
    reviewed: '已审阅',
    closed: '已完成',
    cancelled: '已取消',
  },
};

const STAGE_LABELS = {
  en: {
    preparation: 'Preparation',
    consent: 'Consent',
    exchange: 'Request Exchange',
    assessment: 'Assessment',
    review: 'Review',
    closure: 'Closure',
  },
  tc: {
    preparation: '準備',
    consent: '同意',
    exchange: '請求交換',
    assessment: '評估',
    review: '審閱',
    closure: '結案',
  },
  zh: {
    preparation: '准备',
    consent: '同意',
    exchange: '请求交换',
    assessment: '评估',
    review: '审阅',
    closure: '结案',
  },
};

const REQUEST_STAGE_SECTIONS = [
  { key: 'preparation', statuses: ['draft'] },
  { key: 'consent', statuses: ['consent_obtained'] },
  { key: 'exchange', statuses: ['sent', 'acknowledged'] },
  { key: 'assessment', statuses: ['in_progress', 'response_provided'] },
  { key: 'review', statuses: ['reviewed'] },
  { key: 'closure', statuses: ['closed', 'cancelled'] },
];

const SECTOR_LABELS = {
  en: {
    banking: 'Banking',
    securities: 'Securities',
    insurance: 'Insurance',
    mpf: 'MPF',
    cross_sector: 'Cross-Sector',
  },
  tc: {
    banking: '銀行',
    securities: '證券',
    insurance: '保險',
    mpf: '強積金',
    cross_sector: '跨行業',
  },
  zh: {
    banking: '银行',
    securities: '证券',
    insurance: '保险',
    mpf: '公积金',
    cross_sector: '跨行业',
  },
};

const FLAG_REASON_LABELS = {
  en: {
    sla_breached: 'SLA breached',
    overdue: 'Overdue',
    material_conduct: 'Material conduct issue',
    under_review_conduct: 'Conduct under review',
  },
  tc: {
    sla_breached: '違反 SLA',
    overdue: '已逾期',
    material_conduct: '重大操守問題',
    under_review_conduct: '操守待審查',
  },
  zh: {
    sla_breached: '违反 SLA',
    overdue: '已逾期',
    material_conduct: '重大操守问题',
    under_review_conduct: '操守待审查',
  },
};

const I18N = {
  en: { title: 'Dashboard', subtitle: 'Overview of MRC reference checking activity', total: 'Total Requests', active: 'Active Requests', overdue: 'Overdue (SLA)', institutions: 'Institutions', individuals: 'Individuals', statusBreakdown: 'Request Status Breakdown', noRequests: 'No requests yet', noData: 'No data', recent: 'Recent Reference Requests', viewAll: 'View All', individual: 'Individual', recruiting: 'Recruiting', providing: 'Providing', sector: 'Sector', status: 'Status', sla: 'SLA Deadline', conduct: 'Conduct Information Summary', loadFail: 'Failed to load dashboard data', flaggedIssues: 'Flagged Issues', noFlaggedIssues: 'No flagged issues requiring review' },
  tc: { title: '儀表板', subtitle: 'MRC 背調活動總覽', total: '請求總數', active: '進行中請求', overdue: '逾期（SLA）', institutions: '機構', individuals: '個人', statusBreakdown: '請求狀態分佈', noRequests: '暫無請求', noData: '無數據', recent: '最新背調請求', viewAll: '查看全部', individual: '個人', recruiting: '招聘方', providing: '提供方', sector: '行業', status: '狀態', sla: 'SLA 截止日', conduct: '操守資訊摘要', loadFail: '載入儀表板數據失敗', flaggedIssues: '需關注事項', noFlaggedIssues: '暫無需要審查的事項' },
  zh: { title: '仪表板', subtitle: 'MRC 背调活动总览', total: '请求总数', active: '进行中请求', overdue: '逾期（SLA）', institutions: '机构', individuals: '个人', statusBreakdown: '请求状态分布', noRequests: '暂无请求', noData: '无数据', recent: '最新背调请求', viewAll: '查看全部', individual: '个人', recruiting: '招聘方', providing: '提供方', sector: '行业', status: '状态', sla: 'SLA 截止日', conduct: '操守信息摘要', loadFail: '加载仪表板数据失败', flaggedIssues: '需关注事项', noFlaggedIssues: '暂无需要审查的事项' },
};

function capitalize(str) {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function DashboardPage({ user, lang = 'en' }) {
  const t = I18N[lang] || I18N.en;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    try {
      const nextData = await api.dashboard();
      setData(nextData);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard({ showLoading: true });

    const refreshOnFocus = () => loadDashboard();
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') loadDashboard();
    };

    const intervalId = setInterval(() => loadDashboard(), 30000);
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnVisible);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnVisible);
    };
  }, [loadDashboard]);

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;
  if (!data) return <div className="error-msg">{t.loadFail}</div>;

  const totalRequests = data.totalRequests ?? Object.values(data.statusCounts || {}).reduce((a, b) => a + b, 0);
  const activeRequests = data.activeRequests
    ?? Object.entries(data.statusCounts || {}).reduce((sum, [status, count]) => (
      ['closed', 'cancelled'].includes(status) ? sum : sum + count
    ), 0);
  const stageStatusBreakdown = data.stageStatusBreakdown || {};

  const statusSections = REQUEST_STAGE_SECTIONS.map((section) => {
    const sourceStatuses = stageStatusBreakdown[section.key]?.statuses || data.statusCounts || {};
    const statuses = section.statuses
      .map((status) => [status, Number(sourceStatuses[status] || 0)])
      .filter(([, count]) => count > 0);

    return {
      key: section.key,
      statuses,
      total: Number(stageStatusBreakdown[section.key]?.total || statuses.reduce((sum, [, count]) => sum + count, 0)),
    };
  }).filter((section) => section.total > 0);

  return (
    <div>
      <div className="page-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><ProfessionalIcon name="requests" size={22} /></div>
          <div className="stat-info">
            <h4>{totalRequests}</h4>
            <p>{t.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><ProfessionalIcon name="active" size={22} /></div>
          <div className="stat-info">
            <h4>{activeRequests}</h4>
            <p>{t.active}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><ProfessionalIcon name="alert" size={22} /></div>
          <div className="stat-info">
            <h4>{data.slaStats.overdue || 0}</h4>
            <p>{t.overdue}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><ProfessionalIcon name="institutions" size={22} /></div>
          <div className="stat-info">
            <h4>{data.institutionCount}</h4>
            <p>{t.institutions}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><ProfessionalIcon name="individuals" size={22} /></div>
          <div className="stat-info">
            <h4>{data.individualCount}</h4>
            <p>{t.individuals}</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3>{t.statusBreakdown}</h3>
          </div>
          <div className="card-body">
            {statusSections.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>{t.noRequests}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {statusSections.map((section) => (
                  <div key={section.key} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>{STAGE_LABELS[lang]?.[section.key] || STAGE_LABELS.en[section.key] || capitalize(section.key)}</span>
                      <span style={{ fontWeight: 600 }}>{section.total}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {section.statuses.map(([status, count]) => (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className={`badge ${STATUS_BADGES[status] || 'badge-gray'}`}>
                            {STATUS_LABELS[lang]?.[status] || STATUS_LABELS.en[status] || capitalize(status)}
                          </span>
                          <span style={{ fontWeight: 600 }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Flagged Issues */}
        <div className="card">
          <div className="card-header">
            <h3>{t.flaggedIssues}</h3>
          </div>
          <div className="card-body">
            {(data.flaggedCases || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>{t.noFlaggedIssues}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(data.flaggedCases || []).map((item) => (
                  <Link
                    key={item.request_id}
                    to={`/requests/${item.request_id}`}
                    style={{ textDecoration: 'none', color: 'inherit', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>
                        {item.individual_name || item.request_id}
                        {item.individual_name_zh && <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 12 }}>{item.individual_name_zh}</span>}
                      </span>
                      <span className={`badge ${STATUS_BADGES[item.status] || 'badge-gray'}`}>
                        {STATUS_LABELS[lang]?.[item.status] || STATUS_LABELS.en[item.status] || capitalize(item.status || '')}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                      {item.recruiting_institution_name}
                      {item.recruiting_institution_name_zh ? ` (${item.recruiting_institution_name_zh})` : ''}
                      {' ← '}
                      {item.providing_institution_name}
                      {item.providing_institution_name_zh ? ` (${item.providing_institution_name_zh})` : ''}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(item.reasons || []).map((reason) => (
                        <span key={reason} className="badge badge-red">
                          {FLAG_REASON_LABELS[lang]?.[reason] || FLAG_REASON_LABELS.en[reason] || capitalize(reason)}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3>{t.recent}</h3>
          <Link to="/requests" className="btn btn-outline btn-sm">{t.viewAll}</Link>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{t.individual}</th>
                  <th>{t.recruiting}</th>
                  <th>{t.providing}</th>
                  <th>{t.sector}</th>
                  <th>{t.status}</th>
                  <th>{t.sla}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentRequests.map((req) => (
                  <tr key={req.request_id}>
                    <td>
                      <Link to={`/requests/${req.request_id}`} style={{ fontWeight: 500 }}>
                        {req.individual_name}
                        {req.individual_name_zh && <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 12 }}>{req.individual_name_zh}</span>}
                      </Link>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {req.recruiting_institution_name}
                      {req.recruiting_institution_name_zh ? ` (${req.recruiting_institution_name_zh})` : ''}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {req.providing_institution_name}
                      {req.providing_institution_name_zh ? ` (${req.providing_institution_name_zh})` : ''}
                    </td>
                    <td><span className="badge badge-blue">{SECTOR_LABELS[lang]?.[req.request_sector] || SECTOR_LABELS.en[req.request_sector] || capitalize(req.request_sector || '')}</span></td>
                    <td><span className={`badge ${STATUS_BADGES[req.status] || 'badge-gray'}`}>{STATUS_LABELS[lang]?.[req.status] || STATUS_LABELS.en[req.status] || capitalize(req.status || '')}</span></td>
                    <td style={{ fontSize: 13, color: req.sla_deadline && new Date(req.sla_deadline) < new Date() ? 'var(--danger)' : 'inherit' }}>
                      {req.sla_deadline || '—'}
                    </td>
                  </tr>
                ))}
                {data.recentRequests.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>{t.noRequests}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Conduct Summary */}
      {Object.keys(data.conductSummary).length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <h3>{t.conduct}</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {Object.entries(data.conductSummary).map(([cat, count]) => (
                <div key={cat} className="stat-card" style={{ flex: '1 1 200px' }}>
                  <div className="stat-info">
                    <h4>{count}</h4>
                    <p>{cat.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
