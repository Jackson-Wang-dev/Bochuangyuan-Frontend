// ─── Primitive Enums ─────────────────────────────────────────────────────────

export type IdType =
  | '居民身份证'
  | '护照'
  | '港澳居民来往内地通行证'
  | '台湾居民来往大陆通行证'
  | '外国人永久居留证'

export type DegreeLevel = '专科' | '本科' | '硕士' | '博士' | '博士后' | '其他'

export type WorkNature = '全职' | '兼职' | '创业' | '其他'

export type MemberType = '带头人' | '核心成员' | '一般成员' | '顾问'

export type ProjectSource = '国家级' | '省部级' | '市厅级' | '横向' | '自主' | '其他'

export type PatentType = '发明专利' | '实用新型专利' | '外观设计专利' | 'PCT专利' | '其他'

export type PatentStatus = '已授权' | '申请中' | '已转让'

export type ReportType = '特邀报告' | '口头报告' | '海报展示' | '其他'

export type RegistrationStatus =
  | '草稿'
  | '待提交'
  | '待审核'
  | '审核通过'
  | '审核不通过'
  | '已晋级'
  | '已淘汰'
  | '已撤回'

// ─── Collection Item Base ─────────────────────────────────────────────────────

/** 所有结构化集合条目的基类，_id 用于 diff 时按条目追踪变更 */
export interface CollectionItem {
  _id: string
}

// ─── 1. 团队成员 TeamMember ───────────────────────────────────────────────────

export interface TeamMember extends CollectionItem {
  memberType: MemberType
  name: string
  idType: IdType
  idNumber: string             // 证件号（需验证）
  phone: string
  birthDate: string            // YYYY-MM-DD
  age: number                  // 年龄（由 birthDate 派生，保存快照时固化）
  nationality: string          // 国籍
  division: string             // 分工
  background: string           // 背景简介
}

// ─── 2. 教育经历 Education ────────────────────────────────────────────────────

export interface Education extends CollectionItem {
  country: string
  isFullTime: boolean          // 是否全日制
  startDate: string            // YYYY-MM
  endDate: string              // YYYY-MM
  institution: string          // 院校名称
  major: string                // 专业
  educationLevel: DegreeLevel  // 学历
  degreeLevel: DegreeLevel     // 学位
  isHighestDegree: boolean     // 是否最高学位
}

// ─── 3. 工作经历 Work ─────────────────────────────────────────────────────────

export interface Work extends CollectionItem {
  country: string
  startDate: string            // YYYY-MM
  endDate: string | null       // null = 至今
  organization: string         // 单位名称
  position: string             // 职务
  workNature: WorkNature
  isLastBeforeComeToNingbo: boolean    // 来宁前最后工作单位（来宁 = 原"来甬"）
  isLastBeforeReturnFromAbroad: boolean // 回国前最后工作单位
}

// ─── 4. 主要项目 MajorProject ─────────────────────────────────────────────────

export interface MajorProject extends CollectionItem {
  projectName: string
  startDate: string            // YYYY-MM
  endDate: string              // YYYY-MM
  source: ProjectSource        // 项目来源
  undertakingUnit: string      // 承接单位
  totalFunding: number         // 经费总额（万元）
  personalRole: string         // 本人角色
}

// ─── 5. 代表性论文 Paper ──────────────────────────────────────────────────────

export interface Paper extends CollectionItem {
  title: string
  authors: string              // 作者（按原文顺序）
  journal: string              // 发表载体（期刊/会议名）
  personalRank: number         // 本人排名
  totalAuthors: number         // 作者总数
  publishDate: string          // YYYY-MM
  impactFactor: number | null  // 影响因子（null = 未收录/不适用）
  isCorrespondingAuthor: boolean // 是否通讯作者
}

// ─── 6. 代表性专利 Patent ─────────────────────────────────────────────────────

