import type { ProjectField } from './types'

// ─── Tab 0: 封面 ──────────────────────────────────────────────────────────────

export const COVER_FIELDS: ProjectField[] = [
  {
    key: 'declarationName',
    label: '申报用名',
    type: 'string',
    description: '项目面向评委的简短申报名称，通常≤30字，可能出现在封面或标题页',
  },
  {
    key: 'projectName',
    label: '项目正式名称',
    type: 'string',
    description: '项目的完整正式名称，与立项文件或注册信息一致',
  },
  {
    key: 'coreTech',
    label: '核心技术',
    type: 'string',
    description: '项目的核心技术方向或技术路线，简短概括（如：深度学习、基因编辑、氢燃料电池）',
  },
  {
    key: 'projectBrief',
    label: '项目简介',
    type: 'string',
    description: '项目摘要或执行摘要，200字以内，完整保留原文要点',
  },
]

// ─── Tab 1: 申报人（带头人）标量字段 ────────────────────────────────────────

export const APPLICANT_SCALAR_FIELDS: ProjectField[] = [
  {
    key: 'aName',
    label: '姓名',
    type: 'string',
    description: '申报人（带头人）的中文真实姓名',
  },
  {
    key: 'aNameEn',
    label: '英文姓名',
    type: 'string',
    description: '申报人英文姓名，格式 FirstName LastName 或 LAST First',
  },
  {
    key: 'aGender',
    label: '性别',
    type: 'enum',
    options: ['男', '女', '其他'],
    description: '申报人性别',
  },
  {
    key: 'aBirthDate',
    label: '出生日期',
    type: 'date',
    description: '申报人出生日期，格式 YYYY-MM-DD；若文档只有年份或年月，补齐为 YYYY-01-01 或 YYYY-MM-01',
  },
  {
    key: 'aNationality',
    label: '国籍',
    type: 'string',
    description: '申报人国籍，如"中国"或"美国"',
  },
  {
    key: 'aIsEthnicChinese',
    label: '是否华裔',
    type: 'boolean',
    description: '申报人是否为华裔（非中国国籍但有中国血统）',
  },
  {
    key: 'aBirthPlace',
    label: '出生地',
    type: 'string',
    description: '申报人出生地（省市或国家）',
  },
  {
    key: 'aIdType',
    label: '证件类型',
    type: 'enum',
    options: ['居民身份证', '护照', '港澳居民来往内地通行证', '台湾居民来往大陆通行证', '外国人永久居留证'],
    description: '申报人有效证件类型',
  },
  {
    key: 'aEmail',
    label: '电子邮箱',
    type: 'string',
    description: '申报人联系邮箱',
  },
  {
    key: 'aHighestDegree',
    label: '最高学历',
    type: 'enum',
    options: ['专科', '本科', '硕士', '博士', '博士后', '其他'],
    description: '申报人最高学历级别',
  },
  {
    key: 'aHighestDegreeInstitution',
    label: '最高学历院校',
    type: 'string',
    description: '申报人最高学历的毕业院校全称',
  },
  {
    key: 'aHighestDegreeMajor',
    label: '最高学历专业',
    type: 'string',
    description: '申报人最高学历的就读专业',
  },
  {
    key: 'aIntendedPosition',
    label: '拟任职务',
    type: 'string',
    description: '申报人在宁波落地后拟担任的职务，如"CEO"、"首席科学家"',
  },
  {
    key: 'aLastOrgBeforeComeToNingbo',
    label: '来宁前最后工作单位',
    type: 'string',
    description: '申报人来宁波前的最后一份工作的单位名称',
  },
  {
    key: 'aLastOrgBeforeReturnFromAbroad',
    label: '回国前最后工作单位',
    type: 'string',
    description: '申报人回国前在海外的最后一份工作的单位名称（无海外经历则留空）',
  },
  {
    key: 'aHonorsCertificates',
    label: '荣誉证书及称号',
    type: 'string',
    description: '申报人获得的主要荣誉称号、证书，完整保留原文要点',
  },
]

// ─── Tab 3: 项目信息 标量字段 ────────────────────────────────────────────────

export const PROJECT_INFO_FIELDS: ProjectField[] = [
  {
    key: 'projectBackground',
    label: '项目背景意义',
    type: 'string',
    description: '项目的背景、立项意义、解决的问题，完整保留原文核心段落',
  },
  {
    key: 'projectContent',
    label: '项目实施内容',
    type: 'string',
    description: '项目的主要实施内容、技术方案、创新点，完整保留',
  },
  {
    key: 'workBasis',
    label: '工作基础和条件',
    type: 'string',
    description: '项目的前期研究基础、团队资质、已有资源条件，完整保留',
  },
  {
    key: 'expectedContribution',
    label: '预期贡献及验收指标',
    type: 'string',
    description: '项目预期产出、贡献和可量化验收指标，完整保留',
  },
  {
    key: 'economicEfficiency',
    label: '预期经济效益指标',
    type: 'string',
    description: '项目预期的经济效益、市场规模、营收目标等量化指标，完整保留',
  },
  {
    key: 'totalInvestmentForecast',
    label: '总投资预测',
    type: 'number',
    unit: '万元',
    description: '项目总投资预算，换算为万元的纯数字',
  },
  {
    key: 'alreadyInvestedByOrg',
    label: '单位已投入',
    type: 'number',
    unit: '万元',
    description: '用人单位已投入的资金，换算为万元',
  },
  {
    key: 'govSupportReceived',
    label: '已获政府支持',
    type: 'number',
    unit: '万元',
    description: '已获得的政府资助/补贴金额，换算为万元',
  },
  {
    key: 'plannedInvestmentByOrg',
    label: '单位计划投入',
    type: 'number',
    unit: '万元',
    description: '用人单位计划后续投入的资金，换算为万元',
  },
]

