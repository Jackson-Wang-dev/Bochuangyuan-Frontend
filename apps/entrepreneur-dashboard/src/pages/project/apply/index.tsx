import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Check, Trophy, Calendar,
  CheckSquare, Square, AlertTriangle, History,
} from 'lucide-react'
import { useProjectDashboardStore } from '@/store/projectDashboardStore'
import {
  type CompetitionTemplate, type TemplateField, type ProjectV2, type RegistrationInstance,
} from '@/mock/projectMock'
import { cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getProjectFieldValue(project: ProjectV2, key: keyof ProjectV2): string {
  const v = project[key]
  if (Array.isArray(v)) return v.join(', ')
  return String(v ?? '')
}

function prefillFromProject(fields: TemplateField[], project: ProjectV2): Record<string, string> {
  const result: Record<string, string> = {}
  for (const f of fields) {
    if (f.projectFieldKey) {
      result[f.key] = getProjectFieldValue(project, f.projectFieldKey)
    }
  }
  return result
}

function prefillFromRegistration(
  fields: TemplateField[],
  sourceReg: RegistrationInstance,
  project: ProjectV2,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const f of fields) {
    if (f.key in sourceReg.filledContent) {
      result[f.key] = sourceReg.filledContent[f.key] ?? ''
    } else if (f.projectFieldKey) {
      result[f.key] = getProjectFieldValue(project, f.projectFieldKey)
    }
  }
  return result
}

interface BackflowDiff {
  fieldKey: keyof ProjectV2
  label: string
  oldValue: string
  newValue: string
}

function computeDiff(
  fields: TemplateField[],
  project: ProjectV2,
  formValues: Record<string, string>,
): BackflowDiff[] {
  const diffs: BackflowDiff[] = []
  for (const f of fields) {
    if (!f.projectFieldKey) continue
    const submitted = formValues[f.key] ?? ''
    const current = getProjectFieldValue(project, f.projectFieldKey)
    if (submitted && submitted !== current) {
      diffs.push({
        fieldKey: f.projectFieldKey,
        label: f.label,
        oldValue: current,
        newValue: submitted,
      })
    }
  }
  return diffs
}

// ── Step 1: Competition selection ─────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  '报名中': 'bg-emerald-50 text-emerald-600',
  '进行中': 'bg-blue-50 text-blue-600',
  '已结束': 'bg-slate-100 text-slate-400',
}

function CompetitionSelectStep({
  competitions,
  selected,
  onSelect,
  onNext,
}: {
  competitions: CompetitionTemplate[]
  selected: CompetitionTemplate | null
  onSelect: (c: CompetitionTemplate) => void
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
              isSelected
                ? 'border-brand-blue bg-brand-blue/5'
                : isAvailable
                  ? 'border-slate-200 hover:border-slate-300'
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
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', STATUS_COLOR[comp.status])}>
                    {comp.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{comp.summary}</p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  截止 {comp.deadline} · {comp.track}
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

// ── Step 2: Fill template form ────────────────────────────────────────────────

const INPUT_CLS =
  'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white'

function FormField({
  field,
  value,
  onChange,
}: {
  field: TemplateField
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-600">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {field.type === 'textarea' ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn(INPUT_CLS, 'resize-none')}
        />
      ) : field.type === 'select' ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLS}>
          <option value="">请选择</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={INPUT_CLS}
        />
      )}
    </div>
  )
}

