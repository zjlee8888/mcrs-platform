import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const REQUEST_SECTOR_OPTIONS = [
  { value: 'banking', labelKey: 'sectorBanking' },
  { value: 'securities', labelKey: 'sectorSecurities' },
  { value: 'insurance', labelKey: 'sectorInsurance' },
  { value: 'mpf', labelKey: 'sectorMpf' },
  { value: 'cross_sector', labelKey: 'sectorCrossSector' },
];

const REGULATOR_REGION_MAP = {
  HKMA: 'asia',
  SFC: 'asia',
  IA: 'asia',
  MPFA: 'asia',
  MAS: 'asia',
  PBOC: 'asia',
  CSRC: 'asia',
  FCA: 'europe',
  PRA: 'europe',
  BAFIN: 'europe',
  AMF_FR: 'europe',
  CONSOB: 'europe',
  CNMV: 'europe',
  AFM_NL: 'europe',
  FINMA: 'europe',
  SEC: 'north_america',
  FINRA: 'north_america',
  IIROC: 'north_america',
  CVM_BR: 'latin_america',
  CNBV_MX: 'latin_america',
  DFSA: 'middle_east',
  SAMA: 'middle_east',
  FSRA_ADGM: 'middle_east',
  ASIC: 'oceania',
  APRA: 'oceania',
  FSCA_ZA: 'africa',
  CBN_NG: 'africa',
};

function institutionRegions(regulators = []) {
  const regions = new Set();
  regulators.forEach((reg) => {
    const mapped = REGULATOR_REGION_MAP[String(reg || '').toUpperCase()];
    if (mapped) regions.add(mapped);
  });
  return Array.from(regions);
}

