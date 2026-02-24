import { useState, useEffect } from 'react';
import { api } from '../api';

const GROUP_STORAGE_KEY = 'mrcs_monitoring_groups_v1';
const GROUP_NAME_MIN = 3;
const GROUP_NAME_MAX = 80;
const GROUP_MEMBER_MAX = 50;

function readGroups() {
  try {
    const raw = localStorage.getItem(GROUP_STORAGE_KEY);
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((g) => g && g.group_id && g.name)
      .map((g) => ({
        group_id: g.group_id,
        name: g.name,
        individual_ids: Array.isArray(g.individual_ids) ? Array.from(new Set(g.individual_ids.filter(Boolean))) : [],
      }));
  } catch (_err) {
    return [];
  }
}

function writeGroups(groups) {
  localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(groups || []));
}

function normalizeGroupName(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function titleCase(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OngoingMonitoringPage({ user, lang = 'en' }) {
  const I18N = {
    en: {
      title: 'Ongoing Monitoring',
      subtitle: 'High-level monitoring dashboard by user groups',
      allStatuses: 'All Statuses',
      totalGroups: 'Groups',
      totalMembers: 'Members',
      groupsWithActive: 'Groups with Active Monitoring',
      dueReviews: 'Due Reviews',
      configureOpen: 'Configure Monitoring',
      configureTitle: 'Configure Monitoring',
      groupMode: 'Group',
      useExistingGroup: 'Use Existing Group',
      createNewGroup: 'Create New Group',
      selectGroup: 'Select group...',
      groupName: 'Group Name',
      groupNamePlaceholder: 'e.g. HK Investment Team',
      groupMembers: 'Group Members',
      integrationScope: 'Integrations to Scan',
      regulators: 'Regulators',
      jurisdictions: 'Jurisdictions',
      notifications: 'Alert Notifications',
      recipients: 'Recipients (comma-separated emails)',
      channels: 'Notify via',
      emailChannel: 'Email',
      inAppChannel: 'In-App',
      notes: 'Monitoring Notes',
      configure: 'Apply Monitoring Configuration',
      groupsTitle: 'Monitoring Groups',
      inspect: 'Inspect',
      memberCount: 'Members',
      scheduleCount: 'Schedules',
      groupStatus: 'Group Status',
      notConfigured: 'Not Configured',
      groupDetails: 'Group Details',
      noGroupSelected: 'Select a group to inspect details',
      memberId: 'Member ID',
      reviewHistory: 'Review History',
      requestDate: 'Request Date',
      requestSector: 'Sector',
      integrationResults: 'Integration Results',
      noHistory: 'No review history found for this member',
      invalidGroup: 'Invalid group configuration',
      errSelectGroup: 'Please select a valid group.',
      errGroupNameRequired: 'Group name is required.',
      errGroupNameLength: `Group name must be ${GROUP_NAME_MIN}-${GROUP_NAME_MAX} characters.`,
      errGroupNameInvalid: 'Group name can only contain letters, numbers, spaces, and . , & - ( ).',
      errGroupNameExists: 'A group with this name already exists.',
      errMembersRequired: 'Select at least one member.',
      errMembersTooMany: `A group can contain up to ${GROUP_MEMBER_MAX} members.`,
      errMembersDuplicate: 'Duplicate members are not allowed.',
      errMembersInvalid: 'One or more selected members are invalid.',
      inspectTitle: 'Inspect Group',
      reviewNowTitle: 'Run Review Now',
      reviewNowConfirm: 'Run immediate monitoring review for this member now?',
      confirm: 'Confirm',
      reviewing: 'Reviewing...',
      individual: 'Individual',
      recruiting: 'Recruiting Institution',
      providing: 'Providing Institution',
      frequency: 'Frequency',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      semiAnnual: 'Semi-Annual',
      watchlist: 'Financial Watchlist',
      license: 'License Register',
      issues: 'Disciplinary Issues',
      litigation: 'Civil Litigation',
      nextReview: 'Next Review',
      lastReview: 'Last Review',
      status: 'Status',
      reviewNow: 'Review Now',
      noGroups: 'No monitoring groups configured',
      noSchedules: 'No monitoring schedules for this group',
      noMembers: 'No members selected',
      membersNoSchedule: 'Members without monitoring schedule',
      close: 'Close',
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed',
      loading: 'Loading...',
    },
    tc: {
      title: '持續監察',
      subtitle: '按用戶群組檢視的高層監察儀表板',
      allStatuses: '所有狀態',
      totalGroups: '群組數量',
      totalMembers: '成員數量',
      groupsWithActive: '有啟用監察的群組',
      dueReviews: '到期審查',
      configureOpen: '設定監察',
      configureTitle: '設定監察',
      groupMode: '群組',
      useExistingGroup: '使用現有群組',
      createNewGroup: '建立新群組',
      selectGroup: '選擇群組...',
      groupName: '群組名稱',
      groupNamePlaceholder: '例如：香港投資團隊',
      groupMembers: '群組成員',
      integrationScope: '整合掃描範圍',
      regulators: '監管機構',
      jurisdictions: '司法管轄區',
      notifications: '告警通知',
      recipients: '收件人（以逗號分隔電郵）',
      channels: '通知方式',
      emailChannel: '電郵',
      inAppChannel: '站內通知',
      notes: '監察備註',
      configure: '套用監察設定',
      groupsTitle: '監察群組',
      inspect: '查看',
      memberCount: '成員',
      scheduleCount: '排程',
      groupStatus: '群組狀態',
      notConfigured: '未設定',
      groupDetails: '群組詳情',
      noGroupSelected: '請先選擇群組查看詳情',
      memberId: '成員編號',
      reviewHistory: '審查歷史',
      requestDate: '請求日期',
      requestSector: '行業',
      integrationResults: '整合結果',
      noHistory: '找不到此成員的審查歷史',
      invalidGroup: '群組設定無效',
      errSelectGroup: '請選擇有效群組。',
      errGroupNameRequired: '請輸入群組名稱。',
      errGroupNameLength: `群組名稱需為 ${GROUP_NAME_MIN}-${GROUP_NAME_MAX} 個字。`,
      errGroupNameInvalid: '群組名稱只可包含字母、數字、空格及 . , & - ( )。',
      errGroupNameExists: '此群組名稱已存在。',
      errMembersRequired: '請至少選擇一名成員。',
      errMembersTooMany: `每個群組最多 ${GROUP_MEMBER_MAX} 名成員。`,
      errMembersDuplicate: '不可重複選擇成員。',
      errMembersInvalid: '包含無效成員，請重新選擇。',
      inspectTitle: '查看群組',
      reviewNowTitle: '立即執行審查',
      reviewNowConfirm: '是否立即為此成員執行監察審查？',
      confirm: '確認',
      reviewing: '審查中...',
      individual: '個人',
      recruiting: '招聘機構',
      providing: '提供機構',
      frequency: '頻率',
      weekly: '每週',
      monthly: '每月',
      quarterly: '每季',
      semiAnnual: '每半年',
      watchlist: '金融觀察名單',
      license: '牌照登記',
      issues: '紀律問題',
      litigation: '民事訴訟',
      nextReview: '下次審查',
      lastReview: '上次審查',
      status: '狀態',
      reviewNow: '立即審查',
      noGroups: '尚未設定監察群組',
      noSchedules: '找不到監察排程',
      noMembers: '未選擇成員',
      membersNoSchedule: '尚未有監察排程的成員',
      close: '關閉',
      active: '啟用中',
      paused: '已暫停',
      completed: '已完成',
      loading: '載入中...',
    },
    zh: {
      title: '持续监控',
      subtitle: '按用户分组查看的高层监控仪表板',
      allStatuses: '所有状态',
      totalGroups: '分组数量',
      totalMembers: '成员数量',
      groupsWithActive: '有启用监控的分组',
      dueReviews: '到期审查',
      configureOpen: '配置监控',
      configureTitle: '配置监控',
      groupMode: '分组',
      useExistingGroup: '使用现有分组',
      createNewGroup: '新建分组',
      selectGroup: '选择分组...',
      groupName: '分组名称',
      groupNamePlaceholder: '例如：香港投资团队',
      groupMembers: '分组成员',
      integrationScope: '整合扫描范围',
      regulators: '监管机构',
      jurisdictions: '司法辖区',
      notifications: '告警通知',
      recipients: '收件人（逗号分隔邮箱）',
      channels: '通知方式',
      emailChannel: '邮件',
      inAppChannel: '站内通知',
      notes: '监控备注',
      configure: '应用监控配置',
      groupsTitle: '监控分组',
      inspect: '查看',
      memberCount: '成员',
      scheduleCount: '排程',
      groupStatus: '分组状态',
      notConfigured: '未配置',
      groupDetails: '分组详情',
      noGroupSelected: '请选择一个分组查看详情',
      memberId: '成员编号',
      reviewHistory: '审查历史',
      requestDate: '请求日期',
      requestSector: '行业',
      integrationResults: '集成结果',
      noHistory: '未找到该成员的审查历史',
      invalidGroup: '分组配置无效',
      errSelectGroup: '请选择有效分组。',
      errGroupNameRequired: '请输入分组名称。',
      errGroupNameLength: `分组名称需为 ${GROUP_NAME_MIN}-${GROUP_NAME_MAX} 个字符。`,
      errGroupNameInvalid: '分组名称仅支持字母、数字、空格及 . , & - ( )。',
      errGroupNameExists: '该分组名称已存在。',
      errMembersRequired: '请至少选择一名成员。',
      errMembersTooMany: `每个分组最多 ${GROUP_MEMBER_MAX} 名成员。`,
      errMembersDuplicate: '不允许重复成员。',
      errMembersInvalid: '存在无效成员，请重新选择。',
      inspectTitle: '查看分组',
      reviewNowTitle: '立即执行审查',
      reviewNowConfirm: '是否立即为该成员执行监控审查？',
      confirm: '确认',
      reviewing: '审查中...',
      individual: '个人',
      recruiting: '招聘机构',
      providing: '提供机构',
      frequency: '频率',
      weekly: '每周',
      monthly: '每月',
      quarterly: '每季',
      semiAnnual: '每半年',
      watchlist: '金融观察名单',
      license: '牌照登记',
      issues: '纪律问题',
      litigation: '民事诉讼',
      nextReview: '下次审查',
      lastReview: '上次审查',
      status: '状态',
      reviewNow: '立即审查',
      noGroups: '尚未配置监控分组',
      noSchedules: '找不到监控排程',
      noMembers: '未选择成员',
      membersNoSchedule: '尚无监控排程的成员',
      close: '关闭',
      active: '启用中',
      paused: '已暂停',
      completed: '已完成',
      loading: '加载中...',
    },
  };

  const t = I18N[lang] || I18N.en;
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [requests, setRequests] = useState([]);
  const [groups, setGroups] = useState(() => readGroups());
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showReviewNowModal, setShowReviewNowModal] = useState(false);
  const [showMemberHistoryModal, setShowMemberHistoryModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState('active');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    group_mode: 'existing',
    group_id: '',
    group_name: '',
    individual_ids: [],
    review_frequency: 'quarterly',
    integrations: ['watchlist'],
    regulators: ['HKMA', 'SFC', 'IA', 'MPFA', 'MAS', 'PBOC', 'CSRC', 'FSA_JP', 'FSS_KR', 'FSC_TW', 'RBI', 'FCA', 'PRA', 'BAFIN', 'AMF_FR', 'CONSOB', 'CNMV', 'AFM_NL', 'FINMA', 'SEC', 'FINRA', 'IIROC', 'CVM_BR', 'CNBV_MX'],
    jurisdictions: ['HK', 'CN', 'SG', 'JP', 'KR', 'TW', 'IN', 'UK', 'DE', 'FR', 'IT', 'ES', 'NL', 'CH', 'US', 'CA', 'BR', 'MX'],
    recipients: '',
    channels: ['in_app'],
    notes: '',
  });

  const loadSchedules = () => {
    setLoading(true);
    Promise.allSettled([
      api.getMonitoringSchedules({ status: statusFilter || 'all' }),
      api.getRequests({ limit: 500 }),
    ])
      .then(([schedulesResult, requestsResult]) => {
        if (schedulesResult.status === 'fulfilled') setSchedules(schedulesResult.value.schedules || []);
        if (requestsResult.status === 'fulfilled') setRequests(requestsResult.value.requests || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadSchedules, [statusFilter]);

  useEffect(() => {
    writeGroups(groups);
  }, [groups]);

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0].group_id);
    }
    if (selectedGroupId && !groups.some((g) => g.group_id === selectedGroupId)) {
      setSelectedGroupId(groups[0]?.group_id || '');
    }
  }, [groups, selectedGroupId]);

  const isReadOnly = ['regulator_admin', 'regulator_viewer', 'auditor'].includes(user.role);

  const individualOptions = Array.from(
    new Map(
      requests
        .filter((req) => req.individual_id)
        .map((req) => [
          req.individual_id,
          {
            individual_id: req.individual_id,
            label: `${req.individual_name || req.individual_id}${req.individual_name_zh ? ` (${req.individual_name_zh})` : ''}`,
          },
        ])
    ).values()
  );

  const individualLookup = new Map(individualOptions.map((item) => [item.individual_id, item.label]));

  const today = new Date().toISOString().split('T')[0];

  const groupsWithMeta = groups
    .map((group) => {
      const uniqueMemberIds = Array.from(new Set(group.individual_ids.filter(Boolean)));
      const groupSchedules = schedules.filter((row) => uniqueMemberIds.includes(row.individual_id));
      const activeCount = groupSchedules.filter((row) => row.status === 'active').length;
      const dueCount = groupSchedules.filter((row) => row.status === 'active' && row.next_review_date && row.next_review_date <= today).length;
      const nextReview = groupSchedules
        .filter((row) => row.next_review_date)
        .sort((a, b) => String(a.next_review_date).localeCompare(String(b.next_review_date)))[0]?.next_review_date || '—';

      const latestScheduleByMember = new Map();
      const sortedSchedules = [...groupSchedules].sort((a, b) => String(b.next_review_date || '').localeCompare(String(a.next_review_date || '')));
      sortedSchedules.forEach((row) => {
        if (!latestScheduleByMember.has(row.individual_id)) {
          latestScheduleByMember.set(row.individual_id, row);
        }
      });

      const memberRows = uniqueMemberIds.map((memberId) => {
        const latest = latestScheduleByMember.get(memberId);
        if (latest) return latest;
        return {
          monitoring_id: `member-${memberId}`,
          individual_id: memberId,
          individual_name: individualLookup.get(memberId) || memberId,
          recruiting_institution_name: '—',
          providing_institution_name: '—',
          review_frequency: '',
          next_review_date: '—',
          last_review_date: null,
          status: 'not_configured',
        };
      });

      let derivedStatus = 'not_configured';
      if (groupSchedules.length > 0) {
        if (activeCount > 0) derivedStatus = 'active';
        else if (groupSchedules.some((row) => row.status === 'paused')) derivedStatus = 'paused';
        else derivedStatus = 'completed';
      }

      return {
        ...group,
        uniqueMemberIds,
        members: uniqueMemberIds.map((id) => ({ individual_id: id, label: individualLookup.get(id) || id })),
        memberRows,
        schedules: groupSchedules,
        activeCount,
        dueCount,
        nextReview,
        derivedStatus,
      };
    })
    .filter((group) => {
      if (!statusFilter) return true;
      return group.schedules.some((row) => row.status === statusFilter);
    });

  const selectedGroup = groupsWithMeta.find((g) => g.group_id === selectedGroupId) || null;
  const selectedMemberLabel = individualLookup.get(selectedMemberId) || selectedMemberId;
  const selectedMemberRequests = requests
    .filter((row) => row.individual_id === selectedMemberId)
    .sort((a, b) => {
      const aDate = a.request_date || a.created_at || '';
      const bDate = b.request_date || b.created_at || '';
      return String(bDate).localeCompare(String(aDate));
    });
  const selectedMemberSchedules = schedules
    .filter((row) => row.individual_id === selectedMemberId)
    .sort((a, b) => String(b.next_review_date || '').localeCompare(String(a.next_review_date || '')));

  const totals = {
    groups: groupsWithMeta.length,
    members: groupsWithMeta.reduce((sum, group) => sum + group.uniqueMemberIds.length, 0),
    activeGroups: groupsWithMeta.filter((group) => group.activeCount > 0).length,
    dueReviews: groupsWithMeta.reduce((sum, group) => sum + group.dueCount, 0),
  };

  const toggleArrayValue = (key, value) => {
    const current = form[key] || [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setForm({ ...form, [key]: next });
  };

  const openConfigureModal = () => {
    setForm((prev) => ({
      ...prev,
      group_mode: groups.length > 0 ? 'existing' : 'new',
      group_id: groups[0]?.group_id || '',
      group_name: '',
      individual_ids: groups[0]?.individual_ids || [],
    }));
    setFormErrors({});
    setShowConfigureModal(true);
  };

  const validateGroupForm = () => {
    const errors = {};
    const validMemberIds = new Set(individualOptions.map((item) => item.individual_id));
    const memberIds = Array.isArray(form.individual_ids) ? form.individual_ids.filter(Boolean) : [];
    const uniqueMemberIds = Array.from(new Set(memberIds));

    if (form.group_mode === 'existing') {
      const target = groups.find((group) => group.group_id === form.group_id);
      if (!target) errors.group_id = t.errSelectGroup;
    } else {
      const normalizedName = normalizeGroupName(form.group_name);
      if (!normalizedName) {
        errors.group_name = t.errGroupNameRequired;
      } else if (normalizedName.length < GROUP_NAME_MIN || normalizedName.length > GROUP_NAME_MAX) {
        errors.group_name = t.errGroupNameLength;
      } else if (!/^[\p{L}\p{N} .,&()\-]+$/u.test(normalizedName)) {
        errors.group_name = t.errGroupNameInvalid;
      } else if (groups.some((group) => normalizeGroupName(group.name).toLowerCase() === normalizedName.toLowerCase())) {
        errors.group_name = t.errGroupNameExists;
      }
    }

    if (memberIds.length === 0) {
      errors.individual_ids = t.errMembersRequired;
    } else if (memberIds.length > GROUP_MEMBER_MAX) {
      errors.individual_ids = t.errMembersTooMany;
    } else if (uniqueMemberIds.length !== memberIds.length) {
      errors.individual_ids = t.errMembersDuplicate;
    } else if (!uniqueMemberIds.every((id) => validMemberIds.has(id))) {
      errors.individual_ids = t.errMembersInvalid;
    }

    setFormErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      uniqueMemberIds,
      normalizedName: normalizeGroupName(form.group_name),
    };
  };

  const upsertGroup = (payload) => {
    if (payload.group_mode === 'existing') {
      const updated = groups.map((group) => (
        group.group_id === payload.group_id
          ? { ...group, individual_ids: payload.individual_ids }
          : group
      ));
      setGroups(updated);
      return payload.group_id;
    }

    const groupId = `group_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const created = {
      group_id: groupId,
      name: normalizeGroupName(payload.group_name),
      individual_ids: payload.individual_ids,
    };
    setGroups([...groups, created]);
    return groupId;
  };

  const handleConfigure = async (e) => {
    e.preventDefault();

    const validation = validateGroupForm();
    if (!validation.isValid) {
      return;
    }

    const isExisting = form.group_mode === 'existing';
    const targetGroup = isExisting
      ? groups.find((group) => group.group_id === form.group_id)
      : null;
    const groupName = isExisting ? targetGroup?.name : validation.normalizedName;

    if (!groupName || !groupName.trim()) {
      alert(t.invalidGroup);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        individual_ids: validation.uniqueMemberIds,
        group_name: validation.normalizedName,
      };

      const updatedGroupId = upsertGroup(payload);
      const result = await api.configureMonitoring({
        individual_ids: validation.uniqueMemberIds,
        review_frequency: form.review_frequency,
        scan_scope: {
          integrations: form.integrations,
          regulators: form.regulators,
          jurisdictions: form.jurisdictions,
        },
        notify: {
          channels: form.channels,
          recipients: form.recipients.split(',').map((x) => x.trim()).filter(Boolean),
        },
        notes: form.notes,
      });

      const createdCount = (result?.created || []).length;
      const skippedCount = (result?.skipped || []).length;
      if (skippedCount > 0) {
        alert(`Configured ${createdCount} members. Skipped ${skippedCount} members without accessible reference requests.`);
      }

      setSelectedGroupId(updatedGroupId);
      setFormErrors({});
      setShowConfigureModal(false);
      loadSchedules();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewNow = async (monitoringId) => {
    try {
      await api.reviewMonitoringSchedule(monitoringId);
      loadSchedules();
    } catch (err) {
      alert(err.message);
    }
  };

  const openInspect = (groupId) => {
    setSelectedGroupId(groupId);
    setShowInspectModal(true);
  };

  const openReviewNow = (item) => {
    setReviewTarget(item);
    setShowReviewNowModal(true);
  };

  const confirmReviewNow = async () => {
    if (!reviewTarget?.monitoring_id) return;
    setReviewSubmitting(true);
    try {
      await handleReviewNow(reviewTarget.monitoring_id);
      setShowReviewNowModal(false);
      setReviewTarget(null);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const openMemberHistory = (individualId) => {
    setSelectedMemberId(individualId);
    setShowMemberHistoryModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div className="toolbar">
        <select className="form-control" style={{ width: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">{t.allStatuses}</option>
          <option value="active">{t.active}</option>
          <option value="paused">{t.paused}</option>
          <option value="completed">{t.completed}</option>
        </select>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={openConfigureModal}>{t.configureOpen}</button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info"><h4>{totals.groups}</h4><p>{t.totalGroups}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-info"><h4>{totals.members}</h4><p>{t.totalMembers}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-info"><h4>{totals.activeGroups}</h4><p>{t.groupsWithActive}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-info"><h4>{totals.dueReviews}</h4><p>{t.dueReviews}</p></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>{t.groupsTitle}</h3></div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading"><div className="spinner" /> {t.loading}</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t.groupName}</th>
                    <th>{t.groupMembers}</th>
                    <th>{t.memberCount}</th>
                    <th>{t.scheduleCount}</th>
                    <th>{t.nextReview}</th>
                    <th>{t.groupStatus}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {groupsWithMeta.map((group) => (
                    <tr key={group.group_id}>
                      <td style={{ fontWeight: 500 }}>{group.name}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {group.members.map((member) => (
                            <button
                              key={member.individual_id}
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ padding: '3px 8px', fontSize: 12 }}
                              onClick={() => openMemberHistory(member.individual_id)}
                            >
                              {member.label}
                            </button>
                          ))}
                          {group.members.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                        </div>
                      </td>
                      <td>{group.uniqueMemberIds.length}</td>
                      <td>{group.memberRows.filter((row) => row.status !== 'not_configured').length}</td>
                      <td>{group.nextReview}</td>
                      <td>
                        <span className={`badge ${group.derivedStatus === 'active' ? 'badge-green' : group.derivedStatus === 'paused' ? 'badge-yellow' : group.derivedStatus === 'completed' ? 'badge-blue' : 'badge-gray'}`}>
                          {group.derivedStatus === 'not_configured' ? t.notConfigured : titleCase(group.derivedStatus)}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => openInspect(group.group_id)}>{t.inspect}</button>
                      </td>
                    </tr>
                  ))}
                  {groupsWithMeta.length === 0 && (
                    <tr>
                      <td colSpan={7} className="empty-state" style={{ padding: 40 }}>{t.noGroups}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showInspectModal && (
        <div className="modal-overlay" onClick={() => setShowInspectModal(false)}>
          <div className="modal" style={{ maxWidth: 1100 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.inspectTitle}{selectedGroup ? ` · ${selectedGroup.name}` : ''}</h3>
              <button className="close-btn" onClick={() => setShowInspectModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: 0 }}>
              {!selectedGroup ? (
                <div className="empty-state">{t.noGroupSelected}</div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>{t.individual}</th>
                        <th>{t.recruiting}</th>
                        <th>{t.providing}</th>
                        <th>{t.frequency}</th>
                        <th>{t.nextReview}</th>
                        <th>{t.lastReview}</th>
                        <th>{t.status}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroup.memberRows.map((item) => (
                        <tr key={item.monitoring_id}>
                          <td style={{ fontWeight: 500 }}>
                            <button
                              type="button"
                              onClick={() => openMemberHistory(item.individual_id)}
                              style={{ border: 'none', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                            >
                              {item.individual_name || individualLookup.get(item.individual_id) || item.individual_id}
                            </button>
                          </td>
                          <td style={{ fontSize: 13 }}>{item.recruiting_institution_name}</td>
                          <td style={{ fontSize: 13 }}>{item.providing_institution_name}</td>
                          <td>{item.review_frequency ? titleCase(item.review_frequency) : '—'}</td>
                          <td>{item.next_review_date}</td>
                          <td>{item.last_review_date || '—'}</td>
                          <td>
                            <span className={`badge ${item.status === 'active' ? 'badge-green' : item.status === 'paused' ? 'badge-yellow' : item.status === 'completed' ? 'badge-blue' : 'badge-gray'}`}>
                              {item.status === 'not_configured' ? t.notConfigured : titleCase(item.status)}
                            </span>
                          </td>
                          <td>
                            {!isReadOnly && item.status === 'active' && !String(item.monitoring_id).startsWith('member-') && (
                              <button className="btn btn-outline btn-sm" onClick={() => openReviewNow(item)}>
                                {t.reviewNow}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {selectedGroup.memberRows.length === 0 && (
                        <tr>
                          <td colSpan={8} className="empty-state" style={{ padding: 40 }}>{t.noSchedules}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowInspectModal(false)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {showReviewNowModal && (
        <div className="modal-overlay" onClick={() => setShowReviewNowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.reviewNowTitle}</h3>
              <button className="close-btn" onClick={() => setShowReviewNowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 12 }}>{t.reviewNowConfirm}</div>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>{t.individual}</label>
                  <div className="value">{reviewTarget?.individual_name || individualLookup.get(reviewTarget?.individual_id) || reviewTarget?.individual_id || '—'}</div>
                </div>
                <div className="detail-item">
                  <label>{t.nextReview}</label>
                  <div className="value">{reviewTarget?.next_review_date || '—'}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowReviewNowModal(false)}>{t.close}</button>
              <button type="button" className="btn btn-primary" onClick={confirmReviewNow} disabled={reviewSubmitting}>
                {reviewSubmitting ? t.reviewing : t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfigureModal && (
        <div className="modal-overlay" onClick={() => setShowConfigureModal(false)}>
          <div className="modal" style={{ maxWidth: 900 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.configureTitle}</h3>
              <button className="close-btn" onClick={() => setShowConfigureModal(false)}>×</button>
            </div>
            <form onSubmit={handleConfigure}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>{t.groupMode}</label>
                    <select
                      className="form-control"
                      value={form.group_mode}
                      onChange={(e) => {
                        const nextMode = e.target.value;
                        const firstGroup = groups[0] || null;
                        setForm({
                          ...form,
                          group_mode: nextMode,
                          group_id: firstGroup?.group_id || '',
                          individual_ids: nextMode === 'existing' && firstGroup ? firstGroup.individual_ids : form.individual_ids,
                        });
                        setFormErrors({});
                      }}
                    >
                      {groups.length > 0 && <option value="existing">{t.useExistingGroup}</option>}
                      <option value="new">{t.createNewGroup}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    {form.group_mode === 'existing' ? (
                      <>
                        <label>{t.selectGroup}</label>
                        <select
                          className="form-control"
                          value={form.group_id}
                          onChange={(e) => {
                            const selected = groups.find((group) => group.group_id === e.target.value);
                            setForm({ ...form, group_id: e.target.value, individual_ids: selected?.individual_ids || [] });
                            setFormErrors((prev) => ({ ...prev, group_id: undefined, individual_ids: undefined }));
                          }}
                        >
                          {groups.map((group) => (
                            <option key={group.group_id} value={group.group_id}>{group.name}</option>
                          ))}
                        </select>
                        {formErrors.group_id && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{formErrors.group_id}</div>}
                      </>
                    ) : (
                      <>
                        <label>{t.groupName}</label>
                        <input
                          className="form-control"
                          value={form.group_name}
                          placeholder={t.groupNamePlaceholder}
                          onChange={(e) => {
                            setForm({ ...form, group_name: e.target.value });
                            setFormErrors((prev) => ({ ...prev, group_name: undefined }));
                          }}
                        />
                        {formErrors.group_name && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{formErrors.group_name}</div>}
                      </>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>{t.groupMembers}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8, maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 12 }}>
                    {individualOptions.map((item) => (
                      <label key={item.individual_id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={form.individual_ids.includes(item.individual_id)}
                          onChange={() => {
                            toggleArrayValue('individual_ids', item.individual_id);
                            setFormErrors((prev) => ({ ...prev, individual_ids: undefined }));
                          }}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                  {formErrors.individual_ids && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{formErrors.individual_ids}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t.frequency}</label>
                    <select className="form-control" value={form.review_frequency} onChange={(e) => setForm({ ...form, review_frequency: e.target.value })}>
                      <option value="weekly">{t.weekly}</option>
                      <option value="monthly">{t.monthly}</option>
                      <option value="quarterly">{t.quarterly}</option>
                      <option value="semi_annual">{t.semiAnnual}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t.recipients}</label>
                    <input className="form-control" value={form.recipients} onChange={(e) => setForm({ ...form, recipients: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t.integrationScope}</label>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {[['watchlist', t.watchlist], ['license', t.license], ['issues', t.issues], ['litigation', t.litigation]].map(([value, label]) => (
                      <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="checkbox" checked={form.integrations.includes(value)} onChange={() => toggleArrayValue('integrations', value)} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t.regulators}</label>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {['HKMA', 'SFC', 'IA', 'MPFA', 'MAS', 'PBOC', 'CSRC', 'FSA_JP', 'FSS_KR', 'FSC_TW', 'RBI', 'FCA', 'PRA', 'BAFIN', 'AMF_FR', 'CONSOB', 'CNMV', 'AFM_NL', 'FINMA', 'SEC', 'FINRA', 'IIROC', 'CVM_BR', 'CNBV_MX'].map((reg) => (
                        <label key={reg} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="checkbox" checked={form.regulators.includes(reg)} onChange={() => toggleArrayValue('regulators', reg)} />
                          {reg}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t.jurisdictions}</label>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {['HK', 'CN', 'SG', 'JP', 'KR', 'TW', 'IN', 'UK', 'DE', 'FR', 'IT', 'ES', 'NL', 'CH', 'US', 'CA', 'BR', 'MX'].map((jur) => (
                        <label key={jur} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="checkbox" checked={form.jurisdictions.includes(jur)} onChange={() => toggleArrayValue('jurisdictions', jur)} />
                          {jur}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t.channels}</label>
                    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="checkbox" checked={form.channels.includes('email')} onChange={() => toggleArrayValue('channels', 'email')} />
                        {t.emailChannel}
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="checkbox" checked={form.channels.includes('in_app')} onChange={() => toggleArrayValue('channels', 'in_app')} />
                        {t.inAppChannel}
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t.notes}</label>
                    <textarea className="form-control" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowConfigureModal(false)}>{t.close}</button>
                <button className="btn btn-primary" type="submit" disabled={submitting || !form.individual_ids.length}>{submitting ? '...' : t.configure}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowMemberHistoryModal(false)}>
          <div className="modal" style={{ maxWidth: 980 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.reviewHistory}</h3>
              <button className="close-btn" onClick={() => setShowMemberHistoryModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid" style={{ marginBottom: 16 }}>
                <div className="detail-item">
                  <label>{t.individual}</label>
                  <div className="value">{selectedMemberLabel || '—'}</div>
                </div>
                <div className="detail-item">
                  <label>{t.memberId}</label>
                  <div className="value">{selectedMemberId || '—'}</div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header"><h3>{t.status}</h3></div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>{t.frequency}</th>
                          <th>{t.nextReview}</th>
                          <th>{t.lastReview}</th>
                          <th>{t.status}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMemberSchedules.map((item) => (
                          <tr key={item.monitoring_id}>
                            <td>{titleCase(item.review_frequency)}</td>
                            <td>{item.next_review_date || '—'}</td>
                            <td>{item.last_review_date || '—'}</td>
                            <td><span className="badge badge-blue">{titleCase(item.status)}</span></td>
                          </tr>
                        ))}
                        {selectedMemberSchedules.length === 0 && (
                          <tr>
                            <td colSpan={4} className="empty-state" style={{ padding: 24 }}>{t.noSchedules}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3>{t.integrationResults}</h3></div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>{t.requestDate}</th>
                          <th>{t.requestSector}</th>
                          <th>{t.status}</th>
                          <th>{t.recruiting}</th>
                          <th>{t.providing}</th>
                          <th>{t.integrationResults}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMemberRequests.map((item) => {
                          const summary = item.integration_snapshot?.summary || {};
                          return (
                            <tr key={item.request_id}>
                              <td>{item.request_date || '—'}</td>
                              <td>{titleCase(item.request_sector)}</td>
                              <td><span className="badge badge-gray">{titleCase(item.status)}</span></td>
                              <td style={{ fontSize: 13 }}>{item.recruiting_institution_name || '—'}</td>
                              <td style={{ fontSize: 13 }}>{item.providing_institution_name || '—'}</td>
                              <td style={{ fontSize: 12 }}>
                                W:{summary.watchlist_hits ?? 0} · L:{summary.license_matches ?? 0} · I:{summary.issue_hits ?? 0} · C:{summary.litigation_hits ?? 0}
                              </td>
                            </tr>
                          );
                        })}
                        {selectedMemberRequests.length === 0 && (
                          <tr>
                            <td colSpan={6} className="empty-state" style={{ padding: 24 }}>{t.noHistory}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowMemberHistoryModal(false)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
