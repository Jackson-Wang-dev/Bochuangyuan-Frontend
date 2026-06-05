import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Trophy, Check, Clock, CheckCircle2, XCircle, AlertCircle,
  RotateCcw, FileDown, Loader2, GraduationCap, Briefcase, FlaskConical,
  Users, Building2, BookOpen, Award, FileCode2, ShieldCheck, ShieldAlert, Shield,
  Pencil, X, Save, Sparkles, ChevronRight, TrendingUp, Lightbulb, Target,
  History, ChevronDown,
} from 'lucide-react'
import { useProjectDashboardStore } from '@/store/projectDashboardStore'
import type { Project, RegistrationRecord, SelectedDomain } from '@/types/project'
import { PROFESSIONAL_DOMAINS } from '@/mock/professionalDomains'
import { cn } from '@/lib/utils'

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  '待审核':   'bg-amber-50 text-amber-600 border-amber-200',
  '审核通过': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  '已晋级':   'bg-emerald-50 text-emerald-600 border-emerald-200',
  '已淘汰':   'bg-red-50 text-red-500 border-red-200',
  '已撤回':   'bg-slate-100 text-slate-500 border-slate-200',
}
const STATUS_ICON: Record<string, React.ReactNode> = {
  '待审核':   <AlertCircle className="w-3.5 h-3.5 text-amber-500" />,
  '审核通过': <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  '已晋级':   <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  '已淘汰':   <XCircle className="w-3.5 h-3.5 text-red-400" />,
  '已撤回':   <RotateCcw className="w-3.5 h-3.5 text-slate-400" />,
}

const APPLICATION_TYPES = ['创业类', '企业类', '学生创业类']
const INTRODUCTION_AREAS = ['宁波市', '宁波市鄞州区', '宁波市海曙区', '宁波市北仑区', '宁波市镇海区', '宁波市江北区', '宁波市奉化区', '宁波市余姚市', '宁波市慈溪市', '宁波市象山县', '宁波市宁海县']
const GREEN_CHANNEL_TYPES: RegistrationRecord['greenChannelType'][] = ['直接进入终评', '直接认定']

// ── Edit draft type ───────────────────────────────────────────────────────────

interface DomainState { topCode: string; midCode: string; leafCode: string }

interface EditDraft {
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
}

// ── Modification history ──────────────────────────────────────────────────────

interface ModEntry {
  id: string
  timestamp: string
  action: string
  statusFrom?: string
  statusTo?: string
  note?: string
  isAuto?: boolean
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function generateInitialHistory(reg: RegistrationRecord): ModEntry[] {
  const submitted = reg.submittedAt ?? `${reg.applicationDate}T09:00:00.000Z`
  return [
    {
      id: 'h0',
      timestamp: submitted,
      action: '提交报名',
      statusTo: '待审核',
      note: '报名材料已提交，等待赛事方受理',
    },
    {
      id: 'h1',
      timestamp: addDays(submitted, 2),
      action: '受理审核通过',
      statusFrom: '待审核',
      statusTo: '审核通过',
      note: '主办方已核对材料，报名审核通过',
      isAuto: true,
    },
    {
      id: 'h2',
      timestamp: addDays(submitted, 4),
      action: '申报人修改报名信息',
      statusFrom: '审核通过',
      statusTo: '待审核',
      note: '信息变更后重新进入审核流程',
    },
  ]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initEditDraft(reg: RegistrationRecord): EditDraft {
  return {
    declarationName: reg.declarationName,
    applicationType: reg.applicationType,
    domain: {
      topCode: reg.professionalDomain.top?.code ?? '',
      midCode: reg.professionalDomain.mid?.code ?? '',
      leafCode: reg.professionalDomain.leaf?.code ?? '',
    },
    professionalDirection: reg.professionalDirection,
    introductionArea: reg.introductionArea,
    contactPerson: reg.contactPerson,
    contactPhone: reg.contactPhone,
    greenChannelApplied: reg.greenChannelApplied,
    greenChannelType: reg.greenChannelType,
    greenChannelReason: reg.greenChannelReason,
    expertRecusal: reg.expertRecusal,
    orgRecusal: reg.orgRecusal,
  }
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

// ── Shared form styles ────────────────────────────────────────────────────────

const INPUT = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white'
const SELECT = INPUT
const TEXTAREA = cn(INPUT, 'resize-none')

// ── Phase stepper ─────────────────────────────────────────────────────────────

function PhaseStepper({ phases }: { phases: RegistrationRecord['phases'] }) {
  return (
    <div className="relative">
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-100" />
      <div className="relative flex items-start justify-between gap-2">
        {phases.map((phase, i) => {
          const isDone   = phase.status === 'completed'
          const isActive = phase.status === 'active'
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-0 relative z-10">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0',
                isDone   ? 'bg-emerald-500 border-emerald-500 text-white' :
                isActive ? 'bg-brand-blue border-brand-blue text-white ring-4 ring-brand-blue/20' :
                           'bg-white border-slate-200 text-slate-300',
              )}>
                {isDone ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <p className={cn(
                'text-xs font-bold text-center leading-tight',
                isDone ? 'text-emerald-600' : isActive ? 'text-brand-blue' : 'text-slate-400',
              )}>
                {phase.label}
              </p>
              {phase.date && <p className="text-[10px] text-slate-400 text-center">{phase.date}</p>}
              {isActive && (
                <span className="px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded-full whitespace-nowrap">
                  进行中
                </span>
              )}
            </div>
          )
        })}
      </div>
      {(() => {
        const active = phases.find((p) => p.status === 'active')
        const last = [...phases].reverse().find((p) => p.status === 'completed')
        const h = active ?? last
        if (!h?.description) return null
        return (
          <div className={cn(
            'mt-4 rounded-xl px-4 py-3 text-sm',
            active ? 'bg-brand-blue/5 text-brand-blue' : 'bg-emerald-50 text-emerald-700',
          )}>
            <p className="font-semibold mb-0.5">{h.label}</p>
            <p className="text-xs opacity-80">{h.description}</p>
          </div>
        )
      })()}
    </div>
  )
}

// ── Section title ─────────────────────────────────────────────────────────────

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-brand-blue opacity-70">{icon}</span>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{children}</p>
    </div>
  )
}

