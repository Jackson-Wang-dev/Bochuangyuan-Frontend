import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Check, AlertTriangle, Upload, FileText, X,
} from 'lucide-react'
import { useProjectDashboardStore } from '@/store/projectDashboardStore'
import type {
  Project, CollectionItem, IdType, DegreeLevel,
  Applicant, TeamMember, Education, Work, MajorProject, Paper, Patent,
  SoftwareCopyright, Product, Award, Book, ConferenceReport,
  AcademicPosition, FoundedCompany, ProjectStage, OrgHonor, OrgInfo,
} from '@/types/project'
import RepeatableCollection from '@/components/RepeatableCollection'
import {
  TEAM_MEMBER_SCHEMA, EDUCATION_SCHEMA, WORK_SCHEMA, MAJOR_PROJECT_SCHEMA,
  PAPER_SCHEMA, PATENT_SCHEMA, SOFTWARE_COPYRIGHT_SCHEMA, PRODUCT_SCHEMA,
  AWARD_SCHEMA, BOOK_SCHEMA, CONFERENCE_REPORT_SCHEMA, ACADEMIC_POSITION_SCHEMA,
  FOUNDED_COMPANY_SCHEMA, PROJECT_STAGE_SCHEMA, ORG_HONOR_SCHEMA,
} from '@/types/collectionSchemas'
import { cn } from '@/lib/utils'

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS = ['封面', '申报人', '项目成员', '项目信息', '成果业绩', '个人陈述', '用人单位', '记录及提交'] as const

const PROJ_INFO_SUB = [
  '项目背景意义', '项目实施内容', '阶段性目标', '工作基础和条件', '预期贡献及验收指标', '预期经济效益指标',
] as const

// TODO[domain-mock]: 替换为后端主办方配置的领域枚举接口，当前为硬编码 mock，覆盖范围和 code 不一定与实际竞赛匹配
const TOP_DOMAINS = [
  {
    code: '1', label: '人工智能与大数据',
    children: [
      { code: '1-1', label: '人工智能', children: [
        { code: '1-1-1', label: '机器学习与深度学习' }, { code: '1-1-2', label: '计算机视觉' },
        { code: '1-1-3', label: '自然语言处理' }, { code: '1-1-4', label: '智能机器人' },
      ]},
      { code: '1-2', label: '大数据与云计算', children: [
        { code: '1-2-1', label: '数据挖掘与分析' }, { code: '1-2-2', label: '分布式计算' },
      ]},
    ],
  },
  {
    code: '2', label: '生物医药与健康',
    children: [
      { code: '2-1', label: '生物技术', children: [
        { code: '2-1-1', label: '基因工程' }, { code: '2-1-2', label: '细胞治疗' }, { code: '2-1-3', label: '体外诊断' },
      ]},
      { code: '2-2', label: '新药研发', children: [
        { code: '2-2-1', label: '化学药' }, { code: '2-2-2', label: '生物制品' },
      ]},
    ],
  },
  {
    code: '3', label: '新能源与环保',
    children: [
      { code: '3-1', label: '新能源', children: [
        { code: '3-1-1', label: '光伏' }, { code: '3-1-2', label: '储能' }, { code: '3-1-3', label: '氢能' },
      ]},
      { code: '3-2', label: '节能环保', children: [
        { code: '3-2-1', label: '废物资源化' }, { code: '3-2-2', label: '水处理' },
      ]},
    ],
  },
  {
    code: '4', label: '高端装备与先进制造',
    children: [
      { code: '4-1', label: '智能制造', children: [
        { code: '4-1-1', label: '工业机器人' }, { code: '4-1-2', label: '数控机床' }, { code: '4-1-3', label: '工业互联网' },
      ]},
      { code: '4-2', label: '航空航天', children: [
        { code: '4-2-1', label: '无人机' }, { code: '4-2-2', label: '航空发动机' },
      ]},
    ],
  },
  {
    code: '5', label: '新材料',
    children: [
      { code: '5-1', label: '先进金属材料', children: [
        { code: '5-1-1', label: '合金材料' }, { code: '5-1-2', label: '粉末冶金' },
      ]},
      { code: '5-2', label: '前沿新材料', children: [
        { code: '5-2-1', label: '3D打印材料' }, { code: '5-2-2', label: '纳米材料' },
      ]},
    ],
  },
  {
    code: '6', label: '数字经济与信息技术',
    children: [
      { code: '6-1', label: '信息安全', children: [
        { code: '6-1-1', label: '网络安全' }, { code: '6-1-2', label: '数据安全' },
      ]},
      { code: '6-2', label: '集成电路', children: [
        { code: '6-2-1', label: '芯片设计' }, { code: '6-2-2', label: '半导体材料' },
      ]},
    ],
  },
  {
    code: '7', label: '现代农业',
    children: [
      { code: '7-1', label: '智慧农业', children: [
        { code: '7-1-1', label: '精准农业' }, { code: '7-1-2', label: '农业物联网' },
      ]},
      { code: '7-2', label: '农业生物技术', children: [
        { code: '7-2-1', label: '育种技术' }, { code: '7-2-2', label: '农药研发' },
      ]},
    ],
  },
]

// ── Draft state ────────────────────────────────────────────────────────────────

// TODO[draft-persist]: DraftState 仅存活于 React 内存，刷新/关闭浏览器后全部丢失。
// 如需草稿持久化，在 useEffect 里同步到 localStorage，初始化时从 localStorage 读取。
interface DraftState {
  // Tab 0: Cover
  declarationName: string; projectName: string; coreTech: string
  projectBrief: string; domainTopCode: string; domainMidCode: string; domainLeafCode: string
  // Tab 1: Applicant scalars
  aName: string; aNameEn: string; aNameNative: string
  aGender: '男' | '女' | '其他'; aBirthDate: string; aNationality: string
  aIsEthnicChinese: boolean; aBirthPlace: string; aIdType: IdType; aIdNumber: string
  aIdExpiry: string; aIsFullTimeOnBoarded: boolean; aIntendedPosition: string
  aPlannedArrivalDate: string; aLaborContractStart: string; aLaborContractEnd: string
  aPhone: string; aEmail: string; aHighestDegree: DegreeLevel
  aHighestDegreeInstitution: string; aHighestDegreeMajor: string
  aComeToNingboDate: string; aLastOrgBeforeComeToNingbo: string
  aReturnFromAbroadDate: string; aLastOrgBeforeReturnFromAbroad: string
  aHonorsCertificates: string
  // Tab 1: Applicant collections (education + work = chapters 2 & 3)
  educations: CollectionItem[]; works: CollectionItem[]
  // Tab 2: Team
  teamMembers: CollectionItem[]
  // Tab 3: Project Info
  projectBackground: string; projectContent: string; workBasis: string
  expectedContribution: string; economicEfficiency: string
  projectStages: CollectionItem[]
  totalInvestmentForecast: string; alreadyInvestedByOrg: string
  govSupportReceived: string; plannedInvestmentByOrg: string
  // Tab 4: Achievements (chapter 4 sub-collections)
  majorProjects: CollectionItem[]; papers: CollectionItem[]; patents: CollectionItem[]
  softwareCopyrights: CollectionItem[]; products: CollectionItem[]
  awards: CollectionItem[]; books: CollectionItem[]
  conferenceReports: CollectionItem[]; academicPositions: CollectionItem[]
  // Tab 5: Personal Statement
  personalBrief: string; achievementsSummary: string
  hasEntrepreneurExperience: boolean; foundedCompanies: CollectionItem[]
  legalIssuesHasIssue: boolean; legalIssuesDescription: string
  // Tab 6: Org
  oName: string; oOrgType: string; oCreditCode: string; oEstablishedDate: string
  oRegisteredCapital: string; oTotalEmployees: string; oAddress: string
  oContactPerson: string; oContactPhone: string; oOrgBrief: string
  oRdExpenditure: string; oRdRevenueRatio: string; oRdPersonnelCount: string
  oOrgInventionPatentCount: string; oTotalRevenue: string; oLastYearProfit: string
  oTotalFunding: string; oFundingRound: string; orgHonors: CollectionItem[]
  // Tab 7: Attachments + Commitment
  attachments: { name: string; size: string; fileType: string }[]
  commitmentChecked: boolean
}

