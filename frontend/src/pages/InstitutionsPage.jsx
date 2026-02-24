import { Fragment, useState, useEffect } from 'react';
import { api } from '../api';

const CHINESE_FIS = [
  { en: 'Bank of China (Hong Kong)', zh: '中國銀行(香港)' },
  { en: 'ICBC (Asia)', zh: '中國工商銀行(亞洲)' },
  { en: 'China Construction Bank (Asia)', zh: '中國建設銀行(亞洲)' },
  { en: 'Bank of Communications (Hong Kong)', zh: '交通銀行(香港)' },
  { en: 'CMB Wing Lung Bank', zh: '招商永隆銀行' },
];

const SINGAPORE_FIS = [
  { en: 'DBS Bank', zh: '星展銀行' },
  { en: 'OCBC Bank', zh: '華僑銀行' },
  { en: 'United Overseas Bank', zh: '大華銀行' },
  { en: 'Standard Chartered Singapore', zh: '渣打新加坡' },
  { en: 'Maybank Singapore', zh: '馬來亞銀行新加坡' },
];

const I18N = {
  en: {
    title: 'Institutions',
    subtitle: 'Participating institutions across all regulated sectors',
    searchPlaceholder: 'Search institutions...',
    allSectors: 'All Sectors',
    allRegions: 'All Regions',
    chineseFIs: 'Chinese FIs',
    singaporeFIs: 'Singapore FIs',
    institution: 'Institution',
    region: 'Region',
    type: 'Type',
    sectors: 'Sectors',
    regulators: 'Regulators',
    status: 'Status',
    typeLabel: 'Type',
    ubi: 'UBI',
    licenceNumbers: 'Licence Numbers',
    contactEmail: 'Contact Email',
    users: 'Users',
    onboarded: 'Onboarded',
    noInstitutions: 'No institutions found',
    registered: 'registered',
  },
  tc: {
    title: '機構',
    subtitle: '涵蓋所有受監管行業的參與機構',
    searchPlaceholder: '搜尋機構...',
    allSectors: '所有行業',
    allRegions: '所有地區',
    chineseFIs: '中國金融機構',
    singaporeFIs: '新加坡金融機構',
    institution: '機構',
    region: '地區',
    type: '類型',
    sectors: '行業',
    regulators: '監管機構',
    status: '狀態',
    typeLabel: '類型',
    ubi: 'UBI',
    licenceNumbers: '牌照號碼',
    contactEmail: '聯絡電郵',
    users: '使用者',
    onboarded: '加入日期',
    noInstitutions: '未找到機構',
    registered: '已註冊',
  },
  zh: {
    title: '机构',
    subtitle: '覆盖所有受监管行业的参与机构',
    searchPlaceholder: '搜索机构...',
    allSectors: '所有行业',
    allRegions: '所有地区',
    chineseFIs: '中国金融机构',
    singaporeFIs: '新加坡金融机构',
    institution: '机构',
    region: '地区',
    type: '类型',
    sectors: '行业',
    regulators: '监管机构',
    status: '状态',
    typeLabel: '类型',
    ubi: 'UBI',
    licenceNumbers: '牌照号码',
    contactEmail: '联系邮箱',
    users: '用户',
    onboarded: '加入日期',
    noInstitutions: '未找到机构',
    registered: '已注册',
  },
};

