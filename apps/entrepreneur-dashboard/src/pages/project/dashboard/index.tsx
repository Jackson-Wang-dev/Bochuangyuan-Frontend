import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Trophy, Users, Zap, Award, TrendingUp,
  Clock, ChevronRight, ChevronDown, CheckCircle2, XCircle, AlertCircle, RotateCcw,
  FileText, Pencil, Plus, X, Save, Check, CheckSquare, Square,
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { useProjectDashboardStore } from '@/store/projectDashboardStore'
import {
  projectToRadar, snapshotToRadar, formatTimestamp,
  type ProjectV2, type RegistrationInstance, type ProjectEvent,
  type FieldChange, type MaturityLevel,
} from '@/mock/projectMock'
import { cn } from '@/lib/utils'

// ── Constants ─────────────────────────────────────────────────────────────────

const MATURITY_OPTIONS: MaturityLevel[] = ['概念', '原型', '小试', '中试', '量产']
const TRACKS = ['医疗健康', '新能源', '智慧城市', '人工智能', '智慧物流', '先进制造', '农业科技', '其他']

const STATUS_ICON: Record<string, React.ReactNode> = {
  '待审核': <AlertCircle className="w-4 h-4 text-amber-500" />,
  '通过':   <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  '淘汰':   <XCircle className="w-4 h-4 text-red-400" />,
  '已撤回': <RotateCcw className="w-4 h-4 text-slate-400" />,
}
const STATUS_COLOR: Record<string, string> = {
  '待审核': 'bg-amber-50 text-amber-600',
  '通过':   'bg-emerald-50 text-emerald-600',
  '淘汰':   'bg-red-50 text-red-500',
  '已撤回': 'bg-slate-100 text-slate-500',
}

// Fields that appear in change events and support selective rollback
const ROLLBACKABLE_FIELDS = new Set([
  'teamSize', 'fundingAmount', 'patentCount', 'maturityLevel', 'businessScope',
  'displayName', 'officialName', 'track', 'coreTech', 'relatedEnterprise', 'teamLead',
])

const MOD_COLLAPSE_THRESHOLD = 3  // show first 1, fold the rest if run length ≥ this