function titleCase(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function NewRequestPage({ user, lang = 'en' }) {
  const I18N = {
    en: {
      back: 'Back', title: 'New Reference Request', subtitle: 'Initiate an MRC reference check for a prospective employee', requestDetails: 'Request Details', individual: 'Individual (Prospective Employee)', searchIndividuals: 'Search individuals...', selectIndividual: 'Select individual...', recruitingInst: 'Recruiting Institution', providingInst: 'Reference-Providing Institution (Previous Employer)', selectInstitution: 'Select institution...', requestSector: 'Request Sector', notes: 'Notes (Optional)', additional: 'Additional context...', create: 'Create Reference Request', creating: 'Creating...', process: 'MRC Process Overview', categories: 'Conduct Information Categories', addNewIndividual: 'Add New Individual', cancel: 'Cancel', addIndividual: 'Add Individual', new: '+ New', loading: 'Loading...', noEmail: 'no email', validationMsg: 'Please select an individual and a reference-providing institution', selectRecruitingInst: 'Select recruiting institution...', validationRecruitingMsg: 'Please select a recruiting institution',
      institutionRegion: 'Region', institutionIndustry: 'Industry', allRegions: 'All Regions', allIndustries: 'All Industries',
      regionAsia: 'Asia', regionEurope: 'Europe', regionNorthAmerica: 'North America', regionLatinAmerica: 'Latin America', regionMiddleEast: 'Middle East', regionAfrica: 'Africa', regionOceania: 'Oceania',
      sectorBanking: 'Banking', sectorSecurities: 'Securities', sectorInsurance: 'Insurance', sectorMpf: 'MPF', sectorCrossSector: 'Cross-Sector',
      step1: 'Create Request — Identify the individual and their previous employer', step2: 'Obtain Consent — Secure written consent from the individual', step3: 'Send Request — Request is routed to the providing institution', step4: 'Await Response — 30-day SLA for the providing institution to respond', step5: 'Review Response — Assess any conduct information received', step6: 'Close — Complete the reference check',
      cat1: 'Breach of legal or regulatory requirements', cat2: 'Incidents casting doubt on honesty & integrity', cat3: 'Misconduct reports filed with regulators', cat4: 'Internal or external disciplinary actions', cat5: 'Ongoing internal investigations', cat6: 'Additional relevant information',
      lookback: 'Lookback period: 7 years from request date', surname: 'Surname (English)', given: 'Given Name (English)', chineseName: 'Chinese Name', email: 'Email',
      integrationsTitle: 'Integration Screening', runIntegrationSearch: 'Run Integration Search', rerunIntegrationSearch: 'Re-run Integration Search', integrationHint: 'Runs regulator and litigation checks and stores the snapshot with this request.',
      integrationReady: 'Integration snapshot ready', integrationNotRun: 'Run integration screening before submit (recommended).', watchlistHits: 'Watchlist Hits', licenseHits: 'License Matches', issueHits: 'Disciplinary Issues', litigationHits: 'Litigation Cases',
      monitoringTitle: 'Ongoing Monitoring', enableMonitoring: 'Enable periodic review', reviewFrequency: 'Review Frequency', nextReviewDate: 'Next Review Date', monitoringNotes: 'Monitoring Notes (Optional)',
      monthly: 'Monthly', quarterly: 'Quarterly', semiAnnual: 'Semi-Annual',
      integrationFailed: 'Integration screening failed. Please try again.'
    },
    tc: {
      back: '返回', title: '新增背調請求', subtitle: '為候選員工發起 MRC 背調', requestDetails: '請求詳情', individual: '個人（候選員工）', searchIndividuals: '搜尋個人...', selectIndividual: '選擇個人...', recruitingInst: '招聘機構', providingInst: '提供背調機構（前僱主）', selectInstitution: '選擇機構...', requestSector: '請求行業', notes: '備註（可選）', additional: '補充說明...', create: '建立背調請求', creating: '建立中...', process: 'MRC 流程概覽', categories: '操守資訊類別', addNewIndividual: '新增個人', cancel: '取消', addIndividual: '新增個人', new: '+ 新增', loading: '載入中...', noEmail: '無電郵', validationMsg: '請選擇個人及提供背調機構', selectRecruitingInst: '選擇招聘機構...', validationRecruitingMsg: '請先選擇招聘機構',
      institutionRegion: '地區', institutionIndustry: '產業', allRegions: '所有地區', allIndustries: '所有產業',
      regionAsia: '亞洲', regionEurope: '歐洲', regionNorthAmerica: '北美', regionLatinAmerica: '拉丁美洲', regionMiddleEast: '中東', regionAfrica: '非洲', regionOceania: '大洋洲',
      sectorBanking: '銀行', sectorSecurities: '證券', sectorInsurance: '保險', sectorMpf: '強積金', sectorCrossSector: '跨行業',
      step1: '建立請求 — 識別個人及其前僱主', step2: '取得同意 — 取得個人的書面同意', step3: '發送請求 — 請求將發送至提供機構', step4: '等待回覆 — 提供機構須於 30 天內回覆', step5: '審閱回覆 — 評估收到的操守資訊', step6: '完成 — 完成背調程序',
      cat1: '違反法律或監管要求', cat2: '影響誠信的事件', cat3: '向監管機構提交的不當行為報告', cat4: '內部或外部紀律處分', cat5: '進行中的內部調查', cat6: '其他相關資訊',
      lookback: '回溯期：請求日期起 7 年', surname: '姓氏（英文）', given: '名字（英文）', chineseName: '中文姓名', email: '電郵',
      integrationsTitle: '整合篩查', runIntegrationSearch: '執行整合搜尋', rerunIntegrationSearch: '重新執行整合搜尋', integrationHint: '執行監管及訴訟檢查，並把快照保存於此請求。',
      integrationReady: '整合快照已準備', integrationNotRun: '建議提交前先執行整合篩查。', watchlistHits: '觀察名單命中', licenseHits: '牌照匹配', issueHits: '紀律問題', litigationHits: '訴訟案件',
      monitoringTitle: '持續監察', enableMonitoring: '啟用定期審查', reviewFrequency: '審查頻率', nextReviewDate: '下次審查日期', monitoringNotes: '監察備註（可選）',
      monthly: '每月', quarterly: '每季', semiAnnual: '每半年',
      integrationFailed: '整合篩查失敗，請稍後再試。'
    },
    zh: {
      back: '返回', title: '新增背调请求', subtitle: '为候选员工发起 MRC 背调', requestDetails: '请求详情', individual: '个人（候选员工）', searchIndividuals: '搜索个人...', selectIndividual: '选择个人...', recruitingInst: '招聘机构', providingInst: '提供背调机构（前雇主）', selectInstitution: '选择机构...', requestSector: '请求行业', notes: '备注（可选）', additional: '补充说明...', create: '创建背调请求', creating: '创建中...', process: 'MRC 流程概览', categories: '操守信息类别', addNewIndividual: '新增个人', cancel: '取消', addIndividual: '新增个人', new: '+ 新增', loading: '加载中...', noEmail: '无邮箱', validationMsg: '请选择个人及提供背调机构', selectRecruitingInst: '选择招聘机构...', validationRecruitingMsg: '请先选择招聘机构',
      institutionRegion: '地区', institutionIndustry: '产业', allRegions: '所有地区', allIndustries: '所有产业',
      regionAsia: '亚洲', regionEurope: '欧洲', regionNorthAmerica: '北美', regionLatinAmerica: '拉丁美洲', regionMiddleEast: '中东', regionAfrica: '非洲', regionOceania: '大洋洲',
      sectorBanking: '银行', sectorSecurities: '证券', sectorInsurance: '保险', sectorMpf: '公积金', sectorCrossSector: '跨行业',
      step1: '创建请求 — 识别个人及其前雇主', step2: '取得同意 — 取得个人的书面同意', step3: '发送请求 — 请求将发送至提供机构', step4: '等待回复 — 提供机构须于 30 天内回复', step5: '审阅回复 — 评估收到的操守信息', step6: '完成 — 完成背调流程',
      cat1: '违反法律或监管要求', cat2: '影响诚信的事件', cat3: '向监管机构提交的不当行为报告', cat4: '内部或外部纪律处分', cat5: '进行中的内部调查', cat6: '其他相关信息',
      lookback: '回溯期：请求日期起 7 年', surname: '姓氏（英文）', given: '名字（英文）', chineseName: '中文姓名', email: '邮箱',
      integrationsTitle: '整合筛查', runIntegrationSearch: '执行整合搜索', rerunIntegrationSearch: '重新执行整合搜索', integrationHint: '执行监管及诉讼检查，并将快照保存至该请求。',
      integrationReady: '整合快照已准备', integrationNotRun: '建议提交前先执行整合筛查。', watchlistHits: '观察名单命中', licenseHits: '牌照匹配', issueHits: '纪律问题', litigationHits: '诉讼案件',
      monitoringTitle: '持续监控', enableMonitoring: '启用定期审查', reviewFrequency: '审查频率', nextReviewDate: '下次审查日期', monitoringNotes: '监控备注（可选）',
      monthly: '每月', quarterly: '每季', semiAnnual: '每半年',
      integrationFailed: '整合筛查失败，请稍后重试。'
    },
  };
  const t = I18N[lang] || I18N.en;
  const navigate = useNavigate();
  const [individuals, setIndividuals] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    individual_id: '',
    recruiting_institution_id: user.institution_id || '',
    reference_providing_institution_id: '',
    request_sector: 'banking',
    notes: '',
  });
  const [search, setSearch] = useState('');
  const [providingRegionFilter, setProvidingRegionFilter] = useState('');
  const [providingIndustryFilter, setProvidingIndustryFilter] = useState('');
  const [showNewIndividual, setShowNewIndividual] = useState(false);
  const [newIndividual, setNewIndividual] = useState({ name_en_surname: '', name_en_given: '', name_zh: '', email: '' });
  const [integrationLoading, setIntegrationLoading] = useState(false);
  const [integrationSnapshot, setIntegrationSnapshot] = useState(null);
  const [monitoring, setMonitoring] = useState({ enabled: true, review_frequency: 'quarterly', next_review_date: '', notes: '' });

  useEffect(() => {
    Promise.all([
      api.getIndividuals({ limit: 100 }),
      api.getInstitutions(),
    ]).then(([indData, instData]) => {
      setIndividuals(indData.individuals);
      setInstitutions(instData.institutions);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setIntegrationSnapshot(null);
  }, [form.individual_id, form.reference_providing_institution_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.individual_id || !form.reference_providing_institution_id) {
      return alert(t.validationMsg);
    }
    if (!user.institution_id && !form.recruiting_institution_id) {
      return alert(t.validationRecruitingMsg);
    }
    setSubmitting(true);
    try {
      const monitoringPayload = monitoring.enabled ? {
        ...monitoring,
        scope: {
          regulators: ['HKMA', 'SFC', 'IA', 'MPFA', 'MAS', 'PBOC', 'CSRC', 'FSA_JP', 'FSS_KR', 'FSC_TW', 'RBI', 'FCA', 'PRA', 'BAFIN', 'AMF_FR', 'CONSOB', 'CNMV', 'AFM_NL', 'FINMA', 'SEC', 'FINRA', 'IIROC', 'CVM_BR', 'CNBV_MX'],
          checks: ['watchlist', 'license', 'issues', 'litigation'],
        },
      } : { enabled: false };

      const payload = {
        ...form,
        integration_snapshot: integrationSnapshot,
        monitoring: monitoringPayload,
      };
      const result = await api.createRequest(payload);
      navigate(`/requests/${result.request_id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateIndividual = async (e) => {
    e.preventDefault();
    try {
      const ind = await api.createIndividual(newIndividual);
      setIndividuals(prev => [...prev, ind]);
      setForm({ ...form, individual_id: ind.individual_id });
      setShowNewIndividual(false);
      setNewIndividual({ name_en_surname: '', name_en_given: '', name_zh: '', email: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> {t.loading}</div>;

  const filteredIndividuals = search
    ? individuals.filter(i => `${i.name_en_surname} ${i.name_en_given} ${i.name_zh || ''} ${i.email || ''}`.toLowerCase().includes(search.toLowerCase()))
    : individuals;

  const userInstitutionId = user.institution_id;
  const recruitingInstitutionId = userInstitutionId || form.recruiting_institution_id;
  const otherInstitutions = institutions.filter(i => i.institution_id !== recruitingInstitutionId);
  const filteredOtherInstitutions = otherInstitutions.filter((institution) => {
    const matchesIndustry = !providingIndustryFilter || institution.sectors?.includes(providingIndustryFilter);
    const matchesRegion = !providingRegionFilter || institutionRegions(institution.regulators || []).includes(providingRegionFilter);
    return matchesIndustry && matchesRegion;
  });
  const selectedIndividual = individuals.find((i) => i.individual_id === form.individual_id);
  const selectedInstitution = institutions.find((i) => i.institution_id === form.reference_providing_institution_id);

  const runIntegrationSearch = async () => {
    if (!selectedIndividual || !selectedInstitution) return;
    setIntegrationLoading(true);
    try {
      const surname = selectedIndividual.name_en_surname || '';
      const givenName = selectedIndividual.name_en_given || '';
      const institutionName = selectedInstitution.name_en || '';

      const [watchlistRes, licenseRes, issuesRes, litigationRes] = await Promise.allSettled([
        api.financialWatchlistSearch({ surname, given_name: givenName, regulators: ['HKMA', 'SFC', 'IA', 'MPFA', 'MAS', 'PBOC', 'CSRC', 'FSA_JP', 'FSS_KR', 'FSC_TW', 'RBI', 'FCA', 'PRA', 'BAFIN', 'AMF_FR', 'CONSOB', 'CNMV', 'AFM_NL', 'FINMA', 'SEC', 'FINRA', 'IIROC', 'CVM_BR', 'CNBV_MX'] }),
        api.licenseSearch({ name: institutionName }),
        api.licenseIssues({ name: institutionName }),
        api.civilLitigation({ name: institutionName }),
      ]);

      const watchlist = watchlistRes.status === 'fulfilled' ? watchlistRes.value.result : { total: 0, records: [] };
      const licenses = licenseRes.status === 'fulfilled' ? licenseRes.value.result : { total: 0, records: [] };
      const issues = issuesRes.status === 'fulfilled' ? issuesRes.value.result : { total: 0, records: [] };
      const litigation = litigationRes.status === 'fulfilled' ? litigationRes.value.result : { total: 0, records: [] };

      setIntegrationSnapshot({
        generated_at: new Date().toISOString(),
        inputs: {
          individual_id: selectedIndividual.individual_id,
          individual_surname: surname,
          individual_given_name: givenName,
          institution_id: selectedInstitution.institution_id,
          institution_name: institutionName,
        },
        summary: {
          watchlist_hits: watchlist.total || 0,
          license_matches: licenses.total || 0,
          issue_hits: issues.total || 0,
          litigation_hits: litigation.total || 0,
        },
        records: {
          watchlist: watchlist.records || [],
          licenses: licenses.records || [],
          issues: issues.records || [],
          litigation: litigation.records || [],
        },
      });
    } catch (_err) {
      alert(t.integrationFailed);
    } finally {
      setIntegrationLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/requests')}>← {t.back}</button>
        <div>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>{t.requestDetails}</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="card-body">
              {/* Individual Selection */}
              <div className="form-group">
                <label>{t.individual}</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t.searchIndividuals}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowNewIndividual(true)}>{t.new}</button>
                </div>
                <select className="form-control" value={form.individual_id} onChange={(e) => setForm({ ...form, individual_id: e.target.value })} required>
                  <option value="">{t.selectIndividual}</option>
                  {filteredIndividuals.map(i => (
                    <option key={i.individual_id} value={i.individual_id}>
                      {i.name_en_surname}, {i.name_en_given} {i.name_zh ? `(${i.name_zh})` : ''} — {i.email || t.noEmail}
                    </option>
                  ))}
                </select>
              </div>

              {/* Providing Institution */}
              {!userInstitutionId && (
                <div className="form-group">
                  <label>{t.recruitingInst}</label>
                  <select className="form-control" value={form.recruiting_institution_id} onChange={(e) => setForm({ ...form, recruiting_institution_id: e.target.value, reference_providing_institution_id: '' })} required>
                    <option value="">{t.selectRecruitingInst}</option>
                    {institutions.map(i => (
                      <option key={i.institution_id} value={i.institution_id}>
                        {i.name_en} ({i.institution_type}) — {i.sectors?.map(titleCase).join(', ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Providing Institution */}
              <div className="form-group">
                <label>{t.providingInst}</label>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t.institutionRegion}</label>
                    <select className="form-control" value={providingRegionFilter} onChange={(e) => setProvidingRegionFilter(e.target.value)}>
                      <option value="">{t.allRegions}</option>
                      <option value="asia">{t.regionAsia}</option>
                      <option value="europe">{t.regionEurope}</option>
                      <option value="north_america">{t.regionNorthAmerica}</option>
                      <option value="latin_america">{t.regionLatinAmerica}</option>
                      <option value="middle_east">{t.regionMiddleEast}</option>
                      <option value="africa">{t.regionAfrica}</option>
                      <option value="oceania">{t.regionOceania}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t.institutionIndustry}</label>
                    <select className="form-control" value={providingIndustryFilter} onChange={(e) => setProvidingIndustryFilter(e.target.value)}>
                      <option value="">{t.allIndustries}</option>
                      <option value="banking">{t.sectorBanking}</option>
                      <option value="securities">{t.sectorSecurities}</option>
                      <option value="insurance">{t.sectorInsurance}</option>
                      <option value="mpf">{t.sectorMpf}</option>
                    </select>
                  </div>
                </div>
                <select className="form-control" value={form.reference_providing_institution_id} onChange={(e) => setForm({ ...form, reference_providing_institution_id: e.target.value })} required>
                  <option value="">{t.selectInstitution}</option>
                  {filteredOtherInstitutions.map(i => (
                    <option key={i.institution_id} value={i.institution_id}>
                      {i.name_en} ({i.institution_type}) — {i.sectors?.map(titleCase).join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector */}
              <div className="form-group">
                <label>{t.requestSector}</label>
                <select className="form-control" value={form.request_sector} onChange={(e) => setForm({ ...form, request_sector: e.target.value })}>
                  {REQUEST_SECTOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{t[option.labelKey]}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label>{t.notes}</label>
                <textarea className="form-control" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t.additional} />
              </div>

              <div className="card" style={{ border: '1px solid var(--border)', marginBottom: 16 }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>{t.integrationsTitle}</h3>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={runIntegrationSearch}
                    disabled={integrationLoading || !selectedIndividual || !selectedInstitution}
                  >
                    {integrationLoading ? t.loading : integrationSnapshot ? t.rerunIntegrationSearch : t.runIntegrationSearch}
                  </button>
                </div>
                <div className="card-body" style={{ fontSize: 13 }}>
                  <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>{t.integrationHint}</p>
                  {integrationSnapshot ? (
                    <>
                      <p style={{ color: 'var(--success)', fontWeight: 600 }}>{t.integrationReady}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                        <div>{t.watchlistHits}: <strong>{integrationSnapshot.summary.watchlist_hits}</strong></div>
                        <div>{t.licenseHits}: <strong>{integrationSnapshot.summary.license_matches}</strong></div>
                        <div>{t.issueHits}: <strong>{integrationSnapshot.summary.issue_hits}</strong></div>
                        <div>{t.litigationHits}: <strong>{integrationSnapshot.summary.litigation_hits}</strong></div>
                      </div>
                    </>
                  ) : (
                    <p style={{ marginBottom: 0, color: 'var(--text-muted)' }}>{t.integrationNotRun}</p>
                  )}
                </div>
              </div>

              <div className="card" style={{ border: '1px solid var(--border)', marginBottom: 16 }}>
                <div className="card-header"><h3 style={{ margin: 0 }}>{t.monitoringTitle}</h3></div>
                <div className="card-body" style={{ fontSize: 13 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <input
                      type="checkbox"
                      checked={monitoring.enabled}
                      onChange={(e) => setMonitoring({ ...monitoring, enabled: e.target.checked })}
                    />
                    {t.enableMonitoring}
                  </label>
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t.reviewFrequency}</label>
                      <select
                        className="form-control"
                        value={monitoring.review_frequency}
                        onChange={(e) => setMonitoring({ ...monitoring, review_frequency: e.target.value })}
                        disabled={!monitoring.enabled}
                      >
                        <option value="monthly">{t.monthly}</option>
                        <option value="quarterly">{t.quarterly}</option>
                        <option value="semi_annual">{t.semiAnnual}</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t.nextReviewDate}</label>
                      <input
                        type="date"
                        className="form-control"
                        value={monitoring.next_review_date}
                        onChange={(e) => setMonitoring({ ...monitoring, next_review_date: e.target.value })}
                        disabled={!monitoring.enabled}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>{t.monitoringNotes}</label>
                    <textarea
                      className="form-control"
                      value={monitoring.notes}
                      onChange={(e) => setMonitoring({ ...monitoring, notes: e.target.value })}
                      disabled={!monitoring.enabled}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? t.creating : t.create}
              </button>
            </div>
          </form>
        </div>

        {/* Info Panel */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><h3>{t.process}</h3></div>
            <div className="card-body" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <ol style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>{t.step1}</li>
                <li>{t.step2}</li>
                <li>{t.step3}</li>
                <li>{t.step4}</li>
                <li>{t.step5}</li>
                <li>{t.step6}</li>
              </ol>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3>{t.categories}</h3></div>
            <div className="card-body" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>{t.cat1}</li>
                <li>{t.cat2}</li>
                <li>{t.cat3}</li>
                <li>{t.cat4}</li>
                <li>{t.cat5}</li>
                <li>{t.cat6}</li>
              </ul>
              <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>{t.lookback}</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Individual Modal */}
      {showNewIndividual && (
        <div className="modal-overlay" onClick={() => setShowNewIndividual(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.addNewIndividual}</h3>
              <button className="close-btn" onClick={() => setShowNewIndividual(false)}>×</button>
            </div>
            <form onSubmit={handleCreateIndividual}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>{t.surname}</label>
                    <input type="text" className="form-control" value={newIndividual.name_en_surname} onChange={(e) => setNewIndividual({ ...newIndividual, name_en_surname: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>{t.given}</label>
                    <input type="text" className="form-control" value={newIndividual.name_en_given} onChange={(e) => setNewIndividual({ ...newIndividual, name_en_given: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t.chineseName}</label>
                    <input type="text" className="form-control" value={newIndividual.name_zh} onChange={(e) => setNewIndividual({ ...newIndividual, name_zh: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>{t.email}</label>
                    <input type="email" className="form-control" value={newIndividual.email} onChange={(e) => setNewIndividual({ ...newIndividual, email: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowNewIndividual(false)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary">{t.addIndividual}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