const EMPTY_DRAFT: DraftState = {
  declarationName: '', projectName: '', coreTech: '', projectBrief: '',
  domainTopCode: '', domainMidCode: '', domainLeafCode: '',
  aName: '', aNameEn: '', aNameNative: '', aGender: '男',
  aBirthDate: '', aNationality: '中国', aIsEthnicChinese: false, aBirthPlace: '',
  aIdType: '居民身份证', aIdNumber: '', aIdExpiry: '',
  aIsFullTimeOnBoarded: false, aIntendedPosition: '',
  aPlannedArrivalDate: '', aLaborContractStart: '', aLaborContractEnd: '',
  aPhone: '', aEmail: '',
  aHighestDegree: '博士', aHighestDegreeInstitution: '', aHighestDegreeMajor: '',
  aComeToNingboDate: '', aLastOrgBeforeComeToNingbo: '',
  aReturnFromAbroadDate: '', aLastOrgBeforeReturnFromAbroad: '',
  aHonorsCertificates: '', educations: [], works: [],
  teamMembers: [],
  projectBackground: '', projectContent: '', workBasis: '',
  expectedContribution: '', economicEfficiency: '', projectStages: [],
  totalInvestmentForecast: '', alreadyInvestedByOrg: '',
  govSupportReceived: '', plannedInvestmentByOrg: '',
  majorProjects: [], papers: [], patents: [], softwareCopyrights: [],
  products: [], awards: [], books: [], conferenceReports: [], academicPositions: [],
  personalBrief: '', achievementsSummary: '',
  hasEntrepreneurExperience: false, foundedCompanies: [],
  legalIssuesHasIssue: false, legalIssuesDescription: '',
  oName: '', oOrgType: '', oCreditCode: '', oEstablishedDate: '',
  oRegisteredCapital: '', oTotalEmployees: '', oAddress: '',
  oContactPerson: '', oContactPhone: '', oOrgBrief: '',
  oRdExpenditure: '', oRdRevenueRatio: '', oRdPersonnelCount: '',
  oOrgInventionPatentCount: '', oTotalRevenue: '', oLastYearProfit: '',
  oTotalFunding: '', oFundingRound: '', orgHonors: [],
  attachments: [],
  commitmentChecked: false,
}

const MOCK_PRESET: Partial<DraftState> = {
  declarationName: '基于类脑计算的端侧AI推理框架',
  projectName: '轻量化类脑计算AI推理框架关键技术研究与产业化应用',
  coreTech: '脉冲神经网络稀疏推理专利 ZL202410098765.4',
  projectBrief: '本项目依托类脑计算芯片架构，研发能效比超传统GPU 10倍的端侧AI推理框架，目标应用于智能制造、医疗影像等领域，解决云端推理高延迟与高功耗难题。',
  domainTopCode: '1', domainMidCode: '1-1', domainLeafCode: '1-1-1',
  aName: '李明远', aNameEn: 'Li Mingyuan', aGender: '男',
  aBirthDate: '1985-06-15', aNationality: '中国',
  aIdType: '居民身份证', aIdNumber: '33020019850615XXXX',
  aPhone: '13800138001', aEmail: 'lmy@nbjz-tech.com',
  aHighestDegree: '博士', aHighestDegreeInstitution: '浙江大学',
  aHighestDegreeMajor: '计算机科学与技术',
  aIsFullTimeOnBoarded: true, aIntendedPosition: '首席技术官（CTO）',
  aPlannedArrivalDate: '2023-03-01',
  aComeToNingboDate: '2023-03',
  aLastOrgBeforeComeToNingbo: '某知名互联网公司 AI 研究院',
  projectBackground: '随着AI应用从云端向边缘侧迁移，传统GPU在功耗、成本和实时性方面的局限日益凸显。类脑计算以其稀疏激活、事件驱动的特性，有望在端侧推理场景实现突破性能效比。',
  projectContent: '本项目重点攻克三大关键技术：（1）面向SNN的高效权重量化与网络压缩算法；（2）异构芯片适配的统一编译工具链；（3）端云协同的增量学习框架。',
  workBasis: '团队已在脉冲神经网络领域深耕8年，发表SCI论文12篇，持有发明专利6项，与宁波智能制造研究院签署了合作协议，具备充分的工作基础和条件。',
  oName: '宁波智算科技有限公司', oOrgType: '有限责任公司',
  oCreditCode: '91330200MA2XXXXX01', oEstablishedDate: '2020-03',
  oRegisteredCapital: '2000', oTotalEmployees: '45',
  oAddress: '宁波市鄞州区高新技术产业开发区智能大厦501室',
  oContactPerson: '张婷婷', oContactPhone: '13900139001',
  oOrgBrief: '公司专注于边缘AI芯片与软件栈的研发，已完成Pre-A轮融资3000万元，产品已在智能工厂、医疗器械等场景落地验证。',
  oTotalFunding: '3000', oFundingRound: 'Pre-A轮',
  oRdExpenditure: '800', oRdRevenueRatio: '35',
  oTotalRevenue: '1200', oLastYearProfit: '80',
}

// ── Styles ────────────────────────────────────────────────────────────────────

const IC = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white disabled:bg-slate-50 disabled:text-slate-400'
const TC = `${IC} resize-none`
const SEL = `${IC} appearance-none cursor-pointer`

// ── Validation ────────────────────────────────────────────────────────────────

