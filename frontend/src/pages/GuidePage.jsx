import { useState } from 'react';

const SECTION_ORDER = ['getting_started', 'raise_request', 'sla', 'responses', 'support', 'access'];

const I18N = {
  en: {
    title: 'Guide & FAQ',
    subtitle: 'Detailed help for request workflow, SLA management, responses, and support',
    filterLabel: 'Filter by section',
    allSections: 'All Sections',
    guideTitle: 'Guide',
    faqTitle: 'FAQ',
    sections: {
      getting_started: {
        label: 'Getting Started',
        guide: [
          'Sign in with your assigned role and verify your institution context in the top bar before taking action.',
          'Use Dashboard for daily triage: active requests, overdue SLA alerts, and recent activity trends.',
          'Use list pages (Requests, Institutions, Individuals) with filters to find records quickly by status or entity.',
          'Open Audit Log when you need operational traceability for approvals, edits, status changes, and access events.',
        ],
        faq: [
          { q: 'Why do I see different menus than another user?', a: 'Navigation is role-based. Your role and institution permissions determine which actions and pages are available.' },
          { q: 'Which page should I check first every day?', a: 'Start with Dashboard and Ongoing Monitoring to prioritize at-risk requests and SLA deadlines.' },
        ],
      },
      raise_request: {
        label: 'How to Raise a Request',
        guide: [
          'Click New Request and complete required fields: individual details, recruiting institution, providing institution, and request sector.',
          'Confirm identity and profile details carefully before submission to avoid rework and delayed responses.',
          'Record consent status before sharing or requesting regulated conduct information.',
          'Submit the request and monitor status transitions from sent to acknowledged, in progress, and response provided.',
          'If data changes after submission, update the request promptly and keep notes clear for downstream reviewers.',
        ],
        faq: [
          { q: 'Who is allowed to raise a request?', a: 'Typically HR initiator and institution admin roles, depending on organization policy and assigned permissions.' },
          { q: 'What causes request rejection or delay?', a: 'Common causes are missing consent, incomplete individual data, incorrect institution pairing, and unclear notes.' },
          { q: 'Can I edit a request after submission?', a: 'Yes, where role and status allow. Use request detail updates and ensure the audit trail reflects the changes.' },
        ],
      },
      sla: {
        label: 'SLA and Deadlines',
        guide: [
          'Track SLA deadlines from Dashboard for summary and Ongoing Monitoring for actionable request-level follow-up.',
          'Treat approaching deadlines as priority work items and escalate early when dependencies may delay completion.',
          'Use status timestamps and audit events to understand where cycle-time was consumed and what action is required next.',
          'When SLA breach risk is identified, document mitigation actions and notify responsible approvers or compliance reviewers.',
        ],
        faq: [
          { q: 'Where do I see overdue cases?', a: 'Dashboard shows overdue totals; Ongoing Monitoring shows the specific requests requiring immediate action.' },
          { q: 'What should I do before a deadline is breached?', a: 'Follow up with pending owners, confirm missing data, and escalate blockers before the SLA threshold is crossed.' },
          { q: 'What does SLA breach mean in practice?', a: 'It indicates the request exceeded its expected completion window and should trigger escalation and documented remediation.' },
        ],
      },
      responses: {
        label: 'Understanding Responses',
        guide: [
          'Review response fields in request detail together with conduct categories, notes, and attached context.',
          'Use the status and conduct summary to determine whether the case can be closed or requires escalation.',
          'Interpret status responses consistently: acknowledged means accepted for processing; in progress means active handling; response provided means the source institution has submitted output.',
          'When response quality is unclear, request clarification through internal workflow and capture rationale in notes.',
        ],
        faq: [
          { q: 'What does “Acknowledged” mean?', a: 'The providing institution has accepted the request and it is queued or being prepared for handling.' },
          { q: 'What does “Response Provided” mean?', a: 'A response has been submitted; reviewers should assess content completeness and conduct implications.' },
          { q: 'When should I escalate based on response content?', a: 'Escalate if there are adverse findings, ambiguous evidence, policy conflicts, or material data gaps.' },
        ],
      },
      support: {
        label: 'Customer Support',
        guide: [
          'For operational issues, first collect request ID, timestamp, user role, and a short description of expected vs actual behavior.',
          'Check Audit Log and request history before raising support so the team has reproducible context.',
          'For access issues, route through institution admin and IAM Management before opening platform-level incidents.',
          'For data quality or compliance concerns, escalate to compliance reviewer with supporting evidence and timeline details.',
        ],
        faq: [
          { q: 'What should I include in a support ticket?', a: 'Include request ID, screenshots if available, exact error or symptom, time observed, and actions already attempted.' },
          { q: 'Who handles permission problems?', a: 'Institution admin is the first contact for role and access assignments; platform admin handles cross-institution platform issues.' },
          { q: 'How can support diagnose faster?', a: 'Provide clear reproduction steps and relevant audit timestamps so support can trace the event sequence quickly.' },
        ],
      },
      access: {
        label: 'Roles and Access',
        guide: [
          'Each role has scoped actions; maintain least privilege and assign only required operational permissions.',
          'Use IAM Management to review user-role mappings regularly and remove stale access promptly.',
          'Regulator and auditor roles are generally read-oriented to preserve independence and controls.',
          'Document temporary access changes and revert them after the approved window closes.',
        ],
        faq: [
          { q: 'Why is New Request missing for my account?', a: 'Your current role is likely read-only or does not include request creation permission.' },
          { q: 'Can one user hold multiple responsibilities?', a: 'This depends on governance policy. If allowed, ensure role assignments preserve segregation-of-duties controls.' },
        ],
      },
    },
  },
  tc: {
    title: '使用指南與常見問題',
    subtitle: '提供請求流程、SLA 管理、回覆解讀與支援處理的詳細說明',
    filterLabel: '按主題篩選',
    allSections: '全部主題',
    guideTitle: '指南',
    faqTitle: '常見問題',
    sections: {
      getting_started: {
        label: '快速入門',
        guide: [
          '請先以已分配角色登入，並確認頂部顯示的機構資訊正確。',
          '每日先看儀表板，重點關注進行中個案、逾期 SLA 及近期活動。',
          '在請求、機構、個人頁面使用篩選器，可更快定位目標記錄。',
          '需要追蹤責任與操作歷程時，請使用審計日誌。',
        ],
        faq: [
          { q: '為何我和其他使用者看到的功能不同？', a: '系統依角色與機構權限顯示功能，因此可見頁面與操作會不同。' },
          { q: '每天應先看哪個頁面？', a: '建議先看儀表板與持續監察，以優先處理高風險與臨近期限個案。' },
        ],
      },
      raise_request: {
        label: '如何建立請求',
        guide: [
          '按「新增請求」後填寫必要欄位：個人資料、招聘機構、提供機構與行業別。',
          '提交前請再次核對身份與資料完整性，避免重工與延誤。',
          '涉及受規管資訊前，需先確認並記錄同意狀態。',
          '提交後持續追蹤狀態：已發送、已確認、進行中、已提供回覆。',
          '若提交後資料變更，請即時更新並在備註清楚說明。',
        ],
        faq: [
          { q: '誰可以建立背調請求？', a: '通常為人力資源發起人或機構管理員，實際仍以權限設定為準。' },
          { q: '哪些情況最容易造成延誤？', a: '常見原因包括同意缺漏、個人資料不完整、機構配對錯誤及備註不清。' },
          { q: '提交後可否修改？', a: '在角色與狀態允許下可以修改，系統會保留對應審計紀錄。' },
        ],
      },
      sla: {
        label: 'SLA 與時限',
        guide: [
          '儀表板用於總覽，持續監察用於逐案跟進與行動。',
          '臨近期限的個案應優先處理，及早升級阻塞事項。',
          '可透過狀態時間與審計事件找出流程耗時點。',
          '若有逾期風險，請記錄補救措施並通知審批或合規角色。',
        ],
        faq: [
          { q: '在哪裡看逾期個案？', a: '儀表板看逾期總數，持續監察看需即時處理的具體請求。' },
          { q: '逾期前應做什麼？', a: '先追蹤待辦責任人、補齊缺失資料，並在門檻前完成升級。' },
          { q: 'SLA breach 代表什麼？', a: '代表請求超出預期完成時限，需觸發升級與補救紀錄。' },
        ],
      },
      responses: {
        label: '如何解讀回覆',
        guide: [
          '在請求詳情同時檢視回覆欄位、操守分類、備註與上下文。',
          '以狀態與操守摘要判斷是否可結案或需升級。',
          '狀態解讀建議一致：已確認＝已接收處理；進行中＝正在處理；已提供回覆＝對方已提交結果。',
          '若回覆內容不清晰，應按流程要求補充說明並記錄理由。',
        ],
        faq: [
          { q: '「已確認」是什麼意思？', a: '提供機構已接收請求，並已進入排程或處理準備。' },
          { q: '「已提供回覆」代表已完成嗎？', a: '代表已提交回覆，仍需由審閱人確認完整性與風險影響。' },
          { q: '什麼情況要升級？', a: '如有不利發現、證據不清、政策衝突或資料重大缺口，應升級處理。' },
        ],
      },
      support: {
        label: '客戶支援',
        guide: [
          '提出支援前，先整理請求 ID、時間、角色與期望/實際行為差異。',
          '先查審計日誌與請求歷史，可大幅縮短排查時間。',
          '權限問題先由機構管理員與 IAM 管理處理，再視需要升級至平台層。',
          '若涉及資料質量或合規疑慮，應附上證據並提交合規審閱。',
        ],
        faq: [
          { q: '支援單需要包含什麼？', a: '請包含請求 ID、錯誤現象、發生時間、重現步驟與已嘗試動作。' },
          { q: '誰負責權限問題？', a: '機構管理員為第一聯絡點；跨機構平台問題由平台管理員處理。' },
          { q: '怎樣讓支援更快定位？', a: '提供可重現步驟與關鍵審計時間點，能快速還原事件序列。' },
        ],
      },
      access: {
        label: '角色與權限',
        guide: [
          '角色權限應最小化，只授予完成職責所需操作。',
          '定期在 IAM 管理檢查角色映射，及時移除不再需要的存取權。',
          '監管與審計角色通常以查閱為主，以維持獨立性與控制要求。',
          '臨時權限應記錄期限與原因，期滿後立即回收。',
        ],
        faq: [
          { q: '為何我沒有「新增請求」？', a: '目前角色可能為唯讀，或未配置建立請求的權限。' },
          { q: '一個人可以同時有多個角色嗎？', a: '視治理政策而定；若允許，需注意職責分離控制。' },
        ],
      },
    },
  },
  zh: {
    title: '使用指南与常见问题',
    subtitle: '提供请求流程、SLA 管理、回复解读与支持处理的详细说明',
    filterLabel: '按主题筛选',
    allSections: '全部主题',
    guideTitle: '指南',
    faqTitle: '常见问题',
    sections: {
      getting_started: {
        label: '快速入门',
        guide: [
          '请先使用已分配角色登录，并确认顶部显示的机构信息正确。',
          '每日先查看仪表板，重点关注进行中个案、逾期 SLA 与近期活动。',
          '在请求、机构、个人页面使用筛选器，可更快定位目标记录。',
          '需要追踪责任与操作历史时，请使用审计日志。',
        ],
        faq: [
          { q: '为什么我和其他用户看到的功能不同？', a: '系统按角色和机构权限展示功能，因此可见页面与操作会不同。' },
          { q: '每天应该先看哪个页面？', a: '建议先看仪表板与持续监控，优先处理高风险和临近时限个案。' },
        ],
      },
      raise_request: {
        label: '如何创建请求',
        guide: [
          '点击“新建请求”后填写必填项：个人信息、招聘机构、提供机构和行业类别。',
          '提交前再次核对身份与资料完整性，避免返工与延误。',
          '涉及受监管信息前，需要先确认并记录同意状态。',
          '提交后持续跟踪状态：已发送、已确认、进行中、已提供回复。',
          '若提交后资料发生变化，请及时更新并在备注中说明原因。',
        ],
        faq: [
          { q: '谁可以创建背调请求？', a: '通常为人力资源发起人或机构管理员，实际以权限配置为准。' },
          { q: '哪些情况最容易导致延迟？', a: '常见原因是同意缺失、个人资料不完整、机构匹配错误和备注不清。' },
          { q: '提交后还能修改吗？', a: '在角色与状态允许时可以修改，系统会保留对应审计记录。' },
        ],
      },
      sla: {
        label: 'SLA 与时限',
        guide: [
          '仪表板用于总览，持续监控用于逐案跟进与执行动作。',
          '临近截止的个案应优先处理，并尽早升级阻塞事项。',
          '可通过状态时间与审计事件识别流程耗时环节。',
          '若存在逾期风险，请记录补救措施并通知审批或合规角色。',
        ],
        faq: [
          { q: '在哪里查看逾期个案？', a: '仪表板查看逾期总数，持续监控查看需要立即处理的具体请求。' },
          { q: '逾期前应该做什么？', a: '先跟进责任人、补齐缺失资料，并在阈值前完成升级。' },
          { q: 'SLA breach 代表什么？', a: '表示请求超出预期完成时限，应触发升级和补救记录。' },
        ],
      },
      responses: {
        label: '如何解读回复',
        guide: [
          '在请求详情中同时查看回复字段、操守分类、备注和上下文。',
          '结合状态与操守摘要判断是否可结案或需要升级。',
          '建议统一理解状态：已确认＝已接收处理；进行中＝正在处理；已提供回复＝对方已提交结果。',
          '若回复内容不清晰，应按流程要求补充说明并记录理由。',
        ],
        faq: [
          { q: '“已确认”是什么意思？', a: '提供机构已接收请求，并进入排队或处理准备阶段。' },
          { q: '“已提供回复”代表已经完成吗？', a: '表示已提交回复，仍需由审阅人确认完整性与风险影响。' },
          { q: '什么情况下需要升级？', a: '如出现不利发现、证据不清、政策冲突或数据重大缺口时应升级处理。' },
        ],
      },
      support: {
        label: '客户支持',
        guide: [
          '提报支持前先整理请求 ID、时间、角色及预期/实际行为差异。',
          '先检查审计日志与请求历史，可显著缩短排查时间。',
          '权限问题先由机构管理员和 IAM 管理处理，再按需要升级到平台层。',
          '如涉及数据质量或合规疑虑，应附证据并提交合规审阅。',
        ],
        faq: [
          { q: '支持工单需要包含什么？', a: '请提供请求 ID、错误现象、发生时间、复现步骤和已尝试操作。' },
          { q: '谁负责权限问题？', a: '机构管理员是第一联系人；跨机构平台问题由平台管理员处理。' },
          { q: '如何让支持更快定位问题？', a: '提供可复现步骤与关键审计时间点，支持团队可更快还原事件过程。' },
        ],
      },
      access: {
        label: '角色与权限',
        guide: [
          '角色权限应保持最小化，只授予履职所需操作。',
          '定期在 IAM 管理中检查角色映射，及时移除不再需要的访问。',
          '监管与审计角色通常以查看为主，以满足独立性和控制要求。',
          '临时权限应记录期限与原因，并在到期后立即回收。',
        ],
        faq: [
          { q: '为什么我没有“新建请求”？', a: '当前角色可能为只读，或未配置创建请求权限。' },
          { q: '一个人可以同时承担多个角色吗？', a: '视治理政策而定；若允许，需确保职责分离控制不被破坏。' },
        ],
      },
    },
  },
};

export default function GuidePage({ lang = 'en' }) {
  const t = I18N[lang] || I18N.en;
  const [activeSection, setActiveSection] = useState('all');

  const filterOptions = [
    { id: 'all', label: t.allSections },
    ...SECTION_ORDER.map((id) => ({ id, label: t.sections[id].label })),
  ];

  const visibleSectionIds = activeSection === 'all' ? SECTION_ORDER : [activeSection];

  return (
    <div>
      <div className="page-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="toolbar" style={{ alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 4 }}>{t.filterLabel}:</span>
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`btn btn-sm ${activeSection === opt.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveSection(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {visibleSectionIds.map((sectionId) => {
          const section = t.sections[sectionId];
          return (
            <div key={sectionId} className="card">
              <div className="card-header">
                <h3>{section.label}</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h4 style={{ marginBottom: 8 }}>{t.guideTitle}</h4>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {section.guide.map((item) => (
                      <li key={item} style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 style={{ marginBottom: 8 }}>{t.faqTitle}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {section.faq.map((item) => (
                      <div key={item.q} style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.q}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
