import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType,
  PageOrientation, convertInchesToTwip, Header, Footer, PageNumber,
  TableLayoutType, VerticalAlign, HeightRule,
} from 'docx'
import type { ExportProject, Education, Work, MajorProject, Paper, Patent, SoftwareCopyright, Product, Award, Book, ConferenceReport, AcademicPosition, FoundedCompany, TeamMember, ProjectStage } from './types.js'

// ── Constants ─────────────────────────────────────────────────────────────────

const FONT_BODY  = '仿宋_GB2312'
const FONT_HEAD  = '黑体'
const FONT_TITLE = '宋体'

/** Half-points (docx internal unit) */
const PT = (pt: number) => pt * 2

const BORDER_STD = { style: BorderStyle.SINGLE, size: 6, color: '000000' }
const CELL_BORDERS = { top: BORDER_STD, bottom: BORDER_STD, left: BORDER_STD, right: BORDER_STD }

const SHADING_LABEL = { type: ShadingType.CLEAR, fill: 'E8E8E8', color: 'auto' }

const val = (v: string | number | null | undefined, unit = '') =>
  (v !== null && v !== undefined && String(v).trim() !== '' && String(v) !== '0')
    ? `${v}${unit}`
    : '/'

// ── Helpers ───────────────────────────────────────────────────────────────────

function heading1(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT_HEAD, size: PT(16), bold: true })],
    spacing: { before: 240, after: 120 },
    alignment: AlignmentType.LEFT,
  })
}

function heading2(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, font: FONT_HEAD, size: PT(14), bold: true })],
    spacing: { before: 160, after: 80 },
  })
}

function body(text: string, options: { bold?: boolean; indent?: boolean } = {}): Paragraph {
  return new Paragraph({
    children: [new TextRun({
      text,
      font: FONT_BODY,
      size: PT(12),
      bold: options.bold,
    })],
    indent: options.indent ? { firstLine: PT(24) } : undefined,
    spacing: { line: 360, before: 0, after: 60 },
  })
}

function pageBreak(): Paragraph {
  return new Paragraph({ pageBreakBefore: true, children: [] })
}

function emptyLine(count = 1): Paragraph[] {
  return Array.from({ length: count }, () => new Paragraph({ children: [], spacing: { before: 0, after: 60 } }))
}

/** Standard bordered table cell */
function cell(
  content: string | Paragraph | Paragraph[],
  opts: {
    width?: number
    bold?: boolean
    shaded?: boolean
    colSpan?: number
    rowSpan?: number
    align?: (typeof AlignmentType)[keyof typeof AlignmentType]
    vertAlign?: (typeof VerticalAlign)[keyof typeof VerticalAlign]
  } = {},
): TableCell {
  const paras: Paragraph[] =
    typeof content === 'string'
      ? [new Paragraph({
          children: [new TextRun({
            text: content,
            font: FONT_BODY,
            size: PT(11),
            bold: opts.bold,
          })],
          alignment: opts.align ?? AlignmentType.LEFT,
          spacing: { before: 60, after: 60 },
        })]
      : Array.isArray(content) ? content : [content]

  return new TableCell({
    borders: CELL_BORDERS,
    shading: opts.shaded ? SHADING_LABEL : undefined,
    columnSpan: opts.colSpan,
    rowSpan: opts.rowSpan,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verticalAlign: (opts.vertAlign ?? VerticalAlign.CENTER) as any,
    width: opts.width !== undefined ? { size: opts.width, type: WidthType.DXA } : undefined,
    children: paras,
  })
}

/** Label + value row (2-col) */
function row2(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      cell(label, { shaded: true, bold: true, width: 2000 }),
      cell(value, { width: 6500 }),
    ],
  })
}

/** 4-col row: label1 / val1 / label2 / val2 */
function row4(l1: string, v1: string, l2: string, v2: string): TableRow {
  return new TableRow({
    children: [
      cell(l1, { shaded: true, bold: true, width: 1500 }),
      cell(v1, { width: 3000 }),
      cell(l2, { shaded: true, bold: true, width: 1500 }),
      cell(v2, { width: 2500 }),
    ],
  })
}