function validateTab(tab: number, d: DraftState): string[] {
  const e: string[] = []
  if (tab === 0) {
    if (!d.declarationName.trim()) e.push('申报用名为必填项')
    if (!d.projectName.trim()) e.push('项目正式名称为必填项')
    if (!d.domainTopCode) e.push('专业领域（一级）为必填项')
  } else if (tab === 1) {
    if (!d.aName.trim()) e.push('姓名为必填项')
    if (!d.aBirthDate) e.push('出生日期为必填项')
    if (!d.aNationality.trim()) e.push('国籍为必填项')
    // TODO[validation-format]: 补充手机号格式校验（1X开头11位）和身份证号校验位
    if (!d.aPhone.trim()) e.push('手机号为必填项')
  } else if (tab === 3) {
    if (d.projectStages.length < 2) e.push('阶段性目标至少填写2个阶段（申报书要求）')
  } else if (tab === 6) {
    if (!d.oName.trim()) e.push('用人单位名称为必填项')
  } else if (tab === 7) {
    if (!d.commitmentChecked) e.push('请勾选申报人承诺')
  }
  return e
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

type SfFn = <K extends keyof DraftState>(key: K, val: DraftState[K]) => void

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

function SecTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3', className)}>
      {children}
    </p>
  )
}

function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      {(['是', '否'] as const).map((label) => {
        const v = label === '是'
        return (
          <button key={label} type="button" onClick={() => onChange(v)}
            className={cn('px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
              value === v
                ? 'border-brand-blue bg-brand-blue/8 text-brand-blue'
                : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
            {label}
          </button>
        )
      })}
    </div>
  )
}

