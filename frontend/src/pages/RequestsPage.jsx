import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import ProfessionalIcon from '../components/ProfessionalIcon';

const STATUS_BADGES = {
  draft: 'badge-gray', consent_obtained: 'badge-blue', sent: 'badge-blue',
  acknowledged: 'badge-yellow', in_progress: 'badge-orange', response_provided: 'badge-purple',
  reviewed: 'badge-green', closed: 'badge-green', cancelled: 'badge-red',
};

function titleCase(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RequestsPage({ user, lang = 'en' }) {
  const I18N = {
    en: { title: 'Reference Requests', subtitle: 'Manage MRC reference checking requests', allStatuses: 'All Statuses', allSectors: 'All Sectors', newRequest: '+ New Request', lastRefreshed: 'Last refreshed', individual: 'Individual', recruiting: 'Recruiting Institution', providing: 'Providing Institution', sector: 'Sector', status: 'Status', integrations: 'Integrations', requestDate: 'Request Date', slaDeadline: 'SLA Deadline', sla: 'SLA', noRequests: 'No reference requests', createFirst: 'Create your first reference request to get started', draft: 'Draft', consentObtained: 'Consent Obtained', sent: 'Sent', acknowledged: 'Acknowledged', inProgress: 'In Progress', responseProvided: 'Response Provided', reviewed: 'Reviewed', closed: 'Closed', cancelled: 'Cancelled', banking: 'Banking', securities: 'Securities', insurance: 'Insurance', mpf: 'MPF', crossSector: 'Cross-Sector', issuesFound: 'Issues', clear: 'Clear', notChecked: 'Not checked' },
    tc: { title: '背調請求', subtitle: '管理 MRC 背調請求', allStatuses: '所有狀態', allSectors: '所有行業', newRequest: '+ 新增請求', lastRefreshed: '上次更新', individual: '個人', recruiting: '招聘機構', providing: '提供機構', sector: '行業', status: '狀態', integrations: '整合', requestDate: '請求日期', slaDeadline: 'SLA 截止日', sla: 'SLA', noRequests: '沒有背調請求', createFirst: '建立首個背調請求以開始', draft: '草稿', consentObtained: '已取得同意', sent: '已發送', acknowledged: '已確認', inProgress: '進行中', responseProvided: '已提供回覆', reviewed: '已審閱', closed: '已完成', cancelled: '已取消', banking: '銀行', securities: '證券', insurance: '保險', mpf: '強積金', crossSector: '跨行業', issuesFound: '有問題', clear: '正常', notChecked: '未檢查' },
    zh: { title: '背调请求', subtitle: '管理 MRC 背调请求', allStatuses: '所有状态', allSectors: '所有行业', newRequest: '+ 新建请求', lastRefreshed: '上次刷新', individual: '个人', recruiting: '招聘机构', providing: '提供机构', sector: '行业', status: '状态', integrations: '集成', requestDate: '请求日期', slaDeadline: 'SLA 截止日', sla: 'SLA', noRequests: '没有背调请求', createFirst: '创建首个背调请求以开始', draft: '草稿', consentObtained: '已取得同意', sent: '已发送', acknowledged: '已确认', inProgress: '进行中', responseProvided: '已提供回复', reviewed: '已审阅', closed: '已完成', cancelled: '已取消', banking: '银行', securities: '证券', insurance: '保险', mpf: '公积金', crossSector: '跨行业', issuesFound: '有问题', clear: '正常', notChecked: '未检查' },
  };
  const t = I18N[lang] || I18N.en;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const navigate = useNavigate();

  const loadRequests = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (sectorFilter) params.sector = sectorFilter;
    Promise.allSettled([
      api.getRequests(params),
    ])
      .then(([requestResult]) => {
        if (requestResult.status === 'fulfilled') {
          setRequests(requestResult.value.requests || []);
        }
        setLastRefreshedAt(new Date());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadRequests, [statusFilter, sectorFilter]);

  useEffect(() => {
    const onFocus = () => loadRequests();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadRequests();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [statusFilter, sectorFilter]);

  const isReadOnly = ['regulator_admin', 'regulator_viewer', 'auditor'].includes(user.role);

  return (
    <div>
      <div className="page-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="toolbar">
        <select className="form-control" style={{ width: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">{t.allStatuses}</option>
          <option value="draft">{t.draft}</option>
          <option value="consent_obtained">{t.consentObtained}</option>
          <option value="sent">{t.sent}</option>
          <option value="acknowledged">{t.acknowledged}</option>
          <option value="in_progress">{t.inProgress}</option>
          <option value="response_provided">{t.responseProvided}</option>
          <option value="reviewed">{t.reviewed}</option>
          <option value="closed">{t.closed}</option>
          <option value="cancelled">{t.cancelled}</option>
        </select>
        <select className="form-control" style={{ width: 160 }} value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
          <option value="">{t.allSectors}</option>
          <option value="banking">{t.banking}</option>
          <option value="securities">{t.securities}</option>
          <option value="insurance">{t.insurance}</option>
          <option value="mpf">{t.mpf}</option>
          <option value="cross_sector">{t.crossSector}</option>
        </select>
        <div className="toolbar-right">
          {!isReadOnly && (
            <button className="btn btn-primary" onClick={() => navigate('/requests/new')}>
              {t.newRequest}
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading"><div className="spinner" /> Loading...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t.individual}</th>
                    <th>{t.recruiting}</th>
                    <th>{t.providing}</th>
                    <th>{t.sector}</th>
                    <th>{t.status}</th>
                    <th>{t.integrations}</th>
                    <th>{t.requestDate}</th>
                    <th>{t.slaDeadline}</th>
                    <th>{t.sla}</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.request_id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/requests/${req.request_id}`)}>
                      <td style={{ fontWeight: 500 }}>
                        {req.individual_name}
                        {req.individual_name_zh && <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 12 }}>{req.individual_name_zh}</span>}
                      </td>
                      <td style={{ fontSize: 13 }}>{req.recruiting_institution_name}</td>
                      <td style={{ fontSize: 13 }}>{req.providing_institution_name}</td>
                      <td><span className="badge badge-blue">{titleCase(req.request_sector)}</span></td>
                      <td><span className={`badge ${STATUS_BADGES[req.status]}`}>{titleCase(req.status)}</span></td>
                      <td>
                        {req.integration_snapshot?.summary ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span className={`badge ${req.integration_snapshot.summary.issue_hits > 0 ? 'badge-red' : 'badge-green'}`}>
                              {req.integration_snapshot.summary.issue_hits || 0} {req.integration_snapshot.summary.issue_hits === 1 ? t.issuesFound : t.issuesFound}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              W:{req.integration_snapshot.summary.watchlist_hits || 0} • L:{req.integration_snapshot.summary.license_matches || 0} • C:{req.integration_snapshot.summary.litigation_hits || 0}
                            </span>
                          </div>
                        ) : (
                          <span className="badge badge-gray">{t.notChecked}</span>
                        )}
                      </td>
                      <td style={{ fontSize: 13 }}>{req.request_date || '—'}</td>
                      <td style={{ fontSize: 13, color: req.sla_deadline && new Date(req.sla_deadline) < new Date() ? 'var(--danger)' : 'inherit', fontWeight: req.sla_deadline && new Date(req.sla_deadline) < new Date() ? 600 : 400 }}>
                        {req.sla_deadline || '—'}
                      </td>
                      <td>
                        {req.sla_breached ? <span className="badge badge-red">Breached</span> : req.sla_deadline ? <span className="badge badge-green">OK</span> : '—'}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr><td colSpan={9} className="empty-state" style={{ padding: 48 }}>
                      <div className="icon"><ProfessionalIcon name="requests" size={48} /></div>
                      <h3>{t.noRequests}</h3>
                      <p>{t.createFirst}</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {lastRefreshedAt && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          {t.lastRefreshed}: {lastRefreshedAt.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