export interface Patent extends CollectionItem {
  patentType: PatentType
  name: string
  authorizedCountry: string    // 授权国家
  patentNumber: string         // 专利号（需验证）
  personalRank: number         // 本人排名
  totalInventors: number       // 发明人总数
  authorizedDate: string       // 授权时间 YYYY-MM
  status: PatentStatus
  /** 需平台附件验证后方计入雷达/真实展示 */
  isVerified: boolean
}

// ─── 7. 软件著作权 SoftwareCopyright ─────────────────────────────────────────

export interface SoftwareCopyright extends CollectionItem {
  softwareName: string         // 软件全称
  authorizedCountry: string
  registrationNumber: string   // 登记号
  copyrightHolder: string      // 著作权人
  approvalDate: string         // 登记批准日期 YYYY-MM-DD
}

// ─── 8. 主要产品 Product ──────────────────────────────────────────────────────

export interface Product extends CollectionItem {
  productName: string
  relyingUnit: string          // 依托单位
  launchDate: string           // 上市时间 YYYY-MM
  /** 影响力与个人贡献，≤100字 */
  impactAndContribution: string
}

// ─── 9. 奖励表彰 Award ────────────────────────────────────────────────────────

export interface Award extends CollectionItem {
  awardDate: string            // 获奖时间 YYYY-MM
  awardName: string
  awardingBody: string         // 颁奖单位
  personalRank: number         // 本人排序
}

// ─── 10. 代表性著作 Book ──────────────────────────────────────────────────────

export interface Book extends CollectionItem {
  title: string
  publishYear: number
  personalRank: number
  totalAuthors: number
  publisher: string            // 出版社
  publishPlace: string         // 出版地
}

// ─── 11. 学术会议报告 ConferenceReport ───────────────────────────────────────

export interface ConferenceReport extends CollectionItem {
  title: string
  year: number
  personalRank: number
  totalPresenters: number
  conferenceName: string
  reportType: ReportType
}

// ─── 12. 学术任职 AcademicPosition ───────────────────────────────────────────

export interface AcademicPosition extends CollectionItem {
  organizationOrJournal: string // 组织/期刊名称
  position: string
  tenureStart: string           // YYYY-MM
  tenureEnd: string | null      // null = 至今
}

// ─── 13. 异地创办企业 FoundedCompany ─────────────────────────────────────────

export interface FoundedCompany extends CollectionItem {
  companyName: string
  personalRole: string         // 本人角色（如：创始人/股东）
  personalPosition: string     // 本人职务（如：CEO）
  companyInfo: string          // 企业情况（规模、业务等）
  relationToNingboCompany: string // 与宁波公司关系
}

// ─── 14. 阶段性目标 ProjectStage ─────────────────────────────────────────────

export interface ProjectStage extends CollectionItem {
  stageLabel: string           // 阶段名称（如：第一阶段）
  startDate: string            // YYYY-MM
  endDate: string              // YYYY-MM
  plannedInvestment: number    // 预计投入（万元）
  stageGoal: string            // 阶段性目标
}

// ─── 15. 单位荣誉 OrgHonor ───────────────────────────────────────────────────

export interface OrgHonor extends CollectionItem {
  awardDate: string            // 获得时间 YYYY-MM
  honorName: string
  issuingDepartment: string    // 颁发部门
}

// ─── Applicant 申报人（带头人）───────────────────────────────────────────────

export interface Applicant {
  // ── 基本信息（申报书第一章）──────────────────────────────────────────────
  name: string                       // 姓名（中文）
  nameEn: string                     // 英文姓名
  nameNative: string                 // 本国语言姓名（外籍填）
  gender: '男' | '女' | '其他'
  birthDate: string                  // YYYY-MM-DD
  birthPlace: string                 // 出生地区
  nationality: string                // 国籍（地区）
  isEthnicChinese: boolean           // 是否华裔（仅非中国籍填写）
  idType: IdType
  idNumber: string                   // 证件号码 [需验证]
  idExpiry: string                   // 证件有效期 YYYY-MM-DD
  phone: string                      // 本人手机号
  email: string
  highestDegree: DegreeLevel         // 最高学位
  highestDegreeInstitution: string   // 毕业院校
  highestDegreeMajor: string         // 所学专业