function FormStep({
  comp,
  values,
  onChange,
  onBack,
  onSubmit,
  submitting,
  sourceRegName,
}: {
  comp: CompetitionTemplate
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  sourceRegName?: string
}) {
  return (
    <div className="space-y-5">
      {sourceRegName ? (
        <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2 border border-amber-100">
          <History className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>已从报名实例「{sourceRegName}」预填，请核对并按本次赛事要求修改。</span>
        </div>
      ) : (
        <div className="bg-brand-blue/5 rounded-xl p-3 text-xs text-brand-blue flex items-start gap-2">
          <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>以下字段已从项目信息预填，请核对并按赛事要求修改。</span>
        </div>
      )}

      <div className="glass-card p-5 space-y-4">
        {comp.fields.map((field) => (
          <FormField
            key={field.key}
            field={field}
            value={values[field.key] ?? ''}
            onChange={(v) => onChange(field.key, v)}
          />
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 重新选择赛事
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
        >
          <Check className="w-4 h-4" /> {submitting ? '提交中…' : '提交报名'}
        </button>
      </div>
    </div>
  )
}

// ── Backflow dialog ───────────────────────────────────────────────────────────

function BackflowDialog({
  diffs,
  checked,
  onToggle,
  onConfirm,
  onSkip,
}: {
  diffs: BackflowDiff[]
  checked: Set<string>
  onToggle: (key: string) => void
  onConfirm: () => void
  onSkip: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800">回流确认</p>
            <p className="text-sm text-slate-500 mt-0.5">
              本次报名内容与项目当前信息存在差异，勾选要同步回项目的维度
            </p>
          </div>
        </div>

        {diffs.length === 0 ? (
          <div className="py-4 text-center text-sm text-slate-400">
            填写内容与项目当前信息一致，无需回流
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {diffs.map((d) => {
              const isChecked = checked.has(d.fieldKey as string)
              return (
                <button
                  key={d.fieldKey as string}
                  onClick={() => onToggle(d.fieldKey as string)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3',
                    isChecked
                      ? 'border-brand-blue bg-brand-blue/5'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <span className="mt-0.5 flex-shrink-0 text-brand-blue">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0 text-sm">
                    <p className="font-semibold text-slate-700">{d.label}</p>
                    <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="line-through">{d.oldValue || '（空）'}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-emerald-600 font-semibold">{d.newValue}</span>
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <p className="text-xs text-slate-400">
          赛事专属附件和排版仅保留在报名实例中，不会回流至项目。
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            不同步，直接完成
          </button>
          <button
            onClick={onConfirm}
            disabled={diffs.length > 0 && checked.size === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-40 transition-colors"
          >
            <Check className="w-4 h-4" />
            {diffs.length === 0 ? '完成' : '同步选中维度'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Step = 'select' | 'form' | 'backflow' | 'done'

const STEP_LABELS = ['选择赛事', '填写报名表', '提交完成']

export default function ProjectApplyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromRegId = searchParams.get('fromReg')
  const { projects, registrations, competitions, addRegistration, updateProject, recordApply } =
    useProjectDashboardStore()

  const project = projects.find((p) => p.id === id)
  const sourceReg = fromRegId ? registrations.find((r) => r.id === fromRegId) : null

  const [step, setStep] = useState<Step>('select')
  const [selectedComp, setSelectedComp] = useState<CompetitionTemplate | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [diffs, setDiffs] = useState<BackflowDiff[]>([])
  const [checkedDiffs, setCheckedDiffs] = useState<Set<string>>(new Set())

  if (!project) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
        <p className="text-sm">项目不存在</p>
        <button onClick={() => navigate('/project')} className="text-sm text-brand-blue hover:underline">
          返回
        </button>
      </div>
    )
  }

  function handleToForm() {
    if (!selectedComp) return
    const filled = sourceReg
      ? prefillFromRegistration(selectedComp.fields, sourceReg, project!)
      : prefillFromProject(selectedComp.fields, project!)
    setFormValues(filled)
    setStep('form')
  }

  function handleFormChange(key: string, value: string) {
    setFormValues((v) => ({ ...v, [key]: value }))
  }

  function handleSubmitForm() {
    if (!selectedComp || !project) return
    setSubmitting(true)

    setTimeout(() => {
      const newRegId = `reg-${Date.now()}`

      const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
      addRegistration({
        id: newRegId,
        projectId: project.id,
        competitionId: selectedComp.id,
        competitionName: selectedComp.name,
        track: selectedComp.track,
        filledContent: { ...formValues },
        submittedAt: new Date().toISOString(),
        status: '待审核',
        phases: [
          { label: '报名受理', status: 'active', date: today, description: '材料已提交，等待赛事方审核通过。' },
          { label: '初赛', status: 'upcoming' },
          { label: '决赛', status: 'upcoming' },
          { label: '颁奖', status: 'upcoming' },
        ],
      })

      const snapshot = {
        teamSize: project.teamSize,
        fundingAmount: project.fundingAmount,
        patentCount: project.patentCount,
        maturityLevel: project.maturityLevel,
        businessScope: project.businessScope,
      }
      recordApply(project.id, newRegId, selectedComp.name, snapshot)

      const d = computeDiff(selectedComp.fields, project, formValues)
      setDiffs(d)
      setCheckedDiffs(new Set(d.map((x) => x.fieldKey as string)))
      setSubmitting(false)
      setStep('backflow')
    }, 1000)
  }

  function handleBackflowConfirm() {
    if (!project) return
    const patch: Record<string, unknown> = {}
    for (const diff of diffs) {
      if (!checkedDiffs.has(diff.fieldKey as string)) continue
      const key = diff.fieldKey as string
      const val = diff.newValue
      if (key === 'teamSize') patch[key] = parseInt(val) || project.teamSize
      else if (key === 'fundingAmount') patch[key] = parseFloat(val) || project.fundingAmount
      else if (key === 'patentCount') patch[key] = parseInt(val) || project.patentCount
      else patch[key] = val
    }
    updateProject(project.id, patch as Partial<ProjectV2>)
    setStep('done')
  }

  function toggleDiff(key: string) {
    setCheckedDiffs((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const stepIndex = step === 'select' ? 0 : step === 'form' ? 1 : 2

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            step === 'form' ? setStep('select') : navigate(`/project/${id}`)
          }
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800">报名赛事</h1>
          <p className="text-sm text-slate-400">{project.displayName}</p>
        </div>
      </div>

      {/* Step indicator */}
      {step !== 'done' && (
        <div className="flex items-center gap-2">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all',
                  stepIndex === i
                    ? 'bg-brand-blue text-white'
                    : stepIndex > i
                      ? 'text-emerald-600'
                      : 'text-slate-400',
                )}
              >
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
          competitions={competitions}
          selected={selectedComp}
          onSelect={setSelectedComp}
          onNext={handleToForm}
        />
      )}

      {step === 'form' && selectedComp && (
        <FormStep
          comp={selectedComp}
          values={formValues}
          onChange={handleFormChange}
          onBack={() => setStep('select')}
          onSubmit={handleSubmitForm}
          submitting={submitting}
          sourceRegName={sourceReg?.competitionName}
        />
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center py-16 gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-slate-800">报名成功！</p>
            <p className="text-sm text-slate-400 mt-1">报名实例已创建，等待赛事方审核</p>
          </div>
          <button
            onClick={() => navigate(`/project/${id}`)}
            className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
          >
            返回项目主页
          </button>
        </div>
      )}

      {/* Backflow dialog */}
      {step === 'backflow' && (
        <BackflowDialog
          diffs={diffs}
          checked={checkedDiffs}
          onToggle={toggleDiff}
          onConfirm={handleBackflowConfirm}
          onSkip={() => setStep('done')}
        />
      )}
    </div>
  )
}