// ─── Tab 5: 个人陈述 标量字段 ─────────────────────────────────────────────────

export const PERSONAL_STATEMENT_FIELDS: ProjectField[] = [
  {
    key: 'personalBrief',
    label: '个人简介',
    type: 'string',
    description: '申报人个人简介，200字以内，保留原文核心内容',
  },
  {
    key: 'achievementsSummary',
    label: '主要成就摘要',
    type: 'string',
    description: '申报人核心学术/产业成就摘要，完整保留',
  },
  {
    key: 'hasEntrepreneurExperience',
    label: '是否有创业经历',
    type: 'boolean',
    description: '申报人是否有过创业经历（创办过公司或担任联合创始人）',
  },
  {
    key: 'legalIssuesHasIssue',
    label: '是否有法律纠纷',
    type: 'boolean',
    description: '申报人是否存在法律纠纷或诚信问题',
  },
  {
    key: 'legalIssuesDescription',
    label: '法律纠纷说明',
    type: 'string',
    description: '如有法律纠纷，简要说明情况',
  },
]

// ─── Tab 6: 用人单位 标量字段 ─────────────────────────────────────────────────

export const ORG_FIELDS: ProjectField[] = [
  {
    key: 'oName',
    label: '单位名称',
    type: 'string',
    description: '用人单位（宁波公司/机构）的全称',
  },
  {
    key: 'oOrgType',
    label: '单位类型',
    type: 'enum',
    options: ['企业', '高校', '科研机构', '其他'],
    description: '用人单位的类型',
  },
  {
    key: 'oEstablishedDate',
    label: '成立日期',
    type: 'date',
    description: '用人单位成立/注册日期，格式 YYYY-MM-DD',
  },
  {
    key: 'oRegisteredCapital',
    label: '注册资本（万元）',
    type: 'number',
    unit: '万元',
    description: '用人单位注册资本，换算为万元',
  },
  {
    key: 'oTotalEmployees',
    label: '员工总数',
    type: 'integer',
    description: '用人单位员工总人数（整数）',
  },
  {
    key: 'oAddress',
    label: '单位地址',
    type: 'string',
    description: '用人单位注册或办公地址',
  },
  {
    key: 'oContactPerson',
    label: '联系人',
    type: 'string',
    description: '用人单位联系人姓名',
  },
  {
    key: 'oOrgBrief',
    label: '单位简介',
    type: 'string',
    description: '用人单位的基本情况介绍，完整保留',
  },
  {
    key: 'oRdExpenditure',
    label: '研发投入（万元）',
    type: 'number',
    unit: '万元',
    description: '用人单位年研发投入，换算为万元',
  },
  {
    key: 'oRdRevenueRatio',
    label: '研发投入占比',
    type: 'string',
    description: '研发投入占营收比例，如"15%"或"0.15"，保留原文格式',
  },
  {
    key: 'oRdPersonnelCount',
    label: '研发人员数量',
    type: 'integer',
    description: '用人单位研发人员总数（整数）',
  },
  {
    key: 'oOrgInventionPatentCount',
    label: '发明专利数量',
    type: 'integer',
    description: '用人单位持有的有效发明专利数量（整数）',
  },
  {
    key: 'oTotalRevenue',
    label: '总营收（万元）',
    type: 'number',
    unit: '万元',
    description: '用人单位最近一年总营业收入，换算为万元',
  },
  {
    key: 'oLastYearProfit',
    label: '上年净利润（万元）',
    type: 'number',
    unit: '万元',
    description: '用人单位上一年度净利润，换算为万元（亏损填负数）',
  },
  {
    key: 'oTotalFunding',
    label: '累计融资额（万元）',
    type: 'number',
    unit: '万元',
    description: '用人单位累计获得的融资总额，换算为万元',
  },
  {
    key: 'oFundingRound',
    label: '融资阶段',
    type: 'string',
    description: '用人单位当前融资轮次，如"天使轮"、"A轮"、"Pre-IPO"等',
  },
]

/** All scalar fields flattened, preserving declaration order */
export const ALL_SCALAR_FIELDS: ProjectField[] = [
  ...COVER_FIELDS,
  ...APPLICANT_SCALAR_FIELDS,
  ...PROJECT_INFO_FIELDS,
  ...PERSONAL_STATEMENT_FIELDS,
  ...ORG_FIELDS,
]

/** O(1) lookup: field key → ProjectField */
export const SCALAR_FIELD_MAP: ReadonlyMap<string, ProjectField> = new Map(
  ALL_SCALAR_FIELDS.map((f) => [f.key, f]),
)
