import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Trophy, Pencil, ChevronDown, Clock, Brain, X, Save, Eye, Copy, FileText,
  RotateCcw, Info, Sparkles, Loader2, ArrowLeftRight, ShieldCheck, ShieldAlert, Shield, Upload,
  Download, FolderOpen,
} from 'lucide-react'
import { documentsApi } from '@bochuangyuan/api'
import type { DocumentResponse } from '@bochuangyuan/api'
import { getProject } from '@/api/project'
import { apiToProject } from '@/api/projectMapper'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from 'recharts'
import { useProjectDashboardStore } from '@/store/projectDashboardStore'
import type {
  Project, CollectionItem, FieldChange, Applicant,
  TeamMember, ProjectStage, OrgHonor, RegistrationRecord, RegistrationStatus,
  ProjectEvent, ProjectSnapshotData, ProjectSnapshot, VerifiableField, VerificationStatusValue,
} from '@/types/project'
import { deriveProjectSnapshot, radarSnapshotToChartData } from '@/utils/projectMetrics'
import { computeProjectDiff } from '@/utils/projectDiff'
import { getAIGrowthService } from '@/services/aiService'
import { verificationService, VERIFIABLE_FIELD_LABELS } from '@/services/verificationService'
import ImportModal from '@/pages/project/dashboard/ImportModal'
import RepeatableCollection from '@/components/RepeatableCollection'
import {
  TEAM_MEMBER_SCHEMA, EDUCATION_SCHEMA, WORK_SCHEMA, MAJOR_PROJECT_SCHEMA,
  PAPER_SCHEMA, PATENT_SCHEMA, SOFTWARE_COPYRIGHT_SCHEMA, PRODUCT_SCHEMA,
  AWARD_SCHEMA, BOOK_SCHEMA, CONFERENCE_REPORT_SCHEMA, ACADEMIC_POSITION_SCHEMA,
  FOUNDED_COMPANY_SCHEMA, PROJECT_STAGE_SCHEMA, ORG_HONOR_SCHEMA,
} from '@/types/collectionSchemas'
import { cn } from '@/lib/utils'

// ── Rich diff renderers ───────────────────────────────────────────────────────