  // 到岗信息
  isFullTimeOnBoarded: boolean       // 是否已全职到岗
  intendedPosition: string           // （拟任）职务
  plannedArrivalDate: string         // （拟）到岗时间 YYYY-MM-DD
  laborContractStart: string         // 劳动合同开始 YYYY-MM-DD
  laborContractEnd: string           // 劳动合同结束 YYYY-MM-DD

  // 来宁/回国信息
  /** 来宁时间（来宁 = 原"来甬"，宁波平台统一用语） */
  comeToNingboDate: string           // YYYY-MM
  /** 来宁前单位及职务（文本补充，结构化明细在 works[] 中） */
  lastOrgBeforeComeToNingbo: string
  returnFromAbroadDate: string       // （拟）回国时间 YYYY-MM（海外人才填）
  /** 回国前单位及职务（文本补充，结构化明细在 works[] 中） */
  lastOrgBeforeReturnFromAbroad: string

  // 荣誉与法律声明
  honorsCertificates: string         // 曾获荣誉（文本）
  legalIssues: {
    hasIssue: boolean                // 有无涉法涉诉/知识产权纠纷/竞业禁止等
    description: string              // 如有，简要说明
  }

  // ── 个人陈述（申报书第五章）─────────────────────────────────────────────
  personalBrief: string              // 个人简要介绍 ≤500字
  achievementsSummary: string        // 过往主要业绩简述 ≤1000字
  hasEntrepreneurExperience: boolean // 有无创业经历

  // ── 结构化集合（申报书第二至五章各子章节）──────────────────────────────
  educations: Education[]
  works: Work[]
  majorProjects: MajorProject[]
  papers: Paper[]
  patents: Patent[]
  softwareCopyrights: SoftwareCopyright[]
  products: Product[]
  awards: Award[]
  books: Book[]
  conferenceReports: ConferenceReport[]
  academicPositions: AcademicPosition[]
  foundedCompanies: FoundedCompany[]
}

// ─── OrgInfo 用人单位信息 ─────────────────────────────────────────────────────

export interface OrgInfo {
  name: string                 // 单位全称
  orgType: string              // 单位类型（如：有限责任公司）
  creditCode: string           // 统一社会信用代码
  establishedDate: string      // 成立时间 YYYY-MM
  registeredCapital: number    // 注册资本（万元）
  totalEmployees: number       // 员工总数
  address: string
  contactPerson: string        // 联系人
  contactPhone: string         // 联系人手机

  orgBrief: string             // 用人单位简介 ≤500字

  // 研发能力（需验证，计入成熟度分值）
  rdExpenditure: number        // 年研发投入（万元）
  rdRevenueRatio: number       // 研发经费占主营收入比重（%）
  rdPersonnelCount: number     // 研发人员数
  /** 截至上年度末发明专利数量 [需验证] */
  orgInventionPatentCount: number

  // 经济效益（需验证，计入成熟度分值）
  totalRevenue: number         // 年营业收入（万元）
  lastYearProfit: number       // 上年度利润总额（万元）
  /** 累计融资额（万元），需提供融资协议附件验证 */
  totalFunding: number
  fundingRound: string         // 融资轮次（天使/Pre-A/A/B/C轮…）

  honors: OrgHonor[]           // 单位荣誉，申报书要求≤5项
}

// ─── 专业领域三级枚举（由主办方维护，前端使用 mock） ─────────────────────────

export interface ProfessionalDomainLeaf {
  code: string                 // 如 '1-1-1'
  label: string
}

export interface ProfessionalDomainMid {
  code: string                 // 如 '1-1'
  label: string
  children: ProfessionalDomainLeaf[]
}

export interface ProfessionalDomainTop {
  code: string                 // 如 '1'
  label: string
  children: ProfessionalDomainMid[]
}

/** 报名/项目中使用的三级选中状态 */
export interface SelectedDomain {
  top: ProfessionalDomainTop
  mid: ProfessionalDomainMid
  leaf: ProfessionalDomainLeaf
}