/** Header row for a collection table */
function headerRow(cols: string[]): TableRow {
  return new TableRow({
    tableHeader: true,
    height: { value: 400, rule: HeightRule.EXACT },
    children: cols.map((c) =>
      new TableCell({
        borders: CELL_BORDERS,
        shading: SHADING_LABEL,
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          children: [new TextRun({ text: c, font: FONT_BODY, size: PT(10), bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
        })],
      }),
    ),
  })
}

/** A data row for a collection table (each cell is plain text) */
function dataRow(values: string[]): TableRow {
  return new TableRow({
    children: values.map((v) =>
      new TableCell({
        borders: CELL_BORDERS,
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          children: [new TextRun({ text: v, font: FONT_BODY, size: PT(10) })],
          alignment: AlignmentType.LEFT,
          spacing: { before: 40, after: 40 },
        })],
      }),
    ),
  })
}

function emptyDataRow(cols: number): TableRow {
  return dataRow(Array(cols).fill('/'))
}

function makeTable(rows: TableRow[], widths?: number[]): Table {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
    columnWidths: widths,
  })
}

// ── Section builders ──────────────────────────────────────────────────────────

/** 封面 */
function buildCover(p: ExportProject): (Paragraph | Table)[] {
  const reg = p.registration
  const a = p.applicant

  return [
    new Paragraph({
      children: [new TextRun({ text: '宁波市人才工程项目申报书', font: FONT_TITLE, size: PT(22), bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 720, after: 360 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: reg?.applicationType ?? '创业类项目',
        font: FONT_BODY, size: PT(14),
      })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 720 },
    }),
    makeTable([
      row4('专业领域', reg?.professionalDomain ?? '/', '申报类型', reg?.applicationType ?? '/'),
      row4('专业方向', reg?.professionalDirection ?? '/', '引进地', reg?.introductionArea ?? '/'),
      row4('用人单位', p.orgInfo.name, '带头人', a.name),
      row4('带头人手机', a.phone, '联系人', reg?.contactPerson ?? a.name),
      row4('联系人手机', reg?.contactPhone ?? a.phone, '填表日期', reg?.applicationDate ?? '/'),
    ]),
    ...emptyLine(2),
    new Paragraph({
      children: [new TextRun({ text: '（宁波市经济和信息化局制）', font: FONT_BODY, size: PT(11) })],
      alignment: AlignmentType.CENTER,
    }),
  ]
}

/** 一、申报人基本信息 */
function buildApplicantBasic(p: ExportProject): (Paragraph | Table)[] {
  const a = p.applicant
  const nameParts = a.name.split('') // Chinese names don't split to surname/given cleanly; output full name in first cell
  const fullName = nameParts.join('')

  return [
    heading1('一、申报人基本信息'),
    makeTable([
      row4('姓名（中文）', fullName, '英文姓名', val(a.nameEn)),
      row4('本国语言姓名', val(a.nameNative) || '/', '性别', a.gender),
      row4('出生日期', val(a.birthDate), '出生地区', val(a.birthPlace)),
      row4('国籍（地区）', a.nationality, '是否华裔', a.nationality !== '中国' ? (a.isEthnicChinese ? '是' : '否') : '—'),
      row4('证件类型', a.idType, '证件号码', val(a.idNumber)),
      row4('证件有效期', val(a.idExpiry), '本人手机号', a.phone),
      row4('最高学位', a.highestDegree, '毕业院校', val(a.highestDegreeInstitution)),
      row4('所学专业', val(a.highestDegreeMajor), '是否已全职到岗', a.isFullTimeOnBoarded ? '是' : '否'),
      row4('（拟任）职务', val(a.intendedPosition), '（拟）到岗时间', val(a.plannedArrivalDate)),
      row4('劳动合同起', val(a.laborContractStart), '劳动合同止', val(a.laborContractEnd)),
      row4('（拟）来宁时间', val(a.comeToNingboDate), '（拟）回国时间', val(a.returnFromAbroadDate)),
      row2('来宁前单位及职务', val(a.lastOrgBeforeComeToNingbo)),
      row2('回国前单位及职务', val(a.lastOrgBeforeReturnFromAbroad)),
      row2('电子邮件', val(a.email)),
      row2('曾获荣誉', val(a.honorsCertificates)),
    ]),
  ]
}

