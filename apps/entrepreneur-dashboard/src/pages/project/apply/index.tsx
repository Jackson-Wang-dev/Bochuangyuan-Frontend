import { useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Check, Trophy, Calendar,
  CheckSquare, Square, ChevronRight, GraduationCap,
  Briefcase, FlaskConical, Building2, BookOpen, Award,
  FileCode2, ShieldCheck, User, RefreshCw,
} from 'lucide-react'
import { useProjectDashboardStore } from '@/store/projectDashboardStore'
import type {
  Project, RegistrationRecord, SelectedDomain,
  Applicant, OrgInfo,
} from '@/types/project'
import {
  TEAM_MEMBER_SCHEMA, EDUCATION_SCHEMA, WORK_SCHEMA, MAJOR_PROJECT_SCHEMA,
  PAPER_SCHEMA, PATENT_SCHEMA, SOFTWARE_COPYRIGHT_SCHEMA,
  AWARD_SCHEMA, PROJECT_STAGE_SCHEMA, ORG_HONOR_SCHEMA,
} from '@/types/collectionSchemas'
import RepeatableCollection from '@/components/RepeatableCollection'
import { PROFESSIONAL_DOMAINS } from '@/mock/professionalDomains'
import { cn } from '@/lib/utils'

// ── Style constants ───────────────────────────────────────────────────────────

const INPUT = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white'
const SELECT = INPUT
const TEXTAREA = cn(INPUT, 'resize-none')

const APPLICATION_TYPES = ['创业类', '企业类', '学生创业类']
const INTRODUCTION_AREAS = ['宁波市', '宁波市鄞州区', '宁波市海曙区', '宁波市北仑区', '宁波市镇海区', '宁波市江北区', '宁波市奉化区', '宁波市余姚市', '宁波市慈溪市', '宁波市象山县', '宁波市宁海县']
const GREEN_CHANNEL_TYPES: RegistrationRecord['greenChannelType'][] = ['直接进入终评', '直接认定']

const STATUS_COLOR: Record<string, string> = {
  '报名中': 'bg-emerald-50 text-emerald-600',
  '进行中': 'bg-blue-50 text-blue-600',
  '已结束': 'bg-slate-100 text-slate-400',
}

// ── Utility ───────────────────────────────────────────────────────────────────

function cloneProject(p: Project): Project {
  return JSON.parse(JSON.stringify(p))
}

// ── Domain selector ───────────────────────────────────────────────────────────

interface DomainState { topCode: string; midCode: string; leafCode: string }

