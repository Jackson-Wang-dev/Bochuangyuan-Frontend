// ─── Domain Types ────────────────────────────────────────────────────────────

export type MaturityLevel = '概念' | '原型' | '小试' | '中试' | '量产'

export interface ProjectV2 {
  id: string
  // Identity
  displayName: string
  officialName: string
  track: string
  coreTech: string
  relatedEnterprise: string
  teamLead: string
  // Growth dimensions
  teamSize: number
  fundingAmount: number   // 万元
  patentCount: number
  maturityLevel: MaturityLevel
  businessScope: string[]
  // Reusable content blocks
  briefIntro: string
  leaderInfo: string
  teamMembersDesc: string
  honors: string
  papers: string
  personalStatement: string
  // Attachments
  pdfFiles: { name: string; size: string }[]
  otherMaterials: { name: string; size: string }[]
  // Timeline
  events: ProjectEvent[]
  // Meta
  createdAt: string
  updatedAt: string
}

export interface GrowthSnapshot {
  teamSize: number
  fundingAmount: number
  patentCount: number
  maturityLevel: MaturityLevel
  businessScope: string[]
}

export interface FieldChange {
  field: string
  label: string
  oldValue: string
  newValue: string
}

export interface ProjectEvent {
  id: string
  type: '维护编辑' | '报名'
  timestamp: string
  description: string
  changes?: FieldChange[]
  registrationId?: string
  snapshot: GrowthSnapshot
}

export interface CompetitionPhase {
  label: string
  status: 'completed' | 'active' | 'upcoming'
  date?: string
  description?: string
}

export interface RegistrationInstance {
  id: string
  projectId: string
  competitionId: string
  competitionName: string
  track: string
  filledContent: Record<string, string>
  submittedFiles?: { name: string; size: string }[]
  submittedAt: string
  status: '待审核' | '通过' | '淘汰' | '已撤回'
  phases: CompetitionPhase[]
}

export interface TemplateField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select'
  required: boolean
  projectFieldKey?: keyof ProjectV2
  options?: string[]
  placeholder?: string
}

export interface CompetitionTemplate {
  id: string
  name: string
  summary: string
  track: string
  deadline: string
  status: '报名中' | '进行中' | '已结束'
  fields: TemplateField[]
}

