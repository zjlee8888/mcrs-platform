import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function IndividualsPage({ user, lang = 'en' }) {
  const I18N = {
    en: { title: 'Individuals', subtitle: 'In-scope individuals subject to MRC reference checking', search: 'Search by name or email...', lastRefreshed: 'Last refreshed', nameEn: 'Name (English)', nameZh: 'Name (Chinese)', email: 'Email', noIndividuals: 'No individuals found', noReferenceRequests: 'No reference requests for this individual', chineseName: 'Chinese Name', registrations: 'Regulatory Registrations', reg: 'Regulator', regNo: 'Reg #', type: 'Type', status: 'Status', institution: 'Institution', employment: 'Employment History (7-Year Lookback)', position: 'Position', period: 'Period', current: 'Current', present: 'present', referenceRequests: 'Reference Requests', demo: 'Demo' },
    tc: { title: '個人', subtitle: '受 MRC 背調涵蓋的人員', search: '按姓名或電郵搜尋...', lastRefreshed: '上次更新', nameEn: '英文姓名', nameZh: '中文姓名', email: '電郵', noIndividuals: '找不到個人記錄', noReferenceRequests: '此個人沒有背調請求', chineseName: '中文姓名', registrations: '監管註冊', reg: '監管機構', regNo: '註冊號', type: '類型', status: '狀態', institution: '機構', employment: '僱傭履歷（7 年回溯）', position: '職位', period: '期間', current: '現任', present: '至今', referenceRequests: '背調請求', demo: '示範' },
    zh: { title: '个人', subtitle: '受 MRC 背调涵盖的人员', search: '按姓名或邮箱搜索...', lastRefreshed: '上次刷新', nameEn: '英文姓名', nameZh: '中文姓名', email: '邮箱', noIndividuals: '找不到个人记录', noReferenceRequests: '该个人没有背调请求', chineseName: '中文姓名', registrations: '监管注册', reg: '监管机构', regNo: '注册号', type: '类型', status: '状态', institution: '机构', employment: '雇佣履历（7 年回溯）', position: '职位', period: '期间', current: '现任', present: '至今', referenceRequests: '背调请求', demo: '演示' },
  };
  const t = I18N[lang] || I18N.en;
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  const loadIndividuals = () => {
    setLoading(true);
    api.getIndividuals({ search: search || undefined, limit: 500 })
      .then(data => setIndividuals(data.individuals))
      .catch(console.error)
      .finally(() => {
        setLastRefreshedAt(new Date());
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadIndividuals();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!selected?.individual_id) return undefined;

    const refreshSelected = () => {
      api.getIndividual(selected.individual_id)
        .then(setSelected)
        .catch(console.error);
    };

    const onFocus = () => refreshSelected();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshSelected();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [selected?.individual_id]);

  const loadDetail = async (id) => {
    setDetailLoading(true);
    try {
      const ind = await api.getIndividual(id);
      setSelected(ind);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="form-control"
          style={{ width: 400 }}
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="toolbar-right">
          {lastRefreshedAt && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t.lastRefreshed}: {lastRefreshedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div className="card" style={{ flex: selected ? 1 : 1 }}>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading"><div className="spinner" /> Loading...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{t.nameEn}</th>
                      <th>{t.nameZh}</th>
                      <th>{t.email}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {individuals.map(ind => (
                      <tr key={ind.individual_id} style={{ cursor: 'pointer', background: selected?.individual_id === ind.individual_id ? '#f0f4ff' : undefined }} onClick={() => loadDetail(ind.individual_id)}>
                        <td style={{ fontWeight: 500 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <span>{ind.name_en_surname}, {ind.name_en_given}</span>
                            {Boolean(ind.is_demo_profile) && <span className="badge badge-purple" style={{ fontSize: 11 }}>{t.demo}</span>}
                          </span>
                        </td>
                        <td>{ind.name_zh || '—'}</td>
                        <td style={{ fontSize: 13 }}>{ind.email || '—'}</td>
                      </tr>
                    ))}
                    {individuals.length === 0 && (
                      <tr><td colSpan={3} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>{t.noIndividuals}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {selected && (
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{selected.name_en_surname}, {selected.name_en_given}</span>
                {Boolean(selected.is_demo_profile) && <span className="badge badge-purple" style={{ fontSize: 11 }}>{t.demo}</span>}
              </h3>
              <button className="close-btn" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="card-body">
              {detailLoading ? (
                <div className="loading"><div className="spinner" /> Loading...</div>
              ) : (
                <>
                  <div className="detail-grid" style={{ marginBottom: 20 }}>
                    <div className="detail-item">
                      <label>{t.chineseName}</label>
                      <div className="value">{selected.name_zh || '—'}</div>
                    </div>
                    <div className="detail-item">
                      <label>{t.email}</label>
                      <div className="value">{selected.email || '—'}</div>
                    </div>
                  </div>

                  {/* Regulatory Registrations */}
                  {selected.registrations?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ fontSize: 14, marginBottom: 8 }}>{t.registrations}</h4>
                      <table style={{ fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th>{t.reg}</th>
                            <th>{t.regNo}</th>
                            <th>{t.type}</th>
                            <th>{t.status}</th>
                            <th>{t.institution}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.registrations.map(r => (
                            <tr key={r.registration_id}>
                              <td><span className="badge badge-purple">{r.regulator}</span></td>
                              <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.registration_number}</td>
                              <td>{r.registration_type}</td>
                              <td><span className={`badge ${r.status === 'current' ? 'badge-green' : 'badge-gray'}`}>{r.status === 'current' ? t.current : r.status}</span></td>
                              <td style={{ fontSize: 12 }}>{r.institution_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Employment History */}
                  {selected.employment_records?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ fontSize: 14, marginBottom: 8 }}>{t.employment}</h4>
                      <table style={{ fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th>{t.institution}</th>
                            <th>{t.position}</th>
                            <th>{t.period}</th>
                            <th>{t.current}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.employment_records.map(e => (
                            <tr key={e.record_id}>
                              <td style={{ fontWeight: 500 }}>{e.institution_name}</td>
                              <td>{e.position_title}</td>
                              <td>{e.start_date} — {e.end_date || t.present}</td>
                              <td>{e.is_current ? <span className="badge badge-green">{t.current}</span> : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Reference Requests */}
                  <div>
                    <h4 style={{ fontSize: 14, marginBottom: 8 }}>{t.referenceRequests}</h4>
                    {selected.reference_requests?.length > 0 ? (
                      selected.reference_requests.map(rr => (
                        <Link key={rr.request_id} to={`/requests/${rr.request_id}`} style={{ display: 'block', padding: 10, background: 'var(--bg)', borderRadius: 'var(--radius)', marginBottom: 6, textDecoration: 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13 }}>{rr.recruiting_institution_name} ← {rr.providing_institution_name}</span>
                            <span className={`badge ${rr.status === 'closed' ? 'badge-green' : 'badge-blue'}`}>{rr.status?.replace(/_/g, ' ')}</span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.noReferenceRequests}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