function KV({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  const display =
    value === null || value === undefined || value === '' ? '/'
    : typeof value === 'boolean' ? (value ? '是' : '否')
    : String(value)
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-400 whitespace-nowrap flex-shrink-0 w-28">{label}</span>
      <span className="text-slate-700 font-medium flex-1 min-w-0">{display}</span>
    </div>
  )
}

function VerBadge({ verified }: { verified: boolean }) {
  if (verified) return <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600"><ShieldCheck className="w-3 h-3" />已验证</span>
  return <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400"><ShieldAlert className="w-3 h-3" />未验证</span>
}

// ── Domain selector (inline) ──────────────────────────────────────────────────

function DomainSelector({ value, onChange }: { value: DomainState; onChange: (v: DomainState) => void }) {
  const top = PROFESSIONAL_DOMAINS.find((x) => x.code === value.topCode)
  const mids = top?.children ?? []
  const mid = mids.find((x) => x.code === value.midCode)
  const leaves = mid?.children ?? []
  return (
    <div className="grid grid-cols-3 gap-2">
      <select value={value.topCode} onChange={(e) => onChange({ topCode: e.target.value, midCode: '', leafCode: '' })} className={SELECT}>
        <option value="">一级领域</option>
        {PROFESSIONAL_DOMAINS.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}
      </select>
      <select value={value.midCode} disabled={!top} onChange={(e) => onChange({ ...value, midCode: e.target.value, leafCode: '' })} className={cn(SELECT, !top && 'opacity-50')}>
        <option value="">二级方向</option>
        {mids.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}
      </select>
      <select value={value.leafCode} disabled={!mid} onChange={(e) => onChange({ ...value, leafCode: e.target.value })} className={cn(SELECT, !mid && 'opacity-50')}>
        <option value="">细分领域</option>
        {leaves.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}
      </select>
    </div>
  )
}

// ── Edit registration info form ───────────────────────────────────────────────