// ─── Mock Projects ────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: ProjectV2[] = [
  {
    id: 'nvmed-001',
    displayName: 'NovaMed AI 辅助诊断',
    officialName: '基于大模型的医学影像 AI 辅助诊断系统',
    track: '医疗健康',
    coreTech: '大语言模型、医学影像深度学习（US12345678）',
    relatedEnterprise: 'NovaMed 医疗科技有限公司',
    teamLead: '陈博士',
    teamSize: 15,
    fundingAmount: 500,
    patentCount: 3,
    maturityLevel: '中试',
    businessScope: ['医学影像', 'AI 诊断', '电子病历'],
    briefIntro:
      'NovaMed AI 辅助诊断系统利用大语言模型与医学影像深度学习技术，为医生提供实时、高精度的影像解读辅助，覆盖胸部 CT、病理切片等主要场景，误诊率较传统方法降低 43%。',
    leaderInfo:
      '陈博士，医学影像 AI 领域 15 年经验，曾任职某三甲医院影像科主任，博士毕业于清华大学生物医学工程系。',
    teamMembersDesc:
      '团队共 15 人，含 5 名临床医学博士、4 名 AI 算法工程师、3 名全栈工程师及运营推广人员。',
    honors: '2024 年第三届全国医疗 AI 创新大赛一等奖；国家重点研发计划项目承担单位；入选工信部"专精特新"培育名单。',
    papers:
      'Chen et al., "LLM-Enhanced Chest CT Interpretation", Nature Medicine 2025; 陈某某等，《大模型辅助病理诊断的临床研究》，中华医学杂志 2024。',
    personalStatement:
      '我们相信 AI 不是取代医生，而是成为医生的"超级助手"。每一张影像背后都是一个生命，我们的目标是让每一位患者都能享受到顶级影像专家的水准。',
    pdfFiles: [
      { name: 'NovaMed_BP_v3.pdf', size: '4.2 MB' },
      { name: '专利证书_US12345678.pdf', size: '1.1 MB' },
    ],
    otherMaterials: [{ name: '产品演示视频链接.txt', size: '1 KB' }],
    createdAt: '2024-09-01T10:00:00',
    updatedAt: '2026-01-20T10:00:00',
    events: [
      {
        id: 'ev-nm-1',
        type: '维护编辑',
        timestamp: '2024-09-01T10:00:00',
        description: '创建项目',
        snapshot: { teamSize: 6, fundingAmount: 0, patentCount: 0, maturityLevel: '概念', businessScope: ['医学影像'] },
      },
      {
        id: 'ev-nm-2',
        type: '报名',
        timestamp: '2024-11-15T14:00:00',
        description: '报名第三届全国医疗 AI 创新大赛',
        registrationId: 'reg-001',
        snapshot: { teamSize: 8, fundingAmount: 50, patentCount: 0, maturityLevel: '原型', businessScope: ['医学影像', 'AI 诊断'] },
      },
      {
        id: 'ev-nm-3',
        type: '维护编辑',
        timestamp: '2025-01-20T09:00:00',
        description: '更新团队与融资信息，系统进入小试阶段',
        changes: [
          { field: 'teamSize', label: '团队规模', oldValue: '8 人', newValue: '10 人' },
          { field: 'fundingAmount', label: '融资额', oldValue: '50 万', newValue: '200 万' },
          { field: 'patentCount', label: '专利数', oldValue: '0 项', newValue: '1 项' },
          { field: 'maturityLevel', label: '成熟度', oldValue: '原型', newValue: '小试' },
        ],
        snapshot: { teamSize: 10, fundingAmount: 200, patentCount: 1, maturityLevel: '小试', businessScope: ['医学影像', 'AI 诊断', '电子病历'] },
      },
      {
        id: 'ev-nm-4',
        type: '报名',
        timestamp: '2025-03-10T11:00:00',
        description: '报名全国高校人工智能创新大赛',
        registrationId: 'reg-002',
        snapshot: { teamSize: 10, fundingAmount: 200, patentCount: 1, maturityLevel: '小试', businessScope: ['医学影像', 'AI 诊断', '电子病历'] },
      },
      {
        id: 'ev-nm-5',
        type: '维护编辑',
        timestamp: '2025-08-05T15:00:00',
        description: '3 项发明专利获批，产品进入中试阶段',
        changes: [
          { field: 'patentCount', label: '专利数', oldValue: '1 项', newValue: '3 项' },
          { field: 'maturityLevel', label: '成熟度', oldValue: '小试', newValue: '中试' },
        ],
        snapshot: { teamSize: 10, fundingAmount: 200, patentCount: 3, maturityLevel: '中试', businessScope: ['医学影像', 'AI 诊断', '电子病历'] },
      },
      {
        id: 'ev-nm-6',
        type: '维护编辑',
        timestamp: '2026-01-20T10:00:00',
        description: '完成 A 轮融资 500 万，团队扩张至 15 人',
        changes: [
          { field: 'teamSize', label: '团队规模', oldValue: '10 人', newValue: '15 人' },
          { field: 'fundingAmount', label: '融资额', oldValue: '200 万', newValue: '500 万' },
        ],
        snapshot: { teamSize: 15, fundingAmount: 500, patentCount: 3, maturityLevel: '中试', businessScope: ['医学影像', 'AI 诊断', '电子病历'] },
      },
    ],
  },

  {
    id: 'greenenergy-002',
    displayName: '绿枫能源监控平台',
    officialName: '基于物联网的绿色能源监控与调度平台',
    track: '新能源',
    coreTech: 'IoT 传感网络、大数据实时分析',
    relatedEnterprise: '绿枫科技有限公司',
    teamLead: '王工',
    teamSize: 8,
    fundingAmount: 80,
    patentCount: 1,
    maturityLevel: '原型',
    businessScope: ['能源监控', '碳排放', '可再生能源'],
    briefIntro:
      '绿枫平台通过部署低成本 IoT 传感节点，对分布式光伏、风电等绿色能源站点进行实时监控与智能调度，帮助企业降低碳排放并提升能源利用效率。',
    leaderInfo: '王工，电气工程博士，曾主导国家电网智能电表项目，拥有分布式能源系统设计 10 年经验。',
    teamMembersDesc: '团队 8 人，含 3 名物联网工程师、2 名数据科学家、1 名产品经理及 2 名市场人员。',
    honors: '2025 年省级创业大赛优秀奖；入选省级绿色科技企业培育库。',
    papers: '王某某等，《基于 IoT 的分布式光伏实时调度算法研究》，电力系统自动化 2025。',
    personalStatement: '让每一度绿色电能都被最大化利用，是我们团队的使命。',
    pdfFiles: [{ name: '绿枫能源_商业计划书.pdf', size: '3.0 MB' }],
    otherMaterials: [],
    createdAt: '2025-06-01T09:00:00',
    updatedAt: '2026-05-01T11:00:00',
    events: [
      {
        id: 'ev-ge-1',
        type: '维护编辑',
        timestamp: '2025-06-01T09:00:00',
        description: '创建项目',
        snapshot: { teamSize: 4, fundingAmount: 0, patentCount: 0, maturityLevel: '概念', businessScope: ['能源监控'] },
      },
      {
        id: 'ev-ge-2',
        type: '维护编辑',
        timestamp: '2025-09-15T14:00:00',
        description: '原型系统完成，获天使轮融资 80 万',
        changes: [
          { field: 'teamSize', label: '团队规模', oldValue: '4 人', newValue: '8 人' },
          { field: 'fundingAmount', label: '融资额', oldValue: '0', newValue: '80 万' },
          { field: 'patentCount', label: '专利数', oldValue: '0 项', newValue: '1 项' },
          { field: 'maturityLevel', label: '成熟度', oldValue: '概念', newValue: '原型' },
        ],
        snapshot: { teamSize: 8, fundingAmount: 80, patentCount: 1, maturityLevel: '原型', businessScope: ['能源监控', '碳排放'] },
      },
      {
        id: 'ev-ge-3',
        type: '报名',
        timestamp: '2026-05-01T11:00:00',
        description: '报名绿色能源与可持续发展大赛',
        registrationId: 'reg-003',
        snapshot: { teamSize: 8, fundingAmount: 80, patentCount: 1, maturityLevel: '原型', businessScope: ['能源监控', '碳排放', '可再生能源'] },
      },
    ],
  },

  {
    id: 'cityai-003',
    displayName: '城市智脑交通系统',
    officialName: '智慧城市交通大脑 AI 调度平台',
    track: '智慧城市',
    coreTech: '强化学习、边缘计算',
    relatedEnterprise: '',
    teamLead: '李同学',
    teamSize: 4,
    fundingAmount: 0,
    patentCount: 0,
    maturityLevel: '概念',
    businessScope: ['交通调度', '智慧城市'],
    briefIntro: '利用强化学习算法对城市路口信号灯进行实时优化调度，目标在模拟场景下将平均等待时间降低 35%。',
    leaderInfo: '李同学，计算机科学博士在读，研究方向为多智能体强化学习。',
    teamMembersDesc: '团队 4 人：1 名算法方向博士生、1 名前端开发、1 名后端开发、1 名城市交通领域顾问。',
    honors: '暂无。',
    papers: '李某某等，《基于 MARL 的城市交通信号协同优化》（预印本），2026。',
    personalStatement: '我们希望用 AI 让城市出行更顺畅，让每位司机少等一分钟。',
    pdfFiles: [],
    otherMaterials: [{ name: '项目概念PPT.pptx', size: '5.6 MB' }],
    createdAt: '2026-03-15T10:00:00',
    updatedAt: '2026-04-20T14:00:00',
    events: [
      {
        id: 'ev-ca-1',
        type: '维护编辑',
        timestamp: '2026-03-15T10:00:00',
        description: '创建项目',
        snapshot: { teamSize: 4, fundingAmount: 0, patentCount: 0, maturityLevel: '概念', businessScope: ['交通调度'] },
      },
      {
        id: 'ev-ca-2',
        type: '维护编辑',
        timestamp: '2026-04-20T14:00:00',
        description: '完成市场调研与可行性分析报告',
        changes: [
          { field: 'businessScope', label: '业务范围', oldValue: '交通调度', newValue: '交通调度, 智慧城市' },
        ],
        snapshot: { teamSize: 4, fundingAmount: 0, patentCount: 0, maturityLevel: '概念', businessScope: ['交通调度', '智慧城市'] },
      },
    ],
  },
]

