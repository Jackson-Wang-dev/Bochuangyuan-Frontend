/**
 * Schema 驱动的结构化集合定义。
 * Phase 2 会用这些 schema 渲染通用的表格+弹窗表单组件。
 * 每个 schema 对应 project.ts 中的一种集合类型。
 */

// ─── Schema 元类型 ────────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'          // YYYY-MM-DD
  | 'month'         // YYYY-MM
  | 'select'
  | 'boolean'
  | 'phone'

export interface FieldSchema {
  key: string
  label: string
  type: FieldType
  required: boolean
  options?: string[]           // select 类型的枚举值
  maxLength?: number
  max?: number                 // number 类型上限
  min?: number
  placeholder?: string
  hint?: string
  /** 此字段值需平台验证后方计入硬指标展示 */
  needsVerification?: boolean
  /** 表格列中是否显示（false = 仅在表单中填写，表格不展示） */
  showInTable?: boolean
  /**
   * 只读字段：由系统派生，不渲染输入框，仅在详情/表格中展示。
   * 例：TeamMember.age（由 birthDate 计算）
   */
  readonly?: boolean
  /**
   * 可为空字段：值为 null 时有约定语义（而非"未填写"）。
   * Phase 2 组件应渲染"至今"复选框或清空按钮，而非普通空值处理。
   * 例：Work.endDate=null 表示在职，AcademicPosition.tenureEnd=null 表示至今
   */
  nullable?: boolean
  /** nullable=true 时，null 值在 UI 展示的文案 */
  nullLabel?: string
  /**
   * 完全隐藏字段：不在表单中渲染，不在表格中展示，但包含在数据对象中。
   * 用于由平台/系统设置的字段（如 isVerified），创建时用 defaultValue 初始化。
   */
  hidden?: boolean
  /** hidden=true 时新建条目的初始值 */
  defaultValue?: unknown
  /** AI 预填时给模型的抽取说明（中文，越具体越准）；未填则退化为 label */
  description?: string
  /** 数字字段的单位（如"万元"），要求模型换算成该单位的纯数字 */
  unit?: string
}

export interface CollectionSchema {
  /** 对应 Applicant/Project/OrgInfo 上的属性名 */
  collectionKey: string
  label: string
  /** 父级聚合标签，如"团队成员" → 表格上方显示"团队成员（n）" */
  aggregateLabel: string
  /** 申报书约束的最大条目数（undefined = 不限）*/
  maxItems?: number
  /** 申报书约束的最小条目数 */
  minItems?: number
  fields: FieldSchema[]
  /** 表格行摘要取哪个字段的值（默认取 fields[0].key）*/
  summaryField?: string
}

// ─── 1. 团队成员 ──────────────────────────────────────────────────────────────

export const TEAM_MEMBER_SCHEMA: CollectionSchema = {
  collectionKey: 'teamMembers',
  label: '团队成员',
  aggregateLabel: '团队成员',
  fields: [
    { key: 'memberType', label: '成员类型', type: 'select', required: true, showInTable: true,
      options: ['核心成员', '一般成员', '顾问'] },
    { key: 'name', label: '姓名', type: 'text', required: true, showInTable: true, placeholder: '真实姓名' },
    { key: 'idType', label: '证件类型', type: 'select', required: true, showInTable: false,
      options: ['居民身份证', '护照', '港澳居民来往内地通行证', '台湾居民来往大陆通行证', '外国人永久居留证'] },
    { key: 'idNumber', label: '证件号', type: 'text', required: true, showInTable: false,
      needsVerification: true, placeholder: '18位身份证号或护照号' },
    { key: 'phone', label: '手机号', type: 'phone', required: true, showInTable: true },
    { key: 'birthDate', label: '出生日期', type: 'date', required: true, showInTable: true },
    { key: 'age', label: '年龄', type: 'number', required: false, showInTable: true, min: 0, max: 120,
      readonly: true, hint: '由出生日期自动计算，不可手动修改' },
    { key: 'nationality', label: '国籍', type: 'text', required: true, showInTable: true, placeholder: '中国' },
    { key: 'division', label: '分工', type: 'text', required: true, showInTable: true, placeholder: '如：算法研究、市场运营' },
    { key: 'background', label: '背景简介', type: 'textarea', required: false, showInTable: false,
      maxLength: 200, placeholder: '教育背景、核心经历' },
  ],
  summaryField: 'name',
}