function ErrorBanner({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null
  return (
    <div className="flex flex-col gap-1 p-3 bg-red-50 border border-red-200 rounded-xl mt-4">
      {errors.map((e) => (
        <p key={e} className="text-xs text-red-600 flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />{e}
        </p>
      ))}
    </div>
  )
}

// ── Tab 0: Cover ──────────────────────────────────────────────────────────────

function CoverTab({ d, sf }: { d: DraftState; sf: SfFn }) {
  const top = TOP_DOMAINS.find((x) => x.code === d.domainTopCode)
  const mids = top?.children ?? []
  const mid = mids.find((x) => x.code === d.domainMidCode)
  const leaves = mid?.children ?? []

  return (
    <div className="space-y-5">
      <SecTitle>项目身份</SecTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="申报用名" required hint="面向评委的简短名称，≤30字">
          <input className={IC} value={d.declarationName}
            onChange={(e) => sf('declarationName', e.target.value)}
            placeholder="例：类脑AI端侧推理框架" />
        </Field>
        <Field label="项目正式名称" required hint="与申报材料完全一致">
          <input className={IC} value={d.projectName}
            onChange={(e) => sf('projectName', e.target.value)}
            placeholder="例：轻量化类脑计算AI推理框架关键技术研究与产业化" />
        </Field>
      </div>
      <Field label="核心技术" hint="唯一性锚点，可填核心专利编号">
        <input className={IC} value={d.coreTech}
          onChange={(e) => sf('coreTech', e.target.value)}
          placeholder="例：脉冲神经网络稀疏推理专利 ZL202410XXXXXX" />
      </Field>

      <SecTitle className="mt-6">专业领域（三级联动）</SecTitle>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="一级领域" required>
          <select className={SEL} value={d.domainTopCode}
            onChange={(e) => {
              sf('domainTopCode', e.target.value)
              sf('domainMidCode', '')
              sf('domainLeafCode', '')
            }}>
            <option value="">请选择</option>
            {TOP_DOMAINS.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}
          </select>
        </Field>
        <Field label="二级方向">
          <select className={SEL} value={d.domainMidCode} disabled={!top}
            onChange={(e) => { sf('domainMidCode', e.target.value); sf('domainLeafCode', '') }}>
            <option value="">请选择</option>
            {mids.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}
          </select>
        </Field>
        <Field label="三级方向">
          <select className={SEL} value={d.domainLeafCode} disabled={!mid}
            onChange={(e) => sf('domainLeafCode', e.target.value)}>
            <option value="">请选择</option>
            {leaves.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}
          </select>
        </Field>
      </div>

      <SecTitle className="mt-6">项目摘要</SecTitle>
      <Field label="项目简介" hint="≤500字，报名时预填用">
        <textarea rows={4} className={TC} maxLength={500}
          value={d.projectBrief} onChange={(e) => sf('projectBrief', e.target.value)}
          placeholder="简要介绍项目背景、技术路线和预期成果…" />
        <p className="text-right text-xs text-slate-400 mt-1">{d.projectBrief.length}/500</p>
      </Field>
    </div>
  )
}

// ── Tab 1: Applicant ──────────────────────────────────────────────────────────

function ApplicantTab({ d, sf }: { d: DraftState; sf: SfFn }) {
  const ID_TYPES: IdType[] = ['居民身份证', '护照', '港澳居民来往内地通行证', '台湾居民来往大陆通行证', '外国人永久居留证']
  const DEGREES: DegreeLevel[] = ['专科', '本科', '硕士', '博士', '博士后', '其他']

  return (
    <div className="space-y-5">
      <SecTitle>一、基本信息</SecTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="姓名（中文）" required>
          <input className={IC} value={d.aName} onChange={(e) => sf('aName', e.target.value)} placeholder="请填写" />
        </Field>
        <Field label="英文姓名">
          <input className={IC} value={d.aNameEn} onChange={(e) => sf('aNameEn', e.target.value)} placeholder="Last, First" />
        </Field>
        <Field label="本国语言姓名" hint="外籍人员填写">
          <input className={IC} value={d.aNameNative} onChange={(e) => sf('aNameNative', e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="性别" required>
          <select className={SEL} value={d.aGender}
            onChange={(e) => sf('aGender', e.target.value as '男' | '女' | '其他')}>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他">其他</option>
          </select>
        </Field>
        <Field label="出生日期" required>
          <input type="date" className={IC} value={d.aBirthDate} onChange={(e) => sf('aBirthDate', e.target.value)} />
        </Field>
        <Field label="出生地区">
          <input className={IC} value={d.aBirthPlace} onChange={(e) => sf('aBirthPlace', e.target.value)} placeholder="省/市" />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="国籍（地区）" required>
          <input className={IC} value={d.aNationality} onChange={(e) => sf('aNationality', e.target.value)} placeholder="中国" />
        </Field>
        {d.aNationality !== '中国' && (
          <Field label="是否华裔">
            <YesNo value={d.aIsEthnicChinese} onChange={(v) => sf('aIsEthnicChinese', v)} />
          </Field>
        )}
        <Field label="证件类型">
          <select className={SEL} value={d.aIdType}
            onChange={(e) => sf('aIdType', e.target.value as IdType)}>
            {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="证件号码">
          <input className={IC} value={d.aIdNumber} onChange={(e) => sf('aIdNumber', e.target.value)} />
        </Field>
        <Field label="证件有效期">
          <input type="date" className={IC} value={d.aIdExpiry} onChange={(e) => sf('aIdExpiry', e.target.value)} />
        </Field>
        <Field label="手机号" required>
          <input type="tel" className={IC} value={d.aPhone} onChange={(e) => sf('aPhone', e.target.value)} placeholder="1XXXXXXXXXX" />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="电子邮箱">
          <input type="email" className={IC} value={d.aEmail} onChange={(e) => sf('aEmail', e.target.value)} />
        </Field>
        <Field label="最高学位">
          <select className={SEL} value={d.aHighestDegree}
            onChange={(e) => sf('aHighestDegree', e.target.value as DegreeLevel)}>
            {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="毕业院校">
          <input className={IC} value={d.aHighestDegreeInstitution}
            onChange={(e) => sf('aHighestDegreeInstitution', e.target.value)} />
        </Field>
        <Field label="所学专业">
          <input className={IC} value={d.aHighestDegreeMajor}
            onChange={(e) => sf('aHighestDegreeMajor', e.target.value)} />
        </Field>
      </div>

      <SecTitle className="mt-6">到岗信息</SecTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="是否已全职到岗">
          <YesNo value={d.aIsFullTimeOnBoarded} onChange={(v) => sf('aIsFullTimeOnBoarded', v)} />
        </Field>
        <Field label="（拟任）职务">
          <input className={IC} value={d.aIntendedPosition}
            onChange={(e) => sf('aIntendedPosition', e.target.value)} placeholder="例：首席科学家" />
        </Field>
        <Field label="（拟）到岗时间">
          <input type="date" className={IC} value={d.aPlannedArrivalDate}
            onChange={(e) => sf('aPlannedArrivalDate', e.target.value)} />
        </Field>
        <Field label="来宁时间" hint="YYYY-MM 格式">
          <input className={IC} value={d.aComeToNingboDate}
            onChange={(e) => sf('aComeToNingboDate', e.target.value)} placeholder="2023-03" />
        </Field>
        <Field label="劳动合同开始日期">
          <input type="date" className={IC} value={d.aLaborContractStart}
            onChange={(e) => sf('aLaborContractStart', e.target.value)} />
        </Field>
        <Field label="劳动合同结束日期">
          <input type="date" className={IC} value={d.aLaborContractEnd}
            onChange={(e) => sf('aLaborContractEnd', e.target.value)} />
        </Field>
      </div>
      <Field label="来宁前单位及职务" hint="文本补充，详细经历在下方工作经历中填写">
        <input className={IC} value={d.aLastOrgBeforeComeToNingbo}
          onChange={(e) => sf('aLastOrgBeforeComeToNingbo', e.target.value)} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="（拟）回国时间" hint="海外人才填写，YYYY-MM 格式">
          <input className={IC} value={d.aReturnFromAbroadDate}
            onChange={(e) => sf('aReturnFromAbroadDate', e.target.value)} placeholder="2022-09" />
        </Field>
        <Field label="回国前单位及职务">
          <input className={IC} value={d.aLastOrgBeforeReturnFromAbroad}
            onChange={(e) => sf('aLastOrgBeforeReturnFromAbroad', e.target.value)} />
        </Field>
      </div>

      <SecTitle className="mt-6">二、教育经历</SecTitle>
      <p className="text-xs text-slate-400 -mt-3 mb-2">从本科填起，按起始时间排序</p>
      <RepeatableCollection schema={EDUCATION_SCHEMA} items={d.educations}
        onChange={(items) => sf('educations', items)} defaultExpanded={false} />

      <SecTitle className="mt-4">三、工作经历</SecTitle>
      <p className="text-xs text-slate-400 -mt-3 mb-2">按时间排序；最后一条全职工作须为来宁工作</p>
      <RepeatableCollection schema={WORK_SCHEMA} items={d.works}
        onChange={(items) => sf('works', items)} defaultExpanded={false} />

      <SecTitle className="mt-4">曾获荣誉</SecTitle>
      <Field label="" hint="简述主要荣誉称号（结构化荣誉在第五章填写）">
        <textarea rows={2} className={TC} value={d.aHonorsCertificates}
          onChange={(e) => sf('aHonorsCertificates', e.target.value)}
          placeholder="如：国家级人才计划入选者、省杰出青年基金获得者…" />
      </Field>
    </div>
  )
}

// ── Tab 2: Team ───────────────────────────────────────────────────────────────

function TeamTab({ d, sf }: { d: DraftState; sf: SfFn }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between mb-1">
        <div>
          <SecTitle className="mb-1">项目成员</SecTitle>
          <p className="text-xs text-slate-400">不含申报人；可增删多条，每条需填完必填字段后保存</p>
        </div>
        <span className={cn(
          'text-xs font-bold px-2.5 py-1 rounded-full',
          d.teamMembers.length === 0
            ? 'bg-slate-100 text-slate-400'
            : 'bg-brand-blue/10 text-brand-blue',
        )}>
          {d.teamMembers.length} 人
        </span>
      </div>
      <RepeatableCollection
        schema={TEAM_MEMBER_SCHEMA}
        items={d.teamMembers}
        onChange={(items) => sf('teamMembers', items)}
        defaultExpanded
      />
    </div>
  )
}

// ── Tab 3: Project Info ───────────────────────────────────────────────────────

function ProjectInfoTab({ d, sf }: { d: DraftState; sf: SfFn }) {
  const [sub, setSub] = useState(0)

  return (
    <div>
      {/* Sub-tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5 border-b border-slate-100">
        {PROJ_INFO_SUB.map((label, i) => (
          <button key={i} onClick={() => setSub(i)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0',
              sub === i
                ? 'bg-brand-blue text-white'
                : 'text-slate-500 hover:bg-slate-100',
            )}>
            {label}
          </button>
        ))}
      </div>

      {sub === 0 && (
        <Field label="项目背景意义" hint="阐述项目研究背景、国内外现状及立项意义">
          <textarea rows={10} className={TC} value={d.projectBackground}
            onChange={(e) => sf('projectBackground', e.target.value)}
            placeholder="包括：国内外研究现状及趋势、项目立项意义、拟解决的关键科学/技术问题…" />
        </Field>
      )}
      {sub === 1 && (
        <Field label="项目实施内容" hint="主要研究内容、拟解决的关键问题、主要创新点">
          <textarea rows={10} className={TC} value={d.projectContent}
            onChange={(e) => sf('projectContent', e.target.value)}
            placeholder="包括：主要研究内容、技术路线、核心创新点、实施方案…" />
        </Field>
      )}
      {sub === 2 && (
        <div className="space-y-5">
          <div>
            <SecTitle>阶段性目标</SecTitle>
            <p className="text-xs text-slate-400 mb-3">申报书要求 ≥ 2 个阶段，范围为未来5年（不含申报年份）</p>
            <RepeatableCollection schema={PROJECT_STAGE_SCHEMA} items={d.projectStages}
              onChange={(items) => sf('projectStages', items)} defaultExpanded />
          </div>
          <div>
            <SecTitle className="mt-4">项目总投入预测（万元，按5年估算，不含申报年份）</SecTitle>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['totalInvestmentForecast', '项目总投入预测'],
                ['alreadyInvestedByOrg',    '用人单位已投入资金'],
                ['govSupportReceived',      '已获区县市支持资金'],
                ['plannedInvestmentByOrg',  '未来5年用人单位计划投入'],
              ] as [keyof DraftState, string][]).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input type="number" min={0} className={IC}
                    value={d[key] as string}
                    onChange={(e) => sf(key, e.target.value as DraftState[typeof key])}
                    placeholder="0" />
                </Field>
              ))}
            </div>
          </div>
        </div>
      )}
      {sub === 3 && (
        <Field label="工作基础和条件" hint="团队合作基础、成员分工、项目成熟度、支持条件（环境/设备/生活配套）">
          <textarea rows={10} className={TC} value={d.workBasis}
            onChange={(e) => sf('workBasis', e.target.value)}
            placeholder="包括：已有的研究基础与积累、实验室/工程化条件、项目成熟度描述、团队保障…" />
        </Field>
      )}
      {sub === 4 && (
        <div className="space-y-2">
          <Field label="预期贡献及验收指标" hint="各类成果数量 + 文字说明（≤200字/项），口径：未来5年不含申报年份">
            <textarea rows={12} className={TC} value={d.expectedContribution}
              onChange={(e) => sf('expectedContribution', e.target.value)}
              placeholder={`发明专利：申请 X 项 / 授权 X 项\n实用新型：申请 X 项 / 授权 X 项\n国际专利：申请 X 项 / 授权 X 项\n技术标准：国际/国家/行业/企业标准 各 X 项\n论文：发表总量 X 篇 / SCI·EI X 篇\n人才引进（培养）：博士 X 人 / 硕士 X 人\n其他：…`} />
          </Field>
        </div>
      )}
      {sub === 5 && (
        <div className="space-y-4">
          {/* TODO[data-model]: 申报书 §六 有「累计新增销售额/净利润/税额」3个数字字段，
              Project 类型目前只有 economicEfficiency: string，待 Phase 1 补字段后在此连线 */}
          <Field label="预期经济效益指标说明" hint="≤800字；口径：未来5年，不含申报年份（创业类项目填写）；数字指标待数据模型扩展后补充">
            <textarea rows={8} className={TC} value={d.economicEfficiency}
              onChange={(e) => sf('economicEfficiency', e.target.value)}
              placeholder={`预期经济效益说明：\n- 累计新增销售额（万元）：\n- 累计新增净利润（万元）：\n- 累计新增上缴税额（万元）：\n\n详细说明（市场前景、商业模式、盈利路径）：`} />
          </Field>
        </div>
      )}
    </div>
  )
}

// ── Tab 4: Achievements ───────────────────────────────────────────────────────

function AchievementsTab({ d, sf }: { d: DraftState; sf: SfFn }) {
  const collections: [typeof MAJOR_PROJECT_SCHEMA, keyof DraftState, string][] = [
    [MAJOR_PROJECT_SCHEMA, 'majorProjects', '4.1 领导（参与）过的主要项目'],
    [PAPER_SCHEMA, 'papers', '4.2 代表性论文'],
    [PATENT_SCHEMA, 'patents', '4.3 代表性授权专利'],
    [SOFTWARE_COPYRIGHT_SCHEMA, 'softwareCopyrights', '4.4 软件著作权'],
    [PRODUCT_SCHEMA, 'products', '4.5 领导（参与）开发过的主要产品'],
    [AWARD_SCHEMA, 'awards', '4.6 奖励表彰'],
    [BOOK_SCHEMA, 'books', '4.7 代表性著作'],
    [CONFERENCE_REPORT_SCHEMA, 'conferenceReports', '4.8 重要学术会议邀请报告'],
    [ACADEMIC_POSITION_SCHEMA, 'academicPositions', '4.9 国内外学术组织及期刊任职'],
  ]

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">对应申报书第四章；各类成果按需填写，无则保持空白。</p>
      {collections.map(([schema, key, label]) => (
        <div key={key}>
          <SecTitle>{label}</SecTitle>
          <RepeatableCollection
            schema={schema}
            items={d[key] as CollectionItem[]}
            onChange={(items) => sf(key, items as DraftState[typeof key])}
            defaultExpanded={false}
          />
        </div>
      ))}
    </div>
  )
}

// ── Tab 5: Personal Statement ─────────────────────────────────────────────────

function PersonalStatementTab({ d, sf }: { d: DraftState; sf: SfFn }) {
  return (
    <div className="space-y-5">
      <SecTitle>五、个人陈述</SecTitle>
      <Field label="个人简要介绍" required hint="≤500字，突出专业背景、核心经历与竞争优势">
        <textarea rows={5} className={TC} maxLength={500}
          value={d.personalBrief} onChange={(e) => sf('personalBrief', e.target.value)}
          placeholder="简要介绍个人学术背景、核心技术方向和代表性成就…" />
        <p className="text-right text-xs text-slate-400 mt-1">{d.personalBrief.length}/500</p>
      </Field>
      <Field label="过往主要业绩简述" hint="≤1000字，突出专业技术水平、工作/创业经历、成果业绩">
        <textarea rows={7} className={TC} maxLength={1000}
          value={d.achievementsSummary} onChange={(e) => sf('achievementsSummary', e.target.value)}
          placeholder="列举过往最具代表性的技术突破、项目成果或创业里程碑…" />
        <p className="text-right text-xs text-slate-400 mt-1">{d.achievementsSummary.length}/1000</p>
      </Field>

      <SecTitle className="mt-2">创业经历</SecTitle>
      <Field label="有无创业经历" hint="担任法人/第一大股东/最大自然人股东/实际控制人等">
        <YesNo value={d.hasEntrepreneurExperience} onChange={(v) => sf('hasEntrepreneurExperience', v)} />
      </Field>
      {d.hasEntrepreneurExperience && (
        <div>
          <p className="text-xs text-slate-400 mb-2">异地创办且仍存续经营的企业（序号、企业名称、角色、职务、企业情况、与宁波公司关系）</p>
          <RepeatableCollection schema={FOUNDED_COMPANY_SCHEMA} items={d.foundedCompanies}
            onChange={(items) => sf('foundedCompanies', items)} defaultExpanded={false} />
        </div>
      )}

      <SecTitle className="mt-2">法律声明</SecTitle>
      <Field label="有无涉法涉诉 / 知识产权纠纷 / 竞业禁止 / 兼职取酬限制 / 被调查等">
        <YesNo value={d.legalIssuesHasIssue} onChange={(v) => sf('legalIssuesHasIssue', v)} />
      </Field>
      {d.legalIssuesHasIssue && (
        <Field label="请简要说明情况">
          <textarea rows={3} className={TC} value={d.legalIssuesDescription}
            onChange={(e) => sf('legalIssuesDescription', e.target.value)} />
        </Field>
      )}
    </div>
  )
}

// ── Tab 6: Org ────────────────────────────────────────────────────────────────

function OrgTab({ d, sf }: { d: DraftState; sf: SfFn }) {
  return (
    <div className="space-y-5">
      <SecTitle>1. 用人单位基本情况</SecTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="单位全称" required>
          <input className={IC} value={d.oName} onChange={(e) => sf('oName', e.target.value)}
            placeholder="企业/研究机构法定全称" />
        </Field>
        <Field label="单位类型">
          <input className={IC} value={d.oOrgType} onChange={(e) => sf('oOrgType', e.target.value)}
            placeholder="例：有限责任公司、高校、科研院所" />
        </Field>
        <Field label="统一社会信用代码">
          <input className={IC} value={d.oCreditCode} onChange={(e) => sf('oCreditCode', e.target.value)} />
        </Field>
        <Field label="（拟）注册成立时间" hint="YYYY-MM">
          <input className={IC} value={d.oEstablishedDate}
            onChange={(e) => sf('oEstablishedDate', e.target.value)} placeholder="2020-03" />
        </Field>
        <Field label="注册资本（万元）">
          <input type="number" min={0} className={IC} value={d.oRegisteredCapital}
            onChange={(e) => sf('oRegisteredCapital', e.target.value)} />
        </Field>
        <Field label="员工总数（人）">
          <input type="number" min={0} className={IC} value={d.oTotalEmployees}
            onChange={(e) => sf('oTotalEmployees', e.target.value)} />
        </Field>
        <Field label="联系人">
          <input className={IC} value={d.oContactPerson} onChange={(e) => sf('oContactPerson', e.target.value)} />
        </Field>
        <Field label="联系人手机">
          <input type="tel" className={IC} value={d.oContactPhone}
            onChange={(e) => sf('oContactPhone', e.target.value)} />
        </Field>
      </div>
      <Field label="单位地址">
        <input className={IC} value={d.oAddress} onChange={(e) => sf('oAddress', e.target.value)} />
      </Field>
      <Field label="用人单位简介" hint="≤500字">
        <textarea rows={4} className={TC} maxLength={500} value={d.oOrgBrief}
          onChange={(e) => sf('oOrgBrief', e.target.value)}
          placeholder="主要业务方向、核心技术优势、市场地位…" />
        <p className="text-right text-xs text-slate-400 mt-1">{d.oOrgBrief.length}/500</p>
      </Field>

      <SecTitle className="mt-2">2. 单位荣誉（选填，≤5项）</SecTitle>
      <RepeatableCollection schema={ORG_HONOR_SCHEMA} items={d.orgHonors}
        onChange={(items) => sf('orgHonors', items)} defaultExpanded={false} />

      <SecTitle className="mt-2">3. 研发能力和经济效益（依托单位为企业时填写）</SecTitle>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="年研发投入（万元）">
          <input type="number" min={0} className={IC} value={d.oRdExpenditure}
            onChange={(e) => sf('oRdExpenditure', e.target.value)} />
        </Field>
        <Field label="研发经费占收入比（%）">
          <input type="number" min={0} max={100} className={IC} value={d.oRdRevenueRatio}
            onChange={(e) => sf('oRdRevenueRatio', e.target.value)} />
        </Field>
        <Field label="研发人员数（人）">
          <input type="number" min={0} className={IC} value={d.oRdPersonnelCount}
            onChange={(e) => sf('oRdPersonnelCount', e.target.value)} />
        </Field>
        <Field label="截至上年度末发明专利数">
          <input type="number" min={0} className={IC} value={d.oOrgInventionPatentCount}
            onChange={(e) => sf('oOrgInventionPatentCount', e.target.value)} />
        </Field>
        <Field label="上年度主营业务收入（万元）">
          <input type="number" min={0} className={IC} value={d.oTotalRevenue}
            onChange={(e) => sf('oTotalRevenue', e.target.value)} />
        </Field>
        <Field label="上年度利润总额（万元）">
          <input type="number" className={IC} value={d.oLastYearProfit}
            onChange={(e) => sf('oLastYearProfit', e.target.value)} />
        </Field>
        <Field label="累计融资额（万元）">
          <input type="number" min={0} className={IC} value={d.oTotalFunding}
            onChange={(e) => sf('oTotalFunding', e.target.value)} />
        </Field>
        <Field label="已完成融资轮次">
          <input className={IC} value={d.oFundingRound} onChange={(e) => sf('oFundingRound', e.target.value)}
            placeholder="天使/Pre-A/A/B/C 轮…" />
        </Field>
      </div>
    </div>
  )
}

// ── Tab 7: Review & Submit ────────────────────────────────────────────────────

function ReviewTab({
  d, sf, tabErrors, onTabJump,
}: {
  d: DraftState; sf: SfFn; tabErrors: string[][]; onTabJump: (tab: number) => void
}) {
  const allClean = tabErrors.every((e) => e.length === 0)
  const attFileRef = useRef<HTMLInputElement>(null)

  function handleAttachFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const added = files.map((f) => ({
      name: f.name,
      size: f.size > 1024 * 1024
        ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
        : `${(f.size / 1024).toFixed(0)} KB`,
      fileType: f.name.split('.').pop()?.toUpperCase() ?? '',
    }))
    sf('attachments', [...d.attachments, ...added])
    if (attFileRef.current) attFileRef.current.value = ''
  }

  function removeAttachment(idx: number) {
    sf('attachments', d.attachments.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-5">
      <SecTitle>校验状态</SecTitle>
      <div className="space-y-2">
        {TABS.map((label, i) => {
          const errs = tabErrors[i] ?? []
          const ok = errs.length === 0
          return (
            <button key={i} onClick={() => onTabJump(i)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-left">
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                ok ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600',
              )}>
                {ok ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              </span>
              <span className="flex-1 text-sm font-semibold text-slate-700">{label}</span>
              {!ok && (
                <span className="text-xs text-amber-600">{errs[0] ?? ''}</span>
              )}
              <span className="text-xs text-brand-blue">跳转</span>
            </button>
          )
        })}
      </div>

      <div className={cn(
        'p-4 rounded-2xl border mt-4',
        allClean ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200',
      )}>
        {allClean
          ? <p className="text-sm font-semibold text-emerald-700">所有必填项已通过校验，可以创建项目。</p>
          : <p className="text-sm font-semibold text-amber-700">请补全以上标黄项后再提交。</p>}
      </div>

      <SecTitle className="mt-4">附件材料</SecTitle>
      <p className="text-xs text-slate-400 -mt-3 mb-3">
        可附上专利证书、融资协议、论文等支撑材料（仅保存文件名/大小，实际上传在后端接入后实现）
      </p>
      <div className="space-y-2">
        {d.attachments.map((att, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl text-sm">
            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="flex-1 truncate text-slate-700">{att.name}</span>
            <span className="text-xs text-slate-400 flex-shrink-0">{att.size}</span>
            {att.fileType && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded flex-shrink-0">
                {att.fileType}
              </span>
            )}
            <button onClick={() => removeAttachment(i)}
              className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => attFileRef.current?.click()}
          className="flex items-center gap-2 w-full p-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-brand-blue/30 hover:text-brand-blue transition-colors"
        >
          <Upload className="w-4 h-4" /> 添加附件文件
        </button>
        <input ref={attFileRef} type="file" multiple className="hidden" onChange={handleAttachFile} />
      </div>

      <SecTitle className="mt-4">申报人承诺</SecTitle>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" className="mt-0.5 w-4 h-4 accent-brand-blue"
          checked={d.commitmentChecked} onChange={(e) => sf('commitmentChecked', e.target.checked)} />
        <span className="text-sm text-slate-700 leading-relaxed">
          本人承诺：所填报内容真实、准确、完整；本人有权提交上述项目的申报材料；不存在知识产权纠纷、竞业禁止限制等影响申报的情形；知悉并接受相关政策要求，如有虚假信息愿承担相应责任。
        </span>
      </label>
    </div>
  )
}

// ── Top Stepper ───────────────────────────────────────────────────────────────

function TopStepper({
  current, maxVisited, tabErrors, onTabClick,
}: {
  current: number
  maxVisited: number
  tabErrors: string[][]
  onTabClick: (tab: number) => void
}) {
  return (
    <div className="flex items-center overflow-x-auto pb-1 mb-5">
      {TABS.map((label, i) => {
        const hasError = (tabErrors[i]?.length ?? 0) > 0
        const isVisited = i <= maxVisited
        const isCurrent = i === current
        const isDone = i < current && !hasError

        return (
          <div key={i} className="flex items-center flex-shrink-0">
            <button
              onClick={() => isVisited && onTabClick(i)}
              disabled={!isVisited}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                isCurrent ? 'bg-brand-blue/8 text-brand-blue' :
                isDone ? 'text-emerald-600 hover:bg-slate-50' :
                hasError && isVisited ? 'text-amber-600 hover:bg-slate-50' :
                isVisited ? 'text-slate-500 hover:bg-slate-50' :
                'text-slate-300 cursor-default',
              )}
            >
              <span className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                isCurrent ? 'bg-brand-blue text-white' :
                isDone ? 'bg-emerald-100 text-emerald-700' :
                hasError && isVisited ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-500',
              )}>
                {isDone ? <Check className="w-2.5 h-2.5" /> :
                 hasError && isVisited ? <AlertTriangle className="w-2.5 h-2.5" /> :
                 i + 1}
              </span>
              <span className="hidden md:inline">{label}</span>
              <span className="md:hidden">{i + 1}</span>
            </button>
            {i < TABS.length - 1 && (
              <span className="text-slate-200 text-xs mx-0.5">›</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type EntryMode = 'choose' | 'uploading' | 'form'

export default function ProjectNewPage() {
  const navigate = useNavigate()
  const { addProjectV3, recordEditV3 } = useProjectDashboardStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<EntryMode>('choose')
  const [uploadFileName, setUploadFileName] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT)
  const [currentTab, setCurrentTab] = useState(0)
  const [maxVisited, setMaxVisited] = useState(0)
  const [showErrors, setShowErrors] = useState(false)

  function sf<K extends keyof DraftState>(key: K, val: DraftState[K]) {
    setDraft((prev) => ({ ...prev, [key]: val }))
  }

  const tabErrors = TABS.map((_, i) => validateTab(i, draft))
  const currentErrors = tabErrors[currentTab] ?? []

  function goTo(tab: number) {
    setCurrentTab(tab)
    setMaxVisited((m) => Math.max(m, tab))
    setShowErrors(false)
  }

  function handleNext() {
    if (currentTab < TABS.length - 1) {
      if (currentErrors.length > 0) {
        setShowErrors(true)
        return
      }
      goTo(currentTab + 1)
    }
  }

  function handlePrev() {
    if (currentTab > 0) goTo(currentTab - 1)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadFileName(file.name)
    setMode('uploading')
    setTimeout(() => {
      setDraft({ ...EMPTY_DRAFT, ...MOCK_PRESET })
      setMode('form')
      setMaxVisited(0)
    }, 2000)
  }

  function handleSubmit() {
    const allErrors = TABS.map((_, i) => validateTab(i, draft))
    const firstBad = allErrors.findIndex((e) => e.length > 0)
    if (firstBad >= 0) {
      goTo(firstBad)
      setShowErrors(true)
      return
    }

    const now = new Date().toISOString()
    const projId = `proj-v3-${Date.now()}`

    const topDomain = TOP_DOMAINS.find((d) => d.code === draft.domainTopCode)
    const midDomain = topDomain?.children.find((m) => m.code === draft.domainMidCode)
    const leafDomain = midDomain?.children.find((l) => l.code === draft.domainLeafCode)

    const applicant: Applicant = {
      name: draft.aName, nameEn: draft.aNameEn, nameNative: draft.aNameNative,
      gender: draft.aGender, birthDate: draft.aBirthDate, birthPlace: draft.aBirthPlace,
      nationality: draft.aNationality, isEthnicChinese: draft.aIsEthnicChinese,
      idType: draft.aIdType, idNumber: draft.aIdNumber, idExpiry: draft.aIdExpiry,
      phone: draft.aPhone, email: draft.aEmail,
      highestDegree: draft.aHighestDegree,
      highestDegreeInstitution: draft.aHighestDegreeInstitution,
      highestDegreeMajor: draft.aHighestDegreeMajor,
      isFullTimeOnBoarded: draft.aIsFullTimeOnBoarded,
      intendedPosition: draft.aIntendedPosition,
      plannedArrivalDate: draft.aPlannedArrivalDate,
      laborContractStart: draft.aLaborContractStart,
      laborContractEnd: draft.aLaborContractEnd,
      comeToNingboDate: draft.aComeToNingboDate,
      lastOrgBeforeComeToNingbo: draft.aLastOrgBeforeComeToNingbo,
      returnFromAbroadDate: draft.aReturnFromAbroadDate,
      lastOrgBeforeReturnFromAbroad: draft.aLastOrgBeforeReturnFromAbroad,
      honorsCertificates: draft.aHonorsCertificates,
      legalIssues: { hasIssue: draft.legalIssuesHasIssue, description: draft.legalIssuesDescription },
      personalBrief: draft.personalBrief,
      achievementsSummary: draft.achievementsSummary,
      hasEntrepreneurExperience: draft.hasEntrepreneurExperience,
      educations: draft.educations as Education[],
      works: draft.works as Work[],
      majorProjects: draft.majorProjects as MajorProject[],
      papers: draft.papers as Paper[],
      patents: draft.patents as Patent[],
      softwareCopyrights: draft.softwareCopyrights as SoftwareCopyright[],
      products: draft.products as Product[],
      awards: draft.awards as Award[],
      books: draft.books as Book[],
      conferenceReports: draft.conferenceReports as ConferenceReport[],
      academicPositions: draft.academicPositions as AcademicPosition[],
      foundedCompanies: draft.foundedCompanies as FoundedCompany[],
    }

    const orgInfo: OrgInfo = {
      name: draft.oName, orgType: draft.oOrgType, creditCode: draft.oCreditCode,
      establishedDate: draft.oEstablishedDate,
      registeredCapital: parseFloat(draft.oRegisteredCapital) || 0,
      totalEmployees: parseInt(draft.oTotalEmployees) || 0,
      address: draft.oAddress, contactPerson: draft.oContactPerson, contactPhone: draft.oContactPhone,
      orgBrief: draft.oOrgBrief,
      rdExpenditure: parseFloat(draft.oRdExpenditure) || 0,
      rdRevenueRatio: parseFloat(draft.oRdRevenueRatio) || 0,
      rdPersonnelCount: parseInt(draft.oRdPersonnelCount) || 0,
      orgInventionPatentCount: parseInt(draft.oOrgInventionPatentCount) || 0,
      totalRevenue: parseFloat(draft.oTotalRevenue) || 0,
      lastYearProfit: parseFloat(draft.oLastYearProfit) || 0,
      totalFunding: parseFloat(draft.oTotalFunding) || 0,
      fundingRound: draft.oFundingRound,
      honors: draft.orgHonors as OrgHonor[],
    }

    const project: Project = {
      id: projId,
      declarationName: draft.declarationName.trim(),
      projectName: draft.projectName.trim(),
      coverImage: null,
      professionalDomain: {
        ...(topDomain && { top: { code: topDomain.code, label: topDomain.label, children: topDomain.children } }),
        ...(midDomain && { mid: { code: midDomain.code, label: midDomain.label, children: midDomain.children } }),
        ...(leafDomain && { leaf: { code: leafDomain.code, label: leafDomain.label } }),
      },
      coreTech: draft.coreTech.trim(),
      applicant,
      teamMembers: draft.teamMembers as TeamMember[],
      projectBrief: draft.projectBrief,
      projectBackground: draft.projectBackground,
      projectContent: draft.projectContent,
      projectStages: draft.projectStages as ProjectStage[],
      workBasis: draft.workBasis,
      expectedContribution: draft.expectedContribution,
      economicEfficiency: draft.economicEfficiency,
      totalInvestmentForecast: parseFloat(draft.totalInvestmentForecast) || 0,
      alreadyInvestedByOrg: parseFloat(draft.alreadyInvestedByOrg) || 0,
      govSupportReceived: parseFloat(draft.govSupportReceived) || 0,
      plannedInvestmentByOrg: parseFloat(draft.plannedInvestmentByOrg) || 0,
      orgInfo,
      attachments: [],
      verificationStatus: {
        teamMembers:   'unverified',
        patents:       'unverified',
        totalFunding:  'unverified',
        rdExpenditure: 'unverified',
        totalRevenue:  'unverified',
      },
      registrations: [],
      events: [],
      snapshots: {},
      createdAt: now,
      updatedAt: now,
    }

    addProjectV3(project)
    recordEditV3(projId, '创建项目', [])
    navigate(`/project/${projId}`)
  }

  // ── Entry: choose mode ───────────────────────────────────────────────────────

  if (mode === 'choose') {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/project')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800">新建项目</h1>
            <p className="text-sm text-slate-400">选择录入方式</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-blue/40 hover:bg-brand-blue/3 text-left transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-4 group-hover:bg-brand-blue/15 transition-colors">
              <Upload className="w-6 h-6 text-brand-blue" />
            </div>
            <p className="font-bold text-slate-800 mb-1">上传申报书 / BP 识别导入</p>
            <p className="text-sm text-slate-500 leading-relaxed">上传本地申报书或 PDF，系统自动提取结构化字段（目标覆盖率 80~90%），核对后保存</p>
            <p className="text-xs text-slate-400 mt-2">支持 .pdf .docx 格式 · 识别逻辑 Phase 8 实现</p>
          </button>

          <button
            onClick={() => { setMode('form'); setMaxVisited(0) }}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-blue/40 hover:bg-brand-blue/3 text-left transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
              <FileText className="w-6 h-6 text-slate-500" />
            </div>
            <p className="font-bold text-slate-800 mb-1">手动填写</p>
            <p className="text-sm text-slate-500 leading-relaxed">按申报书章节逐步填写结构化表单，8 个板块分页展示，阶段可视化</p>
          </button>
        </div>

        <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileSelect} />
      </div>
    )
  }

  // ── Entry: uploading ─────────────────────────────────────────────────────────

  if (mode === 'uploading') {
    return (
      <div className="max-w-2xl flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="font-bold text-slate-800 text-lg">正在解析文档…</p>
          <p className="text-sm text-slate-400 mt-1">AI 正在从《{uploadFileName}》中提取结构化字段</p>
          <p className="text-xs text-slate-400 mt-2">完成后请核对各字段内容</p>
        </div>
      </div>
    )
  }

  // ── Entry: form (8-tab wizard) ───────────────────────────────────────────────

  const tabContent = [
    <CoverTab key="cover" d={draft} sf={sf} />,
    <ApplicantTab key="applicant" d={draft} sf={sf} />,
    <TeamTab key="team" d={draft} sf={sf} />,
    <ProjectInfoTab key="proj-info" d={draft} sf={sf} />,
    <AchievementsTab key="achievements" d={draft} sf={sf} />,
    <PersonalStatementTab key="personal" d={draft} sf={sf} />,
    <OrgTab key="org" d={draft} sf={sf} />,
    <ReviewTab key="review" d={draft} sf={sf} tabErrors={tabErrors} onTabJump={goTo} />,
  ]

  const isLastTab = currentTab === TABS.length - 1

  return (
    <div className="max-w-4xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/project')} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800">新建项目</h1>
          {uploadFileName && (
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
              <Check className="w-3 h-3" /> 已从《{uploadFileName}》提取字段，请核对修改
            </p>
          )}
        </div>
      </div>

      {/* Stepper */}
      <TopStepper
        current={currentTab}
        maxVisited={maxVisited}
        tabErrors={tabErrors}
        onTabClick={goTo}
      />

      {/* Tab content card */}
      <div className="glass-card p-6 min-h-[420px]">
        <h2 className="text-base font-black text-slate-800 mb-4">{TABS[currentTab]}</h2>
        {tabContent[currentTab]}
        {showErrors && <ErrorBanner errors={currentErrors} />}
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between mt-4 pb-8">
        <button
          onClick={handlePrev}
          disabled={currentTab === 0}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors',
            currentTab === 0
              ? 'border-slate-100 text-slate-300 cursor-default'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50',
          )}
        >
          <ArrowLeft className="w-4 h-4" /> 上一步
        </button>

        <span className="text-xs text-slate-400">
          {currentTab + 1} / {TABS.length}
        </span>

        {isLastTab ? (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
          >
            <Check className="w-4 h-4" /> 创建项目
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
          >
            下一步 <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