/** 二、申报人教育经历 */
function buildEducations(p: ExportProject): (Paragraph | Table)[] {
  const rows = p.applicant.educations.length > 0
    ? p.applicant.educations.map((e: Education, i: number) => dataRow([
        String(i + 1),
        e.country,
        e.isFullTime ? '是' : '否',
        e.startDate,
        e.endDate,
        e.institution,
        e.major,
        e.educationLevel,
        e.degreeLevel,
        e.isHighestDegree ? '是' : '否',
      ]))
    : [emptyDataRow(10)]

  return [
    heading1('二、申报人教育经历'),
    body('从本科填起，按起始时间排序；博士后、访学计入工作经历。'),
    makeTable([
      headerRow(['序号', '国家', '全日制', '开始', '结束', '院校名称', '专业', '学历', '学位', '最高学位']),
      ...rows,
    ]),
  ]
}

/** 三、申报人工作经历 */
function buildWorks(p: ExportProject): (Paragraph | Table)[] {
  const rows = p.applicant.works.length > 0
    ? p.applicant.works.map((w: Work, i: number) => dataRow([
        String(i + 1),
        w.country,
        w.startDate,
        w.endDate ?? '至今',
        w.organization,
        w.position,
        w.workNature,
        [
          w.isLastBeforeComeToNingbo    ? '来宁前最后工作' : '',
          w.isLastBeforeReturnFromAbroad ? '回国前最后工作' : '',
        ].filter(Boolean).join('、') || '/',
      ]))
    : [emptyDataRow(8)]

  return [
    heading1('三、申报人工作经历'),
    body('按时间排序。3 个月以上非教育断档期需注明。'),
    makeTable([
      headerRow(['序号', '国家', '开始', '结束', '单位名称', '职务', '工作性质', '标记']),
      ...rows,
    ]),
  ]
}