// ─── 2. 教育经历 ──────────────────────────────────────────────────────────────

export const EDUCATION_SCHEMA: CollectionSchema = {
  collectionKey: 'educations',
  label: '教育经历',
  aggregateLabel: '教育经历',
  fields: [
    { key: 'country', label: '国家/地区', type: 'text', required: true, showInTable: true, placeholder: '中国' },
    { key: 'isFullTime', label: '是否全日制', type: 'boolean', required: true, showInTable: true },
    { key: 'startDate', label: '开始时间', type: 'month', required: true, showInTable: true },
    { key: 'endDate', label: '结束时间', type: 'month', required: true, showInTable: true },
    { key: 'institution', label: '院校名称', type: 'text', required: true, showInTable: true, placeholder: '毕业院校全称' },
    { key: 'major', label: '专业', type: 'text', required: true, showInTable: true },
    { key: 'educationLevel', label: '学历', type: 'select', required: true, showInTable: true,
      options: ['专科', '本科', '硕士', '博士', '博士后', '其他'] },
    { key: 'degreeLevel', label: '学位', type: 'select', required: true, showInTable: false,
      options: ['专科', '本科', '硕士', '博士', '博士后', '其他'] },
    { key: 'isHighestDegree', label: '是否最高学位', type: 'boolean', required: true, showInTable: true },
  ],
  summaryField: 'institution',
}

// ─── 3. 工作经历 ──────────────────────────────────────────────────────────────

export const WORK_SCHEMA: CollectionSchema = {
  collectionKey: 'works',
  label: '工作经历',
  aggregateLabel: '工作经历',
  fields: [
    { key: 'country', label: '国家/地区', type: 'text', required: true, showInTable: true, placeholder: '中国' },
    { key: 'startDate', label: '开始时间', type: 'month', required: true, showInTable: true },
    { key: 'endDate', label: '结束时间', type: 'month', required: false, showInTable: true,
      nullable: true, nullLabel: '至今', hint: '仍在职则勾选"至今"' },
    { key: 'organization', label: '单位名称', type: 'text', required: true, showInTable: true },
    { key: 'position', label: '职务', type: 'text', required: true, showInTable: true },
    { key: 'workNature', label: '工作性质', type: 'select', required: true, showInTable: true,
      options: ['全职', '兼职', '创业', '其他'] },
    { key: 'isLastBeforeComeToNingbo', label: '来宁前最后工作单位', type: 'boolean', required: false, showInTable: false },
    { key: 'isLastBeforeReturnFromAbroad', label: '回国前最后工作单位', type: 'boolean', required: false, showInTable: false },
  ],
  summaryField: 'organization',
}

// ─── 4. 主要项目 ──────────────────────────────────────────────────────────────

export const MAJOR_PROJECT_SCHEMA: CollectionSchema = {
  collectionKey: 'majorProjects',
  label: '主要项目',
  aggregateLabel: '主要项目',
  fields: [
    { key: 'projectName', label: '项目名称', type: 'text', required: true, showInTable: true },
    { key: 'startDate', label: '开始时间', type: 'month', required: true, showInTable: true },
    { key: 'endDate', label: '结束时间', type: 'month', required: true, showInTable: true },
    { key: 'source', label: '项目来源', type: 'select', required: true, showInTable: true,
      options: ['国家级', '省部级', '市厅级', '横向', '自主', '其他'] },
    { key: 'undertakingUnit', label: '承接单位', type: 'text', required: true, showInTable: false },
    { key: 'totalFunding', label: '经费总额（万元）', type: 'number', required: true, showInTable: true, min: 0 },
    { key: 'personalRole', label: '本人角色', type: 'text', required: true, showInTable: true,
      placeholder: '如：项目负责人/主研人员' },
  ],
  summaryField: 'projectName',
}

