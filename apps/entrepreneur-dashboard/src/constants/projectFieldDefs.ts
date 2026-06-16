/**
 * 新建项目表单的 AI 预填字段定义。
 *
 * 这是字段定义的唯一真源：所有平铺字段（DraftState scalars）在此声明，
 * 集合字段直接从 ALL_COLLECTION_SCHEMAS 转换，两者合并后随请求发往后端。
 * 后端不存储任何字段清单，只消费前端传来的这份 schema。
 *
 * 如需增删改字段：只改这里（和对应的 DraftState/Project 类型），
 * 后端 AI 抽取逻辑自动适应，无需重新部署。
 */

import type { CollectionSchema } from '@/types/collectionSchemas'
import {
  TEAM_MEMBER_SCHEMA, EDUCATION_SCHEMA, WORK_SCHEMA, MAJOR_PROJECT_SCHEMA,
  PAPER_SCHEMA, PATENT_SCHEMA, SOFTWARE_COPYRIGHT_SCHEMA, PRODUCT_SCHEMA,
  AWARD_SCHEMA, BOOK_SCHEMA, CONFERENCE_REPORT_SCHEMA, ACADEMIC_POSITION_SCHEMA,
  FOUNDED_COMPANY_SCHEMA, PROJECT_STAGE_SCHEMA, ORG_HONOR_SCHEMA,
} from '@/types/collectionSchemas'
import type { PrefillFieldDef, PrefillSchema } from '@/types/prefillTypes'

// ─── Tab 0: 封面 ──────────────────────────────────────────────────────────────

const COVER_FIELDS: PrefillFieldDef[] = [
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

const APPLICANT_SCALAR_FIELDS: PrefillFieldDef[] = [
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

const PROJECT_INFO_FIELDS: PrefillFieldDef[] = [
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

const PERSONAL_STATEMENT_FIELDS: PrefillFieldDef[] = [
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

const ORG_FIELDS: PrefillFieldDef[] = [
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

// ─── 集合字段转换 ─────────────────────────────────────────────────────────────

/** 将 CollectionSchema 中的 FieldType 映射到 PrefillFieldType */
function collectionFieldToPrefillField(f: CollectionSchema['fields'][number]): PrefillFieldDef {
  const base: PrefillFieldDef = {
    key: f.key,
    label: f.label,
    type: 'string',
    description: f.description ?? f.hint ?? f.label,
    ...(f.options ? { options: f.options } : {}),
    ...(f.unit ? { unit: f.unit } : {}),
  }

  switch (f.type) {
    case 'number':
      return { ...base, type: f.unit ? 'number' : 'number' }
    case 'boolean':
      return { ...base, type: 'boolean' }
    case 'select':
      return { ...base, type: 'enum' }
    case 'date':
    case 'month':
      return { ...base, type: 'date' }
    case 'text':
    case 'textarea':
    case 'phone':
    default:
      return { ...base, type: 'string' }
  }
}

/** 将 CollectionSchema 转换为顶层 array 的 PrefillFieldDef */
function collectionSchemaToPrefillField(schema: CollectionSchema): PrefillFieldDef {
  const itemFields = schema.fields
    .filter((f) => !f.hidden && !f.readonly)
    .map(collectionFieldToPrefillField)

  return {
    key: schema.collectionKey,
    label: schema.label,
    type: 'array',
    description: `提取文档中所有${schema.label}条目，每条形成一个对象`,
    fields: itemFields,
  }
}

// ─── 全量 schema 构造函数 ─────────────────────────────────────────────────────

/**
 * 构造当前表单的完整 AI 预填 schema，传给后端。
 * 该函数是字段定义真源的出口：每次调用都反映当前代码里的最新表单结构。
 */
export function buildPrefillSchema(): PrefillSchema {
  const flatFields: PrefillFieldDef[] = [
    ...COVER_FIELDS,
    ...APPLICANT_SCALAR_FIELDS,
    ...PROJECT_INFO_FIELDS,
    ...PERSONAL_STATEMENT_FIELDS,
    ...ORG_FIELDS,
  ]

  const collectionFields: PrefillFieldDef[] = [
    // Tab 1 — 仅提取主申报人（第一人、申报人）的经历，忽略团队成员的
    {
      ...collectionSchemaToPrefillField(EDUCATION_SCHEMA),
      description: '只提取主申报人（即申报人本人，非团队成员）的教育经历，每条形成一个对象',
    },
    {
      ...collectionSchemaToPrefillField(WORK_SCHEMA),
      description: '只提取主申报人（即申报人本人，非团队成员）的工作经历，每条形成一个对象',
    },
    // Tab 2
    collectionSchemaToPrefillField(TEAM_MEMBER_SCHEMA),
    // Tab 3
    collectionSchemaToPrefillField(PROJECT_STAGE_SCHEMA),
    // Tab 4
    collectionSchemaToPrefillField(MAJOR_PROJECT_SCHEMA),
    collectionSchemaToPrefillField(PAPER_SCHEMA),
    collectionSchemaToPrefillField(PATENT_SCHEMA),
    collectionSchemaToPrefillField(SOFTWARE_COPYRIGHT_SCHEMA),
    collectionSchemaToPrefillField(PRODUCT_SCHEMA),
    collectionSchemaToPrefillField(AWARD_SCHEMA),
    collectionSchemaToPrefillField(BOOK_SCHEMA),
    collectionSchemaToPrefillField(CONFERENCE_REPORT_SCHEMA),
    collectionSchemaToPrefillField(ACADEMIC_POSITION_SCHEMA),
    // Tab 5
    collectionSchemaToPrefillField(FOUNDED_COMPANY_SCHEMA),
    // Tab 6
    collectionSchemaToPrefillField(ORG_HONOR_SCHEMA),
  ]

  return { fields: [...flatFields, ...collectionFields] }
}