// ─── Mock Registration Instances ─────────────────────────────────────────────

export const MOCK_REGISTRATIONS: RegistrationInstance[] = [
  {
    id: 'reg-001',
    projectId: 'nvmed-001',
    competitionId: 'comp-ext-1',
    competitionName: '第三届全国医疗 AI 创新大赛',
    track: '医疗 AI',
    submittedAt: '2024-11-15T14:00:00',
    status: '通过',
    filledContent: {
      projectName: 'NovaMed AI 辅助诊断',
      officialName: '基于大模型的医学影像 AI 辅助诊断系统',
      teamSize: '8',
      briefIntro: 'NovaMed AI 辅助诊断系统利用大语言模型，为医生提供实时、高精度的影像解读辅助，覆盖胸部 CT、病理切片等主要场景，误诊率较传统方法降低 43%。',
      coreTech: '大语言模型、医学影像深度学习',
    },
    submittedFiles: [
      { name: 'NovaMed_BP_v1.pdf', size: '3.5 MB' },
      { name: '团队介绍.pdf', size: '0.8 MB' },
    ],
    phases: [
      { label: '报名受理', status: 'completed', date: '2024-11-15', description: '报名资料审核通过，获得参赛资格' },
      { label: '初赛评审', status: 'completed', date: '2024-12-10', description: '书面评审通过，晋级复赛' },
      { label: '复赛路演', status: 'completed', date: '2025-01-25', description: '现场路演 10 分钟 + 问答 5 分钟，评委评分排名第 2' },
      { label: '决赛颁奖', status: 'completed', date: '2025-02-28', description: '荣获一等奖，奖金 20 万元' },
    ],
  },
  {
    id: 'reg-002',
    projectId: 'nvmed-001',
    competitionId: 'comp-001',
    competitionName: '全国高校人工智能创新大赛',
    track: '人工智能',
    submittedAt: '2025-03-10T11:00:00',
    status: '待审核',
    filledContent: {
      projectName: 'NovaMed AI 辅助诊断',
      officialName: '基于大模型的医学影像 AI 辅助诊断系统',
      teamSize: '10',
      briefIntro: 'NovaMed AI 辅助诊断系统利用大语言模型与医学影像深度学习技术，为医生提供高精度的影像解读辅助，已在 3 家三甲医院完成小试部署。',
      coreTech: '大语言模型、医学影像深度学习（US12345678）',
      teamMembersDesc: '团队共 10 人，含 4 名临床医学博士、3 名 AI 算法工程师、3 名全栈工程师',
      honors: '2024 年第三届全国医疗 AI 创新大赛一等奖',
      fundingAmount: '200',
    },
    submittedFiles: [
      { name: 'NovaMed_BP_v2.pdf', size: '4.0 MB' },
      { name: '专利证书_US12345678.pdf', size: '1.1 MB' },
    ],
    phases: [
      { label: '报名受理', status: 'completed', date: '2025-03-10', description: '报名材料提交成功，进入审核队列' },
      { label: '初赛评审', status: 'active', date: '2025-04-01', description: '评委正在评审中，结果预计 4 月下旬公布' },
      { label: '复赛路演', status: 'upcoming', date: '2025-05-20' },
      { label: '决赛颁奖', status: 'upcoming', date: '2025-06-28' },
    ],
  },
  {
    id: 'reg-003',
    projectId: 'greenenergy-002',
    competitionId: 'comp-002',
    competitionName: '绿色能源与可持续发展大赛',
    track: '新能源',
    submittedAt: '2026-05-01T11:00:00',
    status: '待审核',
    filledContent: {
      projectName: '绿枫能源监控平台',
      officialName: '基于物联网的绿色能源监控与调度平台',
      teamSize: '8',
      briefIntro: '绿枫平台通过部署低成本 IoT 传感节点，对分布式光伏、风电等绿色能源站点进行实时监控与智能调度，帮助企业降低碳排放并提升能源利用效率。',
      personalStatement: '让每一度绿色电能都被最大化利用，是我们团队的使命。',
    },
    submittedFiles: [
      { name: '绿枫能源_商业计划书.pdf', size: '3.0 MB' },
    ],
    phases: [
      { label: '报名受理', status: 'active', date: '2026-05-01', description: '报名材料已提交，等待赛事方确认（预计 3 个工作日）' },
      { label: '初赛评审', status: 'upcoming', date: '2026-06-15' },
      { label: '复赛路演', status: 'upcoming', date: '2026-07-20' },
      { label: '决赛颁奖', status: 'upcoming', date: '2026-08-10' },
    ],
  },
]

