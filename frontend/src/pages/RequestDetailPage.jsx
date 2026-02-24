import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { jsPDF } from 'jspdf';

const ALL_STATUSES = ['draft', 'consent_obtained', 'sent', 'acknowledged', 'in_progress', 'response_provided', 'reviewed', 'closed'];
const STATUS_FLOW = {
  draft: ['consent_obtained', 'cancelled'],
  consent_obtained: ['sent', 'cancelled'],
  sent: ['acknowledged', 'cancelled'],
  acknowledged: ['in_progress', 'cancelled'],
  in_progress: ['response_provided', 'cancelled'],
  response_provided: ['reviewed', 'cancelled'],
  reviewed: ['closed'],
  closed: [], cancelled: [],
};

const CONDUCT_CATEGORIES = [
  { value: 'legal_regulatory_breach' },
  { value: 'integrity_concern' },
  { value: 'misconduct_report' },
  { value: 'disciplinary_action' },
  { value: 'ongoing_investigation' },
  { value: 'additional_information' },
];

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

const CONDUCT_CATEGORY_LABELS = {
  en: {
    legal_regulatory_breach: 'Legal/Regulatory Breach',
    integrity_concern: 'Integrity Concern',
    misconduct_report: 'Misconduct Report',
    disciplinary_action: 'Disciplinary Action',
    ongoing_investigation: 'Ongoing Investigation',
    additional_information: 'Additional Information',
  },
  tc: {
    legal_regulatory_breach: '法律/監管違規',
    integrity_concern: '誠信疑慮',
    misconduct_report: '不當行為報告',
    disciplinary_action: '紀律處分',
    ongoing_investigation: '進行中調查',
    additional_information: '其他補充資訊',
  },
  zh: {
    legal_regulatory_breach: '法律/监管违规',
    integrity_concern: '诚信疑虑',
    misconduct_report: '不当行为报告',
    disciplinary_action: '纪律处分',
    ongoing_investigation: '进行中调查',
    additional_information: '其他补充信息',
  },
};

