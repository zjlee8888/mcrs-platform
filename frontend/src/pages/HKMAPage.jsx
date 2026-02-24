import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

const ALL_REGULATORS = ['HKMA', 'SFC', 'IA', 'MPFA', 'MAS', 'PBOC', 'CSRC', 'FSA_JP', 'FSS_KR', 'FSC_TW', 'RBI', 'FCA', 'PRA', 'BAFIN', 'AMF_FR', 'CONSOB', 'CNMV', 'AFM_NL', 'FINMA', 'SEC', 'FINRA', 'IIROC', 'CVM_BR', 'CNBV_MX'];
const REGULATOR_LABELS = {
  HKMA: 'HKMA (Hong Kong)',
  SFC: 'SFC (Hong Kong)',
  IA: 'IA (Hong Kong)',
  MPFA: 'MPFA (Hong Kong)',
  MAS: 'MAS (Singapore)',
  PBOC: 'PBOC (China)',
  CSRC: 'CSRC (China)',
  FSA_JP: 'FSA (Japan)',
  FSS_KR: 'FSS (Korea)',
  FSC_TW: 'FSC (Taiwan)',
  RBI: 'RBI (India)',
  FCA: 'FCA (United Kingdom)',
  PRA: 'PRA (United Kingdom)',
  BAFIN: 'BaFin (Germany)',
  AMF_FR: 'AMF (France)',
  CONSOB: 'CONSOB (Italy)',
  CNMV: 'CNMV (Spain)',
  AFM_NL: 'AFM (Netherlands)',
  FINMA: 'FINMA (Switzerland)',
  SEC: 'SEC (United States)',
  FINRA: 'FINRA (United States)',
  IIROC: 'IIROC (Canada)',
  CVM_BR: 'CVM (Brazil)',
  CNBV_MX: 'CNBV (Mexico)',
};

const COUNTRIES = [
  { code: 'HK', label: 'Hong Kong' },
  { code: 'CN', label: 'China' },
  { code: 'SG', label: 'Singapore' },
  { code: 'JP', label: 'Japan' },
  { code: 'KR', label: 'South Korea' },
  { code: 'TW', label: 'Taiwan' },
  { code: 'IN', label: 'India' },
  { code: 'UK', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'IT', label: 'Italy' },
  { code: 'ES', label: 'Spain' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'BR', label: 'Brazil' },
  { code: 'MX', label: 'Mexico' },
];

const regulatorsByCountry = {
  HK: ['HKMA', 'SFC', 'IA', 'MPFA'],
  CN: ['PBOC', 'CSRC'],
  SG: ['MAS'],
  JP: ['FSA_JP'],
  KR: ['FSS_KR'],
  TW: ['FSC_TW'],
  IN: ['RBI'],
  UK: ['FCA', 'PRA'],
  DE: ['BAFIN'],
  FR: ['AMF_FR'],
  IT: ['CONSOB'],
  ES: ['CNMV'],
  NL: ['AFM_NL'],
  CH: ['FINMA'],
  US: ['SEC', 'FINRA'],
  CA: ['IIROC'],
  BR: ['CVM_BR'],
  MX: ['CNBV_MX'],
};

function createAssociationRow() {
  return { country: 'HK', regulator: 'ALL', surname: '', first_name: '', license_number: '' };
}

