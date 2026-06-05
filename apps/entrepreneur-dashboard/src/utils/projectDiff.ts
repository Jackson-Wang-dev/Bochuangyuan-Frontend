import type {
  FieldChange,
  ProjectSnapshotData,
  TextSegment,
  ScalarChange,
  TextChange,
  CollectionChange,
  CollectionItemChange,
} from '@/types/project'

// ── Character-level LCS text diff ─────────────────────────────────────────────

export function computeTextDiff(oldText: string, newText: string): TextSegment[] {
  if (oldText === newText) return [{ type: 'unchanged', text: oldText }]
  if (!oldText) return [{ type: 'added', text: newText }]
  if (!newText) return [{ type: 'removed', text: oldText }]

  const oc = [...oldText]
  const nc = [...newText]
  const m = oc.length
  const n = nc.length

  // For very long texts (>800 chars each) skip LCS to avoid O(n²) slowness
  if (m > 800 || n > 800) {
    return [{ type: 'removed', text: oldText }, { type: 'added', text: newText }]
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0) as number[])
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oc[i - 1] === nc[j - 1]) {
        dp[i]![j] = (dp[i - 1]![j - 1] ?? 0) + 1
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j] ?? 0, dp[i]![j - 1] ?? 0)
      }
    }
  }

  const raw: TextSegment[] = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oc[i - 1] === nc[j - 1]) {
      raw.unshift({ type: 'unchanged', text: oc[i - 1]! })
      i--; j--
    } else if (j > 0 && (i === 0 || (dp[i]![j - 1] ?? 0) >= (dp[i - 1]![j] ?? 0))) {
      raw.unshift({ type: 'added', text: nc[j - 1]! })
      j--
    } else {
      raw.unshift({ type: 'removed', text: oc[i - 1]! })
      i--
    }
  }

  // Merge consecutive same-type segments
  return raw.reduce<TextSegment[]>((acc, seg) => {
    const last = acc[acc.length - 1]
    if (last && last.type === seg.type) { last.text += seg.text; return acc }
    acc.push({ type: seg.type, text: seg.text })
    return acc
  }, [])
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function strOf(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? '是' : '否'
  return String(v)
}

function numLabel(v: number, unit = '万元'): string {
  return v > 0 ? `${v.toLocaleString()} ${unit}` : '—'
}

function scalarDiff(
  field: string, label: string, oldVal: string, newVal: string,
): ScalarChange | null {
  if (oldVal === newVal) return null
  return { diffType: 'scalar', field, label, oldValue: oldVal, newValue: newVal }
}

function numericDiff(
  field: string, label: string, oldVal: number, newVal: number, unit = '万元',
): ScalarChange | null {
  if (oldVal === newVal) return null
  return { diffType: 'scalar', field, label, oldValue: numLabel(oldVal, unit), newValue: numLabel(newVal, unit) }
}

function longTextDiff(
  field: string, label: string, oldVal: string, newVal: string,
): TextChange | null {
  if (oldVal === newVal) return null
  return { diffType: 'text', field, label, segments: computeTextDiff(oldVal, newVal) }
}

type AnyItem = { _id: string } & Record<string, unknown>

function collectionDiff(
  field: string,
  label: string,
  oldItems: AnyItem[],
  newItems: AnyItem[],
  summarize: (item: AnyItem) => string,
  watchKeys: Array<[string, string]>,
): CollectionChange | null {
  const oldMap = new Map(oldItems.map((it) => [it._id, it]))
  const newMap = new Map(newItems.map((it) => [it._id, it]))

  const added: string[] = []
  const removed: string[] = []
  const modified: CollectionItemChange[] = []

  for (const [id, newIt] of newMap) {
    if (!oldMap.has(id)) added.push(summarize(newIt))
  }

  for (const [id, oldIt] of oldMap) {
    const newIt = newMap.get(id)
    if (!newIt) {
      removed.push(summarize(oldIt))
    } else {
      const fieldChanges: ScalarChange[] = []
      for (const [k, l] of watchKeys) {
        const ov = strOf(oldIt[k])
        const nv = strOf(newIt[k])
        if (ov !== nv) {
          fieldChanges.push({ diffType: 'scalar', field: k, label: l, oldValue: ov, newValue: nv })
        }
      }
      if (fieldChanges.length > 0) {
        modified.push({ itemId: id, itemSummary: summarize(newIt), fieldChanges })
      }
    }
  }

  if (!added.length && !removed.length && !modified.length) return null
  return { diffType: 'collection', field, label, added, removed, modified }
}