function titleCase(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function RequestDetailPage({ user, lang = 'en' }) {
  const I18N = {
    en: { back: 'Back', title: 'Reference Request', requestDetails: 'Request Details', sector: 'Sector', recruiting: 'Recruiting Institution', providing: 'Providing Institution', requestDate: 'Request Date', slaDeadline: 'SLA Deadline', lookback: 'Lookback Start', responseDate: 'Response Date', notes: 'Notes', individualInfo: 'Individual Information', nameEn: 'Name (English)', nameZh: 'Name (Chinese)', email: 'Email', conduct: 'Conduct Information', category: 'Category', description: 'Description', period: 'Period', severity: 'Severity', regulatorReported: 'Regulator Reported', status: 'Status', noConduct: 'No conduct information submitted — this indicates no negative reference findings.', audit: 'Audit Trail', cancel: 'Cancel Request', addConduct: '+ Add Conduct Info', notFound: 'Request not found', loading: 'Loading...', requestId: 'Request ID', notYetSent: 'Not yet sent', slaBreached: 'SLA Breached', ongoing: 'ongoing', yes: 'Yes', no: 'No', system: 'System', changeStatusTo: 'Change status to', addConductTitle: 'Add Conduct Information', conductCategory: 'Conduct Category', describeConduct: 'Describe the conduct information...', incidentStartDate: 'Incident Start Date', underReview: 'Under Review', material: 'Material', nonMaterial: 'Non-Material', submitConduct: 'Submit Conduct Info', noValue: '—', integrations: 'Background Screening Summary', issuesDetected: 'Issues detected', noIssuesDetected: 'No issues detected', lastChecked: 'Last checked', notChecked: 'Not checked', watchlistHits: 'Watchlist Hits', licenseMatches: 'License Matches', issueHits: 'Disciplinary Issues', litigationHits: 'Litigation Cases', viewDetails: 'View details', close: 'Close', noRecordsFound: 'No records found.', screeningDetails: 'Background Screening Details', downloadReport: 'Download Report' },
    tc: { back: '返回', title: '背調請求', requestDetails: '請求詳情', sector: '行業', recruiting: '招聘機構', providing: '提供機構', requestDate: '請求日期', slaDeadline: 'SLA 截止日', lookback: '回溯開始日', responseDate: '回覆日期', notes: '備註', individualInfo: '個人資料', nameEn: '英文姓名', nameZh: '中文姓名', email: '電郵', conduct: '操守資訊', category: '類別', description: '描述', period: '期間', severity: '嚴重程度', regulatorReported: '已向監管申報', status: '狀態', noConduct: '未提交操守資訊 — 表示沒有負面背調結果。', audit: '審計軌跡', cancel: '取消請求', addConduct: '+ 新增操守資訊', notFound: '找不到請求', loading: '載入中...', requestId: '請求編號', notYetSent: '尚未發送', slaBreached: 'SLA 違規', ongoing: '進行中', yes: '是', no: '否', system: '系統', changeStatusTo: '將狀態更改為', addConductTitle: '新增操守資訊', conductCategory: '操守類別', describeConduct: '請描述操守資訊...', incidentStartDate: '事件開始日期', underReview: '審核中', material: '重大', nonMaterial: '非重大', submitConduct: '提交操守資訊', noValue: '—', integrations: '背景審查摘要', issuesDetected: '發現問題', noIssuesDetected: '未發現問題', lastChecked: '上次檢查', notChecked: '未檢查', watchlistHits: '觀察名單命中', licenseMatches: '牌照匹配', issueHits: '紀律問題', litigationHits: '訴訟案件', viewDetails: '查看詳情', close: '關閉', noRecordsFound: '沒有找到記錄。', screeningDetails: '背景審查詳情', downloadReport: '下載報告' },
    zh: { back: '返回', title: '背调请求', requestDetails: '请求详情', sector: '行业', recruiting: '招聘机构', providing: '提供机构', requestDate: '请求日期', slaDeadline: 'SLA 截止日', lookback: '回溯开始日', responseDate: '回复日期', notes: '备注', individualInfo: '个人资料', nameEn: '英文姓名', nameZh: '中文姓名', email: '邮箱', conduct: '操守信息', category: '类别', description: '描述', period: '期间', severity: '严重程度', regulatorReported: '已向监管申报', status: '状态', noConduct: '未提交操守信息 — 表示没有负面背调结果。', audit: '审计轨迹', cancel: '取消请求', addConduct: '+ 新增操守信息', notFound: '找不到请求', loading: '加载中...', requestId: '请求编号', notYetSent: '尚未发送', slaBreached: 'SLA 违规', ongoing: '进行中', yes: '是', no: '否', system: '系统', changeStatusTo: '将状态更改为', addConductTitle: '新增操守信息', conductCategory: '操守类别', describeConduct: '请描述操守信息...', incidentStartDate: '事件开始日期', underReview: '审核中', material: '重大', nonMaterial: '非重大', submitConduct: '提交操守信息', noValue: '—', integrations: '背景筛查摘要', issuesDetected: '发现问题', noIssuesDetected: '未发现问题', lastChecked: '上次检查', notChecked: '未检查', watchlistHits: '观察名单命中', licenseMatches: '牌照匹配', issueHits: '纪律问题', litigationHits: '诉讼案件', viewDetails: '查看详情', close: '关闭', noRecordsFound: '未找到记录。', screeningDetails: '背景筛查详情', downloadReport: '下载报告' },
  };
  const t = I18N[lang] || I18N.en;
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConductModal, setShowConductModal] = useState(false);
  const [conductForm, setConductForm] = useState({ category: 'legal_regulatory_breach', description: '', incident_start_date: '', severity: 'under_review' });
  const [updating, setUpdating] = useState(false);
  const [consentFile, setConsentFile] = useState(null);
  const [resultsFile, setResultsFile] = useState(null);
  const [consentEmail, setConsentEmail] = useState('');
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowMessage, setWorkflowMessage] = useState('');
  const [parsedResults, setParsedResults] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  const loadRequest = () => {
    setLoading(true);
    api.getRequest(id).then(setRequest).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(loadRequest, [id]);

  useEffect(() => {
    if (request?.individual_email) {
      setConsentEmail(request.individual_email);
    }
  }, [request?.individual_email]);

  const handleStatusChange = async (newStatus) => {
    const targetLabel = STATUS_LABELS[lang]?.[newStatus] || STATUS_LABELS.en[newStatus] || titleCase(newStatus);
    if (!window.confirm(`${t.changeStatusTo} "${targetLabel}"?`)) return;
    setUpdating(true);
    try {
      await api.updateRequestStatus(id, newStatus);
      loadRequest();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddConduct = async (e) => {
    e.preventDefault();
    try {
      await api.addConduct(id, conductForm);
      setShowConductModal(false);
      setConductForm({ category: 'legal_regulatory_breach', description: '', incident_start_date: '', severity: 'under_review' });
      loadRequest();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUploadSignedConsent = async () => {
    if (!consentFile) {
      alert('Please select a signed consent file first.');
      return;
    }

    setWorkflowLoading(true);
    setWorkflowMessage('');
    try {
      const dataUrl = await readFileAsDataUrl(consentFile);
      await api.uploadSignedConsent(id, {
        file_name: consentFile.name,
        mime_type: consentFile.type || 'application/octet-stream',
        file_data_base64: dataUrl,
      });
      setWorkflowMessage('Signed consent uploaded and logged to case file.');
      setConsentFile(null);
      loadRequest();
    } catch (err) {
      alert(err.message);
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleSendConsentEmail = async () => {
    if (!consentEmail) {
      alert('Recipient email is required.');
      return;
    }

    setWorkflowLoading(true);
    setWorkflowMessage('');
    try {
      const response = await api.sendConsentSigningEmail(id, { recipient_email: consentEmail });
      if (response?.mailto_url) {
        window.location.href = response.mailto_url;
      }
      setWorkflowMessage('Consent email draft opened in your system mail client and logged to case file.');
      loadRequest();
    } catch (err) {
      alert(err.message);
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleUploadReferenceResults = async () => {
    if (!resultsFile) {
      alert('Please select a reference results file first.');
      return;
    }

    setWorkflowLoading(true);
    setWorkflowMessage('');
    try {
      const dataUrl = await readFileAsDataUrl(resultsFile);
      const response = await api.uploadReferenceResults(id, {
        file_name: resultsFile.name,
        mime_type: resultsFile.type || 'application/octet-stream',
        file_data_base64: dataUrl,
        ocr_enabled: true,
        ai_enabled: true,
      });
      setParsedResults(response.parsed || null);
      setWorkflowMessage('Reference results uploaded, parsed with OCR/AI, and logged to case file.');
      setResultsFile(null);
      loadRequest();
    } catch (err) {
      alert(err.message);
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleDownloadIntegrationPdf = () => {
    if (!request?.integration_snapshot) return;

    const summary = request.integration_snapshot.summary || {};
    const records = request.integration_snapshot.records || {};
    const inputs = request.integration_snapshot.inputs || {};
    const issueRecords = Array.isArray(records.issues) ? records.issues : [];
    const watchlistRecords = Array.isArray(records.watchlist) ? records.watchlist : [];
    const licenseRecords = Array.isArray(records.licenses) ? records.licenses : [];
    const litigationRecords = Array.isArray(records.litigation) ? records.litigation : [];
    const registrations = Array.isArray(request.regulatory_registrations) ? request.regulatory_registrations : [];

    const nonEmpty = (value) => value !== null && value !== undefined && String(value).trim() !== '';
    const safe = (value, fallback = 'N/A') => (nonEmpty(value) ? String(value) : fallback);
    const formatDateTime = (value, includeTime = false) => {
      if (!nonEmpty(value)) return 'N/A';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return safe(value);
      return includeTime ? date.toLocaleString() : date.toLocaleDateString();
    };
    const formatArray = (value) => {
      if (!value) return 'N/A';
      if (Array.isArray(value)) return value.length ? value.join(', ') : 'N/A';
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.length ? parsed.join(', ') : 'N/A';
          } catch (_err) {
            return trimmed;
          }
        }
      }
      return String(value);
    };
    const pickRecordPairs = (record = {}) => {
      const preferredKeys = [
        'entity_name', 'full_name', 'name',
        'id_number', 'person_id', 'candidate_id',
        'regulator', 'jurisdiction',
        'license_number', 'registration_number', 'registration_type',
        'status', 'category', 'type',
        'issue_id', 'case_id', 'reference_no', 'court',
        'date', 'effective_from', 'effective_to',
      ];

      const result = [];
      preferredKeys.forEach((key) => {
        if (nonEmpty(record[key])) result.push([titleCase(key), String(record[key])]);
      });

      if (result.length < 6) {
        Object.entries(record || {}).forEach(([key, value]) => {
          if (result.find(([existing]) => existing.toLowerCase() === titleCase(key).toLowerCase())) return;
          if (!nonEmpty(value) || typeof value === 'object') return;
          result.push([titleCase(key), String(value)]);
        });
      }

      return result.slice(0, 10);
    };

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);
    const sectionSpacing = 14;
    const headerColor = [26, 54, 93];
    const softHeaderFill = [240, 245, 252];
    const borderColor = [210, 218, 230];
    let y = margin;

    const ensureSpace = (height = 18) => {
      if (y + height > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const drawSectionHeader = (title) => {
      ensureSpace(28);
      doc.setFillColor(...softHeaderFill);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(margin, y - 2, contentWidth, 24, 4, 4, 'FD');
      doc.setTextColor(...headerColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(String(title || ''), margin + 10, y + 14);
      y += 32;
      doc.setTextColor(20, 20, 20);
    };

    const writeLine = (text, options = {}) => {
      const { fontSize = 10, bold = false, spacing = 14 } = options;
      ensureSpace(spacing);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(String(text || ''), contentWidth);
      lines.forEach((line) => {
        ensureSpace(spacing);
        doc.text(line, margin, y);
        y += spacing;
      });
    };

    const writeKeyValueRow = (label, value) => {
      const leftColWidth = 170;
      const rightColWidth = contentWidth - leftColWidth;
      const rightLines = doc.splitTextToSize(safe(value), rightColWidth);
      const rowHeight = Math.max(18, rightLines.length * 12 + 6);
      ensureSpace(rowHeight + 2);

      doc.setDrawColor(...borderColor);
      doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`${label}:`, margin, y + 12);

      doc.setFont('helvetica', 'normal');
      rightLines.forEach((line, idx) => {
        doc.text(line, margin + leftColWidth, y + 12 + idx * 12);
      });

      y += rowHeight;
    };

    const writeRecordsSection = (title, items) => {
      drawSectionHeader(title);
      if (!items || items.length === 0) {
        writeLine(t.noRecordsFound || 'No records found.');
        y += sectionSpacing;
        return;
      }

      items.forEach((item, index) => {
        const pairs = pickRecordPairs(item);
        ensureSpace(24);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${safe(item?.entity_name || item?.full_name || item?.name || item?.issue_id || item?.license_number || 'Record')}`, margin, y + 12);
        y += 16;

        if (pairs.length === 0) {
          writeLine('Record details unavailable.');
        } else {
          pairs.forEach(([label, value]) => writeKeyValueRow(label, value));
        }

        if (nonEmpty(item?.description)) writeKeyValueRow('Description', item.description);
        if (nonEmpty(item?.action_taken)) writeKeyValueRow('Action Taken', item.action_taken);
        y += 8;
      });
      y += sectionSpacing;
    };

    doc.setFillColor(...headerColor);
    doc.rect(0, 0, pageWidth, 80, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Background Screening Report', margin, 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 54);
    doc.text(`Request ID: ${safe(request.request_id)}`, pageWidth - margin - 180, 54);
    doc.setTextColor(20, 20, 20);
    y = 96;

    drawSectionHeader('Request & Candidate Details');
    writeKeyValueRow('Candidate Name', `${safe(request.name_en_surname, '').trim()} ${safe(request.name_en_given, '').trim()}`.trim() || 'N/A');
    writeKeyValueRow('Candidate Chinese Name', safe(request.individual_name_zh));
    writeKeyValueRow('Candidate ID (System)', safe(request.individual_id));
    writeKeyValueRow('HKID / National ID (Hashed)', safe(request.hkid_hash));
    writeKeyValueRow('Email', safe(request.individual_email));
    writeKeyValueRow('Phone', safe(request.individual_phone));
    writeKeyValueRow('Target Job Position', safe(request.target_position_title));
    writeKeyValueRow('Previous Position (Reference Institution)', safe(request.previous_position_title));
    writeKeyValueRow('Request Sector', titleCase(request.request_sector || ''));
    writeKeyValueRow('Request Status', titleCase(request.status || ''));
    writeKeyValueRow('Request Date', formatDateTime(request.request_date));
    writeKeyValueRow('SLA Deadline', formatDateTime(request.sla_deadline));
    writeKeyValueRow('Integration Last Checked', formatDateTime(request.integration_last_checked_at, true));
    writeKeyValueRow('Snapshot Generated At', formatDateTime(request.integration_snapshot?.generated_at, true));
    y += sectionSpacing;

    drawSectionHeader('Institution Context');
    writeKeyValueRow('Recruiting Institution', safe(request.recruiting_institution_name));
    writeKeyValueRow('Recruiting Regulators', formatArray(request.recruiting_institution_regulators));
    writeKeyValueRow('Recruiting Sectors', formatArray(request.recruiting_institution_sectors));
    writeKeyValueRow('Reference-Providing Institution', safe(request.providing_institution_name));
    writeKeyValueRow('Providing Regulators', formatArray(request.providing_institution_regulators));
    writeKeyValueRow('Providing Sectors', formatArray(request.providing_institution_sectors));
    writeKeyValueRow('Search Input - Individual ID', safe(inputs.individual_id));
    writeKeyValueRow('Search Input - Individual Name', `${safe(inputs.individual_surname, '').trim()} ${safe(inputs.individual_given_name, '').trim()}`.trim() || 'N/A');
    writeKeyValueRow('Search Input - Institution', safe(inputs.institution_name));
    y += sectionSpacing;

    drawSectionHeader('Regulatory Registrations');
    if (registrations.length === 0) {
      writeLine(t.noRecordsFound || 'No records found.');
    } else {
      registrations.forEach((registration, index) => {
        ensureSpace(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${safe(registration.regulator)}${nonEmpty(registration.registration_type) ? ` - ${registration.registration_type}` : ''}`, margin, y + 12);
        y += 16;
        writeKeyValueRow('License / Registration Number', safe(registration.registration_number));
        writeKeyValueRow('Status', safe(registration.status));
        writeKeyValueRow('Regulated Activities', formatArray(registration.regulated_activities));
        writeKeyValueRow('Principal Institution', safe(registration.institution_name));
        writeKeyValueRow('Effective Period', `${formatDateTime(registration.effective_from)} to ${formatDateTime(registration.effective_to)}`);
        y += 8;
      });
    }
    y += sectionSpacing;

    drawSectionHeader('Background Screening Summary');
    writeKeyValueRow('Watchlist Hits', String(summary.watchlist_hits || 0));
    writeKeyValueRow('License Matches', String(summary.license_matches || 0));
    writeKeyValueRow('Disciplinary Issues', String(summary.issue_hits || 0));
    writeKeyValueRow('Litigation Cases', String(summary.litigation_hits || 0));
    y += sectionSpacing;

    writeRecordsSection('Watchlist Records', watchlistRecords);
    writeRecordsSection('License Records', licenseRecords);
    writeRecordsSection('Disciplinary Issue Records', issueRecords);
    writeRecordsSection('Litigation Records', litigationRecords);

    const suffix = (request.request_id || 'background-screening').replace(/[^a-zA-Z0-9-_]/g, '_');
    doc.save(`background-screening-report-${suffix}.pdf`);
  };

  if (loading) return <div className="loading"><div className="spinner" /> {t.loading}</div>;
  if (!request) return <div className="error-msg">{t.notFound}</div>;

  const currentIdx = ALL_STATUSES.indexOf(request.status);
  const nextStatuses = STATUS_FLOW[request.status] || [];
  const isReadOnly = ['regulator_admin', 'regulator_viewer', 'auditor'].includes(user.role);
  const integrationSummary = request.integration_snapshot?.summary || null;
  const integrationIssueRecords = Array.isArray(request.integration_snapshot?.records?.issues)
    ? request.integration_snapshot.records.issues
    : [];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/requests')}>← {t.back}</button>
        <div>
          <h2>{t.title}</h2>
          <p>{request.name_en_surname} {request.name_en_given} {request.individual_name_zh && `(${request.individual_name_zh})`}</p>
        </div>
      </div>

      {/* Status Progress */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div className="status-steps">
            {ALL_STATUSES.map((s, i) => (
              <span key={s} className={`status-step ${i < currentIdx ? 'done' : i === currentIdx ? 'current' : ''}`}>
                {STATUS_LABELS[lang]?.[s] || STATUS_LABELS.en[s] || titleCase(s)}
              </span>
            ))}
            {request.status === 'cancelled' && <span className="status-step current" style={{ background: 'var(--danger)', color: 'white' }}>{STATUS_LABELS[lang]?.cancelled || STATUS_LABELS.en.cancelled}</span>}
          </div>
          {!isReadOnly && nextStatuses.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              {nextStatuses.map(s => (
                <button key={s} className={`btn btn-sm ${s === 'cancelled' ? 'btn-danger' : 'btn-primary'}`} onClick={() => handleStatusChange(s)} disabled={updating}>
                  {s === 'cancelled' ? t.cancel : `→ ${STATUS_LABELS[lang]?.[s] || STATUS_LABELS.en[s] || titleCase(s)}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Request Details */}
        <div className="card">
          <div className="card-header"><h3>{t.requestDetails}</h3></div>
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t.requestId}</label>
                <div className="value" style={{ fontSize: 12, fontFamily: 'monospace' }}>{request.request_id}</div>
              </div>
              <div className="detail-item">
                <label>{t.sector}</label>
                <div className="value"><span className="badge badge-blue">{titleCase(request.request_sector)}</span></div>
              </div>
              <div className="detail-item">
                <label>{t.recruiting}</label>
                <div className="value">{request.recruiting_institution_name}</div>
              </div>
              <div className="detail-item">
                <label>{t.providing}</label>
                <div className="value">{request.providing_institution_name}</div>
              </div>
              <div className="detail-item">
                <label>{t.requestDate}</label>
                <div className="value">{request.request_date || t.notYetSent}</div>
              </div>
              <div className="detail-item">
                <label>{t.slaDeadline}</label>
                <div className="value" style={{ color: request.sla_deadline && new Date(request.sla_deadline) < new Date() ? 'var(--danger)' : 'inherit' }}>
                  {request.sla_deadline || t.noValue}
                  {request.sla_breached ? <span className="badge badge-red" style={{ marginLeft: 8 }}>{t.slaBreached}</span> : ''}
                </div>
              </div>
              <div className="detail-item">
                <label>{t.lookback}</label>
                <div className="value">{request.lookback_start_date || t.noValue}</div>
              </div>
              <div className="detail-item">
                <label>{t.responseDate}</label>
                <div className="value">{request.response_date || t.noValue}</div>
              </div>
            </div>
            {request.notes && (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: 14 }}>
                <strong>{t.notes}:</strong> {request.notes}
              </div>
            )}
          </div>
        </div>

        {/* Individual Info */}
        <div className="card">
          <div className="card-header"><h3>{t.individualInfo}</h3></div>
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t.nameEn}</label>
                <div className="value">{request.name_en_surname}, {request.name_en_given}</div>
              </div>
              <div className="detail-item">
                <label>{t.nameZh}</label>
                <div className="value">{request.individual_name_zh || t.noValue}</div>
              </div>
              <div className="detail-item">
                <label>{t.email}</label>
                <div className="value">{request.individual_email || t.noValue}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, border: '1px solid var(--border)' }}>
        <div className="card-header" style={{ alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowIntegrationModal(true)}
              disabled={!integrationSummary}
              title={integrationSummary ? t.viewDetails : t.notChecked}
            >
              {t.integrations}
            </button>
            {integrationSummary ? (
              <span className={`badge ${integrationSummary.issue_hits > 0 ? 'badge-red' : 'badge-green'}`}>
                {integrationSummary.issue_hits > 0 ? t.issuesDetected : t.noIssuesDetected}
              </span>
            ) : (
              <span className="badge badge-gray">{t.notChecked}</span>
            )}
          </div>
          {integrationSummary && (
            <button type="button" className="btn btn-outline btn-sm" onClick={handleDownloadIntegrationPdf}>
              {t.downloadReport}
            </button>
          )}
        </div>
        <div className="card-body">
          {integrationSummary ? (
            <>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <li>
                  <strong>{t.watchlistHits}:</strong> {integrationSummary.watchlist_hits || 0}
                </li>
                <li>
                  <strong>{t.licenseMatches}:</strong> {integrationSummary.license_matches || 0}
                </li>
                <li>
                  <strong>{t.issueHits}:</strong>{' '}
                  {integrationIssueRecords.length > 0 ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setShowIssueModal(true)}
                      style={{ padding: '2px 8px', lineHeight: 1.3 }}
                    >
                      {integrationSummary.issue_hits || 0}
                    </button>
                  ) : (
                    integrationSummary.issue_hits || 0
                  )}
                </li>
                <li>
                  <strong>{t.litigationHits}:</strong> {integrationSummary.litigation_hits || 0}
                </li>
                <li style={{ gridColumn: '1 / -1', fontSize: 12, color: 'var(--text-muted)' }}>
                  <strong>{t.lastChecked}:</strong> {request.integration_last_checked_at ? new Date(request.integration_last_checked_at).toLocaleString() : t.notChecked}
                </li>
              </ul>
            </>
          ) : (
            <p style={{ marginBottom: 0, color: 'var(--text-muted)' }}>{t.notChecked}</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><h3>{t.workflowTitle || 'Consent & Reference Results'}</h3></div>
        <div className="card-body">
          <div className="grid-2">
            <div>
              <h4 style={{ marginTop: 0, marginBottom: 10 }}>{t.signedConsent || '1) Signed Consent Form'}</h4>
              <div className="form-group">
                <label>{t.uploadSignedConsent || 'Upload signed consent form'}</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setConsentFile(e.target.files?.[0] || null)}
                  disabled={isReadOnly || workflowLoading}
                />
              </div>
              <button className="btn btn-primary btn-sm" type="button" onClick={handleUploadSignedConsent} disabled={isReadOnly || workflowLoading || !consentFile}>
                {t.uploadSignedConsent || 'Upload signed consent form'}
              </button>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label>{t.sendSignEmail || 'Or send email to user for e-signature'}</label>
                <input
                  type="email"
                  className="form-control"
                  value={consentEmail}
                  onChange={(e) => setConsentEmail(e.target.value)}
                  placeholder="user@example.com"
                  disabled={isReadOnly || workflowLoading}
                />
              </div>
              <button className="btn btn-outline btn-sm" type="button" onClick={handleSendConsentEmail} disabled={isReadOnly || workflowLoading || !consentEmail}>
                {t.sendSignEmail || 'Send signing email'}
              </button>
            </div>

            <div>
              <h4 style={{ marginTop: 0, marginBottom: 10 }}>{t.referenceResults || '2) Reference Results Upload + OCR/AI Parse'}</h4>
              <div className="form-group">
                <label>{t.uploadReferenceResults || 'Upload reference results'}</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setResultsFile(e.target.files?.[0] || null)}
                  disabled={isReadOnly || workflowLoading}
                />
              </div>
              <button className="btn btn-primary btn-sm" type="button" onClick={handleUploadReferenceResults} disabled={isReadOnly || workflowLoading || !resultsFile}>
                {t.uploadReferenceResults || 'Upload + OCR/AI parse'}
              </button>

              {parsedResults && (
                <div style={{ marginTop: 14, padding: 10, border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13 }}>
                  <div><strong>{t.totalFindings || 'Total Findings'}:</strong> {parsedResults.summary?.total_findings || 0}</div>
                  <div><strong>{t.material || 'Material'}:</strong> {parsedResults.summary?.material_count || 0}</div>
                  <div><strong>{t.nonMaterial || 'Non-Material'}:</strong> {parsedResults.summary?.non_material_count || 0}</div>
                  <div><strong>{t.underReview || 'Under Review'}:</strong> {parsedResults.summary?.under_review_count || 0}</div>
                </div>
              )}
            </div>
          </div>

          {workflowMessage && (
            <div style={{ marginTop: 14, color: 'var(--success)', fontSize: 13 }}>{workflowMessage}</div>
          )}

          <div style={{ marginTop: 20 }}>
            <h4 style={{ marginBottom: 10 }}>{t.caseFile || 'Case File Log'}</h4>
            {request.case_file_entries?.length > 0 ? (
              <div className="timeline">
                {request.case_file_entries.map((entry) => (
                  <div key={entry.case_file_id} className="timeline-item">
                    <div className="time">{new Date(entry.created_at).toLocaleString()}</div>
                    <div className="content">
                      <strong>{entry.title}</strong>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>({titleCase(entry.entry_type)})</span>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {(entry.created_by_name || t.system)}
                        {entry.metadata?.recipient_email ? ` • ${entry.metadata.recipient_email}` : ''}
                        {entry.metadata?.summary?.total_findings !== undefined ? ` • Findings: ${entry.metadata.summary.total_findings}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>{t.noCaseEntries || 'No case file entries yet.'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Conduct Information */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3>{t.conduct} ({request.conduct_information?.length || 0})</h3>
          {!isReadOnly && ['in_progress', 'response_provided'].includes(request.status) && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowConductModal(true)}>{t.addConduct}</button>
          )}
        </div>
        <div className="card-body" style={{ padding: request.conduct_information?.length ? 0 : 20 }}>
          {request.conduct_information?.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t.category}</th>
                    <th>{t.description}</th>
                    <th>{t.period}</th>
                    <th>{t.severity}</th>
                    <th>{t.regulatorReported}</th>
                    <th>{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {request.conduct_information.map(ci => (
                    <tr key={ci.conduct_id}>
                      <td><span className="badge badge-orange">{CONDUCT_CATEGORY_LABELS[lang]?.[ci.category] || CONDUCT_CATEGORY_LABELS.en[ci.category] || titleCase(ci.category)}</span></td>
                      <td style={{ maxWidth: 300 }}>{ci.description}</td>
                      <td style={{ fontSize: 13 }}>{ci.incident_start_date} — {ci.incident_end_date || t.ongoing}</td>
                      <td>
                        <span className={`badge ${ci.severity === 'material' ? 'badge-red' : ci.severity === 'non_material' ? 'badge-yellow' : 'badge-gray'}`}>
                          {titleCase(ci.severity)}
                        </span>
                      </td>
                      <td>{ci.regulator_reported ? t.yes : t.no}</td>
                      <td><span className={`badge ${ci.status === 'resolved' ? 'badge-green' : 'badge-yellow'}`}>{titleCase(ci.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>{t.noConduct}</p>
          )}
        </div>
      </div>

      {/* Audit Trail */}
      {request.audit_trail?.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><h3>{t.audit}</h3></div>
          <div className="card-body">
            <div className="timeline">
              {request.audit_trail.map(log => (
                <div key={log.log_id} className="timeline-item">
                  <div className="time">{new Date(log.timestamp).toLocaleString()}</div>
                  <div className="content">
                    <strong>{log.user_name || t.system}</strong> — {log.action?.replace(/_/g, ' ')}
                    {log.details && (() => {
                      try {
                        const d = JSON.parse(log.details);
                        if (d.from && d.to) return ` (${d.from} → ${d.to})`;
                        return '';
                      } catch { return ''; }
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Conduct Modal */}
      {showConductModal && (
        <div className="modal-overlay" onClick={() => setShowConductModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.addConductTitle}</h3>
              <button className="close-btn" onClick={() => setShowConductModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddConduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t.conductCategory}</label>
                  <select className="form-control" value={conductForm.category} onChange={(e) => setConductForm({ ...conductForm, category: e.target.value })}>
                    {CONDUCT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{CONDUCT_CATEGORY_LABELS[lang]?.[c.value] || CONDUCT_CATEGORY_LABELS.en[c.value] || titleCase(c.value)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t.description}</label>
                  <textarea className="form-control" value={conductForm.description} onChange={(e) => setConductForm({ ...conductForm, description: e.target.value })} placeholder={t.describeConduct} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t.incidentStartDate}</label>
                    <input type="date" className="form-control" value={conductForm.incident_start_date} onChange={(e) => setConductForm({ ...conductForm, incident_start_date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>{t.severity}</label>
                    <select className="form-control" value={conductForm.severity} onChange={(e) => setConductForm({ ...conductForm, severity: e.target.value })}>
                      <option value="under_review">{t.underReview}</option>
                      <option value="material">{t.material}</option>
                      <option value="non_material">{t.nonMaterial}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowConductModal(false)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary">{t.submitConduct}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIssueModal && (
        <div className="modal-overlay" onClick={() => setShowIssueModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Disciplinary Issues</h3>
              <button className="close-btn" onClick={() => setShowIssueModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {integrationIssueRecords.length > 0 ? (
                <div className="timeline">
                  {integrationIssueRecords.map((issue, index) => (
                    <div key={issue.issue_id || `${issue.license_number || 'issue'}-${index}`} className="timeline-item">
                      <div className="time">{issue.date ? new Date(issue.date).toLocaleDateString() : 'N/A'}</div>
                      <div className="content">
                        <strong>{issue.issue_id || `Issue ${index + 1}`}</strong>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                          {(issue.entity_name || issue.license_number || 'Unknown entity')}
                          {issue.regulator ? ` • ${issue.regulator}` : ''}
                          {issue.status ? ` • ${issue.status}` : ''}
                        </div>
                        {issue.description && <div style={{ marginTop: 6 }}>{issue.description}</div>}
                        {issue.action_taken && <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>Action: {issue.action_taken}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ marginBottom: 0, color: 'var(--text-muted)' }}>No issue records found.</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowIssueModal(false)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {showIntegrationModal && integrationSummary && (
        <div className="modal-overlay" onClick={() => setShowIntegrationModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.screeningDetails}</h3>
              <button className="close-btn" onClick={() => setShowIntegrationModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <ul style={{ marginTop: 0, marginBottom: 14, paddingLeft: 20, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <li><strong>{t.watchlistHits}:</strong> {integrationSummary.watchlist_hits || 0}</li>
                <li><strong>{t.licenseMatches}:</strong> {integrationSummary.license_matches || 0}</li>
                <li><strong>{t.issueHits}:</strong> {integrationSummary.issue_hits || 0}</li>
                <li><strong>{t.litigationHits}:</strong> {integrationSummary.litigation_hits || 0}</li>
              </ul>

              {[
                { label: t.watchlistHits, items: request.integration_snapshot?.records?.watchlist || [] },
                { label: t.licenseMatches, items: request.integration_snapshot?.records?.licenses || [] },
                { label: t.issueHits, items: request.integration_snapshot?.records?.issues || [] },
                { label: t.litigationHits, items: request.integration_snapshot?.records?.litigation || [] },
              ].map((section) => (
                <div key={section.label} style={{ marginBottom: 14 }}>
                  <h4 style={{ marginBottom: 8 }}>{section.label}</h4>
                  {Array.isArray(section.items) && section.items.length > 0 ? (
                    <div className="timeline">
                      {section.items.map((item, index) => (
                        <div key={`${section.label}-${item.issue_id || item.license_number || item.entity_name || index}`} className="timeline-item">
                          <div className="time">{item.date ? new Date(item.date).toLocaleDateString() : `#${index + 1}`}</div>
                          <div className="content">
                            <strong>{item.entity_name || item.license_number || item.issue_id || `${section.label} ${index + 1}`}</strong>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                              {Object.entries(item || {})
                                .filter(([key, value]) => !['description', 'action_taken'].includes(key) && value !== null && value !== undefined && String(value).trim() !== '' && typeof value !== 'object')
                                .slice(0, 4)
                                .map(([key, value]) => `${titleCase(key)}: ${value}`)
                                .join(' • ')}
                            </div>
                            {item.description && <div style={{ marginTop: 6 }}>{item.description}</div>}
                            {item.action_taken && <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>Action: {item.action_taken}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ marginBottom: 0, color: 'var(--text-muted)' }}>{t.noRecordsFound}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={handleDownloadIntegrationPdf}>{t.downloadReport}</button>
              <button type="button" className="btn btn-primary" onClick={() => setShowIntegrationModal(false)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