export default function HKMAPage({ user }) {
  const [activeCategory, setActiveCategory] = useState('securities_staff');
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');

  const [regCountry, setRegCountry] = useState('HK');
  const [selectedRegulators, setSelectedRegulators] = useState(ALL_REGULATORS);

  const [surname, setSurname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [watchlistResults, setWatchlistResults] = useState([]);
  const [watchlistSearched, setWatchlistSearched] = useState(false);

  const [corporateCountry, setCorporateCountry] = useState('HK');
  const [companyName, setCompanyName] = useState('');
  const [personName, setPersonName] = useState('');
  const [corporateRole, setCorporateRole] = useState('both');
  const [corporateResults, setCorporateResults] = useState([]);
  const [corporateSearched, setCorporateSearched] = useState(false);

  const [associationRows, setAssociationRows] = useState([createAssociationRow()]);
  const [associationResults, setAssociationResults] = useState([]);
  const [associationSearched, setAssociationSearched] = useState(false);

  const [misconductSurname, setMisconductSurname] = useState('');
  const [misconductFirstName, setMisconductFirstName] = useState('');
  const [misconductCountry, setMisconductCountry] = useState('HK');
  const [misconductRegulators, setMisconductRegulators] = useState(ALL_REGULATORS);
  const [misconductResults, setMisconductResults] = useState([]);
  const [misconductSearched, setMisconductSearched] = useState(false);

  const [legalQuery, setLegalQuery] = useState('');
  const [legalCountry, setLegalCountry] = useState('HK');
  const [legalRegulators, setLegalRegulators] = useState(ALL_REGULATORS);
  const [legalResults, setLegalResults] = useState([]);
  const [legalSearched, setLegalSearched] = useState(false);
  const demoBootstrapRef = useRef(false);

  const isJamesDemoAccount = Boolean(
    user?.is_demo_account
    || String(user?.email || '').toLowerCase() === 'compliance@hsbc.com.hk'
    || String(user?.name_en || '').toLowerCase() === 'james lee'
  );

  const toggleRegulator = (value, selected, setter) => {
    setter(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  const runWatchlistSearch = async () => {
    if (!surname.trim() || !firstName.trim()) return;
    setLoading((prev) => ({ ...prev, secstaff: true }));
    setError('');
    try {
      const data = await api.financialWatchlistSearch({
        surname: surname.trim(),
        given_name: firstName.trim(),
        regulators: selectedRegulators,
        country: regCountry,
      });
      setWatchlistResults(data?.result?.records || []);
      setWatchlistSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, secstaff: false }));
    }
  };

  const runCorporateSearch = async () => {
    if (!companyName.trim() && !personName.trim()) return;
    setLoading((prev) => ({ ...prev, corporate: true }));
    setError('');
    try {
      const data = await api.corporateDirectorShareholderSearch(corporateCountry, {
        company_name: companyName.trim(),
        name: personName.trim(),
        role: corporateRole,
      });
      setCorporateResults(data?.result?.records || []);
      setCorporateSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, corporate: false }));
    }
  };

  const runAssociationBatch = async () => {
    const validRows = associationRows.filter((row) => row.surname.trim() && row.first_name.trim());
    if (validRows.length === 0) return;

    setLoading((prev) => ({ ...prev, association: true }));
    setError('');
    try {
      const responses = await Promise.allSettled(
        validRows.map((row) => api.licenseeAssociationSearch({
          surname: row.surname.trim(),
          first_name: row.first_name.trim(),
          license_number: row.license_number.trim(),
          country: row.country,
          regulator: row.regulator === 'ALL' ? '' : row.regulator,
        }))
      );

      const merged = [];
      responses.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const records = result.value?.result?.records || [];
          records.forEach((item) => {
            merged.push({ ...item, batch_row: index + 1, batch_query: `${validRows[index].surname || '—'} ${validRows[index].first_name || '—'} / ${validRows[index].license_number || '—'}` });
          });
        }
      });

      setAssociationResults(merged);
      setAssociationSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, association: false }));
    }
  };

  const runMisconductSearch = async () => {
    if (!misconductSurname.trim() || !misconductFirstName.trim()) return;
    setLoading((prev) => ({ ...prev, misconduct: true }));
    setError('');
    try {
      const data = await api.financialMisconductSearch({
        surname: misconductSurname.trim(),
        given_name: misconductFirstName.trim(),
        country: misconductCountry,
        regulators: misconductRegulators,
      });
      setMisconductResults(data?.result?.records || []);
      setMisconductSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, misconduct: false }));
    }
  };

  const runLegalSearch = async () => {
    if (!legalQuery.trim()) return;
    setLoading((prev) => ({ ...prev, legal: true }));
    setError('');
    try {
      const data = await api.legalSearch({
        query: legalQuery.trim(),
        country: legalCountry,
        regulators: legalRegulators,
      });
      setLegalResults(data?.result?.records || []);
      setLegalSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, legal: false }));
    }
  };

  const runAllIntegrations = async () => {
    setLoading((prev) => ({ ...prev, run_all: true }));
    try {
      await Promise.allSettled([
        surname.trim() && firstName.trim() ? runWatchlistSearch() : Promise.resolve(),
        (companyName.trim() || personName.trim()) ? runCorporateSearch() : Promise.resolve(),
        associationRows.some((r) => r.surname.trim() && r.first_name.trim()) ? runAssociationBatch() : Promise.resolve(),
        misconductSurname.trim() && misconductFirstName.trim() ? runMisconductSearch() : Promise.resolve(),
        legalQuery.trim() ? runLegalSearch() : Promise.resolve(),
      ]);
    } finally {
      setLoading((prev) => ({ ...prev, run_all: false }));
    }
  };

  useEffect(() => {
    if (!isJamesDemoAccount || demoBootstrapRef.current) return;
    demoBootstrapRef.current = true;

    setSurname('Lee');
    setFirstName('James');
    setRegCountry('HK');
    setSelectedRegulators(['HKMA', 'SFC']);

    setCorporateCountry('HK');
    setCompanyName('Harbour Peak');
    setPersonName('James Lee');
    setCorporateRole('both');

    setAssociationRows([{ country: 'HK', regulator: 'ALL', surname: 'Lee', first_name: 'James', license_number: '' }]);

    setMisconductSurname('Lee');
    setMisconductFirstName('James');
    setMisconductCountry('HK');
    setMisconductRegulators(['SFC']);

    setLegalQuery('Lee');
    setLegalCountry('HK');
    setLegalRegulators(['SFC']);

    setLoading((prev) => ({ ...prev, run_all: true }));
    setError('');

    Promise.allSettled([
      api.financialWatchlistSearch({
        surname: 'Lee',
        given_name: 'James',
        regulators: ['HKMA', 'SFC'],
        country: 'HK',
      }),
      api.corporateDirectorShareholderSearch('HK', {
        company_name: 'Harbour Peak',
        name: 'James Lee',
        role: 'both',
      }),
      api.licenseeAssociationSearch({
        surname: 'Lee',
        first_name: 'James',
        country: 'HK',
        regulator: '',
      }),
      api.financialMisconductSearch({
        surname: 'Lee',
        given_name: 'James',
        country: 'HK',
        regulators: ['SFC'],
      }),
      api.legalSearch({
        query: 'Lee',
        country: 'HK',
        regulators: ['SFC'],
      }),
    ]).then(([watchRes, corporateRes, associationRes, misconductRes, legalRes]) => {
      if (watchRes.status === 'fulfilled') {
        setWatchlistResults(watchRes.value?.result?.records || []);
        setWatchlistSearched(true);
      }
      if (corporateRes.status === 'fulfilled') {
        setCorporateResults(corporateRes.value?.result?.records || []);
        setCorporateSearched(true);
      }
      if (associationRes.status === 'fulfilled') {
        const records = associationRes.value?.result?.records || [];
        setAssociationResults(records.map((item) => ({
          ...item,
          batch_row: 1,
          batch_query: 'Lee James / —',
        })));
        setAssociationSearched(true);
      }
      if (misconductRes.status === 'fulfilled') {
        setMisconductResults(misconductRes.value?.result?.records || []);
        setMisconductSearched(true);
      }
      if (legalRes.status === 'fulfilled') {
        setLegalResults(legalRes.value?.result?.records || []);
        setLegalSearched(true);
      }
    }).finally(() => {
      setLoading((prev) => ({ ...prev, run_all: false }));
    });
  }, [isJamesDemoAccount]);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Integrations</h2>
          <p>Category-based integrations with batch processing and global watchlists.</p>
        </div>
        <button className="btn btn-primary" onClick={runAllIntegrations} disabled={loading.run_all}>
          {loading.run_all ? 'Running...' : 'Run All'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
        <div className="card">
          <div className="card-header">
            <h3>Integration Categories</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className={`btn integration-category-btn ${activeCategory === 'securities_staff' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveCategory('securities_staff')}>Register of Licensees Search</button>
            <button className={`btn integration-category-btn ${activeCategory === 'corporate' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveCategory('corporate')}>Corporate Registry</button>
            <button className={`btn integration-category-btn ${activeCategory === 'association' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveCategory('association')}>Licensee-to-Company Association</button>
            <button className={`btn integration-category-btn ${activeCategory === 'misconduct' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveCategory('misconduct')}>Financial Misconduct Search</button>
            <button className={`btn integration-category-btn ${activeCategory === 'legal' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveCategory('legal')}>Legal Search</button>
          </div>
        </div>

        <div>
          {activeCategory === 'securities_staff' && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><h3>Register of Licensees Search</h3></div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <select className="form-control" value={regCountry} onChange={(e) => setRegCountry(e.target.value)} style={{ maxWidth: 220 }}>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <input className="form-control" placeholder="Enter surname..." value={surname} onChange={(e) => setSurname(e.target.value)} style={{ minWidth: 200, flex: 1 }} />
                  <input className="form-control" placeholder="Enter first name..." value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ minWidth: 200, flex: 1 }} />
                  <button className="btn btn-primary" onClick={runWatchlistSearch} disabled={loading.secstaff || !surname.trim() || !firstName.trim()}>{loading.secstaff ? 'Searching...' : 'Search'}</button>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  {ALL_REGULATORS.map((reg) => (
                    <label key={reg} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <input type="checkbox" checked={selectedRegulators.includes(reg)} onChange={() => toggleRegulator(reg, selectedRegulators, setSelectedRegulators)} />
                      {REGULATOR_LABELS[reg] || reg}
                    </label>
                  ))}
                </div>
                {watchlistResults.length > 0 ? (
                  <div className="table-container"><table><thead><tr><th>Name</th><th>Regulator</th><th>Country</th></tr></thead><tbody>
                    {watchlistResults.map((item, i) => (
                      <tr key={`${item.full_name}-${item.regulator}-${i}`}><td>{item.full_name}</td><td>{item.regulator}</td><td>{item.country}</td></tr>
                    ))}
                  </tbody></table></div>
                ) : watchlistSearched ? <div className="empty-state"><p>No register results found.</p></div> : null}
              </div>
            </div>
          )}

          {activeCategory === 'corporate' && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><h3>Corporate Registry: Director / Shareholder Search</h3></div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <select className="form-control" value={corporateCountry} onChange={(e) => setCorporateCountry(e.target.value)} style={{ maxWidth: 220 }}>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <select className="form-control" value={corporateRole} onChange={(e) => setCorporateRole(e.target.value)} style={{ maxWidth: 220 }}>
                    <option value="both">Director + Shareholder</option>
                    <option value="director">Director Only</option>
                    <option value="shareholder">Shareholder Only</option>
                  </select>
                  <input className="form-control" placeholder="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={{ minWidth: 220, flex: 1 }} />
                  <input className="form-control" placeholder="Director or shareholder name" value={personName} onChange={(e) => setPersonName(e.target.value)} style={{ minWidth: 220, flex: 1 }} />
                  <button className="btn btn-primary" onClick={runCorporateSearch} disabled={loading.corporate || (!companyName.trim() && !personName.trim())}>{loading.corporate ? 'Searching...' : 'Search'}</button>
                </div>
                {corporateResults.length > 0 ? (
                  <div className="table-container"><table><thead><tr><th>Country</th><th>Company</th><th>Person</th><th>Role</th><th>Identifier</th><th>Status</th></tr></thead><tbody>
                    {corporateResults.map((item, i) => <tr key={`${item.company_name}-${item.person_name}-${i}`}><td>{item.country}</td><td>{item.company_name}</td><td>{item.person_name}</td><td>{item.role}</td><td>{item.identifier || '—'}</td><td>{item.status}</td></tr>)}
                  </tbody></table></div>
                ) : corporateSearched ? <div className="empty-state"><p>No director/shareholder records found.</p></div> : null}
              </div>
            </div>
          )}

          {activeCategory === 'association' && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><h3>Licensee-to-Company Association Search (Batch)</h3></div>
              <div className="card-body">
                {associationRows.map((row, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '160px 210px 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                    <select className="form-control" value={row.country} onChange={(e) => setAssociationRows((prev) => prev.map((item, i) => i === index ? { ...item, country: e.target.value, regulator: 'ALL' } : item))}>
                      {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                    <select className="form-control" value={row.regulator} onChange={(e) => setAssociationRows((prev) => prev.map((item, i) => i === index ? { ...item, regulator: e.target.value } : item))}>
                      <option value="ALL">All Regulators</option>
                      {(regulatorsByCountry[row.country] || []).map((reg) => <option key={reg} value={reg}>{REGULATOR_LABELS[reg] || reg}</option>)}
                    </select>
                    <input className="form-control" placeholder="Surname" value={row.surname} onChange={(e) => setAssociationRows((prev) => prev.map((item, i) => i === index ? { ...item, surname: e.target.value } : item))} />
                    <input className="form-control" placeholder="First name" value={row.first_name} onChange={(e) => setAssociationRows((prev) => prev.map((item, i) => i === index ? { ...item, first_name: e.target.value } : item))} />
                    <input className="form-control" placeholder="License number (optional)" value={row.license_number} onChange={(e) => setAssociationRows((prev) => prev.map((item, i) => i === index ? { ...item, license_number: e.target.value } : item))} />
                    <button className="btn btn-outline" onClick={() => setAssociationRows((prev) => prev.length === 1 ? prev : prev.filter((_, i) => i !== index))}>Remove</button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 12 }}>
                  <button className="btn btn-outline" onClick={() => setAssociationRows((prev) => [...prev, createAssociationRow()])}>+ Add Row</button>
                  <button className="btn btn-primary" onClick={runAssociationBatch} disabled={loading.association}>{loading.association ? 'Running Batch...' : 'Run Batch'}</button>
                </div>
                {associationResults.length > 0 ? (
                  <div className="table-container"><table><thead><tr><th>Batch Row</th><th>Query</th><th>Licensee</th><th>Associated Company</th><th>License Number</th><th>Regulator</th><th>Country</th><th>Status</th></tr></thead><tbody>
                    {associationResults.map((item, i) => (
                      <tr key={`${item.license_number || item.full_name}-${i}`}><td>{item.batch_row}</td><td>{item.batch_query}</td><td>{item.full_name || `${item.surname || ''} ${item.first_name || ''}`.trim()}</td><td>{item.associated_company || '—'}</td><td>{item.license_number || '—'}</td><td>{item.regulator}</td><td>{item.country}</td><td>{item.status}</td></tr>
                    ))}
                  </tbody></table></div>
                ) : associationSearched ? <div className="empty-state"><p>No association records found for batch input.</p></div> : null}
              </div>
            </div>
          )}

          {activeCategory === 'misconduct' && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><h3>Financial Misconduct Search</h3></div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <select className="form-control" value={misconductCountry} onChange={(e) => setMisconductCountry(e.target.value)} style={{ maxWidth: 220 }}>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <input className="form-control" placeholder="Enter surname..." value={misconductSurname} onChange={(e) => setMisconductSurname(e.target.value)} style={{ minWidth: 220, flex: 1 }} />
                  <input className="form-control" placeholder="Enter first name..." value={misconductFirstName} onChange={(e) => setMisconductFirstName(e.target.value)} style={{ minWidth: 220, flex: 1 }} />
                  <button className="btn btn-primary" onClick={runMisconductSearch} disabled={loading.misconduct || !misconductSurname.trim() || !misconductFirstName.trim()}>{loading.misconduct ? 'Searching...' : 'Search'}</button>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  {ALL_REGULATORS.map((reg) => (
                    <label key={reg} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <input type="checkbox" checked={misconductRegulators.includes(reg)} onChange={() => toggleRegulator(reg, misconductRegulators, setMisconductRegulators)} />
                      {REGULATOR_LABELS[reg] || reg}
                    </label>
                  ))}
                </div>
                {misconductResults.length > 0 ? (
                  <div className="table-container"><table><thead><tr><th>Name</th><th>Regulator</th><th>Country</th><th>Case Ref</th><th>Type</th><th>Status</th><th>Summary</th></tr></thead><tbody>
                    {misconductResults.map((item) => <tr key={item.case_ref}><td>{item.full_name}</td><td>{item.regulator}</td><td>{item.country}</td><td>{item.case_ref}</td><td>{item.misconduct_type}</td><td>{item.status}</td><td>{item.summary}</td></tr>)}
                  </tbody></table></div>
                ) : misconductSearched ? <div className="empty-state"><p>No financial misconduct results found.</p></div> : null}
              </div>
            </div>
          )}

          {activeCategory === 'legal' && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><h3>Legal Search</h3></div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <select className="form-control" value={legalCountry} onChange={(e) => setLegalCountry(e.target.value)} style={{ maxWidth: 220 }}>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <input className="form-control" placeholder="Case / party / court keyword" value={legalQuery} onChange={(e) => setLegalQuery(e.target.value)} style={{ minWidth: 260, flex: 1 }} />
                  <button className="btn btn-primary" onClick={runLegalSearch} disabled={loading.legal || !legalQuery.trim()}>{loading.legal ? 'Searching...' : 'Search'}</button>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  {ALL_REGULATORS.map((reg) => (
                    <label key={reg} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <input type="checkbox" checked={legalRegulators.includes(reg)} onChange={() => toggleRegulator(reg, legalRegulators, setLegalRegulators)} />
                      {REGULATOR_LABELS[reg] || reg}
                    </label>
                  ))}
                </div>
                {legalResults.length > 0 ? (
                  <div className="table-container"><table><thead><tr><th>Case ID</th><th>Case Name</th><th>Regulator</th><th>Country</th><th>Court</th><th>Status</th></tr></thead><tbody>
                    {legalResults.map((item) => <tr key={item.case_id}><td>{item.case_id}</td><td>{item.case_name}</td><td>{item.regulator}</td><td>{item.country}</td><td>{item.court}</td><td>{item.status}</td></tr>)}
                  </tbody></table></div>
                ) : legalSearched ? <div className="empty-state"><p>No legal search results found.</p></div> : null}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3>Data Source Integration Status</h3></div>
        <div className="card-body" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr><th>Data Source</th><th>Category</th><th>Protocol</th><th>Status</th><th>Auth</th></tr>
            </thead>
            <tbody>
              <tr><td style={{ fontWeight: 500 }}>Register of Licensees Search</td><td><span className="badge badge-blue">Register of Licensees</span></td><td>REST API (Live HKMA for HK)</td><td><span className="badge badge-green">Live HK</span></td><td>HKMA Open API + Internal Fallback</td></tr>
              <tr><td style={{ fontWeight: 500 }}>Corporate Registry Director/Shareholder Search</td><td><span className="badge badge-blue">Corporate Registry</span></td><td>REST API (Dummy)</td><td><span className="badge badge-green">Mocked</span></td><td>Internal Dummy API</td></tr>
              <tr><td style={{ fontWeight: 500 }}>Licensee-to-Company Association (Batch)</td><td><span className="badge badge-blue">Licensee Association</span></td><td>REST API (Dummy)</td><td><span className="badge badge-green">Mocked</span></td><td>Internal Dummy API</td></tr>
              <tr><td style={{ fontWeight: 500 }}>Financial Misconduct Search</td><td><span className="badge badge-blue">Financial Misconduct</span></td><td>REST API (Dummy)</td><td><span className="badge badge-green">Mocked</span></td><td>Internal Dummy API</td></tr>
              <tr><td style={{ fontWeight: 500 }}>Legal Search</td><td><span className="badge badge-blue">Legal</span></td><td>REST API (Dummy)</td><td><span className="badge badge-green">Mocked</span></td><td>Internal Dummy API</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
