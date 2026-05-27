import { nanoid } from 'nanoid'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { FormField, FieldOption, ReviewPhaseConfig } from '@bochuangyuan/types'
import { useFormBuilderStore } from './useFormBuilderStore'
import type { BuilderMode } from './types'
import { cn } from '../../lib/cn'

interface Props {
  mode: BuilderMode
  readOnly?: boolean
}

export function FieldEditor({ mode, readOnly }: Props) {
  const {
    fields,
    selectedFieldId,
    phases,
    selectedPhase,
    formName,
    formDescription,
    updateField,
    setFormMeta,
    updatePhaseConfig,
    autoBalanceWeights,
  } = useFormBuilderStore()

  const field = selectedFieldId ? fields.find((f) => f.id === selectedFieldId) : null
  const phase = selectedPhase ? phases.find((p) => p.phase === selectedPhase) : null

  if (mode === 'review') {
    if (phase) {
      return <PhaseEditor phase={phase} readOnly={readOnly} onUpdate={updatePhaseConfig} onBalance={() => autoBalanceWeights(phase.phase)} />
    }
    return (
      <div className="p-4 text-sm text-slate-400 text-center mt-8">
        点击左侧阶段区块选择，或在画布中选择维度
      </div>
    )
  }

  if (field) {
    return (
      <FieldEditPanel
        key={field.id}
        field={field}
        readOnly={readOnly}
        onUpdate={(patch) => updateField(field.id, patch)}
      />
    )
  }

  return (
    <FormMetaEditor
      name={formName}
      description={formDescription}
      readOnly={readOnly}
      onChange={setFormMeta}
    />
  )
}

// ─── Form meta (no field selected) ───────────────────────────────────────────