/** 四、成果业绩 */
function buildAchievements(p: ExportProject): (Paragraph | Table)[] {
  const a = p.applicant
  const out: (Paragraph | Table)[] = [heading1('四、申报人成果业绩')]

  // 4.1 主要项目
  out.push(heading2('（一）领导（参与）过的主要项目'))
  const projectRows = a.majorProjects.length > 0
    ? a.majorProjects.map((mp: MajorProject, i: number) => dataRow([
        String(i + 1), mp.projectName,
        `${mp.startDate} — ${mp.endDate}`,
        mp.source, mp.undertakingUnit,
        val(mp.totalFunding, ' 万元'), mp.personalRole,
      ]))
    : [emptyDataRow(7)]
  out.push(makeTable([
    headerRow(['序号', '项目名称', '起止时间', '来源', '承接单位', '经费总额', '本人角色']),
    ...projectRows,
  ]))

  // 4.2 代表性论文
  out.push(heading2('（二）代表性论文'))
  const paperRows = a.papers.length > 0
    ? a.papers.map((pp: Paper, i: number) => dataRow([
        String(i + 1), pp.title, pp.authors, pp.journal,
        `${pp.personalRank}/${pp.totalAuthors}`,
        pp.publishDate,
        pp.impactFactor !== null ? String(pp.impactFactor) : '/',
        pp.isCorrespondingAuthor ? '是' : '否',
      ]))
    : [emptyDataRow(8)]
  out.push(makeTable([
    headerRow(['序号', '论文标题', '作者', '发表载体', '排名/总数', '发表时间', 'IF', '通讯作者']),
    ...paperRows,
  ]))

  // 4.3 代表性授权专利
  out.push(heading2('（三）代表性授权专利'))
  const patentRows = a.patents.filter((pt: Patent) => pt.status === '已授权').length > 0
    ? a.patents.filter((pt: Patent) => pt.status === '已授权').map((pt: Patent, i: number) => dataRow([
        String(i + 1), pt.patentType, pt.name, pt.authorizedCountry,
        pt.patentNumber, `${pt.personalRank}/${pt.totalInventors}`, pt.authorizedDate,
        pt.isVerified ? '已验证' : '未验证',
      ]))
    : [emptyDataRow(8)]
  out.push(makeTable([
    headerRow(['序号', '专利类型', '专利名称', '授权国', '专利号', '排名/总数', '授权时间', '验证状态']),
    ...patentRows,
  ]))

  // 4.4 软件著作权
  out.push(heading2('（四）软件著作权'))
  const swRows = a.softwareCopyrights.length > 0
    ? a.softwareCopyrights.map((sw: SoftwareCopyright, i: number) => dataRow([
        String(i + 1), sw.softwareName, sw.authorizedCountry,
        sw.registrationNumber, sw.copyrightHolder, sw.approvalDate,
      ]))
    : [emptyDataRow(6)]
  out.push(makeTable([
    headerRow(['序号', '软件全称', '授权国', '登记号', '著作权人', '批准日期']),
    ...swRows,
  ]))

  // 4.5 主要产品
  out.push(heading2('（五）领导（参与）开发过的主要产品'))
  const productRows = a.products.length > 0
    ? a.products.map((pd: Product, i: number) => dataRow([
        String(i + 1), pd.productName, pd.relyingUnit, pd.launchDate, pd.impactAndContribution,
      ]))
    : [emptyDataRow(5)]
  out.push(makeTable([
    headerRow(['序号', '产品名称', '依托单位', '上市时间', '影响力与个人贡献（≤100字）']),
    ...productRows,
  ]))

  // 4.6 奖励表彰
  out.push(heading2('（六）奖励表彰'))
  const awardRows = a.awards.length > 0
    ? a.awards.map((aw: Award, i: number) => dataRow([
        String(i + 1), aw.awardDate, aw.awardName, aw.awardingBody, String(aw.personalRank),
      ]))
    : [emptyDataRow(5)]
  out.push(makeTable([
    headerRow(['序号', '获奖时间', '获奖名称', '颁奖单位', '本人排序']),
    ...awardRows,
  ]))

  // 4.7 代表性著作
  out.push(heading2('（七）代表性著作'))
  const bookRows = a.books.length > 0
    ? a.books.map((bk: Book, i: number) => dataRow([
        String(i + 1), bk.title, String(bk.publishYear),
        `${bk.personalRank}/${bk.totalAuthors}`, bk.publisher, bk.publishPlace,
      ]))
    : [emptyDataRow(6)]
  out.push(makeTable([
    headerRow(['序号', '著作题目', '出版年份', '排名/总数', '出版社', '出版地']),
    ...bookRows,
  ]))

  // 4.8 学术会议报告
  out.push(heading2('（八）重要学术会议邀请报告'))
  const confRows = a.conferenceReports.length > 0
    ? a.conferenceReports.map((cr: ConferenceReport, i: number) => dataRow([
        String(i + 1), cr.title, String(cr.year),
        `${cr.personalRank}/${cr.totalPresenters}`, cr.conferenceName, cr.reportType,
      ]))
    : [emptyDataRow(6)]
  out.push(makeTable([
    headerRow(['序号', '报告题目', '年份', '排名/总数', '会议名称', '报告类型']),
    ...confRows,
  ]))

  // 4.9 学术任职
  out.push(heading2('（九）国内外学术组织及重要期刊任职'))
  const posRows = a.academicPositions.length > 0
    ? a.academicPositions.map((ap: AcademicPosition, i: number) => dataRow([
        String(i + 1), ap.organizationOrJournal, ap.position,
        ap.tenureStart, ap.tenureEnd ?? '至今',
      ]))
    : [emptyDataRow(5)]
  out.push(makeTable([
    headerRow(['序号', '组织或期刊名称', '职务', '任期开始', '任期结束']),
    ...posRows,
  ]))

  return out
}