// ─── 5. 代表性论文 ────────────────────────────────────────────────────────────

export const PAPER_SCHEMA: CollectionSchema = {
  collectionKey: 'papers',
  label: '代表性论文',
  aggregateLabel: '代表性论文',
  fields: [
    { key: 'title', label: '论文标题', type: 'text', required: true, showInTable: true },
    { key: 'authors', label: '作者（按原文顺序）', type: 'text', required: true, showInTable: false },
    { key: 'journal', label: '发表载体', type: 'text', required: true, showInTable: true,
      placeholder: '期刊/会议全称' },
    { key: 'personalRank', label: '本人排名', type: 'number', required: true, showInTable: true, min: 1 },
    { key: 'totalAuthors', label: '作者总数', type: 'number', required: true, showInTable: true, min: 1 },
    { key: 'publishDate', label: '发表时间', type: 'month', required: true, showInTable: true },
    { key: 'impactFactor', label: '影响因子', type: 'number', required: false, showInTable: true, min: 0,
      nullable: true, nullLabel: '—', hint: '不适用（会议论文/中文期刊）可留空' },
    { key: 'isCorrespondingAuthor', label: '是否通讯作者', type: 'boolean', required: true, showInTable: true },
  ],
  summaryField: 'title',
}

// ─── 6. 代表性专利 ────────────────────────────────────────────────────────────

export const PATENT_SCHEMA: CollectionSchema = {
  collectionKey: 'patents',
  label: '代表性专利',
  aggregateLabel: '代表性专利',
  fields: [
    { key: 'patentType', label: '专利类型', type: 'select', required: true, showInTable: true,
      options: ['发明专利', '实用新型专利', '外观设计专利', 'PCT专利', '其他'] },
    { key: 'name', label: '专利名称', type: 'text', required: true, showInTable: true },
    { key: 'authorizedCountry', label: '授权国家', type: 'text', required: true, showInTable: true, placeholder: '中国' },
    { key: 'patentNumber', label: '专利号', type: 'text', required: true, showInTable: true,
      needsVerification: true },
    { key: 'personalRank', label: '本人排名', type: 'number', required: true, showInTable: true, min: 1 },
    { key: 'totalInventors', label: '发明人总数', type: 'number', required: true, showInTable: true, min: 1 },
    { key: 'authorizedDate', label: '授权时间', type: 'month', required: true, showInTable: true },
    { key: 'status', label: '状态', type: 'select', required: true, showInTable: true,
      options: ['已授权', '申请中', '已转让'] },
    // 由平台验证流程设置，不对用户开放编辑，新建时默认 false
    { key: 'isVerified', label: '已验证', type: 'boolean', required: false,
      hidden: true, defaultValue: false },
  ],
  summaryField: 'name',
}

// ─── 7. 软件著作权 ────────────────────────────────────────────────────────────

export const SOFTWARE_COPYRIGHT_SCHEMA: CollectionSchema = {
  collectionKey: 'softwareCopyrights',
  label: '软件著作权',
  aggregateLabel: '软件著作权',
  fields: [
    { key: 'softwareName', label: '软件全称', type: 'text', required: true, showInTable: true },
    { key: 'authorizedCountry', label: '授权国家', type: 'text', required: true, showInTable: true, placeholder: '中国' },
    { key: 'registrationNumber', label: '登记号', type: 'text', required: true, showInTable: true },
    { key: 'copyrightHolder', label: '著作权人', type: 'text', required: true, showInTable: true },
    { key: 'approvalDate', label: '登记批准日期', type: 'date', required: true, showInTable: true },
  ],
  summaryField: 'softwareName',
}