// ─── 成长雷达快照（派生维度，仅用于雷达图渲染，轻量版本） ───────────────────

export interface GrowthRadarSnapshot {
  snapshotId: string
  timestamp: string
  /** 团队成员数（含申报人），派生自 teamMembers.length + 1 */
  teamSize: number
  /** 已授权专利数，派生自 applicant.patents.filter(已授权).length，需验证 */
  patentCount: number
  /** 软著数，派生自 applicant.softwareCopyrights.length */
  softwareCopyrightCount: number
  /** 论文数，派生自 applicant.papers.length */
  paperCount: number
  /** 累计融资额（万元），来自 orgInfo.totalFunding，需验证 */
  totalFunding: number
  /** 年研发投入（万元），来自 orgInfo.rdExpenditure */
  rdExpenditure: number
  /**
   * 成熟度综合分（0–100）
   * = 技术成果分（专利×15 + 软著×5 + 论文×3，上限40）
   *   + 研发能力分（rdExpenditure/500×30，上限30）
   *   + 经济效益分（totalRevenue/1000×30，上限30）
   * 所有来源字段均需对应验证通过后方计入
   */
  maturityScore: number
}

// ─── ProjectSnapshot（完整快照，用于 diff 与回退）────────────────────────────

/**
 * 项目在某一时刻的完整数据快照。
 * 每次保存时生成，存在 Project.snapshots 里。
 *
 * data = 完整项目字段（不含 events/snapshots，避免循环引用），
 *        diff 引擎和回退功能均以此为数据源。
 * radar = 同一时刻预计算的雷达维度，供图表快速渲染，避免重复计算。
 */
export type ProjectSnapshotData = Omit<Project, 'events' | 'snapshots' | 'registrations'>

export interface ProjectSnapshot {
  snapshotId: string
  timestamp: string
  data: ProjectSnapshotData
  radar: GrowthRadarSnapshot
}

// ─── FieldChange（diff 的最小单元）──────────────────────────────────────────

export interface ScalarChange {
  diffType: 'scalar'
  field: string
  label: string
  oldValue: string
  newValue: string
}

export interface TextSegment {
  type: 'unchanged' | 'added' | 'removed'
  text: string
}

export interface TextChange {
  diffType: 'text'
  field: string
  label: string
  segments: TextSegment[]
}

export interface CollectionItemChange {
  itemId: string
  itemSummary: string          // 如"李明（核心成员）"
  fieldChanges: ScalarChange[]
}

export interface CollectionChange {
  diffType: 'collection'
  field: string
  label: string
  added: string[]              // 新增条目摘要列表
  removed: string[]            // 删除条目摘要列表
  modified: CollectionItemChange[]
}

export type FieldChange = ScalarChange | TextChange | CollectionChange

// ─── 时间线事件 ProjectEvent ─────────────────────────────────────────────────

export type EventType = '维护编辑' | '报名' | '回退'

export interface ProjectEvent {
  id: string
  type: EventType
  timestamp: string
  description: string
  changes: FieldChange[]
  registrationId?: string      // 仅 type==='报名' 时存在
  snapshotId: string           // 指向 ProjectSnapshot（含完整数据 + 雷达维度）
}

// ─── 报名记录 RegistrationRecord ─────────────────────────────────────────────

export interface CompetitionPhase {
  label: string
  status: 'completed' | 'active' | 'upcoming'
  date?: string
  description?: string
}