function FieldChangeDiff({ c, inline = false }: { c: FieldChange; inline?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  if (c.diffType === 'scalar') {
    return (
      <div className="text-xs leading-relaxed">
        <span className="font-semibold text-slate-600">{c.label}：</span>
        <span className="line-through text-red-400 mr-1">{c.oldValue}</span>
        <span className="text-slate-400 mx-1">→</span>
        <span className="text-emerald-600 font-semibold">{c.newValue}</span>
      </div>
    )
  }

  if (c.diffType === 'text') {
    // Count distinct edit groups (contiguous non-unchanged runs)
    let groups = 0
    let wasUnchanged = true
    for (const seg of c.segments) {
      if (seg.type !== 'unchanged') { if (wasUnchanged) groups++; wasUnchanged = false }
      else wasUnchanged = true
    }

    const totalLen = c.segments.reduce((s, seg) => s + seg.text.length, 0)
    const isLong = inline && totalLen > 200

    let visibleSegments = c.segments
    if (isLong && !expanded) {
      let chars = 0
      const truncated: typeof c.segments = []
      for (const seg of c.segments) {
        if (chars >= 200) break
        const rem = 200 - chars
        if (seg.text.length > rem) {
          truncated.push({ type: seg.type, text: seg.text.slice(0, rem) + '…' })
          chars = 200
        } else {
          truncated.push(seg)
          chars += seg.text.length
        }
      }
      visibleSegments = truncated
    }

    return (
      <div className="text-xs">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-slate-600">{c.label}</span>
          <span className="text-slate-400">（{groups} 处修改）</span>
          {isLong && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
              className="text-brand-blue hover:underline text-[10px]"
            >
              {expanded ? '收起' : '展开全文'}
            </button>
          )}
        </div>
        <span className="leading-relaxed">
          {visibleSegments.map((seg, i) => (
            <span key={i} className={cn(
              seg.type === 'added'     && 'bg-emerald-100 text-emerald-700',
              seg.type === 'removed'   && 'bg-red-100 text-red-500 line-through',
              seg.type === 'unchanged' && 'text-slate-500',
            )}>
              {seg.text}
            </span>
          ))}
        </span>
      </div>
    )
  }

  // collection
  const parts: string[] = []
  if (c.added.length)    parts.push(`新增 ${c.added.length} 项`)
  if (c.removed.length)  parts.push(`删除 ${c.removed.length} 项`)
  if (c.modified.length) parts.push(`修改 ${c.modified.length} 项`)

  return (
    <div className="text-xs space-y-1">
      <div>
        <span className="font-semibold text-slate-600">{c.label}：</span>
        <span className="text-slate-400">{parts.join('、') || '无变更'}</span>
      </div>
      <div className="pl-3 space-y-1 border-l-2 border-slate-100">
        {c.added.map((s, i) => (
          <div key={`a${i}`} className="flex items-center gap-1 text-emerald-600">
            <span className="font-bold">+</span><span>{s}</span>
          </div>
        ))}
        {c.removed.map((s, i) => (
          <div key={`r${i}`} className="flex items-center gap-1 text-red-400 line-through">
            <span className="font-bold">−</span><span>{s}</span>
          </div>
        ))}
        {c.modified.map((m) => (
          <div key={m.itemId} className="space-y-0.5">
            <span className="font-semibold text-slate-500">{m.itemSummary}：</span>
            {m.fieldChanges.map((fc, fi) => (
              <span key={fi} className="ml-1 inline-block">
                {fc.label}&nbsp;
                <span className="line-through text-red-400">{fc.oldValue}</span>
                <span className="text-slate-400 mx-0.5">→</span>
                <span className="text-emerald-600">{fc.newValue}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Event detail modal ────────────────────────────────────────────────────────

function EventDetailModal({
  event,
  snapshot,
  onClose,
  onRollback,
}: {
  event: ProjectEvent
  snapshot: ProjectSnapshot | undefined
  onClose: () => void
  onRollback: () => void
}) {
  const [confirmRollback, setConfirmRollback] = useState(false)
  const canRollback = !!snapshot && event.type !== '报名'

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 gap-4">
          <div>
            <p className="font-bold text-slate-800">{event.description}</p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.timestamp.slice(0, 16).replace('T', ' ')}
              <span className={cn(
                'ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold',
                event.type === '报名'  ? 'bg-brand-blue/10 text-brand-blue' :
                event.type === '回退'  ? 'bg-amber-100 text-amber-600' :
                                         'bg-slate-100 text-slate-500',
              )}>
                {event.type}
              </span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change list + snapshot dimensions */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {event.changes.length === 0 ? (
            <p className="text-sm text-slate-400 py-2 text-center">此事件无字段变更记录</p>
          ) : (
            <div className="space-y-4">
              {event.changes.map((c, i) => (
                <div key={i} className="pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <FieldChangeDiff c={c} />
                </div>
              ))}
            </div>
          )}

          {/* Snapshot radar snapshot — "快照对比" section */}
          {snapshot && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">此版本快照维度</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['团队规模', `${snapshot.radar.teamSize} 人`],
                  ['专利数',   `${snapshot.radar.patentCount} 件`],
                  ['软著数',   `${snapshot.radar.softwareCopyrightCount} 件`],
                  ['论文数',   `${snapshot.radar.paperCount} 篇`],
                  ['融资额',   snapshot.radar.totalFunding > 0 ? `${snapshot.radar.totalFunding} 万` : '—'],
                  ['成熟度',   `${snapshot.radar.maturityScore} / 100`],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-400">{label}</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rollback footer */}
        {canRollback && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
            {confirmRollback ? (
              <>
                <p className="text-xs text-slate-500">确认将项目数据回退到此版本？</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmRollback(false)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={onRollback}
                    className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600"
                  >
                    确认回退
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-400">可将项目数据回退到此快照版本</p>
                <button
                  onClick={() => setConfirmRollback(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  回退到此版本
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Verification UI ───────────────────────────────────────────────────────────

function VerificationBadge({ status }: { status: VerificationStatusValue }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
        <ShieldCheck className="w-2.5 h-2.5" /> 已验证
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
        <Shield className="w-2.5 h-2.5" /> 审核中
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
      <ShieldAlert className="w-2.5 h-2.5" /> 未验证
    </span>
  )
}

// ── Layout primitives ─────────────────────────────────────────────────────────

function SecTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn('text-xs font-bold text-slate-400 uppercase tracking-widest', className)}>
      {children}
    </p>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-slate-500 mb-2">{children}</p>
}

function InfoRow({ label, value, className }: { label: string; value?: string | null; className?: string }) {
  return (
    <div className={className}>
      <span className="text-xs text-slate-400">{label}</span>
      <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{value || '—'}</p>
    </div>
  )
}

function TextBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  )
}

function NumStat({ label, value, unit = '' }: { label: string; value: number; unit?: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-xs text-slate-500 leading-snug">{label}</p>
      <p className="text-xl font-black text-slate-800 mt-1">
        {value !== 0 ? value.toLocaleString() : '—'}
        {value !== 0 && unit && <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

// ── In-page navigation ────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: 'eval',         label: '成长雷达' },
  { id: 'identity',     label: '项目身份' },
  { id: 'applicant',    label: '申报人' },
  { id: 'team',         label: '项目团队' },
  { id: 'proj-detail',  label: '项目详情' },
  { id: 'investment',   label: '投入预测' },
  { id: 'org',          label: '用人单位' },
  { id: 'registrations',label: '报名记录' },
  { id: 'files',        label: '项目文件' },
  { id: 'timeline',     label: '时间线' },
]

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.classList.remove('section-glow')
  void el.offsetWidth // force reflow to restart animation
  el.classList.add('section-glow')
}

function InPageNav() {
  return (
    <nav className="w-28 flex-shrink-0 sticky top-6 hidden xl:block">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">本页导航</p>
      <ul className="space-y-0.5">
        {NAV_SECTIONS.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => scrollToSection(s.id)}
              className="block w-full text-left text-xs text-slate-500 hover:text-brand-blue px-2 py-1.5 rounded-lg hover:bg-brand-blue/5 transition-colors"
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ── Registration table ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RegistrationStatus, { className: string }> = {
  '草稿':       { className: 'bg-slate-100 text-slate-500' },
  '待提交':     { className: 'bg-amber-100 text-amber-700' },
  '待审核':     { className: 'bg-blue-100 text-blue-700' },
  '审核通过':   { className: 'bg-green-100 text-green-700' },
  '审核不通过': { className: 'bg-red-100 text-red-700' },
  '已晋级':     { className: 'bg-emerald-100 text-emerald-700' },
  '已淘汰':     { className: 'bg-red-100 text-red-700' },
  '已撤回':     { className: 'bg-slate-100 text-slate-500' },
}

function RegistrationRow({ reg, projectId }: { reg: RegistrationRecord; projectId: string }) {
  const navigate = useNavigate()
  const sc = STATUS_CONFIG[reg.status]
  const domainLabel =
    reg.professionalDomain.leaf?.label ??
    reg.professionalDomain.mid?.label ??
    reg.professionalDomain.top?.label ??
    '—'
  const dateLabel = (reg.submittedAt ?? reg.applicationDate).slice(0, 10)

  return (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
      <td className="py-3 pr-4 align-top">
        <p className="text-sm font-semibold text-slate-700 leading-tight">{reg.competitionName}</p>
        <p className="text-xs text-slate-400 mt-0.5">{dateLabel}</p>
      </td>
      <td className="py-3 pr-4 align-middle">
        <p className="text-sm text-slate-600 max-w-[140px] truncate">{reg.declarationName}</p>
      </td>
      <td className="py-3 pr-4 align-middle">
        <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full whitespace-nowrap">
          {domainLabel}
        </span>
      </td>
      <td className="py-3 pr-4 align-middle">
        <span className="text-sm font-semibold text-slate-700">{reg.memberCount}</span>
        <span className="text-xs text-slate-400 ml-0.5">人</span>
      </td>
      <td className="py-3 pr-4 align-middle">
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap', sc.className)}>
          {reg.status}
        </span>
      </td>
      <td className="py-3 pr-4 align-middle">
        <button
          onClick={() => navigate(`/competition/registrations/${reg.id}/green-channel`)}
          className={cn(
            'text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors',
            reg.greenChannelApplied
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20',
          )}
        >
          {reg.greenChannelApplied ? '已申请' : '申请'}
        </button>
      </td>
      <td className="py-3 align-middle">
        <div className="flex items-center gap-0.5">
          <button
            title="查看详情 & 导出申报书"
            onClick={() => navigate(`/project/${projectId}/registration/${reg.id}`)}
            className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button title="复制报名（开发中）" disabled
            className="p-1.5 text-slate-300 rounded-lg cursor-not-allowed">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button title="预览申报书（开发中）" disabled
            className="p-1.5 text-slate-300 rounded-lg cursor-not-allowed">
            <FileText className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Edit project info modal ───────────────────────────────────────────────────

const IC = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white'
const TC = `${IC} resize-none`

interface EditForm {
  declarationName: string; projectName: string; coreTech: string
  projectBrief: string; projectBackground: string; projectContent: string
  workBasis: string; expectedContribution: string; economicEfficiency: string
  totalInvestmentForecast: string; alreadyInvestedByOrg: string
  govSupportReceived: string; plannedInvestmentByOrg: string
}

function EditProjectInfoModal({
  project,
  onClose,
  onSave,
}: {
  project: Project
  onClose: () => void
  onSave: (patch: Partial<Project>, description: string) => void
}) {
  const [form, setForm] = useState<EditForm>({
    declarationName: project.declarationName,
    projectName: project.projectName,
    coreTech: project.coreTech,
    projectBrief: project.projectBrief,
    projectBackground: project.projectBackground,
    projectContent: project.projectContent,
    workBasis: project.workBasis,
    expectedContribution: project.expectedContribution,
    economicEfficiency: project.economicEfficiency,
    totalInvestmentForecast: project.totalInvestmentForecast > 0 ? String(project.totalInvestmentForecast) : '',
    alreadyInvestedByOrg: project.alreadyInvestedByOrg > 0 ? String(project.alreadyInvestedByOrg) : '',
    govSupportReceived: project.govSupportReceived > 0 ? String(project.govSupportReceived) : '',
    plannedInvestmentByOrg: project.plannedInvestmentByOrg > 0 ? String(project.plannedInvestmentByOrg) : '',
  })
  const [description, setDescription] = useState('')

  function sf(key: keyof EditForm, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function handleSave() {
    onSave({
      declarationName: form.declarationName.trim(),
      projectName: form.projectName.trim(),
      coreTech: form.coreTech.trim(),
      projectBrief: form.projectBrief.trim(),
      projectBackground: form.projectBackground.trim(),
      projectContent: form.projectContent.trim(),
      workBasis: form.workBasis.trim(),
      expectedContribution: form.expectedContribution.trim(),
      economicEfficiency: form.economicEfficiency.trim(),
      totalInvestmentForecast: parseFloat(form.totalInvestmentForecast) || 0,
      alreadyInvestedByOrg: parseFloat(form.alreadyInvestedByOrg) || 0,
      govSupportReceived: parseFloat(form.govSupportReceived) || 0,
      plannedInvestmentByOrg: parseFloat(form.plannedInvestmentByOrg) || 0,
    }, description.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <p className="font-bold text-slate-800">编辑项目信息</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Identity */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">项目身份</p>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">申报用名</label>
                  <input className={IC} value={form.declarationName} onChange={(e) => sf('declarationName', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">项目正式名称</label>
                  <input className={IC} value={form.projectName} onChange={(e) => sf('projectName', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">核心技术</label>
                <input className={IC} value={form.coreTech} onChange={(e) => sf('coreTech', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  项目简介 <span className="text-slate-400 font-normal">≤500字</span>
                </label>
                <textarea rows={3} className={TC} maxLength={500}
                  value={form.projectBrief} onChange={(e) => sf('projectBrief', e.target.value)} />
                <p className="text-right text-xs text-slate-400">{form.projectBrief.length}/500</p>
              </div>
            </div>
          </div>

          {/* Project content */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">项目详情</p>
            <div className="space-y-3">
              {([
                ['projectBackground',    '项目背景意义',        4],
                ['projectContent',       '项目实施内容',        4],
                ['workBasis',            '工作基础和条件',      3],
                ['expectedContribution', '预期贡献及验收指标',  3],
                ['economicEfficiency',   '预期经济效益',        3],
              ] as [keyof EditForm, string, number][]).map(([key, label, rows]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">{label}</label>
                  <textarea rows={rows} className={TC}
                    value={form[key] as string}
                    onChange={(e) => sf(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Investment */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">投入预测（万元）</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['totalInvestmentForecast', '项目总投入预测（5年）'],
                ['alreadyInvestedByOrg',    '单位已投入'],
                ['govSupportReceived',      '已获区县市支持'],
                ['plannedInvestmentByOrg',  '单位计划投入（5年）'],
              ] as [keyof EditForm, string][]).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">{label}</label>
                  <input type="number" min={0} className={IC}
                    value={form[key] as string}
                    onChange={(e) => sf(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-slate-100 pt-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
              本次更新备注
            </label>
            <textarea rows={2} className={TC}
              placeholder="简述本次更新内容，留空则自动生成"
              value={description} onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            取消
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors">
            <Save className="w-4 h-4" /> 保存
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Project Files Panel ───────────────────────────────────────────────────────

const DOC_TYPE_TABS: { value: string | undefined; label: string }[] = [
  { value: undefined,          label: '全部' },
  { value: 'business_plan',    label: '商业计划书' },
  { value: 'contest_template', label: '赛事模板' },
  { value: 'submission',       label: '申报材料' },
]

const DOC_TYPE_LABELS: Record<string, string> = {
  business_plan:    '商业计划书',
  contest_template: '赛事模板',
  submission:       '申报材料',
}

const DOC_TYPE_COLORS: Record<string, string> = {
  business_plan:    'bg-blue-100 text-blue-600',
  contest_template: 'bg-purple-100 text-purple-600',
  submission:       'bg-emerald-100 text-emerald-600',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ProjectFilesPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [docs, setDocs] = useState<DocumentResponse[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [filesError, setFilesError] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<string | undefined>(undefined)
  const [uploadType, setUploadType] = useState('business_plan')

  useEffect(() => {
    setLoadingDocs(true)
    setFilesError(null)
    documentsApi.list(activeType)
      .then(setDocs)
      .catch(() => setFilesError('获取文件列表失败，请刷新重试'))
      .finally(() => setLoadingDocs(false))
  }, [activeType])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setFilesError(null)
    try {
      const doc = await documentsApi.upload(file, uploadType)
      setDocs((prev) => [doc, ...prev])
    } catch {
      setFilesError('上传失败，请重试')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDownload(doc: DocumentResponse) {
    try {
      const url = await documentsApi.download(doc.id)
      window.open(url, '_blank')
    } catch {
      setFilesError('下载失败，请重试')
    }
  }

  return (
    <div id="files" className="glass-card p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <SecTitle>项目文件</SecTitle>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          >
            <option value="business_plan">商业计划书</option>
            <option value="contest_template">赛事模板</option>
            <option value="submission">申报材料</option>
          </select>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {uploading ? '上传中…' : '上传文件'}
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {DOC_TYPE_TABS.map((tab) => (
          <button
            key={String(tab.value)}
            onClick={() => setActiveType(tab.value)}
            className={cn(
              'text-xs px-3 py-1 rounded-full font-medium transition-colors',
              activeType === tab.value
                ? 'bg-brand-blue text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filesError && (
        <p className="text-xs text-red-400 mb-3">{filesError}</p>
      )}

      {loadingDocs ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-slate-400 gap-2">
          <FolderOpen className="w-8 h-8" />
          <p className="text-sm">暂无文件</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-brand-blue hover:underline"
          >
            上传第一个文件 →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatFileSize(doc.size)} · v{doc.version} · {doc.created_at.slice(0, 10)}
                </p>
              </div>
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                DOC_TYPE_COLORS[doc.doc_type] ?? 'bg-slate-100 text-slate-500',
              )}>
                {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
              </span>
              <button
                onClick={() => handleDownload(doc)}
                title="下载"
                className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProjectDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projectsV3, addProjectV3, updateProjectV3, recordEditV3, recordRollbackV3, updateVerificationV3 } = useProjectDashboardStore()
  const [timelineOpen, setTimelineOpen] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [detailEvent, setDetailEvent] = useState<ProjectEvent | null>(null)

  // Phase 8 — verification: track per-field loading state
  const [verifyingField, setVerifyingField] = useState<VerifiableField | null>(null)

  // Phase 7 — AI growth review
  const [reviewResult, setReviewResult] = useState<string | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  // Phase 7 — AI snapshot comparison
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])
  const [comparisonResult, setComparisonResult] = useState<string | null>(null)
  const [comparisonLoading, setComparisonLoading] = useState(false)

  const project = projectsV3.find((p) => p.id === id)

  const [projectFetching, setProjectFetching] = useState(false)
  const [projectFetchError, setProjectFetchError] = useState(false)

  useEffect(() => {
    if (!id || projectsV3.find((p) => p.id === id)) return
    setProjectFetching(true)
    setProjectFetchError(false)
    getProject(Number(id))
      .then((api) => addProjectV3(apiToProject(api)))
      .catch(() => setProjectFetchError(true))
      .finally(() => setProjectFetching(false))
  }, [id])

  if (projectFetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
        <p className="text-sm">{projectFetchError ? '项目加载失败，请刷新重试' : '项目不存在'}</p>
        <button onClick={() => navigate('/project')} className="text-sm text-brand-blue hover:underline">
          返回项目列表
        </button>
      </div>
    )
  }

  const liveSnap = deriveProjectSnapshot(project, 'live', new Date().toISOString())
  const radarData = radarSnapshotToChartData(liveSnap.radar)
  const sortedEvents = [...project.events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  // Derive the two selected comparison nodes (sorted chronologically)
  const compareNodeData = (() => {
    if (selectedForCompare.length !== 2) return null
    const [idA, idB] = selectedForCompare as [string, string]
    const evA = project.events.find((e) => e.id === idA)
    const evB = project.events.find((e) => e.id === idB)
    if (!evA || !evB) return null
    const [first, second] = evA.timestamp <= evB.timestamp ? [evA, evB] : [evB, evA]
    const snapA = project.snapshots[first.snapshotId]
    const snapB = project.snapshots[second.snapshotId]
    if (!snapA || !snapB) return null
    return { first, second, snapA, snapB }
  })()
  const allDomain = [
    project.professionalDomain.top?.label,
    project.professionalDomain.mid?.label,
    project.professionalDomain.leaf?.label,
  ].filter(Boolean).join(' › ')

  const a = project.applicant
  const o = project.orgInfo

  const COLLECTION_LABELS: Record<string, string> = {
    educations: '教育经历', works: '工作经历', majorProjects: '主要项目',
    papers: '代表性论文', patents: '代表性专利', softwareCopyrights: '软件著作权',
    products: '主要产品', awards: '奖励表彰', books: '代表性著作',
    conferenceReports: '学术会议报告', academicPositions: '学术任职',
    foundedCompanies: '异地创办企业',
  }

  function saveWithDiff(patch: Partial<Project>, description: string) {
    const { events: _e, snapshots: _s, registrations: _r, ...oldData } = project!
    const newProjectData = { ...project!, ...patch }
    const { events: _e2, snapshots: _s2, registrations: _r2, ...newData } = newProjectData
    const changes = computeProjectDiff(
      oldData as ProjectSnapshotData,
      newData as ProjectSnapshotData,
    )
    updateProjectV3(project!.id, patch)
    recordEditV3(project!.id, description, changes)
  }

  function patchApplicant(key: string, items: CollectionItem[]) {
    const label = COLLECTION_LABELS[key] ?? key
    saveWithDiff(
      { applicant: { ...a, [key]: items } as unknown as Applicant },
      `更新${label}`,
    )
  }

  function handleEditSave(patch: Partial<Project>, desc: string) {
    saveWithDiff(patch, desc || '更新项目信息')
    setEditOpen(false)
  }

  function handleRollback(event: ProjectEvent) {
    const snap = project!.snapshots[event.snapshotId]
    if (!snap) return
    updateProjectV3(project!.id, snap.data as Partial<Project>)
    recordRollbackV3(project!.id, `回退到「${event.description}」`)
    setDetailEvent(null)
  }

  async function handleVerify(field: VerifiableField) {
    if (verifyingField) return
    setVerifyingField(field)
    try {
      const result = await verificationService.requestVerification({
        projectId: project!.id,
        field,
        evidence: [],
      })
      updateVerificationV3(project!.id, field, result.status)
    } catch {
      // verification error is non-blocking; status remains unchanged
    } finally {
      setVerifyingField(null)
    }
  }

  async function handleGenerateReview() {
    if (reviewLoading) return
    setReviewLoading(true)
    setReviewResult(null)
    try {
      const svc = getAIGrowthService()
      const text = await svc.generateReview({
        projectName: project!.declarationName || project!.projectName,
        events: project!.events,
        currentRadar: liveSnap.radar,
      })
      setReviewResult(text)
    } catch (e) {
      setReviewResult(`生成失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setReviewLoading(false)
    }
  }

  function toggleCompareSelection(eventId: string) {
    setSelectedForCompare((prev) => {
      if (prev.includes(eventId)) return prev.filter((id) => id !== eventId)
      if (prev.length >= 2) return [prev[1]!, eventId]
      return [...prev, eventId]
    })
    setComparisonResult(null)
  }

  async function handleGenerateComparison() {
    if (!compareNodeData || comparisonLoading) return
    const { first, second, snapA, snapB } = compareNodeData
    const between = project!.events.filter(
      (e) => e.timestamp > first.timestamp && e.timestamp <= second.timestamp,
    )
    setComparisonLoading(true)
    setComparisonResult(null)
    try {
      const svc = getAIGrowthService()
      const text = await svc.generateComparison({
        projectName: project!.declarationName || project!.projectName,
        nodeA: { timestamp: first.timestamp, description: first.description, radar: snapA.radar },
        nodeB: { timestamp: second.timestamp, description: second.description, radar: snapB.radar },
        eventsBetween: between,
      })
      setComparisonResult(text)
    } catch (e) {
      setComparisonResult(`生成失败：${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setComparisonLoading(false)
    }
  }

  return (
    <>
      {importOpen && (
        <ImportModal
          project={project}
          onClose={() => setImportOpen(false)}
          onConfirm={(patch, desc) => {
            saveWithDiff(patch, desc)
            setImportOpen(false)
          }}
        />
      )}
      <div className="flex gap-5 items-start">
        <InPageNav />

        <div className="flex-1 min-w-0 space-y-4">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/project')} className="text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-800">
                  {project.declarationName || project.projectName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">{project.projectName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setImportOpen(true)}
                className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                title="上传本地表格识别导入"
              >
                <Upload className="w-4 h-4" /> 导入表格
              </button>
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                <Pencil className="w-4 h-4" /> 编辑
              </button>
              <button
                onClick={() => navigate(`/project/${id}/apply`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
              >
                <Trophy className="w-4 h-4" /> 一键报名
              </button>
            </div>
          </div>

          {/* ── 数据/评估区（前置，进入即可见）──────────────────────────── */}
          <div id="eval" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="glass-card p-5">
              <SecTitle>五维成长雷达</SecTitle>
              <p className="text-xs text-slate-400 mt-0.5 mb-3">基于当前项目数据实时计算</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar name="成长" dataKey="value" stroke="#0045c4" fill="#0045c4" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 gap-1.5 mt-3">
                {radarData.map((d) => (
                  <div key={d.subject} className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-lg text-xs">
                    <span className="w-16 text-slate-500 flex-shrink-0">{d.subject}</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-brand-blue rounded-full" style={{ width: `${d.value}%` }} />
                    </div>
                    <span className="font-bold text-slate-700 w-8 text-right">{d.value}</span>
                  </div>
                ))}
              </div>
              {/* Verification coverage note */}
              {(() => {
                const vs = project.verificationStatus
                const unverified = (Object.entries(vs) as [VerifiableField, VerificationStatusValue][])
                  .filter(([, s]) => s !== 'verified')
                return unverified.length > 0 ? (
                  <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                    {unverified.length} 项未验证维度暂不计入：
                    {unverified.map(([f]) => VERIFIABLE_FIELD_LABELS[f].split('（')[0]).join('、')}
                  </p>
                ) : null
              })()}
            </div>

            <div className="glass-card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <SecTitle>AI 成长回顾</SecTitle>
                  <p className="text-xs text-slate-400 mt-0.5">按需生成 · 点击才调用 AI</p>
                </div>
                <button
                  onClick={handleGenerateReview}
                  disabled={reviewLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-blue text-white rounded-lg font-bold hover:bg-brand-blue/90 disabled:opacity-50 transition-colors flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {reviewLoading ? '生成中…' : reviewResult ? '重新生成' : '生成成长回顾'}
                </button>
              </div>
              {reviewLoading ? (
                <div className="flex-1 flex items-center justify-center gap-2 py-10 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">AI 正在分析成长历程…</span>
                </div>
              ) : reviewResult ? (
                <p className="mt-3 text-sm text-slate-700 leading-[1.9] bg-slate-50 rounded-xl p-4">
                  {reviewResult}
                </p>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-300 py-8">
                  <Brain className="w-10 h-10" />
                  <p className="text-xs text-slate-400 text-center max-w-[180px] leading-relaxed">
                    点击后 AI 将基于时间线变更记录，叙述项目从创立至今的成长历程
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── 信息区 ──────────────────────────────────────────────────── */}

          {/* Project Identity */}
          <div id="identity" className="glass-card p-5 space-y-4">
            <SecTitle>项目身份</SecTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
              <InfoRow label="申报用名" value={project.declarationName} />
              <InfoRow label="核心技术" value={project.coreTech} />
              <InfoRow label="专业领域" value={allDomain || '—'} />
              <InfoRow label="关联企业" value={o.name} />
              <InfoRow label="团队负责人" value={a.name} />
              <InfoRow label="项目正式名称" value={project.projectName} className="col-span-2 sm:col-span-1" />
            </div>
            {project.projectBrief && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-1">项目简介</p>
                <p className="text-sm text-slate-700 leading-relaxed">{project.projectBrief}</p>
              </div>
            )}
          </div>

          {/* Applicant */}
          <div id="applicant" className="glass-card p-5 space-y-5">
            <SecTitle>申报人 / 带头人</SecTitle>

            <div>
              <SubTitle>基本信息</SubTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                <InfoRow label="姓名" value={a.name} />
                <InfoRow label="英文姓名" value={a.nameEn} />
                {a.nameNative && <InfoRow label="本国语言姓名" value={a.nameNative} />}
                <InfoRow label="性别" value={a.gender} />
                <InfoRow label="出生日期" value={a.birthDate} />
                {a.birthPlace && <InfoRow label="出生地区" value={a.birthPlace} />}
                <InfoRow label="国籍" value={a.nationality} />
                {a.nationality !== '中国' && (
                  <InfoRow label="是否华裔" value={a.isEthnicChinese ? '是' : '否'} />
                )}
                <InfoRow label="证件类型" value={a.idType} />
                {a.idExpiry && <InfoRow label="证件有效期" value={a.idExpiry} />}
                <InfoRow label="手机号" value={a.phone} />
                <InfoRow label="邮箱" value={a.email} />
                <InfoRow label="最高学历" value={a.highestDegree} />
                <InfoRow label="毕业院校" value={a.highestDegreeInstitution} />
                <InfoRow label="所学专业" value={a.highestDegreeMajor} />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <SubTitle>到岗信息</SubTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                <InfoRow label="是否已全职到岗" value={a.isFullTimeOnBoarded ? '是' : '否'} />
                <InfoRow label="（拟任）职务" value={a.intendedPosition} />
                <InfoRow label="（拟）到岗时间" value={a.plannedArrivalDate} />
                {(a.laborContractStart || a.laborContractEnd) && (
                  <InfoRow label="劳动合同" value={`${a.laborContractStart || '—'} — ${a.laborContractEnd || '—'}`} />
                )}
                <InfoRow label="来宁时间" value={a.comeToNingboDate} />
                <InfoRow label="来宁前单位" value={a.lastOrgBeforeComeToNingbo} className="col-span-2" />
                {a.returnFromAbroadDate && (
                  <>
                    <InfoRow label="（拟）回国时间" value={a.returnFromAbroadDate} />
                    {a.lastOrgBeforeReturnFromAbroad && (
                      <InfoRow label="回国前单位" value={a.lastOrgBeforeReturnFromAbroad} className="col-span-2" />
                    )}
                  </>
                )}
              </div>
            </div>

            {(a.personalBrief || a.achievementsSummary || a.honorsCertificates) && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <SubTitle>个人陈述</SubTitle>
                <InfoRow label="有无创业经历" value={a.hasEntrepreneurExperience ? '有' : '无'} className="w-48" />
                <TextBlock label="个人简要介绍" value={a.personalBrief} />
                <TextBlock label="过往主要业绩" value={a.achievementsSummary} />
                {a.honorsCertificates && <TextBlock label="曾获荣誉" value={a.honorsCertificates} />}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <RepeatableCollection schema={EDUCATION_SCHEMA}
                items={a.educations as CollectionItem[]}
                onChange={(items) => patchApplicant('educations', items)} />
              <RepeatableCollection schema={WORK_SCHEMA}
                items={a.works as CollectionItem[]}
                onChange={(items) => patchApplicant('works', items)} />
              <RepeatableCollection schema={MAJOR_PROJECT_SCHEMA}
                items={a.majorProjects as CollectionItem[]}
                onChange={(items) => patchApplicant('majorProjects', items)} />
              <RepeatableCollection schema={PAPER_SCHEMA}
                items={a.papers as CollectionItem[]}
                onChange={(items) => patchApplicant('papers', items)} />
              <RepeatableCollection schema={PATENT_SCHEMA}
                items={a.patents as CollectionItem[]}
                onChange={(items) => patchApplicant('patents', items)} />
              <RepeatableCollection schema={SOFTWARE_COPYRIGHT_SCHEMA}
                items={a.softwareCopyrights as CollectionItem[]}
                onChange={(items) => patchApplicant('softwareCopyrights', items)} />
              <RepeatableCollection schema={PRODUCT_SCHEMA}
                items={a.products as CollectionItem[]}
                onChange={(items) => patchApplicant('products', items)} />
              <RepeatableCollection schema={AWARD_SCHEMA}
                items={a.awards as CollectionItem[]}
                onChange={(items) => patchApplicant('awards', items)} />
              <RepeatableCollection schema={BOOK_SCHEMA}
                items={a.books as CollectionItem[]}
                onChange={(items) => patchApplicant('books', items)} />
              <RepeatableCollection schema={CONFERENCE_REPORT_SCHEMA}
                items={a.conferenceReports as CollectionItem[]}
                onChange={(items) => patchApplicant('conferenceReports', items)} />
              <RepeatableCollection schema={ACADEMIC_POSITION_SCHEMA}
                items={a.academicPositions as CollectionItem[]}
                onChange={(items) => patchApplicant('academicPositions', items)} />
              <RepeatableCollection schema={FOUNDED_COMPANY_SCHEMA}
                items={a.foundedCompanies as CollectionItem[]}
                onChange={(items) => patchApplicant('foundedCompanies', items)} />
            </div>
          </div>

          {/* Team Members */}
          <div id="team" className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <SecTitle className="flex-1">项目团队</SecTitle>
              <VerificationBadge status={project.verificationStatus.teamMembers} />
              {project.verificationStatus.teamMembers !== 'verified' && (
                <button
                  disabled={verifyingField === 'teamMembers'}
                  onClick={() => handleVerify('teamMembers')}
                  className="text-[10px] font-bold text-brand-blue hover:underline disabled:opacity-50"
                >
                  {verifyingField === 'teamMembers' ? '提交中…' : '申请验证'}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 -mt-1 mb-3">
              验证后团队规模计入雷达图
              {project.verificationStatus.teamMembers === 'verified' && (
                <span className="ml-1 text-emerald-600 font-semibold">
                  · 当前 {project.teamMembers.length + 1} 人（已计入）
                </span>
              )}
            </p>
            <RepeatableCollection
              schema={TEAM_MEMBER_SCHEMA}
              items={project.teamMembers as CollectionItem[]}
              onChange={(items) => saveWithDiff({ teamMembers: items as unknown as TeamMember[] }, '更新项目团队')}
              defaultExpanded
            />
          </div>

          {/* Project Details */}
          <div id="proj-detail" className="glass-card p-5 space-y-4">
            <SecTitle>项目详情</SecTitle>
            <TextBlock label="项目背景意义" value={project.projectBackground} />
            <TextBlock label="项目实施内容" value={project.projectContent} />
            <TextBlock label="工作基础和条件" value={project.workBasis} />
            <TextBlock label="预期贡献及验收指标" value={project.expectedContribution} />
            <TextBlock label="预期经济效益" value={project.economicEfficiency} />
            {!project.projectBackground && !project.projectContent && !project.workBasis
              && !project.expectedContribution && !project.economicEfficiency && (
              <p className="text-sm text-slate-400">暂无内容，点击右上角"编辑"填写</p>
            )}
            <div className="pt-3 border-t border-slate-100">
              <RepeatableCollection
                schema={PROJECT_STAGE_SCHEMA}
                items={project.projectStages as CollectionItem[]}
                onChange={(items) => saveWithDiff({ projectStages: items as unknown as ProjectStage[] }, '更新阶段性目标')}
                defaultExpanded
              />
            </div>
          </div>

          {/* Investment */}
          <div id="investment" className="glass-card p-5">
            <SecTitle>投入预测</SecTitle>
            <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-4">
              <NumStat label="项目总投入预测（5年）" value={project.totalInvestmentForecast} unit="万元" />
              <NumStat label="单位已投入" value={project.alreadyInvestedByOrg} unit="万元" />
              <NumStat label="已获区县市支持" value={project.govSupportReceived} unit="万元" />
              <NumStat label="单位计划投入（5年）" value={project.plannedInvestmentByOrg} unit="万元" />
            </div>
          </div>

          {/* Org Info */}
          <div id="org" className="glass-card p-5 space-y-4">
            <SecTitle>用人单位</SecTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
              <InfoRow label="单位全称" value={o.name} className="col-span-2 sm:col-span-1" />
              <InfoRow label="单位类型" value={o.orgType} />
              <InfoRow label="统一社会信用代码" value={o.creditCode} />
              <InfoRow label="成立时间" value={o.establishedDate} />
              <InfoRow label="注册资本" value={o.registeredCapital > 0 ? `${o.registeredCapital} 万元` : '—'} />
              <InfoRow label="员工总数" value={o.totalEmployees > 0 ? `${o.totalEmployees} 人` : '—'} />
              <InfoRow label="联系人" value={o.contactPerson} />
              <InfoRow label="联系人手机" value={o.contactPhone} />
              <InfoRow label="地址" value={o.address} className="col-span-2" />
            </div>
            <TextBlock label="单位简介" value={o.orgBrief} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4 pt-3 border-t border-slate-100">
              {/* rdExpenditure — needs verification to count in radar */}
              <div>
                <span className="text-xs text-slate-400">年研发投入</span>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <p className="text-sm font-semibold text-slate-700">
                    {o.rdExpenditure > 0 ? `${o.rdExpenditure} 万元` : '—'}
                  </p>
                  <VerificationBadge status={project.verificationStatus.rdExpenditure} />
                </div>
                {project.verificationStatus.rdExpenditure !== 'verified' && (
                  <button
                    disabled={verifyingField === 'rdExpenditure'}
                    onClick={() => handleVerify('rdExpenditure')}
                    className="text-[10px] text-brand-blue hover:underline disabled:opacity-50 mt-0.5"
                  >
                    {verifyingField === 'rdExpenditure' ? '提交中…' : '申请验证 →'}
                  </button>
                )}
              </div>
              <InfoRow label="研发经费占比" value={o.rdRevenueRatio > 0 ? `${o.rdRevenueRatio}%` : '—'} />
              <InfoRow label="研发人员数" value={o.rdPersonnelCount > 0 ? `${o.rdPersonnelCount} 人` : '—'} />
              <InfoRow label="发明专利数" value={`${o.orgInventionPatentCount} 件`} />
              {/* totalRevenue — needs verification to count in maturity score */}
              <div>
                <span className="text-xs text-slate-400">年营业收入</span>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <p className="text-sm font-semibold text-slate-700">
                    {o.totalRevenue > 0 ? `${o.totalRevenue} 万元` : '—'}
                  </p>
                  <VerificationBadge status={project.verificationStatus.totalRevenue} />
                </div>
                {project.verificationStatus.totalRevenue !== 'verified' && (
                  <button
                    disabled={verifyingField === 'totalRevenue'}
                    onClick={() => handleVerify('totalRevenue')}
                    className="text-[10px] text-brand-blue hover:underline disabled:opacity-50 mt-0.5"
                  >
                    {verifyingField === 'totalRevenue' ? '提交中…' : '申请验证 →'}
                  </button>
                )}
              </div>
              <InfoRow label="上年度利润" value={`${o.lastYearProfit} 万元`} />
              {/* totalFunding — needs verification to count in radar */}
              <div>
                <span className="text-xs text-slate-400">累计融资</span>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <p className="text-sm font-semibold text-slate-700">
                    {o.totalFunding > 0 ? `${o.totalFunding} 万元` : '—'}
                  </p>
                  <VerificationBadge status={project.verificationStatus.totalFunding} />
                </div>
                {project.verificationStatus.totalFunding !== 'verified' && (
                  <button
                    disabled={verifyingField === 'totalFunding'}
                    onClick={() => handleVerify('totalFunding')}
                    className="text-[10px] text-brand-blue hover:underline disabled:opacity-50 mt-0.5"
                  >
                    {verifyingField === 'totalFunding' ? '提交中…' : '申请验证 →'}
                  </button>
                )}
              </div>
              <InfoRow label="融资轮次" value={o.fundingRound} />
            </div>
            <div className="pt-3 border-t border-slate-100">
              <RepeatableCollection
                schema={ORG_HONOR_SCHEMA}
                items={o.honors as CollectionItem[]}
                onChange={(items) => saveWithDiff({ orgInfo: { ...o, honors: items as unknown as OrgHonor[] } }, '更新单位荣誉')}
              />
            </div>
          </div>

          {/* ── 功能/记录区 ─────────────────────────────────────────────── */}

          {/* Registrations */}
          <div id="registrations" className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <SecTitle>报名记录</SecTitle>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{project.registrations.length} 次</span>
                <button
                  onClick={() => navigate(`/project/${id}/apply`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue text-white rounded-lg text-xs font-bold hover:bg-brand-blue/90 transition-colors"
                >
                  <Trophy className="w-3 h-3" /> 新建报名
                </button>
              </div>
            </div>
            {project.registrations.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-slate-400 gap-2">
                <Trophy className="w-8 h-8" />
                <p className="text-sm">暂无报名记录</p>
                <button
                  onClick={() => navigate(`/project/${id}/apply`)}
                  className="text-xs text-brand-blue hover:underline"
                >
                  去报名赛事 →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['赛事', '项目申报名', '专业领域', '成员数', '申报状态', '破格通道', '操作'].map((h) => (
                        <th key={h} className="text-left text-xs font-bold text-slate-400 pb-2.5 pr-4 last:pr-0 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {project.registrations.map((reg) => (
                      <RegistrationRow key={reg.id} reg={reg} projectId={id!} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Files */}
          <ProjectFilesPanel />

          {/* Timeline */}
          <div id="timeline" className="glass-card p-5">
            {/* Header row — collapse toggle + compare mode toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimelineOpen((v) => !v)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                <span className="flex-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  成长时间线
                </span>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {timelineOpen ? '收起' : `展开 · ${sortedEvents.length} 条`}
                </span>
                <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0', timelineOpen && 'rotate-180')} />
              </button>
              {timelineOpen && (
                <button
                  onClick={() => {
                    setCompareMode((v) => !v)
                    setSelectedForCompare([])
                    setComparisonResult(null)
                  }}
                  className={cn(
                    'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border flex-shrink-0 transition-colors',
                    compareMode
                      ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/30 font-bold'
                      : 'text-slate-400 border-slate-200 hover:bg-slate-50',
                  )}
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  {compareMode ? `已选 ${selectedForCompare.length}/2` : '快照对比'}
                </button>
              )}
            </div>

            {timelineOpen && (
              <div className="mt-4">
                {/* Compare mode panel */}
                {compareMode && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    {!compareNodeData ? (
                      <p className="text-xs text-slate-400 text-center py-1">
                        请在下方选择两个有快照的节点（标有「已快照」）进行对比
                      </p>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="text-xs text-slate-600 space-y-1">
                            <p>
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-blue text-white text-[10px] font-bold mr-1.5">1</span>
                              {compareNodeData.first.timestamp.slice(0, 10)} · {compareNodeData.first.description}
                            </p>
                            <p>
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-blue text-white text-[10px] font-bold mr-1.5">2</span>
                              {compareNodeData.second.timestamp.slice(0, 10)} · {compareNodeData.second.description}
                            </p>
                          </div>
                          <button
                            onClick={handleGenerateComparison}
                            disabled={comparisonLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-blue text-white rounded-lg font-bold disabled:opacity-50 hover:bg-brand-blue/90 transition-colors flex-shrink-0"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {comparisonLoading ? '分析中…' : comparisonResult ? '重新分析' : '查看成长对比'}
                          </button>
                        </div>
                        {/* Radar delta chips */}
                        {(() => {
                          const { snapA, snapB } = compareNodeData
                          const deltas = ([
                            snapB.radar.teamSize               !== snapA.radar.teamSize               ? { label: '团队',  from: `${snapA.radar.teamSize}人`,               to: `${snapB.radar.teamSize}人` } : null,
                            snapB.radar.patentCount            !== snapA.radar.patentCount            ? { label: '专利',  from: `${snapA.radar.patentCount}件`,             to: `${snapB.radar.patentCount}件` } : null,
                            snapB.radar.softwareCopyrightCount !== snapA.radar.softwareCopyrightCount ? { label: '软著',  from: `${snapA.radar.softwareCopyrightCount}件`,  to: `${snapB.radar.softwareCopyrightCount}件` } : null,
                            snapB.radar.paperCount             !== snapA.radar.paperCount             ? { label: '论文',  from: `${snapA.radar.paperCount}篇`,              to: `${snapB.radar.paperCount}篇` } : null,
                            snapB.radar.totalFunding           !== snapA.radar.totalFunding           ? { label: '融资额', from: `${snapA.radar.totalFunding}万`,           to: `${snapB.radar.totalFunding}万` } : null,
                            snapB.radar.maturityScore          !== snapA.radar.maturityScore          ? { label: '成熟度', from: `${snapA.radar.maturityScore}分`,          to: `${snapB.radar.maturityScore}分` } : null,
                          ] as ({ label: string; from: string; to: string } | null)[]).filter((d): d is { label: string; from: string; to: string } => d !== null)
                          if (!deltas.length) return null
                          return (
                            <div className="flex flex-wrap gap-1.5">
                              {deltas.map((d) => (
                                <span key={d.label} className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1">
                                  <span className="text-slate-400 mr-0.5">{d.label}</span>
                                  <span className="line-through text-red-400">{d.from}</span>
                                  <span className="text-slate-400 mx-0.5">→</span>
                                  <span className="text-emerald-600 font-semibold">{d.to}</span>
                                </span>
                              ))}
                            </div>
                          )
                        })()}
                        {comparisonLoading && (
                          <div className="flex items-center gap-2 text-slate-400 text-xs pt-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            AI 正在分析对比区间…
                          </div>
                        )}
                        {comparisonResult && (
                          <p className="text-sm text-slate-700 leading-[1.9] bg-white rounded-xl p-3 border border-slate-100">
                            {comparisonResult}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {sortedEvents.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">暂无事件</p>
                ) : (
                  sortedEvents.map((ev, idx) => {
                    const isApply = ev.type === '报名'
                    const isRollback = ev.type === '回退'
                    const isLast = idx === sortedEvents.length - 1
                    const hasSnap = !!project!.snapshots[ev.snapshotId]
                    const isSelected = selectedForCompare.includes(ev.id)
                    const selectIdx = selectedForCompare.indexOf(ev.id)

                    return (
                      <div
                        key={ev.id}
                        className={cn(
                          'flex gap-4',
                          isSelected && compareMode && 'bg-brand-blue/5 -mx-1 px-1 rounded-xl',
                        )}
                      >
                        <div className="flex flex-col items-center">
                          {compareMode ? (
                            <button
                              disabled={!hasSnap}
                              onClick={() => toggleCompareSelection(ev.id)}
                              className={cn(
                                'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-all',
                                isSelected
                                  ? 'border-brand-blue bg-brand-blue text-white'
                                  : hasSnap
                                    ? 'border-slate-300 bg-white hover:border-brand-blue cursor-pointer'
                                    : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-40',
                              )}
                            >
                              {isSelected
                                ? <span className="text-xs font-bold">{selectIdx + 1}</span>
                                : <span className={cn('w-3 h-3 rounded-full', hasSnap ? 'bg-slate-300' : 'bg-slate-200')} />}
                            </button>
                          ) : (
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                              isApply    ? 'bg-brand-blue text-white'    :
                              isRollback ? 'bg-amber-100 text-amber-600' :
                                           'bg-slate-100 text-slate-500',
                            )}>
                              {isApply
                                ? <Trophy className="w-3.5 h-3.5" />
                                : isRollback
                                  ? <RotateCcw className="w-3.5 h-3.5" />
                                  : <Pencil className="w-3.5 h-3.5" />}
                            </div>
                          )}
                          {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                        </div>

                        <div className="pb-6 flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-800 flex-1">{ev.description}</p>
                            <button
                              onClick={() => setDetailEvent(ev)}
                              className="flex items-center gap-1 text-xs text-brand-blue hover:underline flex-shrink-0"
                            >
                              <Info className="w-3 h-3" />
                              查看详情
                            </button>
                          </div>

                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ev.timestamp.slice(0, 16).replace('T', ' ')}
                            <span className={cn(
                              'ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold',
                              isApply    ? 'bg-brand-blue/10 text-brand-blue' :
                              isRollback ? 'bg-amber-100 text-amber-600'      :
                                           'bg-slate-100 text-slate-500',
                            )}>
                              {ev.type}
                            </span>
                            {hasSnap && (
                              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-50 text-slate-400">
                                已快照
                              </span>
                            )}
                          </p>

                          {ev.changes.length > 0 && (
                            <div className="mt-2 space-y-2 bg-slate-50/70 rounded-xl px-3 py-2">
                              {ev.changes.map((c, ci) => (
                                <FieldChangeDiff key={ci} c={c} inline />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {editOpen && (
        <EditProjectInfoModal
          project={project}
          onClose={() => setEditOpen(false)}
          onSave={handleEditSave}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          snapshot={project!.snapshots[detailEvent.snapshotId]}
          onClose={() => setDetailEvent(null)}
          onRollback={() => handleRollback(detailEvent)}
        />
      )}
    </>
  )
}