// ─── 8. 主要产品 ──────────────────────────────────────────────────────────────

export const PRODUCT_SCHEMA: CollectionSchema = {
  collectionKey: 'products',
  label: '主要产品',
  aggregateLabel: '主要产品',
  fields: [
    { key: 'productName', label: '产品名称', type: 'text', required: true, showInTable: true },
    { key: 'relyingUnit', label: '依托单位', type: 'text', required: true, showInTable: true },
    { key: 'launchDate', label: '上市时间', type: 'month', required: true, showInTable: true },
    { key: 'impactAndContribution', label: '影响力与个人贡献', type: 'textarea', required: true,
      showInTable: false, maxLength: 100, placeholder: '不超过100字' },
  ],
  summaryField: 'productName',
}

// ─── 9. 奖励表彰 ──────────────────────────────────────────────────────────────

export const AWARD_SCHEMA: CollectionSchema = {
  collectionKey: 'awards',
  label: '奖励表彰',
  aggregateLabel: '奖励表彰',
  fields: [
    { key: 'awardDate', label: '获奖时间', type: 'month', required: true, showInTable: true },
    { key: 'awardName', label: '奖项名称', type: 'text', required: true, showInTable: true },
    { key: 'awardingBody', label: '颁奖单位', type: 'text', required: true, showInTable: true },
    { key: 'personalRank', label: '本人排序', type: 'number', required: true, showInTable: true, min: 1 },
  ],
  summaryField: 'awardName',
}

// ─── 10. 代表性著作 ───────────────────────────────────────────────────────────

export const BOOK_SCHEMA: CollectionSchema = {
  collectionKey: 'books',
  label: '代表性著作',
  aggregateLabel: '代表性著作',
  fields: [
    { key: 'title', label: '题目', type: 'text', required: true, showInTable: true },
    { key: 'publishYear', label: '出版年份', type: 'number', required: true, showInTable: true,
      min: 1900, max: 2100 },
    { key: 'personalRank', label: '本人排名', type: 'number', required: true, showInTable: true, min: 1 },
    { key: 'totalAuthors', label: '作者总数', type: 'number', required: true, showInTable: true, min: 1 },
    { key: 'publisher', label: '出版社', type: 'text', required: true, showInTable: true },
    { key: 'publishPlace', label: '出版地', type: 'text', required: true, showInTable: false },
  ],
  summaryField: 'title',
}

// ─── 11. 学术会议报告 ─────────────────────────────────────────────────────────

export const CONFERENCE_REPORT_SCHEMA: CollectionSchema = {
  collectionKey: 'conferenceReports',
  label: '学术会议报告',
  aggregateLabel: '学术会议报告',
  fields: [
    { key: 'title', label: '报告题目', type: 'text', required: true, showInTable: true },
    { key: 'year', label: '年份', type: 'number', required: true, showInTable: true, min: 1900, max: 2100 },
    { key: 'personalRank', label: '本人排名', type: 'number', required: true, showInTable: true, min: 1 },
    { key: 'totalPresenters', label: '报告人总数', type: 'number', required: true, showInTable: false, min: 1 },
    { key: 'conferenceName', label: '会议名称', type: 'text', required: true, showInTable: true },
    { key: 'reportType', label: '报告类型', type: 'select', required: true, showInTable: true,
      options: ['特邀报告', '口头报告', '海报展示', '其他'] },
  ],
  summaryField: 'title',
}

// ─── 12. 学术任职 ─────────────────────────────────────────────────────────────

export const ACADEMIC_POSITION_SCHEMA: CollectionSchema = {
  collectionKey: 'academicPositions',
  label: '学术任职',
  aggregateLabel: '学术任职',
  fields: [
    { key: 'organizationOrJournal', label: '组织/期刊名称', type: 'text', required: true, showInTable: true },
    { key: 'position', label: '职务', type: 'text', required: true, showInTable: true },
    { key: 'tenureStart', label: '任期开始', type: 'month', required: true, showInTable: true },
    { key: 'tenureEnd', label: '任期结束', type: 'month', required: false, showInTable: true,
      nullable: true, nullLabel: '至今' },
  ],
  summaryField: 'organizationOrJournal',
}