// ── Main diff engine ──────────────────────────────────────────────────────────

export function computeProjectDiff(
  oldData: ProjectSnapshotData,
  newData: ProjectSnapshotData,
): FieldChange[] {
  const changes: FieldChange[] = []
  function push(c: FieldChange | null) { if (c) changes.push(c) }

  // Project identity
  push(scalarDiff('declarationName', '申报用名', oldData.declarationName, newData.declarationName))
  push(scalarDiff('projectName', '项目正式名称', oldData.projectName, newData.projectName))
  push(scalarDiff('coreTech', '核心技术', oldData.coreTech, newData.coreTech))

  // Long text sections
  push(longTextDiff('projectBrief',         '项目简介',       oldData.projectBrief,         newData.projectBrief))
  push(longTextDiff('projectBackground',    '项目背景意义',   oldData.projectBackground,    newData.projectBackground))
  push(longTextDiff('projectContent',       '项目实施内容',   oldData.projectContent,       newData.projectContent))
  push(longTextDiff('workBasis',            '工作基础和条件', oldData.workBasis,            newData.workBasis))
  push(longTextDiff('expectedContribution', '预期贡献',       oldData.expectedContribution, newData.expectedContribution))
  push(longTextDiff('economicEfficiency',   '预期经济效益',   oldData.economicEfficiency,   newData.economicEfficiency))

  // Investment numbers
  push(numericDiff('totalInvestmentForecast', '项目总投入预测', oldData.totalInvestmentForecast, newData.totalInvestmentForecast))
  push(numericDiff('alreadyInvestedByOrg',    '单位已投入',     oldData.alreadyInvestedByOrg,    newData.alreadyInvestedByOrg))
  push(numericDiff('govSupportReceived',      '已获区县市支持', oldData.govSupportReceived,      newData.govSupportReceived))
  push(numericDiff('plannedInvestmentByOrg',  '单位计划投入',   oldData.plannedInvestmentByOrg,  newData.plannedInvestmentByOrg))

  // Applicant scalars
  const oa = oldData.applicant, na = newData.applicant
  push(scalarDiff('applicant.name',     '申报人姓名',   oa.name,     na.name))
  push(scalarDiff('applicant.idNumber', '申报人证件号', oa.idNumber, na.idNumber))
  push(scalarDiff('applicant.phone',    '申报人手机',   oa.phone,    na.phone))
  push(scalarDiff('applicant.email',    '申报人邮箱',   oa.email,    na.email))

  // Applicant long text
  push(longTextDiff('applicant.personalBrief',       '个人简介', oa.personalBrief,       na.personalBrief))
  push(longTextDiff('applicant.achievementsSummary', '业绩简述', oa.achievementsSummary, na.achievementsSummary))

  // OrgInfo scalars
  const oo = oldData.orgInfo, no = newData.orgInfo
  push(scalarDiff('orgInfo.name', '用人单位名称', oo.name, no.name))
  push(numericDiff('orgInfo.totalFunding',      '累计融资额',   oo.totalFunding,      no.totalFunding))
  push(numericDiff('orgInfo.rdExpenditure',     '年研发投入',   oo.rdExpenditure,     no.rdExpenditure))
  push(numericDiff('orgInfo.totalRevenue',      '年营业收入',   oo.totalRevenue,      no.totalRevenue))
  push(numericDiff('orgInfo.registeredCapital', '注册资本',     oo.registeredCapital, no.registeredCapital))

  function toAny<T>(arr: T[]): AnyItem[] { return arr as unknown as AnyItem[] }

  // Team members collection
  push(collectionDiff(
    'teamMembers', '项目团队',
    toAny(oldData.teamMembers), toAny(newData.teamMembers),
    (it) => `${strOf(it['name'])}（${strOf(it['memberType'])}）`,
    [['name','姓名'],['idNumber','证件号'],['memberType','成员类型'],['division','分工']],
  ))

  // Patents collection
  push(collectionDiff(
    'applicant.patents', '专利',
    toAny(oa.patents), toAny(na.patents),
    (it) => strOf(it['name']),
    [['name','专利名称'],['patentNumber','专利号'],['status','状态'],['authorizedDate','授权日期']],
  ))

  // Papers collection
  push(collectionDiff(
    'applicant.papers', '论文',
    toAny(oa.papers), toAny(na.papers),
    (it) => strOf(it['title']),
    [['title','标题'],['journal','期刊'],['publishDate','发表日期']],
  ))

  // Education collection
  push(collectionDiff(
    'applicant.educations', '教育经历',
    toAny(oa.educations), toAny(na.educations),
    (it) => `${strOf(it['institution'])} · ${strOf(it['major'])}`,
    [['institution','院校'],['major','专业'],['educationLevel','学历']],
  ))

  // Work collection
  push(collectionDiff(
    'applicant.works', '工作经历',
    toAny(oa.works), toAny(na.works),
    (it) => `${strOf(it['organization'])} · ${strOf(it['position'])}`,
    [['organization','单位'],['position','职务']],
  ))

  // Major projects collection
  push(collectionDiff(
    'applicant.majorProjects', '主要项目',
    toAny(oa.majorProjects), toAny(na.majorProjects),
    (it) => strOf(it['projectName']),
    [['projectName','项目名称'],['source','来源'],['totalFunding','经费'],['personalRole','角色']],
  ))

  // Awards collection
  push(collectionDiff(
    'applicant.awards', '奖励表彰',
    toAny(oa.awards), toAny(na.awards),
    (it) => strOf(it['awardName']),
    [['awardName','奖项名称'],['awardDate','获奖时间'],['awardingBody','颁奖单位']],
  ))

  // Software copyrights collection
  push(collectionDiff(
    'applicant.softwareCopyrights', '软件著作权',
    toAny(oa.softwareCopyrights), toAny(na.softwareCopyrights),
    (it) => strOf(it['softwareName']),
    [['softwareName','软件名称'],['registrationNumber','登记号'],['approvalDate','批准日期']],
  ))

  // Products collection
  push(collectionDiff(
    'applicant.products', '主要产品',
    toAny(oa.products), toAny(na.products),
    (it) => strOf(it['productName']),
    [['productName','产品名称'],['launchDate','上市时间']],
  ))

  // Books collection
  push(collectionDiff(
    'applicant.books', '代表性著作',
    toAny(oa.books), toAny(na.books),
    (it) => strOf(it['title']),
    [['title','书名'],['publishYear','出版年份'],['publisher','出版社']],
  ))

  // Conference reports collection
  push(collectionDiff(
    'applicant.conferenceReports', '学术会议报告',
    toAny(oa.conferenceReports), toAny(na.conferenceReports),
    (it) => strOf(it['title']),
    [['title','题目'],['conferenceName','会议'],['year','年份']],
  ))

  // Academic positions collection
  push(collectionDiff(
    'applicant.academicPositions', '学术任职',
    toAny(oa.academicPositions), toAny(na.academicPositions),
    (it) => `${strOf(it['organizationOrJournal'])} · ${strOf(it['position'])}`,
    [['organizationOrJournal','组织/期刊'],['position','职务']],
  ))

  // Founded companies collection
  push(collectionDiff(
    'applicant.foundedCompanies', '异地创办企业',
    toAny(oa.foundedCompanies), toAny(na.foundedCompanies),
    (it) => strOf(it['companyName']),
    [['companyName','企业名称'],['personalRole','本人角色'],['companyInfo','企业情况']],
  ))

  // Project stages collection
  push(collectionDiff(
    'projectStages', '阶段性目标',
    toAny(oldData.projectStages), toAny(newData.projectStages),
    (it) => strOf(it['stageLabel']),
    [['stageLabel','阶段名称'],['startDate','开始'],['endDate','结束'],['plannedInvestment','预计投入'],['stageGoal','阶段目标']],
  ))

  // OrgInfo honors collection
  push(collectionDiff(
    'orgInfo.honors', '单位荣誉',
    toAny(oldData.orgInfo.honors), toAny(newData.orgInfo.honors),
    (it) => strOf(it['honorName']),
    [['honorName','荣誉名称'],['awardDate','获得时间'],['issuingDepartment','颁发部门']],
  ))

  return changes
}