// Groups a newest-first event list into interleaved: 报名 singletons and 维护编辑 runs.
type TimelineGroup = ProjectEvent | ProjectEvent[]
function groupTimeline(events: ProjectEvent[]): TimelineGroup[] {
  const result: TimelineGroup[] = []
  let run: ProjectEvent[] = []
  for (const ev of events) {
    if (ev.type === '报名') {
      if (run.length > 0) { result.push([...run]); run = [] }
      result.push(ev)
    } else {
      run.push(ev)
    }
  }
  if (run.length > 0) result.push(run)
  return result
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeChanges(old: ProjectV2, patch: Partial<ProjectV2>): FieldChange[] {
  const changes: FieldChange[] = []

  type NumericKey = 'teamSize' | 'fundingAmount' | 'patentCount'
  const numerics: { key: NumericKey; label: string; fmt: (n: number) => string }[] = [
    { key: 'teamSize',      label: '团队规模', fmt: (n) => `${n} 人` },
    { key: 'fundingAmount', label: '融资额',   fmt: (n) => n === 0 ? '未融资' : `${n} 万` },
    { key: 'patentCount',   label: '专利数',   fmt: (n) => `${n} 项` },
  ]
  for (const f of numerics) {
    const nv = patch[f.key] as number | undefined
    if (nv === undefined || nv === old[f.key]) continue
    changes.push({ field: f.key, label: f.label, oldValue: f.fmt(old[f.key]), newValue: f.fmt(nv) })
  }

  if (patch.maturityLevel && patch.maturityLevel !== old.maturityLevel) {
    changes.push({ field: 'maturityLevel', label: '成熟度', oldValue: old.maturityLevel, newValue: patch.maturityLevel })
  }

  if (patch.businessScope) {
    const o = [...old.businessScope].sort().join(',')
    const n = [...patch.businessScope].sort().join(',')
    if (o !== n) {
      changes.push({
        field: 'businessScope', label: '业务范围',
        oldValue: old.businessScope.join(', ') || '—',
        newValue: patch.businessScope.join(', ') || '—',
      })
    }
  }

  const identityKeys: { key: keyof ProjectV2; label: string }[] = [
    { key: 'displayName',      label: '展示名' },
    { key: 'officialName',     label: '正式申报名' },
    { key: 'track',            label: '赛道' },
    { key: 'coreTech',         label: '核心技术' },
    { key: 'relatedEnterprise',label: '关联企业' },
    { key: 'teamLead',         label: '团队负责人' },
  ]
  for (const f of identityKeys) {
    const nv = patch[f.key] as string | undefined
    if (nv === undefined) continue
    const ov = String(old[f.key] ?? '')
    if (nv !== ov) {
      changes.push({ field: f.key as string, label: f.label, oldValue: ov || '—', newValue: nv || '—' })
    }
  }

  return changes
}

function parseRollbackValue(field: string, displayValue: string): unknown {
  switch (field) {
    case 'teamSize':
    case 'patentCount':
      return parseInt(displayValue.replace(/\D/g, '')) || 0
    case 'fundingAmount':
      if (displayValue === '未融资') return 0
      return parseFloat(displayValue.replace(/[^0-9.]/g, '')) || 0
    case 'businessScope':
      if (!displayValue || displayValue === '—') return []
      return displayValue.split(/[,，]+/).map((s: string) => s.trim()).filter(Boolean)
    default:
      return displayValue === '—' ? '' : displayValue
  }
}

function buildTrendData(project: ProjectV2) {
  return [...project.events]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map((ev) => ({
      date: formatTimestamp(ev.timestamp).slice(5),
      fullDate: formatTimestamp(ev.timestamp),
      teamSize: ev.snapshot.teamSize,
      funding: ev.snapshot.fundingAmount,
      patents: ev.snapshot.patentCount,
    }))
}

// ── Edit form types ───────────────────────────────────────────────────────────

interface EditForm {
  displayName: string; officialName: string; track: string; coreTech: string
  relatedEnterprise: string; teamLead: string
  teamSize: string; fundingAmount: string; patentCount: string
  maturityLevel: MaturityLevel
  businessScopeInput: string; businessScope: string[]
  briefIntro: string; leaderInfo: string; teamMembersDesc: string
  honors: string; papers: string; personalStatement: string
}

function initEditForm(p: ProjectV2): EditForm {
  return {
    displayName: p.displayName, officialName: p.officialName,
    track: p.track, coreTech: p.coreTech,
    relatedEnterprise: p.relatedEnterprise, teamLead: p.teamLead,
    teamSize: String(p.teamSize), fundingAmount: String(p.fundingAmount), patentCount: String(p.patentCount),
    maturityLevel: p.maturityLevel, businessScopeInput: '', businessScope: [...p.businessScope],
    briefIntro: p.briefIntro, leaderInfo: p.leaderInfo, teamMembersDesc: p.teamMembersDesc,
    honors: p.honors, papers: p.papers, personalStatement: p.personalStatement,
  }
}

function editFormToPatch(f: EditForm): Partial<ProjectV2> {
  return {
    displayName: f.displayName.trim(), officialName: f.officialName.trim(),
    track: f.track, coreTech: f.coreTech.trim(),
    relatedEnterprise: f.relatedEnterprise.trim(), teamLead: f.teamLead.trim(),
    teamSize: parseInt(f.teamSize) || 0,
    fundingAmount: parseFloat(f.fundingAmount) || 0,
    patentCount: parseInt(f.patentCount) || 0,
    maturityLevel: f.maturityLevel, businessScope: f.businessScope,
    briefIntro: f.briefIntro.trim(), leaderInfo: f.leaderInfo.trim(),
    teamMembersDesc: f.teamMembersDesc.trim(), honors: f.honors.trim(),
    papers: f.papers.trim(), personalStatement: f.personalStatement.trim(),
  }
}

// ── Shared input classes ──────────────────────────────────────────────────────

const IC = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white'
const TC = `${IC} resize-none`

// ── EditProjectModal ──────────────────────────────────────────────────────────

function EditSectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pt-1">{children}</p>
}