// ─── 13. 异地创办企业 ─────────────────────────────────────────────────────────

export const FOUNDED_COMPANY_SCHEMA: CollectionSchema = {
  collectionKey: 'foundedCompanies',
  label: '异地创办企业',
  aggregateLabel: '异地创办企业',
  fields: [
    { key: 'companyName', label: '企业名称', type: 'text', required: true, showInTable: true },
    { key: 'personalRole', label: '本人角色', type: 'text', required: true, showInTable: true,
      placeholder: '如：创始人/股东' },
    { key: 'personalPosition', label: '本人职务', type: 'text', required: true, showInTable: true,
      placeholder: '如：CEO/CTO' },
    { key: 'companyInfo', label: '企业情况', type: 'textarea', required: true, showInTable: false,
      placeholder: '规模、主营业务、经营状况' },
    { key: 'relationToNingboCompany', label: '与宁波公司关系', type: 'textarea', required: true,
      showInTable: false, placeholder: '如：母子公司/技术合作方' },
  ],
  summaryField: 'companyName',
}

// ─── 14. 阶段性目标 ───────────────────────────────────────────────────────────

export const PROJECT_STAGE_SCHEMA: CollectionSchema = {
  collectionKey: 'projectStages',
  label: '阶段性目标',
  aggregateLabel: '阶段性目标',
  minItems: 2,
  fields: [
    { key: 'stageLabel', label: '阶段名称', type: 'text', required: true, showInTable: true,
      placeholder: '如：第一阶段' },
    { key: 'startDate', label: '开始时间', type: 'month', required: true, showInTable: true },
    { key: 'endDate', label: '结束时间', type: 'month', required: true, showInTable: true },
    { key: 'plannedInvestment', label: '预计投入（万元）', type: 'number', required: true,
      showInTable: true, min: 0 },
    { key: 'stageGoal', label: '阶段性目标', type: 'textarea', required: true, showInTable: false,
      placeholder: '该阶段的具体目标与关键里程碑' },
  ],
  summaryField: 'stageLabel',
}

// ─── 15. 单位荣誉 ─────────────────────────────────────────────────────────────

export const ORG_HONOR_SCHEMA: CollectionSchema = {
  collectionKey: 'honors',
  label: '单位荣誉',
  aggregateLabel: '单位荣誉',
  maxItems: 5,
  fields: [
    { key: 'awardDate', label: '获得时间', type: 'month', required: true, showInTable: true },
    { key: 'honorName', label: '荣誉名称', type: 'text', required: true, showInTable: true },
    { key: 'issuingDepartment', label: '颁发部门', type: 'text', required: true, showInTable: true },
  ],
  summaryField: 'honorName',
}

// ─── 全部 schema 注册表 ───────────────────────────────────────────────────────

export const ALL_COLLECTION_SCHEMAS: Record<string, CollectionSchema> = {
  teamMembers:        TEAM_MEMBER_SCHEMA,
  educations:         EDUCATION_SCHEMA,
  works:              WORK_SCHEMA,
  majorProjects:      MAJOR_PROJECT_SCHEMA,
  papers:             PAPER_SCHEMA,
  patents:            PATENT_SCHEMA,
  softwareCopyrights: SOFTWARE_COPYRIGHT_SCHEMA,
  products:           PRODUCT_SCHEMA,
  awards:             AWARD_SCHEMA,
  books:              BOOK_SCHEMA,
  conferenceReports:  CONFERENCE_REPORT_SCHEMA,
  academicPositions:  ACADEMIC_POSITION_SCHEMA,
  foundedCompanies:   FOUNDED_COMPANY_SCHEMA,
  projectStages:      PROJECT_STAGE_SCHEMA,
  honors:             ORG_HONOR_SCHEMA,
}