/** 五、个人陈述 */
function buildPersonalStatement(p: ExportProject): (Paragraph | Table)[] {
  const a = p.applicant
  const out: (Paragraph | Table)[] = [heading1('五、申报人个人陈述')]

  out.push(heading2('（一）个人简要介绍（≤500字）'))
  out.push(...(a.personalBrief
    ? a.personalBrief.split('\n').map((line) => body(line.trim(), { indent: true }))
    : [body('/', { indent: true })]))

  out.push(heading2('（二）过往主要业绩简述（≤1000字）'))
  out.push(...(a.achievementsSummary
    ? a.achievementsSummary.split('\n').map((line) => body(line.trim(), { indent: true }))
    : [body('/', { indent: true })]))

  out.push(heading2('（三）有无创业经历'))
  out.push(body(a.hasEntrepreneurExperience ? '有' : '无'))

  if (a.foundedCompanies.length > 0) {
    out.push(heading2('（四）异地创办且仍存续经营的企业'))
    const fcRows = a.foundedCompanies.map((fc: FoundedCompany, i: number) => dataRow([
      String(i + 1), fc.companyName, fc.personalRole, fc.personalPosition,
      fc.companyInfo, fc.relationToNingboCompany,
    ]))
    out.push(makeTable([
      headerRow(['序号', '企业名称', '本人角色', '本人职务', '企业情况', '与宁波公司关系']),
      ...fcRows,
    ]))
  }

  out.push(heading2('（五）有无涉法涉诉/竞业禁止等情况'))
  out.push(body(a.legalIssues.hasIssue
    ? `有：${a.legalIssues.description}`
    : '无'))

  return out
}

/** 项目实施 */
function buildProjectImplementation(p: ExportProject): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [
    pageBreak(),
    new Paragraph({
      children: [new TextRun({ text: '项目实施', font: FONT_HEAD, size: PT(18), bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 360 },
    }),
    heading2('项目简要介绍（≤500字）'),
    ...(p.projectBrief
      ? p.projectBrief.split('\n').map((l) => body(l.trim(), { indent: true }))
      : [body('/', { indent: true })]),

    heading1('一、项目背景意义'),
    ...(p.projectBackground
      ? p.projectBackground.split('\n').map((l) => body(l.trim(), { indent: true }))
      : [body('/', { indent: true })]),

    heading1('二、项目实施内容'),
    ...(p.projectContent
      ? p.projectContent.split('\n').map((l) => body(l.trim(), { indent: true }))
      : [body('/', { indent: true })]),
  ]

  // 三、阶段性目标
  out.push(heading1('三、阶段性目标'))
  if (p.projectStages.length > 0) {
    const stageRows = p.projectStages.map((s: ProjectStage, i: number) => dataRow([
      String(i + 1), s.stageLabel, s.startDate, s.endDate,
      val(s.plannedInvestment, ' 万元'), s.stageGoal,
    ]))
    out.push(makeTable([
      headerRow(['序号', '阶段', '开始', '结束', '预计投入', '阶段性目标']),
      ...stageRows,
    ]))
  } else {
    out.push(body('（暂无阶段目标）'))
  }

  // 投入预测
  out.push(heading2('项目总投入预测（万元，未来5年，不含申报年份）'))
  out.push(makeTable([
    row2('项目总投入预测', val(p.totalInvestmentForecast, ' 万元')),
    row2('用人单位已投入', val(p.alreadyInvestedByOrg, ' 万元')),
    row2('已获区县市支持资金', val(p.govSupportReceived, ' 万元')),
    row2('用人单位未来5年计划投入', val(p.plannedInvestmentByOrg, ' 万元')),
  ]))

  out.push(
    heading1('四、现有工作基础和条件'),
    ...(p.workBasis
      ? p.workBasis.split('\n').map((l) => body(l.trim(), { indent: true }))
      : [body('/', { indent: true })]),

    heading1('五、预期贡献及验收指标'),
    ...(p.expectedContribution
      ? p.expectedContribution.split('\n').map((l) => body(l.trim(), { indent: true }))
      : [body('/', { indent: true })]),

    heading1('六、预期经济效益指标（创业类项目）'),
    ...(p.economicEfficiency
      ? p.economicEfficiency.split('\n').map((l) => body(l.trim(), { indent: true }))
      : [body('/', { indent: true })]),
  )

  return out
}

/** 项目成员 */
function buildTeamMembers(p: ExportProject): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [heading1('项目成员')]
  if (p.teamMembers.length > 0) {
    const memberRows = p.teamMembers.map((m: TeamMember, i: number) => dataRow([
      String(i + 1), m.memberType, m.name, m.idType, m.idNumber,
      m.phone, m.birthDate, String(m.age), m.nationality, m.division,
    ]))
    out.push(makeTable([
      headerRow(['序号', '类型', '姓名', '证件类型', '证件号', '手机', '出生日期', '年龄', '国籍', '分工']),
      ...memberRows,
    ]))
  } else {
    out.push(body('（暂无项目成员）'))
  }
  return out
}