function FormMetaEditor({
  name,
  description,
  readOnly,
  onChange,
}: {
  name: string
  description: string
  readOnly?: boolean
  onChange: (name: string, description: string) => void
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">表单属性</h3>
      <label className="block space-y-1">
        <span className="text-sm font-semibold text-slate-700">表单名称</span>
        <input
          disabled={readOnly}
          value={name}
          onChange={(e) => onChange(e.target.value, description)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-semibold text-slate-700">表单描述</span>
        <textarea
          disabled={readOnly}
          value={description}
          onChange={(e) => onChange(name, e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
          placeholder="选填"
        />
      </label>
    </div>
  )
}

// ─── Single field editor ──────────────────────────────────────────────────────

function FieldEditPanel({
  field,
  readOnly,
  onUpdate,
}: {
  field: FormField
  readOnly?: boolean
  onUpdate: (patch: Partial<FormField>) => void
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">字段属性</h3>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-slate-700">
          标题 <span className="text-red-500">*</span>
        </span>
        <input
          disabled={readOnly}
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-slate-700">说明文字</span>
        <input
          disabled={readOnly}
          value={field.description ?? ''}
          onChange={(e) => onUpdate({ description: e.target.value || undefined })}
          placeholder="选填"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
        />
      </label>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          disabled={readOnly}
          type="checkbox"
          checked={field.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="w-4 h-4 accent-[#0045c4]"
        />
        <span className="text-sm font-semibold text-slate-700">必填</span>
      </label>

      {(field.type === 'text' || field.type === 'textarea') && (
        <TextValidation field={field} readOnly={readOnly} onUpdate={onUpdate} />
      )}
      {field.type === 'number' && (
        <NumberValidation field={field} readOnly={readOnly} onUpdate={onUpdate} />
      )}
      {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
        <OptionsEditor field={field} readOnly={readOnly} onUpdate={onUpdate} />
      )}

      <p className="text-xs text-slate-300 font-mono pt-2 border-t border-slate-100">
        ID: {field.id}
      </p>
    </div>
  )
}

function TextValidation({
  field,
  readOnly,
  onUpdate,
}: {
  field: FormField
  readOnly?: boolean
  onUpdate: (p: Partial<FormField>) => void
}) {
  const v = field.validation ?? {}
  const set = (patch: typeof v) => onUpdate({ validation: { ...v, ...patch } })

  return (
    <div className="space-y-3 border-t border-slate-100 pt-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">字符限制</p>
      <div className="flex gap-2">
        <label className="flex-1 space-y-1">
          <span className="text-xs text-slate-500">最小字符数</span>
          <input
            disabled={readOnly}
            type="number"
            min={0}
            value={v.min ?? ''}
            onChange={(e) => set({ min: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
          />
        </label>
        <label className="flex-1 space-y-1">
          <span className="text-xs text-slate-500">最大字符数</span>
          <input
            disabled={readOnly}
            type="number"
            min={0}
            value={v.max ?? ''}
            onChange={(e) => set({ max: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
          />
        </label>
      </div>
    </div>
  )
}

function NumberValidation({
  field,
  readOnly,
  onUpdate,
}: {
  field: FormField
  readOnly?: boolean
  onUpdate: (p: Partial<FormField>) => void
}) {
  const v = field.validation ?? {}
  const set = (patch: typeof v) => onUpdate({ validation: { ...v, ...patch } })

  return (
    <div className="space-y-3 border-t border-slate-100 pt-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">数值范围</p>
      <div className="flex gap-2">
        <label className="flex-1 space-y-1">
          <span className="text-xs text-slate-500">最小值</span>
          <input
            disabled={readOnly}
            type="number"
            value={v.min ?? ''}
            onChange={(e) => set({ min: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
          />
        </label>
        <label className="flex-1 space-y-1">
          <span className="text-xs text-slate-500">最大值</span>
          <input
            disabled={readOnly}
            type="number"
            value={v.max ?? ''}
            onChange={(e) => set({ max: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
          />
        </label>
      </div>
    </div>
  )
}

function OptionsEditor({
  field,
  readOnly,
  onUpdate,
}: {
  field: FormField
  readOnly?: boolean
  onUpdate: (p: Partial<FormField>) => void
}) {
  const options: FieldOption[] = field.options ?? []

  const addOption = () => {
    onUpdate({
      options: [...options, { label: `选项${options.length + 1}`, value: `option_${nanoid(6)}` }],
    })
  }

  const updateOption = (idx: number, patch: Partial<FieldOption>) => {
    onUpdate({ options: options.map((o, i) => (i === idx ? { ...o, ...patch } : o)) })
  }

  const removeOption = (idx: number) => {
    onUpdate({ options: options.filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-2 border-t border-slate-100 pt-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">选项列表</p>
      {options.map((opt, i) => (
        <div key={opt.value} className="flex items-center gap-2 group">
          {!readOnly && (
            <GripVertical className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 cursor-grab" />
          )}
          <input
            disabled={readOnly}
            value={opt.label}
            onChange={(e) => updateOption(i, { label: e.target.value })}
            className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
          />
          {!readOnly && (
            <button
              onClick={() => removeOption(i)}
              className="p-1 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          onClick={addOption}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#0045c4] hover:opacity-70 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          添加选项
        </button>
      )}
    </div>
  )
}

// ─── Phase config editor (review mode) ───────────────────────────────────────

function PhaseEditor({
  phase,
  readOnly,
  onUpdate,
  onBalance,
}: {
  phase: ReviewPhaseConfig
  readOnly?: boolean
  onUpdate: (p: ReviewPhaseConfig['phase'], patch: Partial<Omit<ReviewPhaseConfig, 'phase' | 'dimensions'>>) => void
  onBalance: () => void
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{phase.label} · 阶段设置</h3>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          disabled={readOnly}
          type="checkbox"
          checked={phase.enabled}
          onChange={(e) => onUpdate(phase.phase, { enabled: e.target.checked })}
          className="w-4 h-4 accent-[#0045c4]"
        />
        <span className="text-sm font-semibold text-slate-700">开启此阶段</span>
      </label>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          disabled={readOnly}
          type="checkbox"
          checked={phase.commentsRequired}
          onChange={(e) => onUpdate(phase.phase, { commentsRequired: e.target.checked })}
          className="w-4 h-4 accent-[#0045c4]"
        />
        <span className="text-sm font-semibold text-slate-700">必须填写评语</span>
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-slate-700">截止时间</span>
        <input
          disabled={readOnly}
          type="datetime-local"
          value={phase.deadline ? phase.deadline.slice(0, 16) : ''}
          onChange={(e) =>
            onUpdate(phase.phase, { deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })
          }
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-semibold text-slate-700">晋级名额</span>
        <input
          disabled={readOnly}
          type="number"
          min={0}
          value={phase.advanceQuota ?? ''}
          onChange={(e) =>
            onUpdate(phase.phase, { advanceQuota: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="不限"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
        />
      </label>

      {!readOnly && (
        <button
          onClick={onBalance}
          className="w-full rounded-xl border border-[#0045c4]/30 bg-[#0045c4]/5 py-2 text-sm font-semibold text-[#0045c4] hover:bg-[#0045c4]/10 transition-colors"
        >
          自动平均分配权重
        </button>
      )}
    </div>
  )
}
