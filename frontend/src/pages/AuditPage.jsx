import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AuditPage({ user, lang = 'en' }) {
  const I18N = {
    en: { title: 'Audit Log', subtitle: 'Immutable audit trail for all system actions (who, what, when, from where)', allEntities: 'All Entities', allActions: 'All Actions', page: 'Page', prev: '← Prev', next: 'Next →', timestamp: 'Timestamp', user: 'User', institution: 'Institution', entity: 'Entity', action: 'Action', details: 'Details', noLogs: 'No audit logs found', referenceRequests: 'Reference Requests', institutions: 'Institutions', individuals: 'Individuals', consents: 'Consents', conductInfo: 'Conduct Info', users: 'Users', ongoingMonitoring: 'Ongoing Monitoring' },
    tc: { title: '審計日誌', subtitle: '所有系統操作的不可變審計軌跡（誰、做了什麼、何時、從哪裡）', allEntities: '所有實體', allActions: '所有操作', page: '第', prev: '← 上一頁', next: '下一頁 →', timestamp: '時間戳', user: '使用者', institution: '機構', entity: '實體', action: '操作', details: '詳情', noLogs: '找不到審計日誌', referenceRequests: '背調請求', institutions: '機構', individuals: '個人', consents: '同意書', conductInfo: '操守資訊', users: '使用者', ongoingMonitoring: '持續監察' },
    zh: { title: '审计日志', subtitle: '所有系统操作的不可变审计轨迹（谁、做了什么、何时、从哪里）', allEntities: '所有实体', allActions: '所有操作', page: '第', prev: '← 上一页', next: '下一页 →', timestamp: '时间戳', user: '用户', institution: '机构', entity: '实体', action: '操作', details: '详情', noLogs: '找不到审计日志', referenceRequests: '背调请求', institutions: '机构', individuals: '个人', consents: '同意书', conductInfo: '操守信息', users: '用户', ongoingMonitoring: '持续监控' },
  };
  const t = I18N[lang] || I18N.en;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 50 };
    if (entityFilter) params.entity_type = entityFilter;
    if (actionFilter) params.action = actionFilter;
    api.auditLogs(params)
      .then(data => setLogs(data.logs))
      .catch(console.error)
      .finally(() => setLoading(false));
      
  }, [entityFilter, actionFilter, page]);

  const actionBadges = {
    create: 'badge-green', read: 'badge-gray', update: 'badge-blue',
    delete: 'badge-red', export: 'badge-yellow', status_change: 'badge-orange',
    login: 'badge-blue', logout: 'badge-gray', consent_granted: 'badge-green',
    consent_withdrawn: 'badge-red', sla_breach: 'badge-red', escalation: 'badge-orange',
  };

  return (
    <div>
      <div className="page-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="toolbar">
        <select className="form-control" style={{ width: 180 }} value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}>
          <option value="">{t.allEntities}</option>
          <option value="reference_request">{t.referenceRequests}</option>
          <option value="institution">{t.institutions}</option>
          <option value="individual">{t.individuals}</option>
          <option value="consent">{t.consents}</option>
          <option value="conduct_information">{t.conductInfo}</option>
          <option value="ongoing_monitoring">{t.ongoingMonitoring}</option>
          <option value="user">{t.users}</option>
        </select>
        <select className="form-control" style={{ width: 180 }} value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
          <option value="">{t.allActions}</option>
          <option value="create">Create</option>
          <option value="read">Read</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="status_change">Status Change</option>
          <option value="login">Login</option>
          <option value="consent_granted">Consent Granted</option>
          <option value="consent_withdrawn">Consent Withdrawn</option>
          <option value="sla_breach">SLA Breach</option>
          <option value="escalation">Escalation</option>
        </select>
        <div className="toolbar-right">
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t.prev}</button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.page} {page}</span>
          <button className="btn btn-outline btn-sm" disabled={logs.length < 50} onClick={() => setPage(p => p + 1)}>{t.next}</button>
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
                    <th>{t.timestamp}</th>
                    <th>{t.user}</th>
                    <th>{t.institution}</th>
                    <th>{t.entity}</th>
                    <th>{t.action}</th>
                    <th>{t.details}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    let details = '';
                    try {
                      const d = JSON.parse(log.details);
                      if (d.from && d.to) details = `${d.from} → ${d.to}`;
                      else if (d.note) details = d.note;
                      else if (d.method) details = `${d.method} ${d.path}`;
                      else details = JSON.stringify(d);
                    } catch { details = log.details; }

                    return (
                      <tr key={log.log_id}>
                        <td style={{ fontSize: 12, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td style={{ fontSize: 13 }}>{log.user_name || '—'}</td>
                        <td style={{ fontSize: 13 }}>{log.institution_name || '—'}</td>
                        <td>
                          <span className="badge badge-gray">{log.entity_type}</span>
                        </td>
                        <td>
                          <span className={`badge ${actionBadges[log.action] || 'badge-gray'}`}>
                            {log.action?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {details}
                        </td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>{t.noLogs}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