/** 单位介绍 */
function buildOrgInfo(p: ExportProject): (Paragraph | Table)[] {
  const o = p.orgInfo
  const out: (Paragraph | Table)[] = [
    pageBreak(),
    new Paragraph({
      children: [new TextRun({ text: '单位介绍', font: FONT_HEAD, size: PT(18), bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 360 },
    }),
    heading1('一、用人单位基本情况'),
    makeTable([
      row4('单位全称', o.name, '单位类型', val(o.orgType)),
      row4('统一社会信用代码', val(o.creditCode), '（拟）注册成立时间', val(o.establishedDate)),
      row4('注册资本（万元）', val(o.registeredCapital), '员工总数', val(o.totalEmployees, ' 人')),
      row2('单位地址', val(o.address)),
      row4('联系人', val(o.contactPerson), '联系人手机', val(o.contactPhone)),
    ]),
    ...emptyLine(),
    heading2('用人单位简介（≤500字）'),
    ...(o.orgBrief
      ? o.orgBrief.split('\n').map((l) => body(l.trim(), { indent: true }))
      : [body('/', { indent: true })]),
  ]

  // 单位荣誉
  if (o.honors.length > 0) {
    out.push(heading1('二、单位荣誉（≤5项）'))
    const honorRows = o.honors.map((h, i) => dataRow([
      String(i + 1), h.awardDate, h.honorName, h.issuingDepartment,
    ]))
    out.push(makeTable([
      headerRow(['序号', '获得时间', '荣誉名称', '颁发部门']),
      ...honorRows,
    ]))
  }

  // 研发能力和经济效益
  out.push(
    heading1('三、单位研发能力和经济效益'),
    makeTable([
      row4('上一年度研发经费支出（万元）', val(o.rdExpenditure), '研发经费占主营收入比重（%）', val(o.rdRevenueRatio, '%')),
      row4('研发人员数', val(o.rdPersonnelCount, ' 人'), '截至上年度末发明专利数量', val(o.orgInventionPatentCount, ' 件')),
      row4('已完成融资轮次', val(o.fundingRound), '累计融资额（万元）', val(o.totalFunding)),
      row4('上年度主营业务收入（万元）', val(o.totalRevenue), '上年度利润总额（万元）', val(o.lastYearProfit)),
    ]),
    ...emptyLine(4),
    new Paragraph({
      children: [new TextRun({ text: '用人单位签章：', font: FONT_BODY, size: PT(12) })],
      spacing: { before: 0, after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '年    月    日', font: FONT_BODY, size: PT(12) })],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 60 },
    }),
  )

  return out
}

// ── Main export function ──────────────────────────────────────────────────────

export async function generateApplicationDocx(project: ExportProject): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [
    ...buildCover(project),
    pageBreak(),
    ...buildApplicantBasic(project),
    ...buildEducations(project),
    ...buildWorks(project),
    ...buildAchievements(project),
    ...buildPersonalStatement(project),
    ...buildProjectImplementation(project),
    ...buildTeamMembers(project),
    ...buildOrgInfo(project),
  ]

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT_BODY, size: PT(12) },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { orientation: PageOrientation.PORTRAIT, width: convertInchesToTwip(8.27), height: convertInchesToTwip(11.69) },
          margin: { top: convertInchesToTwip(1.18), bottom: convertInchesToTwip(1.18), left: convertInchesToTwip(1.18), right: convertInchesToTwip(0.98) },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: '宁波市人才工程项目申报书', font: FONT_BODY, size: PT(9), color: '666666' })],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ children: ['第 ', PageNumber.CURRENT], font: FONT_BODY, size: PT(9) }),
              new TextRun({ children: [' / ', PageNumber.TOTAL_PAGES, ' 页'], font: FONT_BODY, size: PT(9) }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children,
    }],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