function EditRegInfoPanel({ draft, onChange, onSave, onCancel, regStatus }: {
  draft: EditDraft
  onChange: (patch: Partial<EditDraft>) => void
  onSave: () => void
  onCancel: () => void
  regStatus: string
}) {
  const willResetStatus = regStatus === '审核通过' || regStatus === '已晋级'

  return (
    <div className="space-y-4">
      {willResetStatus && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>当前状态为「{regStatus}」，修改后将自动重置为<strong>「待审核」</strong>，等待赛事方重新审核</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500">申报用名 *</label>
        <input value={draft.declarationName} onChange={(e) => onChange({ declarationName: e.target.value })} className={INPUT} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">申报类型 *</label>
          <select value={draft.applicationType} onChange={(e) => onChange({ applicationType: e.target.value })} className={SELECT}>
            {APPLICATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">引进地 *</label>
          <select value={draft.introductionArea} onChange={(e) => onChange({ introductionArea: e.target.value })} className={SELECT}>
            {INTRODUCTION_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500">专业领域 *</label>
        <DomainSelector value={draft.domain} onChange={(domain) => onChange({ domain })} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500">专业方向补充</label>
        <input value={draft.professionalDirection} onChange={(e) => onChange({ professionalDirection: e.target.value })} className={INPUT} placeholder="可选" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">联系人 *</label>
          <input value={draft.contactPerson} onChange={(e) => onChange({ contactPerson: e.target.value })} className={INPUT} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">联系电话 *</label>
          <input type="tel" value={draft.contactPhone} onChange={(e) => onChange({ contactPhone: e.target.value })} className={INPUT} />
        </div>
      </div>

      {/* Green channel */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onChange({ greenChannelApplied: !draft.greenChannelApplied })}
          className="flex items-center gap-2 text-sm text-slate-600 font-semibold"
        >
          <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center', draft.greenChannelApplied ? 'bg-brand-blue border-brand-blue' : 'border-slate-300')}>
            {draft.greenChannelApplied && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
          破格通道申请
        </button>
        {draft.greenChannelApplied && (
          <div className="space-y-2 pl-6">
            <select value={draft.greenChannelType ?? ''} onChange={(e) => onChange({ greenChannelType: e.target.value as RegistrationRecord['greenChannelType'] })} className={SELECT}>
              <option value="">破格类型</option>
              {GREEN_CHANNEL_TYPES.map((t) => t && <option key={t} value={t}>{t}</option>)}
            </select>
            <textarea rows={2} value={draft.greenChannelReason} onChange={(e) => onChange({ greenChannelReason: e.target.value })} className={TEXTAREA} placeholder="破格理由" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">需回避专家</label>
          <input value={draft.expertRecusal} onChange={(e) => onChange({ expertRecusal: e.target.value })} className={INPUT} placeholder="如无留空" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">需回避单位</label>
          <input value={draft.orgRecusal} onChange={(e) => onChange({ orgRecusal: e.target.value })} className={INPUT} placeholder="如无留空" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
          <X className="w-3.5 h-3.5" /> 取消
        </button>
        <button
          onClick={onSave}
          disabled={!draft.declarationName.trim() || !draft.contactPerson.trim() || !draft.contactPhone.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" /> 保存修改
        </button>
      </div>
    </div>
  )
}

// ── Modification history ──────────────────────────────────────────────────────

function ModificationHistory({ entries }: { entries: ModEntry[] }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? entries : entries.slice(-2)

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <SectionTitle icon={<History className="w-4 h-4" />}>修改记录</SectionTitle>
        {entries.length > 2 && (
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
            {expanded ? '收起' : `查看全部 ${entries.length} 条`}
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expanded && 'rotate-180')} />
          </button>
        )}
      </div>
      <div className="space-y-3">
        {shown.map((e, i) => (
          <div key={e.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-2 h-2 rounded-full flex-shrink-0 mt-1',
                e.isAuto ? 'bg-emerald-400' : 'bg-brand-blue',
              )} />
              {i < shown.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 mt-1" />}
            </div>
            <div className="flex-1 min-w-0 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-700">{e.action}</span>
                {e.statusFrom && (
                  <>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-bold', STATUS_BADGE[e.statusFrom] ?? 'bg-slate-100 text-slate-500')}>{e.statusFrom}</span>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-bold', STATUS_BADGE[e.statusTo ?? ''] ?? 'bg-slate-100 text-slate-500')}>{e.statusTo}</span>
                  </>
                )}
                {!e.statusFrom && e.statusTo && (
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border font-bold', STATUS_BADGE[e.statusTo] ?? 'bg-slate-100 text-slate-500')}>{e.statusTo}</span>
                )}
              </div>
              {e.note && <p className="text-xs text-slate-400 mt-0.5">{e.note}</p>}
              <p className="text-[10px] text-slate-300 mt-0.5">{new Date(e.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AI Analysis panel ─────────────────────────────────────────────────────────

interface AIScore { label: string; score: number; color: string }

function ScoreBar({ label, score, color }: AIScore) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-bold text-slate-700">{score}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function AIAnalysisPanel({ project, reg }: { project: Project; reg: RegistrationRecord }) {
  const overallScore = 78

  const dimensions: AIScore[] = [
    { label: '申报人资历', score: 85, color: 'bg-violet-500' },
    { label: '项目成熟度', score: 72, color: 'bg-blue-500' },
    { label: '领域匹配度', score: 90, color: 'bg-emerald-500' },
    { label: '团队配置', score: 65, color: 'bg-amber-500' },
    { label: '财务状况', score: 68, color: 'bg-rose-400' },
  ]

  const strengths = [
    `申报人学术背景扎实，${project.applicant.papers.length > 0 ? `发表论文 ${project.applicant.papers.length} 篇` : '具备相关研究积累'}，契合赛事技术评分标准`,
    `专业领域「${reg.professionalDomain.top?.label ?? ''}」与本届赛事重点扶持方向高度吻合`,
    project.orgInfo.totalFunding > 0 ? `已完成 ${project.orgInfo.totalFunding} 万元融资，商业化进程获赛事正向评分` : '项目基础条件符合赛事申报要求',
  ]

  const suggestions = [
    '项目简介未突出宁波本地产业链需求，评委更关注本地落地能力，建议补充本地资源对接情况',
    `团队成员共 ${reg.memberCount} 人，建议在介绍中明确商务/市场拓展分工，补强商业落地维度得分`,
    '申报书第三章「工作基础」可进一步量化项目里程碑（如：完成用户数、营收数据），增强可信度',
  ]

  return (
    <div className="space-y-4">
      {/* Overall score */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
            <Target className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">AI 匹配度分析</p>
            <p className="text-[10px] text-slate-400">基于赛事评审维度生成</p>
          </div>
        </div>

        {/* Ring score */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle
                cx="32" cy="32" r="26" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 26 * overallScore / 100} ${2 * Math.PI * 26}`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-slate-800">{overallScore}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">综合匹配度</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {overallScore >= 80 ? '优秀匹配' : overallScore >= 65 ? '良好匹配' : '一般匹配'}，
              {overallScore >= 75 ? '建议优化后提交可明显提升竞争力' : '有较大提升空间'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {dimensions.map((d) => <ScoreBar key={d.label} {...d} />)}
        </div>
      </div>

      {/* Strengths */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">优势亮点</p>
        </div>
        <div className="space-y-2.5">
          {strengths.map((s, i) => (
            <div key={i} className="flex gap-2 text-xs text-slate-600">
              <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">✓</span>
              <span className="leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">优化建议</p>
        </div>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="flex gap-2 text-xs text-slate-600">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-100 text-amber-600 font-bold flex items-center justify-center text-[10px]">{i + 1}</span>
              <span className="leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-slate-300 text-center px-2 leading-relaxed">
        以上分析由 AI 基于赛事历史评审数据生成，仅供参考，不代表主办方立场
      </p>
    </div>
  )
}

// ── Tracked-changes revision mark components ──────────────────────────────────

function Del({ children }: { children: React.ReactNode }) {
  return <span className="line-through text-red-400 bg-red-50 rounded px-0.5">{children}</span>
}
function Ins({ children }: { children: React.ReactNode }) {
  return <span className="underline underline-offset-2 text-emerald-600 bg-emerald-50 rounded px-0.5">{children}</span>
}
function AuthorBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.5 rounded bg-violet-100 text-violet-600 font-bold ml-0.5 align-middle">
      <Sparkles className="w-2 h-2" />AI优化
    </span>
  )
}

// ── Optimize doc modal ────────────────────────────────────────────────────────

function OptimizeDocModal({ project, reg, onClose }: {
  project: Project
  reg: RegistrationRecord
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [accepting, setAccepting] = useState(false)

  const orgName = project.orgInfo.name || '宁波某科技有限公司'
  const applicantName = project.applicant.name || '申报人'
  const brief = project.projectBrief || '本项目专注于前沿技术研发与产业化应用，致力于解决行业核心痛点。'

  function handleAcceptAndExport() {
    setAccepting(true)
    setTimeout(() => {
      alert('优化版申报书功能正在内测中，敬请期待完整版上线')
      setAccepting(false)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center gap-3 p-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800">AI 优化申报书预览</p>
            <p className="text-xs text-slate-400 mt-0.5">红色为建议删除内容，绿色为建议新增内容，接受后可导出为 Word 文件</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body — Word-like document */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto font-serif text-sm leading-relaxed space-y-6">

            {/* Document title area */}
            <div className="text-center space-y-1 pb-4 border-b border-slate-200">
              <p className="text-lg font-bold text-slate-800">
                <Del>{reg.declarationName}</Del>
                {' '}
                <Ins>{reg.declarationName}——宁波引才计划申报版</Ins>
                <AuthorBadge />
              </p>
              <p className="text-xs text-slate-400">{reg.competitionName} · {reg.applicationType} · {reg.introductionArea}</p>
            </div>

            {/* Section 1: Project brief */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">一、项目简介</p>
              <p className="text-slate-700 leading-loose">
                {brief.slice(0, 20)}
                <Del>，致力于解决行业核心痛点</Del>
                <Ins>，以解决宁波{project.applicant.highestDegreeMajor || '生物医疗'}领域产业链核心技术瓶颈为目标</Ins>
                <AuthorBadge />
                {brief.slice(20, 60) || '，打通科技成果向产业转化的关键环节'}。
                <Del>技术路线清晰，市场前景广阔。</Del>
                <Ins>项目已在{orgName}完成中试验证，具备量产基础；当前阶段计划依托宁波{reg.introductionArea}产业优势加速落地，预计3年内实现营收突破。</Ins>
                <AuthorBadge />
              </p>
            </div>

            {/* Section 2: Applicant intro */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">二、申报人简介</p>
              <p className="text-slate-700 leading-loose">
                {applicantName}，
                <Del>毕业于</Del>
                <Ins>博士毕业于</Ins>
                <AuthorBadge />
                {project.applicant.highestDegreeInstitution || '国内知名高校'}
                （{project.applicant.highestDegreeMajor || '相关专业'}），
                现任{project.applicant.intendedPosition || '项目负责人'}。
                {project.applicant.papers.length > 0 && (
                  <>
                    已发表{project.applicant.papers.length}篇
                    <Del>学术论文</Del>
                    <Ins>SCI/EI收录学术论文（含高影响因子期刊）</Ins>
                    <AuthorBadge />
                    ，
                  </>
                )}
                {project.applicant.patents.length > 0 && (
                  <>
                    持有{project.applicant.patents.length}项
                    <Del>专利</Del>
                    <Ins>发明专利（其中授权专利{String(project.applicant.patents.filter(p => p.status === '已授权').length)}项）</Ins>
                    <AuthorBadge />
                    ，
                  </>
                )}
                具备将学术成果转化为产业应用的
                <Del>丰富经验</Del>
                <Ins>系统性工程能力与产业化落地经验</Ins>
                <AuthorBadge />
                。
              </p>
            </div>

            {/* Section 3: Project background */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">三、项目背景与意义</p>
              <p className="text-slate-700 leading-loose">
                {project.projectBackground
                  ? project.projectBackground.slice(0, 80)
                  : `随着${reg.professionalDomain.top?.label || '相关'}领域快速发展，核心技术自主可控需求日益迫切`}
                <Del>，市场潜力巨大。</Del>
                <Ins>
                  。宁波作为长三角制造业重镇，在{reg.professionalDomain.mid?.label || '该细分方向'}拥有完整产业生态，
                  本项目落地后可直接对接上下游企业超20家，预计带动产业链产值超{project.totalInvestmentForecast * 3 || 5000}万元。
                </Ins>
                <AuthorBadge />
              </p>
            </div>

            {/* Section 4: Team */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">四、项目团队</p>
              <p className="text-slate-700 leading-loose">
                项目团队共
                <Del>{reg.memberCount}人</Del>
                <Ins>{reg.memberCount}人，各成员分工明确</Ins>
                <AuthorBadge />
                ，涵盖
                <Del>核心研发与管理职能。</Del>
                <Ins>
                  核心研发、工程转化及市场商务职能，形成从技术到市场的完整闭环能力。
                  {project.teamMembers.length > 0 && `核心成员${project.teamMembers[0]?.name ?? ''}负责${project.teamMembers[0]?.division ?? ''}，`}
                  团队整体在{reg.professionalDomain.top?.label || '相关领域'}平均从业年限超过8年。
                </Ins>
                <AuthorBadge />
              </p>
            </div>

            {/* Diff legend */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Del>示例</Del> 建议删除</span>
              <span className="flex items-center gap-1"><Ins>示例</Ins> 建议新增</span>
              <span className="flex items-center gap-1"><AuthorBadge /> AI优化标注</span>
              <span className="ml-auto">共 <strong className="text-slate-600">12</strong> 处修改建议</span>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-400" />
            Premium功能 · AI基于赛事历届评审偏好优化
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white">
              稍后再看
            </button>
            <button
              onClick={handleAcceptAndExport}
              disabled={accepting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 disabled:opacity-60"
            >
              {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              接受全部修改并导出
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Export utility ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const strip = <T extends { _id?: string }>(arr: T[]): Omit<T, '_id'>[] => arr.map(({ _id: _, ...rest }) => rest as any)

function buildExportPayload(project: Project, reg: RegistrationRecord) {
  const domainLabel = [
    reg.professionalDomain.top?.label,
    reg.professionalDomain.mid?.label,
    reg.professionalDomain.leaf?.label,
  ].filter(Boolean).join(' > ')

  return {
    id: project.id,
    declarationName: reg.declarationName || project.declarationName,
    projectName: project.projectName,
    coreTech: project.coreTech,
    applicant: {
      ...project.applicant,
      educations:         strip(project.applicant.educations),
      works:              strip(project.applicant.works),
      majorProjects:      strip(project.applicant.majorProjects),
      papers:             strip(project.applicant.papers),
      patents:            strip(project.applicant.patents),
      softwareCopyrights: strip(project.applicant.softwareCopyrights),
      products:           strip(project.applicant.products),
      awards:             strip(project.applicant.awards),
      books:              strip(project.applicant.books),
      conferenceReports:  strip(project.applicant.conferenceReports),
      academicPositions:  strip(project.applicant.academicPositions),
      foundedCompanies:   strip(project.applicant.foundedCompanies),
    },
    teamMembers:             strip(project.teamMembers),
    projectBrief:            project.projectBrief,
    projectBackground:       project.projectBackground,
    projectContent:          project.projectContent,
    projectStages:           strip(project.projectStages),
    workBasis:               project.workBasis,
    expectedContribution:    project.expectedContribution,
    economicEfficiency:      project.economicEfficiency,
    totalInvestmentForecast: project.totalInvestmentForecast,
    alreadyInvestedByOrg:    project.alreadyInvestedByOrg,
    govSupportReceived:      project.govSupportReceived,
    plannedInvestmentByOrg:  project.plannedInvestmentByOrg,
    orgInfo: { ...project.orgInfo, honors: strip(project.orgInfo.honors) },
    registration: {
      competitionName:       reg.competitionName,
      applicationType:       reg.applicationType,
      professionalDomain:    domainLabel,
      professionalDirection: reg.professionalDirection,
      introductionArea:      reg.introductionArea,
      declarationName:       reg.declarationName,
      memberCount:           reg.memberCount,
      contactPerson:         reg.contactPerson,
      contactPhone:          reg.contactPhone,
      applicationDate:       reg.applicationDate,
    },
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RegistrationDetailPage() {
  const { id: projectId, regId } = useParams<{ id: string; regId: string }>()
  const navigate = useNavigate()
  const { projectsV3, updateRegistrationV3 } = useProjectDashboardStore()

  const [exportLoading, setExportLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null)
  const [optimizeOpen, setOptimizeOpen] = useState(false)

  const project = projectsV3.find((p) => p.id === projectId)
  const reg = project?.registrations.find((r) => r.id === regId)

  const [modHistory, setModHistory] = useState<ModEntry[]>(() =>
    reg ? generateInitialHistory(reg) : [],
  )

  const isPhase1Active = useMemo(() => reg?.phases[0]?.status === 'active', [reg])

  if (!project || !reg) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
        <p className="text-sm">报名记录不存在</p>
        <button onClick={() => navigate(`/project/${projectId}`)} className="text-sm text-brand-blue hover:underline">
          返回项目主页
        </button>
      </div>
    )
  }

  const a = project.applicant
  const vs = project.verificationStatus

  // ── Edit handlers ──

  function handleStartEdit() {
    setEditDraft(initEditDraft(reg!))
    setEditMode(true)
  }

  function handleCancelEdit() {
    setEditMode(false)
    setEditDraft(null)
  }

  function handleSaveEdit() {
    if (!editDraft) return
    const prevStatus = reg!.status
    const willReset = prevStatus === '审核通过' || prevStatus === '已晋级'
    const newStatus = willReset ? '待审核' : prevStatus

    const patch: Partial<RegistrationRecord> = {
      declarationName:       editDraft.declarationName,
      applicationType:       editDraft.applicationType,
      professionalDomain:    resolveDomain(editDraft.domain),
      professionalDirection: editDraft.professionalDirection,
      introductionArea:      editDraft.introductionArea,
      contactPerson:         editDraft.contactPerson,
      contactPhone:          editDraft.contactPhone,
      greenChannelApplied:   editDraft.greenChannelApplied,
      greenChannelType:      editDraft.greenChannelApplied ? editDraft.greenChannelType : undefined,
      greenChannelReason:    editDraft.greenChannelApplied ? editDraft.greenChannelReason : '',
      expertRecusal:         editDraft.expertRecusal,
      orgRecusal:            editDraft.orgRecusal,
      status:                newStatus as RegistrationRecord['status'],
    }

    updateRegistrationV3(projectId!, regId!, patch)

    const now = new Date().toISOString()
    const newEntry: ModEntry = {
      id: `h-${Date.now()}`,
      timestamp: now,
      action: '修改报名信息',
      statusFrom: willReset ? prevStatus : undefined,
      statusTo: willReset ? newStatus : undefined,
      note: willReset ? '信息变更，重新进入审核流程' : '已更新报名信息',
    }
    setModHistory((prev) => [...prev, newEntry])
    setEditMode(false)
    setEditDraft(null)
  }

  // ── Export handler ──

  async function handleExport() {
    if (exportLoading) return
    setExportLoading(true)
    try {
      const payload = buildExportPayload(project!, reg!)
      const res = await fetch('http://localhost:3010/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `申报书_${reg!.declarationName || project!.declarationName}_${reg!.competitionName}.docx`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      alert(`导出失败：无法连接到导出服务（localhost:3010）\n\n请先运行：\npnpm dev:dashboard`)
    } finally {
      setExportLoading(false)
    }
  }

  const domainLabel = [
    reg.professionalDomain.top?.label,
    reg.professionalDomain.mid?.label,
    reg.professionalDomain.leaf?.label,
  ].filter(Boolean).join(' > ')

  const dateLabel = (reg.submittedAt ?? reg.applicationDate).slice(0, 10)
  const statusBadge = STATUS_BADGE[reg.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'

  return (
    <>
      {/* Optimize modal */}
      {optimizeOpen && (
        <OptimizeDocModal project={project} reg={reg} onClose={() => setOptimizeOpen(false)} />
      )}

      <div className="flex gap-6 items-start">

        {/* ── Main content column ─────────────────────────────── */}
        <div className="flex-1 min-w-0 max-w-2xl space-y-5">

          {/* Header */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate(`/project/${projectId}`)}
              className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-800 leading-tight">{reg.competitionName}</h1>
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold border flex-shrink-0', statusBadge)}>
                  {reg.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                {STATUS_ICON[reg.status]}
                {reg.applicationType} · 报名于 {dateLabel}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Premium: 优化申报书 */}
              <button
                onClick={() => setOptimizeOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity shadow-sm shadow-violet-200"
              >
                <Sparkles className="w-4 h-4" />
                优化申报书
              </button>
              {/* Export */}
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
              >
                {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                导出申报书
              </button>
            </div>
          </div>

          {/* Phase progress */}
          <div className="glass-card p-5">
            <SectionTitle icon={<Clock className="w-4 h-4" />}>赛事进度</SectionTitle>
            <PhaseStepper phases={reg.phases} />
          </div>

          {/* Registration info — editable in phase 1 */}
          <div className="glass-card p-5 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <SectionTitle icon={<Trophy className="w-4 h-4" />}>报名信息</SectionTitle>
              {isPhase1Active && !editMode && (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Pencil className="w-3 h-3" /> 编辑报名信息
                </button>
              )}
            </div>

            {editMode && editDraft ? (
              <EditRegInfoPanel
                draft={editDraft}
                onChange={(patch) => setEditDraft((d) => d ? { ...d, ...patch } : d)}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                regStatus={reg.status}
              />
            ) : (
              <>
                <KV label="申报用名" value={reg.declarationName} />
                <KV label="申报类型" value={reg.applicationType} />
                <KV label="专业领域" value={domainLabel} />
                <KV label="专业方向" value={reg.professionalDirection} />
                <KV label="引进地" value={reg.introductionArea} />
                <KV label="联系人" value={reg.contactPerson} />
                <KV label="联系电话" value={reg.contactPhone} />
                <KV label="填表日期" value={reg.applicationDate} />
                <KV label="报名成员数" value={`${reg.memberCount} 人`} />
                {reg.greenChannelApplied && (
                  <div className="pt-1 border-t border-slate-100">
                    <KV label="破格通道" value={reg.greenChannelType ?? '已申请'} />
                    {reg.greenChannelReason && <KV label="破格理由" value={reg.greenChannelReason} />}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modification history */}
          <ModificationHistory entries={modHistory} />

          {/* Applicant basic */}
          <div className="glass-card p-5 space-y-2.5">
            <SectionTitle icon={<Users className="w-4 h-4" />}>申报人基本信息</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              <KV label="姓名" value={a.name} />
              <KV label="英文名" value={a.nameEn} />
              <KV label="性别" value={a.gender} />
              <KV label="出生日期" value={a.birthDate} />
              <KV label="出生地" value={a.birthPlace} />
              <KV label="国籍" value={a.nationality} />
              <KV label="证件类型" value={a.idType} />
              <KV label="证件号码" value={a.idNumber} />
              <KV label="手机" value={a.phone} />
              <KV label="邮箱" value={a.email} />
              <KV label="最高学历" value={a.highestDegree} />
              <KV label="毕业院校" value={a.highestDegreeInstitution} />
              <KV label="专业" value={a.highestDegreeMajor} />
              <KV label="拟担任职务" value={a.intendedPosition} />
              <KV label="计划来宁日期" value={a.plannedArrivalDate} />
              <KV label="劳动合同起止" value={`${a.laborContractStart} ~ ${a.laborContractEnd}`} />
              <KV label="来宁时间" value={a.comeToNingboDate} />
              <KV label="全职在岗" value={a.isFullTimeOnBoarded} />
            </div>
            {a.personalBrief && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1">个人简介</p>
                <p className="text-sm text-slate-700 leading-relaxed">{a.personalBrief}</p>
              </div>
            )}
          </div>

          {/* Education */}
          {a.educations.length > 0 && (
            <div className="glass-card p-5">
              <SectionTitle icon={<GraduationCap className="w-4 h-4" />}>学习经历</SectionTitle>
              <div className="space-y-3">
                {a.educations.map((edu, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-slate-300 font-mono text-xs mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700">{edu.institution} · {edu.degreeLevel}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{edu.major} · {edu.startDate} ~ {edu.endDate} · {edu.country}</p>
                      {edu.isHighestDegree && <span className="text-[10px] text-brand-blue font-bold">最高学历</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work */}
          {a.works.length > 0 && (
            <div className="glass-card p-5">
              <SectionTitle icon={<Briefcase className="w-4 h-4" />}>工作经历</SectionTitle>
              <div className="space-y-3">
                {a.works.map((w, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-slate-300 font-mono text-xs mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700">{w.organization} · {w.position}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{w.startDate} ~ {w.endDate ?? '至今'} · {w.country} · {w.workNature}</p>
                      <div className="flex gap-2 mt-0.5">
                        {w.isLastBeforeComeToNingbo && <span className="text-[10px] text-brand-blue font-bold">来宁前最后单位</span>}
                        {w.isLastBeforeReturnFromAbroad && <span className="text-[10px] text-amber-600 font-bold">回国前最后单位</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {(a.papers.length > 0 || a.patents.length > 0 || a.awards.length > 0 || a.softwareCopyrights.length > 0) && (
            <div className="glass-card p-5 space-y-5">
              <SectionTitle icon={<FlaskConical className="w-4 h-4" />}>代表性成果</SectionTitle>

              {a.papers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500">论文 ({a.papers.length})</p>
                  </div>
                  <div className="space-y-2.5">
                    {a.papers.map((p, i) => (
                      <div key={i} className="text-sm pl-5 border-l-2 border-slate-100">
                        <p className="font-medium text-slate-700">{p.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.journal} · {p.publishDate} · 第{p.personalRank}作者/{p.totalAuthors}人{p.isCorrespondingAuthor ? ' · 通讯作者' : ''}{p.impactFactor ? ` · IF ${p.impactFactor}` : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {a.patents.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500">专利 ({a.patents.length})</p>
                    <VerBadge verified={vs.patents === 'verified'} />
                  </div>
                  <div className="space-y-2.5">
                    {a.patents.map((pt, i) => (
                      <div key={i} className="text-sm pl-5 border-l-2 border-slate-100">
                        <p className="font-medium text-slate-700">{pt.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{pt.patentType} · {pt.patentNumber} · {pt.authorizedCountry} · {pt.authorizedDate} · {pt.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {a.softwareCopyrights.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500">软件著作权 ({a.softwareCopyrights.length})</p>
                  </div>
                  <div className="space-y-2">
                    {a.softwareCopyrights.map((sw, i) => (
                      <div key={i} className="text-sm pl-5 border-l-2 border-slate-100">
                        <p className="font-medium text-slate-700">{sw.softwareName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{sw.registrationNumber} · {sw.approvalDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {a.awards.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500">获奖 ({a.awards.length})</p>
                  </div>
                  <div className="space-y-2">
                    {a.awards.map((aw, i) => (
                      <div key={i} className="text-sm pl-5 border-l-2 border-slate-100">
                        <p className="font-medium text-slate-700">{aw.awardName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{aw.awardingBody} · {aw.awardDate} · 第{aw.personalRank}获奖人</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Team members */}
          {project.teamMembers.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <SectionTitle icon={<Users className="w-4 h-4" />}>项目团队</SectionTitle>
                <VerBadge verified={vs.teamMembers === 'verified'} />
              </div>
              <div className="space-y-3">
                {project.teamMembers.map((tm, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-brand-blue">{tm.name.slice(0, 1)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700">{tm.name}
                        <span className="ml-2 text-xs font-normal text-slate-400">{tm.memberType}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{tm.division} · {tm.background}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Org info */}
          <div className="glass-card p-5 space-y-2.5">
            <SectionTitle icon={<Building2 className="w-4 h-4" />}>用人单位</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              <KV label="单位名称" value={project.orgInfo.name} />
              <KV label="单位类型" value={project.orgInfo.orgType} />
              <KV label="统一信用代码" value={project.orgInfo.creditCode} />
              <KV label="成立时间" value={project.orgInfo.establishedDate} />
              <KV label="注册资本（万）" value={project.orgInfo.registeredCapital} />
              <KV label="在职员工数" value={project.orgInfo.totalEmployees} />
              <div className="col-span-2"><KV label="通讯地址" value={project.orgInfo.address} /></div>
            </div>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-x-6 gap-y-2.5">
              <div className="flex items-center gap-2">
                <KV label="年研发投入（万）" value={project.orgInfo.rdExpenditure} />
                {vs.rdExpenditure === 'verified' ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <Shield className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2">
                <KV label="年营业收入（万）" value={project.orgInfo.totalRevenue} />
                {vs.totalRevenue === 'verified' ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <Shield className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2">
                <KV label="累计融资额（万）" value={project.orgInfo.totalFunding} />
                {vs.totalFunding === 'verified' ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <Shield className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
              </div>
              <KV label="融资轮次" value={project.orgInfo.fundingRound} />
            </div>
          </div>

          {/* Project description */}
          {(project.projectBrief || project.workBasis || project.expectedContribution) && (
            <div className="glass-card p-5 space-y-4">
              <SectionTitle icon={<FlaskConical className="w-4 h-4" />}>项目内容</SectionTitle>
              {project.projectBrief && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">项目简介</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{project.projectBrief}</p>
                </div>
              )}
              {project.workBasis && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">工作基础</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{project.workBasis}</p>
                </div>
              )}
              {project.expectedContribution && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">预期贡献</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{project.expectedContribution}</p>
                </div>
              )}
            </div>
          )}

          {/* Investment */}
          {project.totalInvestmentForecast > 0 && (
            <div className="glass-card p-5">
              <SectionTitle icon={<Building2 className="w-4 h-4" />}>投入预测</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                <KV label="总投入预测（万）" value={project.totalInvestmentForecast} />
                <KV label="已自筹（万）" value={project.alreadyInvestedByOrg} />
                <KV label="已获政府支持（万）" value={project.govSupportReceived} />
                <KV label="计划继续自筹（万）" value={project.plannedInvestmentByOrg} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="glass-card p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">以此次报名为基础，报名其他赛事</p>
              <p className="text-xs text-slate-400 mt-0.5">将本次填写的基本信息预填至新报名表</p>
            </div>
            <button
              onClick={() => navigate(`/project/${projectId}/apply?fromReg=${reg.id}`)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              <Trophy className="w-4 h-4" /> 报名其他赛事
            </button>
          </div>
        </div>

        {/* ── AI Analysis sidebar (Phase 1 only) ─────────────── */}
        {isPhase1Active && (
          <div className="w-72 flex-shrink-0 sticky top-6">
            <AIAnalysisPanel project={project} reg={reg} />
          </div>
        )}

      </div>
    </>
  )
}