function titleCase(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayName(item, lang) {
  if (lang === 'en') return item.en;
  return item.zh || item.en;
}

export default function InstitutionsPage({ user, lang = 'en' }) {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const t = I18N[lang] || I18N.en;

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (sectorFilter) params.sector = sectorFilter;
    if (regionFilter) params.region = regionFilter;
    api.getInstitutions(params)
      .then(data => setInstitutions(data.institutions))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, sectorFilter, regionFilter]);

  const loadDetail = async (id) => {
    try {
      const inst = await api.getInstitution(id);
      setSelected(inst);
    } catch (err) {
      console.error(err);
    }
  };

  const typeLabels = {
    AI: 'Authorised Institution', DTC: 'Deposit-Taking Company',
    Licensed_Corp_SFC: 'SFC Licensed Corp', Licensed_Agency_IA: 'IA Licensed Agency',
    Licensed_Broker_IA: 'IA Licensed Broker', Principal_Intermediary_MPFA: 'MPFA Principal Intermediary',
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
          style={{ width: 300 }}
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-control" style={{ width: 160 }} value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
          <option value="">{t.allSectors}</option>
          <option value="banking">Banking</option>
          <option value="securities">Securities</option>
          <option value="insurance">Insurance</option>
          <option value="mpf">MPF</option>
        </select>
        <select className="form-control" style={{ width: 170 }} value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="">{t.allRegions}</option>
          <option value="asia">Asia</option>
          <option value="europe">Europe</option>
          <option value="north_america">North America</option>
          <option value="latin_america">Latin America</option>
          <option value="middle_east">Middle East</option>
          <option value="africa">Africa</option>
          <option value="oceania">Oceania</option>
        </select>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><h3>{t.chineseFIs}</h3></div>
          <div className="card-body" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CHINESE_FIS.map((fi) => (
              <span key={fi.en} className="badge badge-blue">{displayName(fi, lang)}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>{t.singaporeFIs}</h3></div>
          <div className="card-body" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SINGAPORE_FIS.map((fi) => (
              <span key={fi.en} className="badge badge-purple">{displayName(fi, lang)}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* List */}
        <div className="card" style={{ flex: 2 }}>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="loading"><div className="spinner" /> Loading...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{t.region}</th>
                      <th>{t.institution}</th>
                      <th>{t.type}</th>
                      <th>{t.sectors}</th>
                      <th>{t.regulators}</th>
                      <th>{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutions.map((inst, index) => {
                      const previousRegion = index > 0 ? institutions[index - 1].region : null;
                      const showGroupRow = inst.region && inst.region !== previousRegion;
                      return (
                        <Fragment key={inst.institution_id}>
                          {showGroupRow && (
                            <tr key={`${inst.region}-group`}>
                              <td colSpan={6} style={{ background: 'var(--bg-secondary)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {titleCase(inst.region)}
                              </td>
                            </tr>
                          )}
                          <tr style={{ cursor: 'pointer', background: selected?.institution_id === inst.institution_id ? '#f0f4ff' : undefined }} onClick={() => loadDetail(inst.institution_id)}>
                            <td><span className="badge badge-gray">{titleCase(inst.region || 'asia')}</span></td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{inst.name_en}</div>
                              {inst.name_zh && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inst.name_zh}</div>}
                            </td>
                            <td style={{ fontSize: 13 }}>{typeLabels[inst.institution_type] || inst.institution_type}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {inst.sectors?.map(s => <span key={s} className="badge badge-blue">{titleCase(s)}</span>)}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {inst.regulators?.map(r => <span key={r} className="badge badge-purple">{r}</span>)}
                              </div>
                            </td>
                            <td><span className={`badge ${inst.status === 'active' ? 'badge-green' : 'badge-red'}`}>{titleCase(inst.status)}</span></td>
                          </tr>
                        </Fragment>
                      );
                    })}
                    {institutions.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>{t.noInstitutions}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h3>{selected.name_en}</h3>
              <button className="close-btn" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="card-body">
              {selected.name_zh && <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{selected.name_zh}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="detail-item">
                  <label>{t.region}</label>
                  <div className="value">{titleCase(selected.region || 'asia')}</div>
                </div>
                <div className="detail-item">
                  <label>{t.typeLabel}</label>
                  <div className="value">{typeLabels[selected.institution_type] || selected.institution_type}</div>
                </div>
                <div className="detail-item">
                  <label>{t.ubi}</label>
                  <div className="value">{selected.ubi || '—'}</div>
                </div>
                <div className="detail-item">
                  <label>{t.sectors}</label>
                  <div className="value">
                    {selected.sectors?.map(s => <span key={s} className="badge badge-blue" style={{ marginRight: 4 }}>{titleCase(s)}</span>)}
                  </div>
                </div>
                <div className="detail-item">
                  <label>{t.regulators}</label>
                  <div className="value">
                    {selected.regulators?.map(r => <span key={r} className="badge badge-purple" style={{ marginRight: 4 }}>{r}</span>)}
                  </div>
                </div>
                <div className="detail-item">
                  <label>{t.licenceNumbers}</label>
                  <div className="value" style={{ fontSize: 13 }}>
                    {selected.licence_numbers && Object.entries(selected.licence_numbers).map(([k, v]) => (
                      <div key={k}>{k}: {v}</div>
                    ))}
                  </div>
                </div>
                <div className="detail-item">
                  <label>{t.contactEmail}</label>
                  <div className="value">{selected.contact_email || '—'}</div>
                </div>
                <div className="detail-item">
                  <label>{t.users}</label>
                  <div className="value">{selected.user_count || 0} {t.registered}</div>
                </div>
                <div className="detail-item">
                  <label>{t.onboarded}</label>
                  <div className="value">{selected.onboarded_date ? new Date(selected.onboarded_date).toLocaleDateString() : '—'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