function EditProjectModal({
  project,
  onClose,
  onSave,
}: {
  project: ProjectV2
  onClose: () => void
  onSave: (patch: Partial<ProjectV2>, changes: FieldChange[]) => void
}) {
  const [form, setForm] = useState<EditForm>(() => initEditForm(project))

  function sf(key: keyof EditForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }
  function addScope() {
    const v = form.businessScopeInput.trim()
    if (!v || form.businessScope.includes(v)) return
    setForm((f) => ({ ...f, businessScope: [...f.businessScope, v], businessScopeInput: '' }))
  }
  function removeScope(s: string) {
    setForm((f) => ({ ...f, businessScope: f.businessScope.filter((x) => x !== s) }))
  }

  function handleSave() {
    const patch = editFormToPatch(form)
    const changes = computeChanges(project, patch)
    onSave(patch, changes)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <p className="font-bold text-slate-800">编辑项目</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
          {/* Identity */}
          <div>
            <EditSectionTitle>项目身份</EditSectionTitle>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">展示名 <span className="text-red-500">*</span></label>
                  <input className={IC} value={form.displayName} onChange={(e) => sf('displayName', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">正式申报用名</label>
                  <input className={IC} value={form.officialName} onChange={(e) => sf('officialName', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">赛道 / 领域</label>
                  <select className={IC} value={form.track} onChange={(e) => sf('track', e.target.value)}>
                    <option value="">请选择</option>
                    {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">核心技术 / 依托专利</label>
                  <input className={IC} value={form.coreTech} onChange={(e) => sf('coreTech', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">关联企业</label>
                  <input className={IC} value={form.relatedEnterprise} onChange={(e) => sf('relatedEnterprise', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">团队负责人</label>
                  <input className={IC} value={form.teamLead} onChange={(e) => sf('teamLead', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Growth dimensions */}
          <div>
            <EditSectionTitle>成长维度</EditSectionTitle>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">团队规模（人）</label>
                  <input type="number" min={1} className={IC} value={form.teamSize} onChange={(e) => sf('teamSize', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">融资额（万元）</label>
                  <input type="number" min={0} className={IC} value={form.fundingAmount} onChange={(e) => sf('fundingAmount', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">专利数（项）</label>
                  <input type="number" min={0} className={IC} value={form.patentCount} onChange={(e) => sf('patentCount', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">项目成熟度</label>
                <div className="flex gap-2 flex-wrap">
                  {MATURITY_OPTIONS.map((m) => (
                    <button key={m} type="button"
                      onClick={() => setForm((f) => ({ ...f, maturityLevel: m }))}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-semibold border transition-all',
                        form.maturityLevel === m ? 'border-brand-blue bg-brand-blue/8 text-brand-blue' : 'border-slate-200 text-slate-500 hover:border-slate-300',
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">业务范围（标签）</label>
                <div className="flex gap-2">
                  <input className={cn(IC, 'flex-1')}
                    value={form.businessScopeInput}
                    onChange={(e) => sf('businessScopeInput', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addScope() } }}
                    placeholder="输入后按 Enter 或点击 +"
                  />
                  <button type="button" onClick={addScope}
                    className="px-3 py-2 bg-brand-blue/10 text-brand-blue rounded-xl text-sm hover:bg-brand-blue/15 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.businessScope.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {form.businessScope.map((s) => (
                      <span key={s} className="flex items-center gap-1 px-2.5 py-0.5 bg-brand-blue/8 text-brand-blue rounded-full text-xs font-semibold">
                        {s}
                        <button onClick={() => removeScope(s)} className="hover:text-rose-500 transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project details */}
          <div>
            <EditSectionTitle>项目详情</EditSectionTitle>
            <div className="space-y-3">
              {([
                ['briefIntro',       '项目简介',         3],
                ['leaderInfo',       '带头人信息',       2],
                ['teamMembersDesc',  '团队成员',         2],
                ['honors',           '荣誉获奖',         2],
                ['papers',           '代表性著作 / 论文', 2],
                ['personalStatement','个人陈述',         3],
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
        </div>

        {/* Footer */}
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

// ── RollbackDialog ────────────────────────────────────────────────────────────

function RollbackDialog({
  event,
  checked,
  onToggle,
  onConfirm,
  onClose,
}: {
  event: ProjectEvent
  checked: Set<string>
  onToggle: (field: string) => void
  onConfirm: () => void
  onClose: () => void
}) {
  const rollbackable = (event.changes ?? []).filter((c) => ROLLBACKABLE_FIELDS.has(c.field))

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800">回退确认</p>
            <p className="text-xs text-slate-400 mt-0.5">
              将回退 <span className="font-semibold">{formatTimestamp(event.timestamp)}</span> 的维护编辑，勾选要恢复的字段
            </p>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {rollbackable.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">该事件没有可回退的字段</p>
        ) : (
          <div className="space-y-2">
            {rollbackable.map((c) => {
              const isChecked = checked.has(c.field)
              return (
                <button key={c.field} onClick={() => onToggle(c.field)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3',
                    isChecked ? 'border-rose-300 bg-rose-50' : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <span className="mt-0.5 flex-shrink-0">
                    {isChecked
                      ? <CheckSquare className="w-4 h-4 text-rose-500" />
                      : <Square className="w-4 h-4 text-slate-300" />}
                  </span>
                  <div className="flex-1 min-w-0 text-sm">
                    <p className="font-semibold text-slate-700">{c.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-600 font-medium">{c.newValue}</span>
                      <span className="text-slate-300">←</span>
                      <span className="text-rose-500 font-semibold line-through">{c.oldValue}</span>
                      <span className="text-slate-400 no-underline">（恢复为此值）</span>
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            取消
          </button>
          <button onClick={onConfirm}
            disabled={checked.size === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 disabled:opacity-40 transition-colors">
            <RotateCcw className="w-4 h-4" /> 回退选中项
          </button>
        </div>
      </div>
    </div>
  )
}

// ── RegistrationCard ──────────────────────────────────────────────────────────

function RegistrationCard({
  reg,
  projectId,
}: {
  reg: RegistrationInstance
  projectId: string
}) {
  const navigate = useNavigate()
  const activePhase = reg.phases.find((p) => p.status === 'active')
  const completedCount = reg.phases.filter((p) => p.status === 'completed').length

  return (
    <button
      onClick={() => navigate(`/project/${projectId}/registration/${reg.id}`)}
      className="w-full text-left flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-brand-blue/20 hover:shadow-sm transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-brand-blue/8 flex items-center justify-center flex-shrink-0">
        <Trophy className="w-4 h-4 text-brand-blue" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-slate-800 text-sm">{reg.competitionName}</p>
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', STATUS_COLOR[reg.status])}>
            {reg.status}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{reg.track} · 提交于 {formatTimestamp(reg.submittedAt)}</p>
        {activePhase ? (
          <p className="text-xs text-brand-blue mt-1 font-semibold">
            当前阶段：{activePhase.label}
          </p>
        ) : completedCount === reg.phases.length && reg.phases.length > 0 ? (
          <p className="text-xs text-emerald-600 mt-1 font-semibold">已完成全部阶段</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {STATUS_ICON[reg.status]}
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-blue transition-colors" />
      </div>
    </button>
  )
}

// ── TimelineItem ──────────────────────────────────────────────────────────────

function TimelineItem({
  event,
  onViewSnapshot,
  onRollback,
}: {
  event: ProjectEvent
  onViewSnapshot: (e: ProjectEvent) => void
  onRollback: (e: ProjectEvent) => void
}) {
  const isApply = event.type === '报名'
  const canRollback = !isApply && (event.changes ?? []).some((c) => ROLLBACKABLE_FIELDS.has(c.field))

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
          isApply ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-500',
        )}>
          {isApply ? <Trophy className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
        </div>
        <div className="w-px flex-1 bg-slate-100 mt-1" />
      </div>

      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-800">{event.description}</p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimestamp(event.timestamp)}
              <span className={cn('ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold',
                isApply ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 text-slate-500',
              )}>
                {event.type}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canRollback && (
              <button onClick={() => onRollback(event)}
                className="text-xs text-rose-400 hover:text-rose-600 flex items-center gap-1 transition-colors">
                <RotateCcw className="w-3 h-3" /> 回退
              </button>
            )}
            <button onClick={() => onViewSnapshot(event)}
              className="text-xs text-slate-400 hover:text-brand-blue flex items-center gap-1 transition-colors">
              快照 <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {event.changes && event.changes.length > 0 && (
          <div className="mt-2 space-y-1">
            {event.changes.map((c, i) => (
              <p key={i} className="text-xs text-slate-500">
                <span className="font-semibold text-slate-600">{c.label}：</span>
                <span className="line-through text-slate-400">{c.oldValue}</span>
                {' → '}
                <span className="text-emerald-600 font-semibold">{c.newValue}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── SnapshotModal ─────────────────────────────────────────────────────────────

function SnapshotModal({ event, onClose }: { event: ProjectEvent; onClose: () => void }) {
  const radarData = snapshotToRadar(event.snapshot)
  const s = event.snapshot

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">历史快照</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatTimestamp(event.timestamp)} · {event.description}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none">×</button>
        </div>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="快照" dataKey="value" stroke="#0045c4" fill="#0045c4" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { Icon: Users,    label: '团队规模', val: `${s.teamSize} 人` },
            { Icon: Zap,      label: '融资额',   val: s.fundingAmount > 0 ? `${s.fundingAmount} 万` : '—' },
            { Icon: Award,    label: '专利数',   val: `${s.patentCount} 项` },
            { Icon: TrendingUp, label: '成熟度', val: s.maturityLevel },
          ].map(({ Icon, label, val }) => (
            <div key={label} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
              <Icon className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{label}</span>
              <span className="ml-auto font-bold text-slate-800">{val}</span>
            </div>
          ))}
        </div>
        {s.businessScope.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {s.businessScope.map((t) => (
              <span key={t} className="px-2 py-0.5 bg-brand-blue/8 text-brand-blue text-xs rounded-full font-semibold">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-slate-400">{label}</span>
      <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{value}</p>
    </div>
  )
}

function DimBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs text-slate-500">{label}</span>
      <span className="ml-auto text-xs font-bold text-slate-700">{value}</span>
    </div>
  )
}

// ── ProjectDetailsCard (formerly ContentBlocksCard) ───────────────────────────

function ProjectDetailsCard({ project, onEdit }: { project: ProjectV2; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const blocks = [
    { label: '项目简介', value: project.briefIntro },
    { label: '带头人信息', value: project.leaderInfo },
    { label: '团队成员', value: project.teamMembersDesc },
    { label: '荣誉获奖', value: project.honors },
    { label: '代表性著作 / 论文', value: project.papers },
    { label: '个人陈述', value: project.personalStatement },
  ].filter((b) => b.value)

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between">
        <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">项目详情</p>
          <span className="text-xs text-slate-400">{expanded ? '收起' : '展开查看'}</span>
        </button>
        <button onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-blue bg-brand-blue/8 rounded-xl hover:bg-brand-blue/15 transition-colors">
          <Pencil className="w-3 h-3" /> 编辑项目
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {blocks.length === 0 ? (
            <p className="text-sm text-slate-400">暂无内容，点击右上角"编辑项目"填写</p>
          ) : (
            blocks.map((b) => (
              <div key={b.label}>
                <p className="text-xs font-bold text-slate-500 mb-1">{b.label}</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{b.value}</p>
              </div>
            ))
          )}
          {project.pdfFiles.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">附件</p>
              <div className="space-y-1.5">
                {project.pdfFiles.map((f) => (
                  <div key={f.name} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-sm text-slate-600">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>{f.name}</span>
                    <span className="ml-auto text-xs text-slate-400">{f.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProjectDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, registrations, updateProject, recordEdit } = useProjectDashboardStore()

  const [snapshotEvent, setSnapshotEvent] = useState<ProjectEvent | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [rollbackEvent, setRollbackEvent] = useState<ProjectEvent | null>(null)
  const [rollbackChecked, setRollbackChecked] = useState<Set<string>>(new Set())
  const [timelineOpen, setTimelineOpen] = useState(true)
  const [expandedRuns, setExpandedRuns] = useState<Set<number>>(new Set())

  const project = projects.find((p) => p.id === id)
  const projectRegs = registrations.filter((r) => r.projectId === id)
  const sortedEvents = project
    ? [...project.events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    : []

  if (!project) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
        <p className="text-sm">项目不存在</p>
        <button onClick={() => navigate('/project')} className="text-sm text-brand-blue hover:underline">返回项目列表</button>
      </div>
    )
  }

  const radarData = projectToRadar(project)
  const trendData = buildTrendData(project)

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleEditSave(patch: Partial<ProjectV2>, changes: FieldChange[]) {
    const p = project!
    const snapshot = {
      teamSize: (patch.teamSize ?? p.teamSize) as number,
      fundingAmount: (patch.fundingAmount ?? p.fundingAmount) as number,
      patentCount: (patch.patentCount ?? p.patentCount) as number,
      maturityLevel: (patch.maturityLevel ?? p.maturityLevel) as MaturityLevel,
      businessScope: (patch.businessScope ?? p.businessScope) as string[],
    }
    const hasContentChange = (
      (patch.briefIntro !== undefined && patch.briefIntro !== p.briefIntro) ||
      (patch.leaderInfo !== undefined && patch.leaderInfo !== p.leaderInfo) ||
      (patch.teamMembersDesc !== undefined && patch.teamMembersDesc !== p.teamMembersDesc) ||
      (patch.honors !== undefined && patch.honors !== p.honors) ||
      (patch.papers !== undefined && patch.papers !== p.papers) ||
      (patch.personalStatement !== undefined && patch.personalStatement !== p.personalStatement)
    )
    updateProject(p.id, patch)
    if (changes.length > 0 || hasContentChange) {
      const desc = changes.length > 0 ? '更新项目信息' : '更新项目详情内容'
      recordEdit(p.id, desc, changes, snapshot)
    }
    setEditOpen(false)
  }

  function handleOpenRollback(event: ProjectEvent) {
    const rollbackable = (event.changes ?? []).filter((c) => ROLLBACKABLE_FIELDS.has(c.field))
    setRollbackChecked(new Set(rollbackable.map((c) => c.field)))
    setRollbackEvent(event)
  }

  function handleToggleRollback(field: string) {
    setRollbackChecked((prev) => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  function handleConfirmRollback() {
    if (!rollbackEvent) return
    const rollbackable = (rollbackEvent.changes ?? []).filter((c) => rollbackChecked.has(c.field))
    const patch: Record<string, unknown> = {}
    const reverseChanges: FieldChange[] = []

    for (const c of rollbackable) {
      const restoredValue = parseRollbackValue(c.field, c.oldValue)
      patch[c.field] = restoredValue
      reverseChanges.push({ field: c.field, label: c.label, oldValue: c.newValue, newValue: c.oldValue })
    }

    const patchTyped = patch as Partial<ProjectV2>
    const p = project!
    const snapshot = {
      teamSize: (patchTyped.teamSize ?? p.teamSize) as number,
      fundingAmount: (patchTyped.fundingAmount ?? p.fundingAmount) as number,
      patentCount: (patchTyped.patentCount ?? p.patentCount) as number,
      maturityLevel: (patchTyped.maturityLevel ?? p.maturityLevel) as MaturityLevel,
      businessScope: (patchTyped.businessScope ?? p.businessScope) as string[],
    }

    updateProject(p.id, patchTyped)
    recordEdit(
      p.id,
      `回退「${rollbackEvent.description}」(${formatTimestamp(rollbackEvent.timestamp)})`,
      reverseChanges,
      snapshot,
    )
    setRollbackEvent(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/project')} className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800">{project.displayName}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{project.officialName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
              <Pencil className="w-4 h-4" /> 编辑
            </button>
            <button onClick={() => navigate(`/project/${id}/apply`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors">
              <Trophy className="w-4 h-4" /> 一键报名
            </button>
          </div>
        </div>

        {/* Identity card */}
        <div className="glass-card p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">项目身份</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
            <IdentityRow label="赛道 / 领域" value={project.track || '—'} />
            <IdentityRow label="核心技术" value={project.coreTech || '—'} />
            <IdentityRow label="关联企业" value={project.relatedEnterprise || '—'} />
            <IdentityRow label="团队负责人" value={project.teamLead || '—'} />
          </div>
          {project.businessScope.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-100">
              {project.businessScope.map((t) => (
                <span key={t} className="px-2 py-0.5 bg-brand-blue/8 text-brand-blue text-xs rounded-full font-semibold">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Growth: radar + trend */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="glass-card p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">五维成长雷达</p>
            <p className="text-xs text-slate-400 mb-3">当前时点快照</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar name="成长" dataKey="value" stroke="#0045c4" fill="#0045c4" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <DimBadge icon={<Users className="w-3.5 h-3.5" />} label="团队规模" value={`${project.teamSize} 人`} />
              <DimBadge icon={<Zap className="w-3.5 h-3.5" />} label="融资额" value={project.fundingAmount > 0 ? `${project.fundingAmount} 万` : '未融资'} />
              <DimBadge icon={<Award className="w-3.5 h-3.5" />} label="专利" value={`${project.patentCount} 项`} />
              <DimBadge icon={<TrendingUp className="w-3.5 h-3.5" />} label="成熟度" value={project.maturityLevel} />
            </div>
          </div>

          <div className="glass-card p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">成长趋势</p>
            <p className="text-xs text-slate-400 mb-3">各维度随时间变化</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    formatter={(v, name) => {
                      const labels: Record<string, string> = { teamSize: '团队(人)', funding: '融资(万)', patents: '专利(项)' }
                      return [v, labels[name as string] ?? name]
                    }}
                    labelFormatter={(l) => trendData.find((x) => x.date === l)?.fullDate ?? l}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => {
                    const m: Record<string, string> = { teamSize: '团队', funding: '融资(万)', patents: '专利' }
                    return m[v] ?? v
                  }} />
                  <Line type="monotone" dataKey="teamSize" stroke="#0045c4" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="funding" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="patents" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Registration records */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">报名记录</p>
            <span className="text-xs text-slate-400">{projectRegs.length} 次</span>
          </div>
          {projectRegs.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400 gap-2">
              <Trophy className="w-8 h-8" />
              <p className="text-sm">暂无报名记录</p>
              <button onClick={() => navigate(`/project/${id}/apply`)} className="text-xs text-brand-blue hover:underline">
                去报名赛事 →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {projectRegs.map((r) => (
                <RegistrationCard key={r.id} reg={r} projectId={id!} />
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="glass-card p-5">
          {/* Collapsible header */}
          <button
            onClick={() => setTimelineOpen((v) => !v)}
            className="flex items-center gap-2 w-full text-left mb-1"
          >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex-1">成长时间线</p>
            <span className="text-xs text-slate-400">{timelineOpen ? '收起' : `展开 · ${sortedEvents.length} 条`}</span>
            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', timelineOpen && 'rotate-180')} />
          </button>

          {timelineOpen && (
            <div className="mt-4">
              {sortedEvents.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">暂无事件</p>
              ) : (() => {
                const groups = groupTimeline(sortedEvents)
                return groups.map((group, gi) => {
                  if (!Array.isArray(group)) {
                    // 报名 anchor event — always rendered
                    return (
                      <TimelineItem
                        key={group.id}
                        event={group}
                        onViewSnapshot={setSnapshotEvent}
                        onRollback={handleOpenRollback}
                      />
                    )
                  }
                  // Modification run
                  const isExpanded = expandedRuns.has(gi)
                  const needsFold = group.length >= MOD_COLLAPSE_THRESHOLD
                  const visible = needsFold && !isExpanded ? group.slice(0, 1) : group
                  const hiddenCount = group.length - visible.length
                  return (
                    <div key={gi}>
                      {visible.map((ev) => (
                        <TimelineItem
                          key={ev.id}
                          event={ev}
                          onViewSnapshot={setSnapshotEvent}
                          onRollback={handleOpenRollback}
                        />
                      ))}
                      {needsFold && (
                        <button
                          onClick={() => setExpandedRuns((prev) => {
                            const next = new Set(prev)
                            if (isExpanded) next.delete(gi); else next.add(gi)
                            return next
                          })}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-blue transition-colors mb-6 ml-12"
                        >
                          <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
                          {isExpanded ? '收起修改记录' : `展开另外 ${hiddenCount} 条修改记录`}
                        </button>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>

        {/* Project details */}
        <ProjectDetailsCard project={project} onEdit={() => setEditOpen(true)} />
      </div>

      {/* Modals */}
      {snapshotEvent && <SnapshotModal event={snapshotEvent} onClose={() => setSnapshotEvent(null)} />}
      {editOpen && (
        <EditProjectModal project={project} onClose={() => setEditOpen(false)} onSave={handleEditSave} />
      )}
      {rollbackEvent && (
        <RollbackDialog
          event={rollbackEvent}
          checked={rollbackChecked}
          onToggle={handleToggleRollback}
          onConfirm={handleConfirmRollback}
          onClose={() => setRollbackEvent(null)}
        />
      )}
    </>
  )
}