// ─── Mock Competition Templates ───────────────────────────────────────────────

export const MOCK_COMPETITIONS: CompetitionTemplate[] = [
  {
    id: 'comp-001',
    name: '全国高校人工智能创新大赛',
    summary: '面向全国高校在校学生及应届毕业生，聚焦 AI 技术在各垂直领域的落地创新。',
    track: '人工智能',
    deadline: '2026-07-31',
    status: '报名中',
    fields: [
      { key: 'projectName',      label: '项目展示名',   type: 'text',     required: true,  projectFieldKey: 'displayName',      placeholder: '面向评委的简短展示名称' },
      { key: 'officialName',     label: '正式申报名称', type: 'text',     required: true,  projectFieldKey: 'officialName',     placeholder: '与申报材料一致的完整名称' },
      { key: 'teamSize',         label: '当前团队人数', type: 'number',   required: true,  projectFieldKey: 'teamSize',         placeholder: '含兼职' },
      { key: 'briefIntro',       label: '项目简介',     type: 'textarea', required: true,  projectFieldKey: 'briefIntro',       placeholder: '300 字以内' },
      { key: 'coreTech',         label: '核心技术',     type: 'textarea', required: true,  projectFieldKey: 'coreTech',         placeholder: '核心算法/专利/技术壁垒' },
      { key: 'teamMembersDesc',  label: '团队成员描述', type: 'textarea', required: false, projectFieldKey: 'teamMembersDesc',  placeholder: '主要成员背景' },
      { key: 'honors',           label: '荣誉获奖',     type: 'textarea', required: false, projectFieldKey: 'honors',           placeholder: '相关获奖经历' },
      { key: 'fundingAmount',    label: '已融资额（万元）', type: 'number', required: false, projectFieldKey: 'fundingAmount',  placeholder: '无融资填 0' },
    ],
  },
  {
    id: 'comp-002',
    name: '绿色能源与可持续发展大赛',
    summary: '聚焦清洁能源、碳中和、循环经济等赛道，鼓励技术与商业模式创新。',
    track: '新能源',
    deadline: '2026-08-15',
    status: '报名中',
    fields: [
      { key: 'projectName',     label: '项目展示名',   type: 'text',     required: true,  projectFieldKey: 'displayName',     placeholder: '' },
      { key: 'officialName',    label: '正式申报名称', type: 'text',     required: true,  projectFieldKey: 'officialName',    placeholder: '' },
      { key: 'teamSize',        label: '团队规模',     type: 'number',   required: true,  projectFieldKey: 'teamSize',        placeholder: '' },
      { key: 'briefIntro',      label: '项目简介',     type: 'textarea', required: true,  projectFieldKey: 'briefIntro',      placeholder: '' },
      { key: 'personalStatement', label: '个人陈述',   type: 'textarea', required: false, projectFieldKey: 'personalStatement', placeholder: '创业初心与愿景' },
    ],
  },
  {
    id: 'comp-003',
    name: '工业 4.0 数字化转型大赛',
    summary: '聚焦智能制造、工业互联网、数字孪生等方向，面向企业级解决方案。',
    track: '智慧城市',
    deadline: '2026-05-30',
    status: '进行中',
    fields: [
      { key: 'projectName', label: '项目名称', type: 'text',     required: true,  projectFieldKey: 'displayName', placeholder: '' },
      { key: 'briefIntro',  label: '项目简介', type: 'textarea', required: true,  projectFieldKey: 'briefIntro',  placeholder: '' },
    ],
  },
]