export interface RegistrationRecord {
  id: string
  projectId: string
  competitionId: string
  competitionName: string
  applicationType: string      // 申报类型
  /** 报名时选择的专业领域（三级）*/
  professionalDomain: SelectedDomain
  professionalDirection: string // 专业方向（文本补充）
  introductionArea: string     // 引进地
  /** 申报用名（报名时可单独修改）*/
  declarationName: string
  memberCount: number          // 报名时固化的成员数
  contactPerson: string        // 联系人
  contactPhone: string         // 联系人手机
  applicationDate: string      // 填表日期 YYYY-MM-DD
  status: RegistrationStatus
  greenChannelApplied: boolean          // 破格通道申请
  greenChannelType?: '直接进入终评' | '直接认定'
  greenChannelReason: string            // 破格理由
  greenChannelQualifications?: string[] // 选中的破格条件 ID 列表
  greenChannelFiles?: { name: string; size: string; fileType: string }[] // 佐证材料
  expertRecusal: string        // 需回避专家
  orgRecusal: string           // 需回避单位
  applicantCommitment: boolean // 本人承诺
  submittedAt?: string
  /** 提交时的完整快照 ID（指向 Project.snapshots）*/
  snapshotId: string
  phases: CompetitionPhase[]
}

// ─── 核心实体 Project ─────────────────────────────────────────────────────────

export interface Project {
  id: string

  // 封面与身份
  /** 申报用名（面向评委的简短名称，原"备注名"/"displayName"）*/
  declarationName: string
  /** 项目正式名称（与申报书完全一致）*/
  projectName: string
  /** 封面图 URL；null 时由系统基于关键字段自动生成封面 */
  coverImage: string | null
  /** 专业领域三级选择；可能部分填写（仅 top/mid）*/
  professionalDomain: Partial<SelectedDomain>
  coreTech: string

  // 申报人（带头人）
  applicant: Applicant

  // 团队成员（不含申报人，申报书"项目成员"章节）
  teamMembers: TeamMember[]

  // 项目简介（封面摘要）
  /** 项目简要介绍 ≤500字（申报书封面摘要栏）*/
  projectBrief: string

  // 项目信息六章（申报书"项目信息"章节，富文本/长文本）
  projectBackground: string    // 项目背景意义
  projectContent: string       // 项目实施内容
  /** 阶段性目标集合，申报书要求≥2个阶段 */
  projectStages: ProjectStage[]
  workBasis: string            // 工作基础和条件（含项目成熟度描述）
  expectedContribution: string // 预期贡献及验收指标
  economicEfficiency: string   // 预期经济效益指标

  // 投入预测（申报书"项目实施"章节）
  totalInvestmentForecast: number   // 项目总投入预测（万元，5年）
  alreadyInvestedByOrg: number      // 用人单位已投入（万元）
  govSupportReceived: number        // 已获区县市支持资金（万元）
  plannedInvestmentByOrg: number    // 未来5年用人单位计划投入（万元）

  // 用人单位（申报书"用人单位信息"章节）
  orgInfo: OrgInfo

  // 附件材料
  attachments: { name: string; size: string; fileType: string }[]

  // 报名记录（每次报名创建一条，独立于事件流）
  registrations: RegistrationRecord[]

  // 时间线与快照
  events: ProjectEvent[]
  /** key = snapshotId；每次保存时追加一条完整快照，供 diff/回退使用 */
  snapshots: Record<string, ProjectSnapshot>

  // 数据验证状态（硬指标，verified 后才计入雷达图）
  verificationStatus: VerificationStatusMap

  // Meta
  createdAt: string
  updatedAt: string
}

// ─── 验证标记（供雷达图判断是否可信展示）────────────────────────────────────

/**
 * 字段需验证清单（硬指标）：
 * - teamMembers: 资料核验（身份证号）
 * - applicant.patents (已授权): 附件验证
 * - orgInfo.totalFunding: 融资协议附件验证
 * - orgInfo.rdExpenditure: 财务审计报告
 * - orgInfo.totalRevenue: 财务审计报告
 * 未通过验证的字段不计入雷达图，展示处标注"未验证"
 */
export type VerifiableField =
  | 'teamMembers'
  | 'patents'
  | 'totalFunding'
  | 'rdExpenditure'
  | 'totalRevenue'

export type VerificationStatusValue = 'unverified' | 'pending' | 'verified'

/** 各硬指标的验证状态 */
export type VerificationStatusMap = {
  [K in VerifiableField]: VerificationStatusValue
}