function DomainSelector({ value, onChange }: {
  value: DomainState
  onChange: (v: DomainState) => void
}) {
  const top = PROFESSIONAL_DOMAINS.find((x) => x.code === value.topCode)
  const mids = top?.children ?? []
  const mid = mids.find((x) => x.code === value.midCode)
  const leaves = mid?.children ?? []

  return (
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className="text-xs text-slate-500 mb-1 block">一级领域</label>
        <select
          value={value.topCode}
          onChange={(e) => onChange({ topCode: e.target.value, midCode: '', leafCode: '' })}
          className={SELECT}
        >
          <option value="">请选择</option>
          {PROFESSIONAL_DOMAINS.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 block">二级方向</label>
        <select
          value={value.midCode}
          disabled={!top}
          onChange={(e) => onChange({ ...value, midCode: e.target.value, leafCode: '' })}
          className={cn(SELECT, !top && 'opacity-50 cursor-not-allowed')}
        >
          <option value="">请选择</option>
          {mids.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500 mb-1 block">细分领域</label>
        <select
          value={value.leafCode}
          disabled={!mid}
          onChange={(e) => onChange({ ...value, leafCode: e.target.value })}
          className={cn(SELECT, !mid && 'opacity-50 cursor-not-allowed')}
        >
          <option value="">请选择</option>
          {leaves.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}
        </select>
      </div>
    </div>
  )
}

function resolveDomain(state: DomainState): SelectedDomain {
  const top = PROFESSIONAL_DOMAINS.find((x) => x.code === state.topCode)
  const mid = top?.children.find((x) => x.code === state.midCode)
  const leaf = mid?.children.find((x) => x.code === state.leafCode)
  return {
    top: top ?? { code: '', label: '', children: [] },
    mid: mid ?? { code: '', label: '', children: [] },
    leaf: leaf ?? { code: '', label: '' },
  }
}

function domainFromProject(project: Project): DomainState {
  return {
    topCode: project.professionalDomain.top?.code ?? '',
    midCode: project.professionalDomain.mid?.code ?? '',
    leafCode: project.professionalDomain.leaf?.code ?? '',
  }
}

// ── Step 1: Competition selection ─────────────────────────────────────────────

interface CompetitionOption {
  id: string; name: string; summary: string; track: string; deadline: string; status: string
}

function CompetitionSelectStep({
  competitions, selected, onSelect, onNext,
}: {
  competitions: CompetitionOption[]
  selected: CompetitionOption | null
  onSelect: (c: CompetitionOption) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">选择要报名的赛事（仅显示平台内赛事）</p>
      {competitions.map((comp) => {
        const isAvailable = comp.status === '报名中'
        const isSelected = selected?.id === comp.id
        return (
          <button
            key={comp.id}
            disabled={!isAvailable}
            onClick={() => isAvailable && onSelect(comp)}
            className={cn(
              'w-full text-left p-4 rounded-2xl border-2 transition-all',
              isSelected ? 'border-brand-blue bg-brand-blue/5'
              : isAvailable ? 'border-slate-200 hover:border-slate-300'
              : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed',
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                isSelected ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400',
              )}>
                <Trophy className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate-800 text-sm">{comp.name}</p>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', STATUS_COLOR[comp.status] ?? 'bg-slate-100 text-slate-400')}>
                    {comp.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{comp.summary}</p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />截止 {comp.deadline} · {comp.track}
                </p>
              </div>
              {isSelected && <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-1" />}
            </div>
          </button>
        )
      })}
      <div className="flex justify-end pt-2">
        <button
          disabled={!selected}
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-40 transition-colors"
        >
          下一步：填写报名表 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Step 2 form state ─────────────────────────────────────────────────────────

interface RegForm {
  declarationName: string
  applicationType: string
  domain: DomainState
  professionalDirection: string
  introductionArea: string
  contactPerson: string
  contactPhone: string
  greenChannelApplied: boolean
  greenChannelType: RegistrationRecord['greenChannelType']
  greenChannelReason: string
  expertRecusal: string
  orgRecusal: string
  applicantCommitment: boolean
}

function initForm(project: Project, sourceReg?: RegistrationRecord): RegForm {
  if (sourceReg) {
    return {
      declarationName: sourceReg.declarationName,
      applicationType: sourceReg.applicationType,
      domain: {
        topCode: sourceReg.professionalDomain.top?.code ?? '',
        midCode: sourceReg.professionalDomain.mid?.code ?? '',
        leafCode: sourceReg.professionalDomain.leaf?.code ?? '',
      },
      professionalDirection: sourceReg.professionalDirection,
      introductionArea: sourceReg.introductionArea,
      contactPerson: sourceReg.contactPerson,
      contactPhone: sourceReg.contactPhone,
      greenChannelApplied: sourceReg.greenChannelApplied,
      greenChannelType: sourceReg.greenChannelType,
      greenChannelReason: sourceReg.greenChannelReason,
      expertRecusal: sourceReg.expertRecusal,
      orgRecusal: sourceReg.orgRecusal,
      applicantCommitment: false,
    }
  }
  return {
    declarationName: project.declarationName,
    applicationType: '创业类',
    domain: domainFromProject(project),
    professionalDirection: project.professionalDomain.leaf?.label ?? '',
    introductionArea: '宁波市',
    contactPerson: project.applicant.name,
    contactPhone: project.applicant.phone,
    greenChannelApplied: false,
    greenChannelType: undefined,
    greenChannelReason: '',
    expertRecusal: '',
    orgRecusal: '',
    applicantCommitment: false,
  }
}

// ── Editable project info tabs ────────────────────────────────────────────────

const INFO_TABS = ['申报人', '学习/工作', '项目成员', '项目信息', '成果业绩', '用人单位'] as const
type InfoTab = (typeof INFO_TABS)[number]

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-500">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

// Applicant scalar keys for diff / patch
const APPLICANT_SCALAR_KEYS: (keyof Applicant)[] = [
  'name', 'nameEn', 'gender', 'birthDate', 'birthPlace', 'nationality',
  'idType', 'idNumber', 'highestDegree', 'highestDegreeInstitution', 'highestDegreeMajor',
  'intendedPosition', 'plannedArrivalDate', 'isFullTimeOnBoarded', 'personalBrief',
  'phone', 'email',
]

function EditableApplicantTab({ applicant, onChange }: {
  applicant: Applicant
  onChange: (patch: Partial<Applicant>) => void
}) {
  const set = (key: keyof Applicant) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ [key]: e.target.value })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="姓名" required><input value={applicant.name} onChange={set('name')} className={INPUT} /></Field>
        <Field label="英文姓名"><input value={applicant.nameEn} onChange={set('nameEn')} className={INPUT} /></Field>
        <Field label="性别">
          <select value={applicant.gender} onChange={set('gender')} className={SELECT}>
            {['男', '女', '其他'].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="出生日期"><input type="date" value={applicant.birthDate} onChange={set('birthDate')} className={INPUT} /></Field>
        <Field label="出生地"><input value={applicant.birthPlace} onChange={set('birthPlace')} className={INPUT} /></Field>
        <Field label="国籍"><input value={applicant.nationality} onChange={set('nationality')} className={INPUT} /></Field>
        <Field label="证件类型">
          <select value={applicant.idType} onChange={set('idType')} className={SELECT}>
            {['居民身份证', '护照', '港澳居民来往内地通行证', '台湾居民来往大陆通行证', '外国人永久居留证'].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="证件号码"><input value={applicant.idNumber} onChange={set('idNumber')} className={INPUT} /></Field>
        <Field label="最高学历">
          <select value={applicant.highestDegree} onChange={set('highestDegree')} className={SELECT}>
            {['专科', '本科', '硕士', '博士', '博士后', '其他'].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="毕业院校"><input value={applicant.highestDegreeInstitution} onChange={set('highestDegreeInstitution')} className={INPUT} /></Field>
        <Field label="所学专业"><input value={applicant.highestDegreeMajor} onChange={set('highestDegreeMajor')} className={INPUT} /></Field>
        <Field label="拟担任职务"><input value={applicant.intendedPosition} onChange={set('intendedPosition')} className={INPUT} /></Field>
        <Field label="手机号"><input type="tel" value={applicant.phone} onChange={set('phone')} className={INPUT} /></Field>
        <Field label="邮箱"><input type="email" value={applicant.email} onChange={set('email')} className={INPUT} /></Field>
        <Field label="计划来宁日期"><input type="date" value={applicant.plannedArrivalDate} onChange={set('plannedArrivalDate')} className={INPUT} /></Field>
        <Field label="全职在岗">
          <select
            value={applicant.isFullTimeOnBoarded ? 'true' : 'false'}
            onChange={(e) => onChange({ isFullTimeOnBoarded: e.target.value === 'true' })}
            className={SELECT}
          >
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
        </Field>
      </div>
      <Field label="个人简介">
        <textarea
          rows={4} value={applicant.personalBrief}
          onChange={(e) => onChange({ personalBrief: e.target.value })}
          className={TEXTAREA} placeholder="个人简要介绍，≤500字"
        />
      </Field>
    </div>
  )
}

function EditableWorksEducTab({ applicant, onChange }: {
  applicant: Applicant
  onChange: (patch: Partial<Applicant>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs font-semibold text-slate-500">学习经历</p>
        </div>
        <RepeatableCollection
          schema={EDUCATION_SCHEMA}
          items={applicant.educations}
          onChange={(items) => onChange({ educations: items as Applicant['educations'] })}
        />
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs font-semibold text-slate-500">工作经历</p>
        </div>
        <RepeatableCollection
          schema={WORK_SCHEMA}
          items={applicant.works}
          onChange={(items) => onChange({ works: items as Applicant['works'] })}
        />
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs font-semibold text-slate-500">主要项目</p>
        </div>
        <RepeatableCollection
          schema={MAJOR_PROJECT_SCHEMA}
          items={applicant.majorProjects}
          onChange={(items) => onChange({ majorProjects: items as Applicant['majorProjects'] })}
        />
      </div>
    </div>
  )
}

function EditableTeamTab({ teamMembers, onChange }: {
  teamMembers: Project['teamMembers']
  onChange: (items: Project['teamMembers']) => void
}) {
  return (
    <RepeatableCollection
      schema={TEAM_MEMBER_SCHEMA}
      items={teamMembers}
      onChange={(items) => onChange(items as Project['teamMembers'])}
    />
  )
}

function EditableProjectInfoTab({ project, onChange }: {
  project: Project
  onChange: (patch: Partial<Project>) => void
}) {
  return (
    <div className="space-y-4">
      <Field label="项目简介">
        <textarea rows={4} value={project.projectBrief}
          onChange={(e) => onChange({ projectBrief: e.target.value })}
          className={TEXTAREA} placeholder="项目简要介绍，≤500字" />
      </Field>
      <Field label="项目背景意义">
        <textarea rows={4} value={project.projectBackground}
          onChange={(e) => onChange({ projectBackground: e.target.value })}
          className={TEXTAREA} />
      </Field>
      <Field label="项目实施内容">
        <textarea rows={4} value={project.projectContent}
          onChange={(e) => onChange({ projectContent: e.target.value })}
          className={TEXTAREA} />
      </Field>
      <Field label="工作基础和条件">
        <textarea rows={3} value={project.workBasis}
          onChange={(e) => onChange({ workBasis: e.target.value })}
          className={TEXTAREA} />
      </Field>
      <Field label="预期贡献及验收指标">
        <textarea rows={3} value={project.expectedContribution}
          onChange={(e) => onChange({ expectedContribution: e.target.value })}
          className={TEXTAREA} />
      </Field>
      <Field label="预期经济效益指标">
        <textarea rows={3} value={project.economicEfficiency}
          onChange={(e) => onChange({ economicEfficiency: e.target.value })}
          className={TEXTAREA} />
      </Field>

      <div className="pt-2">
        <p className="text-xs font-semibold text-slate-500 mb-3">阶段性目标</p>
        <RepeatableCollection
          schema={PROJECT_STAGE_SCHEMA}
          items={project.projectStages}
          onChange={(items) => onChange({ projectStages: items as Project['projectStages'] })}
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 mb-3">投入预测（万元）</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="项目总投入预测">
            <input type="number" value={project.totalInvestmentForecast}
              onChange={(e) => onChange({ totalInvestmentForecast: Number(e.target.value) })}
              className={INPUT} />
          </Field>
          <Field label="用人单位已投入">
            <input type="number" value={project.alreadyInvestedByOrg}
              onChange={(e) => onChange({ alreadyInvestedByOrg: Number(e.target.value) })}
              className={INPUT} />
          </Field>
          <Field label="已获政府支持资金">
            <input type="number" value={project.govSupportReceived}
              onChange={(e) => onChange({ govSupportReceived: Number(e.target.value) })}
              className={INPUT} />
          </Field>
          <Field label="未来5年计划自筹">
            <input type="number" value={project.plannedInvestmentByOrg}
              onChange={(e) => onChange({ plannedInvestmentByOrg: Number(e.target.value) })}
              className={INPUT} />
          </Field>
        </div>
      </div>
    </div>
  )
}

function EditableAchievementsTab({ applicant, onChange }: {
  applicant: Applicant
  onChange: (patch: Partial<Applicant>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs font-semibold text-slate-500">代表性论文</p>
        </div>
        <RepeatableCollection
          schema={PAPER_SCHEMA}
          items={applicant.papers}
          onChange={(items) => onChange({ papers: items as Applicant['papers'] })}
        />
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs font-semibold text-slate-500">代表性专利</p>
        </div>
        <RepeatableCollection
          schema={PATENT_SCHEMA}
          items={applicant.patents}
          onChange={(items) => onChange({ patents: items as Applicant['patents'] })}
        />
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs font-semibold text-slate-500">软件著作权</p>
        </div>
        <RepeatableCollection
          schema={SOFTWARE_COPYRIGHT_SCHEMA}
          items={applicant.softwareCopyrights}
          onChange={(items) => onChange({ softwareCopyrights: items as Applicant['softwareCopyrights'] })}
        />
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Award className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs font-semibold text-slate-500">获奖荣誉</p>
        </div>
        <RepeatableCollection
          schema={AWARD_SCHEMA}
          items={applicant.awards}
          onChange={(items) => onChange({ awards: items as Applicant['awards'] })}
        />
      </div>
    </div>
  )
}

function EditableOrgInfoTab({ orgInfo, onChange }: {
  orgInfo: OrgInfo
  onChange: (patch: Partial<OrgInfo>) => void
}) {
  const set = (key: keyof OrgInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ [key]: e.target.value })
  const setNum = (key: keyof OrgInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ [key]: Number(e.target.value) })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="单位全称" required><input value={orgInfo.name} onChange={set('name')} className={INPUT} /></Field>
        <Field label="单位类型"><input value={orgInfo.orgType} onChange={set('orgType')} className={INPUT} /></Field>
        <Field label="统一社会信用代码"><input value={orgInfo.creditCode} onChange={set('creditCode')} className={INPUT} /></Field>
        <Field label="成立时间"><input type="month" value={orgInfo.establishedDate} onChange={set('establishedDate')} className={INPUT} /></Field>
        <Field label="注册资本（万元）"><input type="number" value={orgInfo.registeredCapital} onChange={setNum('registeredCapital')} className={INPUT} /></Field>
        <Field label="在职员工总数"><input type="number" value={orgInfo.totalEmployees} onChange={setNum('totalEmployees')} className={INPUT} /></Field>
        <Field label="年研发投入（万元）"><input type="number" value={orgInfo.rdExpenditure} onChange={setNum('rdExpenditure')} className={INPUT} /></Field>
        <Field label="年营业收入（万元）"><input type="number" value={orgInfo.totalRevenue} onChange={setNum('totalRevenue')} className={INPUT} /></Field>
        <Field label="累计融资额（万元）"><input type="number" value={orgInfo.totalFunding} onChange={setNum('totalFunding')} className={INPUT} /></Field>
        <Field label="融资轮次"><input value={orgInfo.fundingRound} onChange={set('fundingRound')} className={INPUT} placeholder="天使/Pre-A/A轮…" /></Field>
      </div>
      <Field label="单位简介">
        <textarea rows={3} value={orgInfo.orgBrief}
          onChange={(e) => onChange({ orgBrief: e.target.value })}
          className={TEXTAREA} placeholder="用人单位简介，≤500字" />
      </Field>
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-3">单位荣誉</p>
        <RepeatableCollection
          schema={ORG_HONOR_SCHEMA}
          items={orgInfo.honors}
          onChange={(items) => onChange({ honors: items as OrgInfo['honors'] })}
        />
      </div>
    </div>
  )
}

function EditableProjectInfoTabs({ project, onChange }: {
  project: Project
  onChange: (patch: Partial<Project>) => void
}) {
  const [activeTab, setActiveTab] = useState<InfoTab>('申报人')

  function patchApplicant(patch: Partial<Applicant>) {
    onChange({ applicant: { ...project.applicant, ...patch } })
  }

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap">
        {INFO_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
              activeTab === tab ? 'bg-brand-blue text-white' : 'text-slate-500 hover:bg-slate-100',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-slate-50/60 rounded-xl p-4">
        {activeTab === '申报人' && (
          <EditableApplicantTab applicant={project.applicant} onChange={patchApplicant} />
        )}
        {activeTab === '学习/工作' && (
          <EditableWorksEducTab applicant={project.applicant} onChange={patchApplicant} />
        )}
        {activeTab === '项目成员' && (
          <EditableTeamTab
            teamMembers={project.teamMembers}
            onChange={(items) => onChange({ teamMembers: items })}
          />
        )}
        {activeTab === '项目信息' && (
          <EditableProjectInfoTab project={project} onChange={onChange} />
        )}
        {activeTab === '成果业绩' && (
          <EditableAchievementsTab applicant={project.applicant} onChange={patchApplicant} />
        )}
        {activeTab === '用人单位' && (
          <EditableOrgInfoTab
            orgInfo={project.orgInfo}
            onChange={(patch) => onChange({ orgInfo: { ...project.orgInfo, ...patch } })}
          />
        )}
      </div>
    </div>
  )
}

// ── Backflow diff & panel ─────────────────────────────────────────────────────

const BACKFLOW_SECTION_LABELS: Record<string, string> = {
  applicant: '申报人基本信息',
  educations: '学习经历',
  works: '工作经历',
  majorProjects: '主要项目',
  papers: '代表性论文',
  patents: '代表性专利',
  softwareCopyrights: '软件著作权',
  awards: '获奖荣誉',
  teamMembers: '项目团队成员',
  projectBrief: '项目简介',
  projectBackground: '项目背景意义',
  projectContent: '项目实施内容',
  workBasis: '工作基础和条件',
  expectedContribution: '预期贡献及验收指标',
  economicEfficiency: '预期经济效益指标',
  projectStages: '阶段性目标',
  investment: '投入预测数据',
  orgInfo: '用人单位基本信息',
  orgHonors: '单位荣誉',
}

function getChangedSections(original: Project, edited: Project): string[] {
  const changed: string[] = []
  const j = JSON.stringify

  // Applicant scalars
  const origScalars = Object.fromEntries(APPLICANT_SCALAR_KEYS.map((k) => [k, original.applicant[k]]))
  const editedScalars = Object.fromEntries(APPLICANT_SCALAR_KEYS.map((k) => [k, edited.applicant[k]]))
  if (j(origScalars) !== j(editedScalars)) changed.push('applicant')

  // Applicant collections
  if (j(original.applicant.educations) !== j(edited.applicant.educations)) changed.push('educations')
  if (j(original.applicant.works) !== j(edited.applicant.works)) changed.push('works')
  if (j(original.applicant.majorProjects) !== j(edited.applicant.majorProjects)) changed.push('majorProjects')
  if (j(original.applicant.papers) !== j(edited.applicant.papers)) changed.push('papers')
  if (j(original.applicant.patents) !== j(edited.applicant.patents)) changed.push('patents')
  if (j(original.applicant.softwareCopyrights) !== j(edited.applicant.softwareCopyrights)) changed.push('softwareCopyrights')
  if (j(original.applicant.awards) !== j(edited.applicant.awards)) changed.push('awards')

  // Project-level
  if (j(original.teamMembers) !== j(edited.teamMembers)) changed.push('teamMembers')

  const textFields = ['projectBrief', 'projectBackground', 'projectContent', 'workBasis', 'expectedContribution', 'economicEfficiency'] as const
  for (const f of textFields) {
    if (original[f] !== edited[f]) changed.push(f)
  }
  if (j(original.projectStages) !== j(edited.projectStages)) changed.push('projectStages')

  const investFields = ['totalInvestmentForecast', 'alreadyInvestedByOrg', 'govSupportReceived', 'plannedInvestmentByOrg'] as const
  if (investFields.some((f) => original[f] !== edited[f])) changed.push('investment')

  // OrgInfo
  const orgScalarKeys: (keyof OrgInfo)[] = ['name', 'orgType', 'creditCode', 'establishedDate', 'registeredCapital', 'totalEmployees', 'rdExpenditure', 'totalRevenue', 'totalFunding', 'fundingRound', 'orgBrief']
  const origOrgScalars = Object.fromEntries(orgScalarKeys.map((k) => [k, original.orgInfo[k]]))
  const editedOrgScalars = Object.fromEntries(orgScalarKeys.map((k) => [k, edited.orgInfo[k]]))
  if (j(origOrgScalars) !== j(editedOrgScalars)) changed.push('orgInfo')
  if (j(original.orgInfo.honors) !== j(edited.orgInfo.honors)) changed.push('orgHonors')

  return changed
}

function buildBackflowPatch(original: Project, edited: Project, selected: Set<string>): Partial<Project> {
  const patch: Partial<Project> = {}

  const applicantSections = ['applicant', 'educations', 'works', 'majorProjects', 'papers', 'patents', 'softwareCopyrights', 'awards']
  if (applicantSections.some((k) => selected.has(k))) {
    const a = { ...original.applicant }
    if (selected.has('applicant')) {
      for (const k of APPLICANT_SCALAR_KEYS) (a as unknown as Record<string, unknown>)[k] = (edited.applicant as unknown as Record<string, unknown>)[k]
    }
    if (selected.has('educations')) a.educations = edited.applicant.educations
    if (selected.has('works')) a.works = edited.applicant.works
    if (selected.has('majorProjects')) a.majorProjects = edited.applicant.majorProjects
    if (selected.has('papers')) a.papers = edited.applicant.papers
    if (selected.has('patents')) a.patents = edited.applicant.patents
    if (selected.has('softwareCopyrights')) a.softwareCopyrights = edited.applicant.softwareCopyrights
    if (selected.has('awards')) a.awards = edited.applicant.awards
    patch.applicant = a
  }

  if (selected.has('teamMembers')) patch.teamMembers = edited.teamMembers

  const textFields = ['projectBrief', 'projectBackground', 'projectContent', 'workBasis', 'expectedContribution', 'economicEfficiency'] as const
  for (const f of textFields) {
    if (selected.has(f)) (patch as Record<string, unknown>)[f] = edited[f]
  }

  if (selected.has('projectStages')) patch.projectStages = edited.projectStages

  if (selected.has('investment')) {
    patch.totalInvestmentForecast = edited.totalInvestmentForecast
    patch.alreadyInvestedByOrg = edited.alreadyInvestedByOrg
    patch.govSupportReceived = edited.govSupportReceived
    patch.plannedInvestmentByOrg = edited.plannedInvestmentByOrg
  }

  if (selected.has('orgInfo') || selected.has('orgHonors')) {
    const orgScalarKeys: (keyof OrgInfo)[] = ['name', 'orgType', 'creditCode', 'establishedDate', 'registeredCapital', 'totalEmployees', 'rdExpenditure', 'totalRevenue', 'totalFunding', 'fundingRound', 'orgBrief']
    const orgPatch = { ...original.orgInfo }
    if (selected.has('orgInfo')) {
      for (const k of orgScalarKeys) (orgPatch as unknown as Record<string, unknown>)[k] = (edited.orgInfo as unknown as Record<string, unknown>)[k]
    }
    if (selected.has('orgHonors')) orgPatch.honors = edited.orgInfo.honors
    patch.orgInfo = orgPatch
  }

  return patch
}

function BackflowPanel({ changedSections, selected, onToggle, onSelectAll, onClearAll }: {
  changedSections: string[]
  selected: Set<string>
  onToggle: (key: string) => void
  onSelectAll: () => void
  onClearAll: () => void
}) {
  if (changedSections.length === 0) return null

  return (
    <div className="glass-card p-5 border border-amber-200 bg-amber-50/40">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800">回流覆盖到项目档案</p>
          <p className="text-xs text-amber-600 mt-0.5">
            以下信息在报名表中已修改，可选择将变更同步回项目档案（可选）
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button onClick={onSelectAll} className="text-brand-blue hover:underline font-semibold">全选</button>
          <span className="text-slate-300">|</span>
          <button onClick={onClearAll} className="text-slate-400 hover:underline">清除</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {changedSections.map((key) => {
          const isSelected = selected.has(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition-colors',
                isSelected
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-amber-200',
              )}
            >
              {isSelected
                ? <CheckSquare className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                : <Square className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
              <span className="text-xs font-semibold">{BACKFLOW_SECTION_LABELS[key] ?? key}</span>
            </button>
          )
        })}
      </div>
      {selected.size > 0 && (
        <p className="mt-3 text-xs text-amber-700">
          已选 {selected.size} 项，提交报名后将自动覆盖项目档案对应内容
        </p>
      )}
    </div>
  )
}

// ── Step 2: Fill registration form ────────────────────────────────────────────

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function RegFormStep({
  originalProject,
  editableProject,
  onEditProject,
  comp,
  form,
  onChange,
  onBack,
  onSubmit,
  submitting,
  sourceRegName,
  changedSections,
  backflowSelected,
  onToggleBackflow,
  onSelectAllBackflow,
  onClearBackflow,
}: {
  originalProject: Project
  editableProject: Project
  onEditProject: (patch: Partial<Project>) => void
  comp: CompetitionOption
  form: RegForm
  onChange: (patch: Partial<RegForm>) => void
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  sourceRegName?: string
  changedSections: string[]
  backflowSelected: Set<string>
  onToggleBackflow: (key: string) => void
  onSelectAllBackflow: () => void
  onClearBackflow: () => void
}) {
  const memberCount = editableProject.teamMembers.length + 1

  const canSubmit =
    form.declarationName.trim() !== '' &&
    form.applicationType !== '' &&
    form.domain.topCode !== '' &&
    form.introductionArea !== '' &&
    form.contactPerson.trim() !== '' &&
    form.contactPhone.trim() !== '' &&
    form.applicantCommitment

  return (
    <div className="space-y-5">

      {/* Competition banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-blue/5 border border-brand-blue/20">
        <Trophy className="w-4 h-4 text-brand-blue flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-brand-blue">{comp.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">截止 {comp.deadline} · {comp.track}</p>
        </div>
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 flex-shrink-0">
          更换 <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {sourceRegName && (
        <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 border border-amber-100">
          已从「{sourceRegName}」预填报名信息，请核对并按本次赛事要求修改
        </div>
      )}

      {/* ── Registration fields ─── */}
      <div className="glass-card p-5 space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">报名信息</p>

        <FormField label="申报用名" required>
          <input
            type="text" value={form.declarationName}
            onChange={(e) => onChange({ declarationName: e.target.value })}
            className={INPUT} placeholder="本次参赛使用的项目名称"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="申报类型" required>
            <select value={form.applicationType} onChange={(e) => onChange({ applicationType: e.target.value })} className={SELECT}>
              {APPLICATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="引进地" required>
            <select value={form.introductionArea} onChange={(e) => onChange({ introductionArea: e.target.value })} className={SELECT}>
              {INTRODUCTION_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="专业领域" required>
          <DomainSelector value={form.domain} onChange={(domain) => onChange({ domain })} />
        </FormField>

        <FormField label="专业方向补充">
          <input
            type="text" value={form.professionalDirection}
            onChange={(e) => onChange({ professionalDirection: e.target.value })}
            className={INPUT} placeholder="对细分领域的进一步说明（可选）"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="联系人" required>
            <input type="text" value={form.contactPerson}
              onChange={(e) => onChange({ contactPerson: e.target.value })} className={INPUT} />
          </FormField>
          <FormField label="联系电话" required>
            <input type="tel" value={form.contactPhone}
              onChange={(e) => onChange({ contactPhone: e.target.value })} className={INPUT} />
          </FormField>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <span className="text-slate-400">报名成员数：</span>
          <span className="font-bold text-slate-700">{memberCount} 人</span>
          <span className="text-xs text-slate-400">（申报人 + {editableProject.teamMembers.length} 名团队成员，自动计算）</span>
        </div>
      </div>

      {/* ── Green channel ─── */}
      <div className="glass-card p-5 space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">破格通道申请（可选）</p>
        <button
          type="button"
          onClick={() => onChange({ greenChannelApplied: !form.greenChannelApplied })}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          {form.greenChannelApplied
            ? <CheckSquare className="w-4 h-4 text-brand-blue" />
            : <Square className="w-4 h-4 text-slate-300" />}
          申请破格通道
        </button>
        {form.greenChannelApplied && (
          <div className="space-y-3 pl-6">
            <FormField label="破格类型">
              <select
                value={form.greenChannelType ?? ''}
                onChange={(e) => onChange({ greenChannelType: e.target.value as RegistrationRecord['greenChannelType'] })}
                className={SELECT}
              >
                <option value="">请选择</option>
                {GREEN_CHANNEL_TYPES.map((t) => t && <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="破格理由">
              <textarea
                rows={3} value={form.greenChannelReason}
                onChange={(e) => onChange({ greenChannelReason: e.target.value })}
                className={TEXTAREA}
                placeholder="说明申请破格通道的条件和理由"
              />
            </FormField>
          </div>
        )}
      </div>

      {/* ── Recusal & commitment ─── */}
      <div className="glass-card p-5 space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">回避声明 & 承诺</p>
        <FormField label="需回避专家">
          <input type="text" value={form.expertRecusal}
            onChange={(e) => onChange({ expertRecusal: e.target.value })}
            className={INPUT} placeholder="如无请留空" />
        </FormField>
        <FormField label="需回避单位">
          <input type="text" value={form.orgRecusal}
            onChange={(e) => onChange({ orgRecusal: e.target.value })}
            className={INPUT} placeholder="如无请留空" />
        </FormField>
        <button
          type="button"
          onClick={() => onChange({ applicantCommitment: !form.applicantCommitment })}
          className="flex items-start gap-2 text-sm text-slate-600 text-left"
        >
          {form.applicantCommitment
            ? <CheckSquare className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
            : <Square className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />}
          <span>本人承诺以上填写信息及提交材料真实有效，如有不实，自愿承担相应法律责任。<span className="text-red-500">*</span></span>
        </button>
      </div>

      {/* ── Editable project info ─── */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex-1">项目信息（将随报名一并提交，可在此修改）</p>
          <User className="w-3 h-3 text-slate-300" />
        </div>
        <EditableProjectInfoTabs project={editableProject} onChange={onEditProject} />
      </div>

      {/* ── Backflow panel ─── */}
      <BackflowPanel
        changedSections={changedSections}
        selected={backflowSelected}
        onToggle={onToggleBackflow}
        onSelectAll={onSelectAllBackflow}
        onClearAll={onClearBackflow}
      />

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 重新选择赛事
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting || !canSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
        >
          <Check className="w-4 h-4" /> {submitting ? '提交中…' : '提交报名'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Step = 'select' | 'form' | 'done'
const STEP_LABELS = ['选择赛事', '填写报名表', '提交完成']

export default function ProjectApplyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromRegId = searchParams.get('fromReg')

  const { projectsV3, competitions, addRegistrationV3, updateProjectV3 } = useProjectDashboardStore()
  const originalProject = projectsV3.find((p) => p.id === id)
  const sourceReg = fromRegId ? originalProject?.registrations.find((r) => r.id === fromRegId) : undefined

  const [step, setStep] = useState<Step>('select')
  const [selectedComp, setSelectedComp] = useState<CompetitionOption | null>(null)
  const [form, setForm] = useState<RegForm | null>(null)
  const [editableProject, setEditableProject] = useState<Project | null>(null)
  const [backflowSelected, setBackflowSelected] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [newRegId, setNewRegId] = useState<string>('')

  const changedSections = useMemo(
    () => (originalProject && editableProject ? getChangedSections(originalProject, editableProject) : []),
    [originalProject, editableProject],
  )

  if (!originalProject) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
        <p className="text-sm">项目不存在</p>
        <button onClick={() => navigate('/project')} className="text-sm text-brand-blue hover:underline">返回</button>
      </div>
    )
  }

  function handleSelectComp(comp: CompetitionOption) {
    setSelectedComp(comp)
  }

  function handleToForm() {
    if (!selectedComp) return
    setForm(initForm(originalProject!, sourceReg))
    setEditableProject(cloneProject(originalProject!))
    setBackflowSelected(new Set())
    setStep('form')
  }

  function handleFormChange(patch: Partial<RegForm>) {
    setForm((f) => f ? { ...f, ...patch } : f)
  }

  function handleEditProject(patch: Partial<Project>) {
    setEditableProject((p) => p ? { ...p, ...patch } : p)
  }

  function handleToggleBackflow(key: string) {
    setBackflowSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleSelectAllBackflow() {
    setBackflowSelected(new Set(changedSections))
  }

  function handleClearBackflow() {
    setBackflowSelected(new Set())
  }

  function handleSubmit() {
    if (!selectedComp || !form || !originalProject || !editableProject) return
    setSubmitting(true)

    setTimeout(() => {
      const regId = `reg-${Date.now()}`
      const now = new Date().toISOString()
      const today = now.slice(0, 10)
      const snapshotId = `snap-${Date.now()}`

      const reg: RegistrationRecord = {
        id: regId,
        projectId: originalProject.id,
        competitionId: selectedComp.id,
        competitionName: selectedComp.name,
        applicationType: form.applicationType,
        professionalDomain: resolveDomain(form.domain),
        professionalDirection: form.professionalDirection,
        introductionArea: form.introductionArea,
        declarationName: form.declarationName,
        memberCount: editableProject.teamMembers.length + 1,
        contactPerson: form.contactPerson,
        contactPhone: form.contactPhone,
        applicationDate: today,
        status: '待审核',
        greenChannelApplied: form.greenChannelApplied,
        greenChannelType: form.greenChannelApplied ? form.greenChannelType : undefined,
        greenChannelReason: form.greenChannelApplied ? form.greenChannelReason : '',
        expertRecusal: form.expertRecusal,
        orgRecusal: form.orgRecusal,
        applicantCommitment: form.applicantCommitment,
        submittedAt: now,
        snapshotId,
        phases: [
          { label: '报名受理', status: 'active', date: today, description: '材料已提交，等待赛事方审核通过。' },
          { label: '初赛评审', status: 'upcoming' },
          { label: '复赛路演', status: 'upcoming' },
          { label: '决赛颁奖', status: 'upcoming' },
        ],
      }

      addRegistrationV3(originalProject.id, reg)

      // Apply backflow changes to project record
      if (backflowSelected.size > 0) {
        const patch = buildBackflowPatch(originalProject, editableProject, backflowSelected)
        updateProjectV3(originalProject.id, patch)
      }

      setNewRegId(regId)
      setSubmitting(false)
      setStep('done')
    }, 800)
  }

  const stepIndex = step === 'select' ? 0 : step === 'form' ? 1 : 2

  const competitionOptions: CompetitionOption[] = competitions.map((c) => ({
    id: c.id, name: c.name, summary: c.summary,
    track: c.track, deadline: c.deadline, status: c.status,
  }))

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => step === 'form' ? setStep('select') : navigate(`/project/${id}`)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800">报名赛事</h1>
          <p className="text-sm text-slate-400">{originalProject.declarationName || originalProject.projectName}</p>
        </div>
      </div>

      {/* Step indicator */}
      {step !== 'done' && (
        <div className="flex items-center gap-2">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all',
                stepIndex === i ? 'bg-brand-blue text-white'
                : stepIndex > i ? 'text-emerald-600'
                : 'text-slate-400',
              )}>
                {stepIndex > i ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                {label}
              </div>
              {i < STEP_LABELS.length - 1 && <div className="w-6 h-0.5 bg-slate-200" />}
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      {step === 'select' && (
        <CompetitionSelectStep
          competitions={competitionOptions}
          selected={selectedComp}
          onSelect={handleSelectComp}
          onNext={handleToForm}
        />
      )}

      {step === 'form' && selectedComp && form && editableProject && (
        <RegFormStep
          originalProject={originalProject}
          editableProject={editableProject}
          onEditProject={handleEditProject}
          comp={selectedComp}
          form={form}
          onChange={handleFormChange}
          onBack={() => setStep('select')}
          onSubmit={handleSubmit}
          submitting={submitting}
          sourceRegName={sourceReg?.competitionName}
          changedSections={changedSections}
          backflowSelected={backflowSelected}
          onToggleBackflow={handleToggleBackflow}
          onSelectAllBackflow={handleSelectAllBackflow}
          onClearBackflow={handleClearBackflow}
        />
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center py-16 gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-slate-800">报名成功！</p>
            <p className="text-sm text-slate-400 mt-1">
              报名已提交，等待赛事方审核
              {backflowSelected.size > 0 && `，已同步 ${backflowSelected.size} 项修改到项目档案`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/project/${id}/registration/${newRegId}`)}
              className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
            >
              查看报名详情
            </button>
            <button
              onClick={() => navigate(`/project/${id}`)}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              返回项目主页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