// ─── Pre-set PDF Extraction Result (simulated) ────────────────────────────────

export const PDF_EXTRACTION_PRESET: Partial<ProjectV2> = {
  displayName: '智慧供应链优化系统',
  officialName: '基于图神经网络的智慧供应链端到端优化平台',
  track: '智慧物流',
  coreTech: '图神经网络（GNN）、多目标优化算法（ZL202410001234.5）',
  relatedEnterprise: '',
  teamLead: '',
  teamSize: 6,
  fundingAmount: 0,
  patentCount: 1,
  maturityLevel: '原型',
  businessScope: ['供应链优化', '物流调度'],
  briefIntro:
    '本系统利用图神经网络对供应链中的多节点关系进行建模，实现货物调配与路径规划的端到端优化，目标将整体物流成本降低 28%。',
  leaderInfo: '',
  teamMembersDesc: '',
  honors: '',
  papers: '',
  personalStatement: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const MATURITY_SCORE: Record<MaturityLevel, number> = {
  概念: 20,
  原型: 40,
  小试: 60,
  中试: 80,
  量产: 100,
}

export function projectToRadar(p: ProjectV2) {
  return [
    { subject: '团队规模', value: Math.min(Math.round((p.teamSize / 20) * 100), 100), fullMark: 100 },
    { subject: '融资额',   value: Math.min(Math.round((p.fundingAmount / 1000) * 100), 100), fullMark: 100 },
    { subject: '专利数',   value: Math.min(Math.round((p.patentCount / 10) * 100), 100), fullMark: 100 },
    { subject: '成熟度',   value: MATURITY_SCORE[p.maturityLevel], fullMark: 100 },
    { subject: '业务广度', value: Math.min(Math.round((p.businessScope.length / 5) * 100), 100), fullMark: 100 },
  ]
}

export function snapshotToRadar(s: GrowthSnapshot) {
  return [
    { subject: '团队规模', value: Math.min(Math.round((s.teamSize / 20) * 100), 100), fullMark: 100 },
    { subject: '融资额',   value: Math.min(Math.round((s.fundingAmount / 1000) * 100), 100), fullMark: 100 },
    { subject: '专利数',   value: Math.min(Math.round((s.patentCount / 10) * 100), 100), fullMark: 100 },
    { subject: '成熟度',   value: MATURITY_SCORE[s.maturityLevel], fullMark: 100 },
    { subject: '业务广度', value: Math.min(Math.round((s.businessScope.length / 5) * 100), 100), fullMark: 100 },
  ]
}

export function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
