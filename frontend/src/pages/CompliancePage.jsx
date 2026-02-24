import { useState, useEffect } from 'react';
import { api } from '../api';
import ProfessionalIcon from '../components/ProfessionalIcon';

export default function CompliancePage({ user, lang = 'en' }) {
  const I18N = {
    en: { title: 'Compliance Dashboard', subtitle: 'SLA monitoring and compliance metrics across all participating institutions', rate: 'SLA Compliance Rate', avg: 'Avg Response Time (days)', activeInst: 'Active Institutions', overview: 'Institution Compliance Overview', institution: 'Institution', total: 'Total Requests', breached: 'SLA Breached', avgResp: 'Avg Response (days)', compliance: 'Compliance', noData: 'No compliance data available', req: 'SLA Requirements', responseDeadline: 'Response Deadline', reminder: 'Reminder Schedule', escalation: 'Escalation', regulatorFlag: 'Regulator Flag', lookback: 'Lookback Period', retention: 'Data Retention' },
    tc: { title: '合規儀表板', subtitle: '所有參與機構的 SLA 監控及合規指標', rate: 'SLA 合規率', avg: '平均回覆時間（天）', activeInst: '活躍機構', overview: '機構合規概覽', institution: '機構', total: '請求總數', breached: 'SLA 違規', avgResp: '平均回覆（天）', compliance: '合規率', noData: '沒有可用合規數據', req: 'SLA 要求', responseDeadline: '回覆期限', reminder: '提醒時間表', escalation: '升級處理', regulatorFlag: '監管標記', lookback: '回溯期', retention: '資料保留' },
    zh: { title: '合规仪表板', subtitle: '所有参与机构的 SLA 监控及合规指标', rate: 'SLA 合规率', avg: '平均回复时间（天）', activeInst: '活跃机构', overview: '机构合规概览', institution: '机构', total: '请求总数', breached: 'SLA 违规', avgResp: '平均回复（天）', compliance: '合规率', noData: '没有可用合规数据', req: 'SLA 要求', responseDeadline: '回复期限', reminder: '提醒时间表', escalation: '升级处理', regulatorFlag: '监管标记', lookback: '回溯期', retention: '数据保留' },
  };
  const t = I18N[lang] || I18N.en;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.compliance().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /> Loading...</div>;
  if (!data) return <div className="error-msg">Failed to load compliance data</div>;

  return (
    <div>
      <div className="page-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><ProfessionalIcon name="compliance" size={22} /></div>
          <div className="stat-info">
            <h4>{data.slaComplianceRate}%</h4>
            <p>{t.rate}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><ProfessionalIcon name="time" size={22} /></div>
          <div className="stat-info">
            <h4>{data.avgResponseDays ?? '—'}</h4>
            <p>{t.avg}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><ProfessionalIcon name="institutions" size={22} /></div>
          <div className="stat-info">
            <h4>{data.byInstitution?.length || 0}</h4>
            <p>{t.activeInst}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{t.overview}</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{t.institution}</th>
                  <th>{t.total}</th>
                  <th>{t.breached}</th>
                  <th>{t.avgResp}</th>
                  <th>{t.compliance}</th>
                </tr>
              </thead>
              <tbody>
                {data.byInstitution?.filter(i => i.total_requests > 0).map(inst => {
                  const compRate = inst.total_requests > 0
                    ? Math.round(((inst.total_requests - inst.sla_breached) / inst.total_requests) * 100)
                    : 100;
                  return (
                    <tr key={inst.institution_id}>
                      <td style={{ fontWeight: 500 }}>{inst.name_en}</td>
                      <td>{inst.total_requests}</td>
                      <td>
                        {inst.sla_breached > 0 ? (
                          <span className="badge badge-red">{inst.sla_breached}</span>
                        ) : (
                          <span className="badge badge-green">0</span>
                        )}
                      </td>
                      <td>{inst.avg_response_days ? Math.round(inst.avg_response_days * 10) / 10 : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                              width: `${compRate}%`,
                              height: '100%',
                              background: compRate >= 90 ? 'var(--success)' : compRate >= 70 ? 'var(--warning)' : 'var(--danger)',
                              borderRadius: 4,
                            }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, width: 40 }}>{compRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!data.byInstitution || data.byInstitution.filter(i => i.total_requests > 0).length === 0) && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>{t.noData}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 30-Day SLA Reference */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3>{t.req}</h3></div>
        <div className="card-body" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          <div className="detail-grid">
            <div className="detail-item">
              <label>{t.responseDeadline}</label>
              <div className="value">30 calendar days from request date</div>
            </div>
            <div className="detail-item">
              <label>{t.reminder}</label>
              <div className="value">Day 7, 14, 21, 25, 28</div>
            </div>
            <div className="detail-item">
              <label>{t.escalation}</label>
              <div className="value">Auto-escalate to Compliance Officer at Day 25</div>
            </div>
            <div className="detail-item">
              <label>{t.regulatorFlag}</label>
              <div className="value">Flag to regulator dashboard at Day 30+</div>
            </div>
            <div className="detail-item">
              <label>{t.lookback}</label>
              <div className="value">7 years</div>
            </div>
            <div className="detail-item">
              <label>{t.retention}</label>
              <div className="value">Per PDPO / sector-specific rules</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
