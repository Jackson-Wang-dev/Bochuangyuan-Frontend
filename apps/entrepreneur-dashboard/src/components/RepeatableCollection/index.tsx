import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ChevronDown, ChevronUp, Plus, Pencil, Trash2,
  ShieldCheck, X, Check, AlertCircle,
} from 'lucide-react'
import type { CollectionSchema, FieldSchema } from '@/types/collectionSchemas'
import type { CollectionItem } from '@/types/project'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function computeAge(birthDate: string): number {
  const b = new Date(birthDate)
  const t = new Date()
  let age = t.getFullYear() - b.getFullYear()
  if (
    t.getMonth() < b.getMonth() ||
    (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())
  ) age--
  // Guard against Invalid Date (NaN) or negative ages
  return Number.isFinite(age) ? Math.max(0, age) : 0
}

function buildBlank(schema: CollectionSchema): Record<string, unknown> {
  const obj: Record<string, unknown> = { _id: genId() }
  for (const f of schema.fields) {
    if (f.hidden) {
      // System-managed fields: initialize with declared defaultValue
      obj[f.key] = f.defaultValue ?? (f.type === 'boolean' ? false : f.type === 'number' ? 0 : '')
      continue
    }
    if (f.type === 'boolean') { obj[f.key] = false; continue }
    if (f.type === 'number') { obj[f.key] = f.nullable ? null : ''; continue }
    obj[f.key] = f.nullable ? null : ''
  }
  return obj
}

function cellText(field: FieldSchema, raw: unknown): string {
  if (raw === null) return field.nullLabel ?? '至今'
  if (raw === undefined || raw === '') return '—'
  if (field.type === 'boolean') return raw ? '是' : '否'
  return String(raw)
}

// ─── FieldInput ───────────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  hasError,
  onChange,
}: {
  field: FieldSchema
  value: unknown
  hasError: boolean
  onChange: (key: string, val: unknown) => void
}) {
  const inputCls = cn(
    'w-full bg-white border rounded-xl px-4 py-2.5 text-sm outline-none transition-all',
    hasError
      ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
      : 'border-slate-200 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/40',
  )

  if (field.readonly) {
    return (
      <div className="flex items-center gap-2 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-400">
        <span>{value !== '' && value !== null && value !== undefined ? String(value) : '—'}</span>
      </div>
    )
  }

  // Nullable field: "至今" / "不适用" checkbox + conditional input
  if (field.nullable) {
    const isNull = value === null
    const checkLabel = field.nullLabel === '—' ? '不适用' : (field.nullLabel ?? '至今')
    const inputType =
      field.type === 'month' ? 'month' : field.type === 'date' ? 'date' : 'number'
    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isNull}
            onChange={(e) => onChange(field.key, e.target.checked ? null : '')}
            className="w-4 h-4 rounded accent-brand-blue"
          />
          {checkLabel}
        </label>
        {!isNull && (
          <input
            type={inputType}
            value={value === null || value === undefined ? '' : String(value)}
            onChange={(e) => {
              const v = e.target.value
              onChange(field.key, field.type === 'number' ? (v === '' ? '' : Number(v)) : v)
            }}
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
            className={inputCls}
          />
        )}
      </div>
    )
  }

  if (field.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 py-1 text-sm text-slate-700 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(field.key, e.target.checked)}
          className="w-4 h-4 rounded accent-brand-blue"
        />
        {Boolean(value) ? '是' : '否'}
      </label>
    )
  }

  if (field.type === 'select') {
    return (
      <select
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={inputCls}
      >
        <option value="">请选择…</option>
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )
  }

  if (field.type === 'textarea') {
    const strVal = typeof value === 'string' ? value : ''
    const hasLimit = field.maxLength !== undefined
    const nearLimit = hasLimit && strVal.length > field.maxLength! * 0.85
    return (
      <div className="relative">
        <textarea
          value={strVal}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          rows={3}
          className={cn(inputCls, 'resize-none leading-relaxed', hasLimit && 'pb-7')}
        />
        {hasLimit && (
          <span className={cn(
            'absolute bottom-2.5 right-3 text-xs pointer-events-none select-none',
            nearLimit ? 'text-amber-500' : 'text-slate-300',
          )}>
            {strVal.length}/{field.maxLength}
          </span>
        )}
      </div>
    )
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        value={value === '' || value === null || value === undefined ? '' : String(value)}
        onChange={(e) => onChange(field.key, e.target.value === '' ? '' : Number(e.target.value))}
        min={field.min}
        max={field.max}
        placeholder={field.placeholder}
        className={inputCls}
      />
    )
  }

  // text · phone · date · month
  const htmlType =
    field.type === 'phone' ? 'tel'
    : field.type === 'date' ? 'date'
    : field.type === 'month' ? 'month'
    : 'text'

  return (
    <input
      type={htmlType}
      value={(value as string) ?? ''}
      onChange={(e) => onChange(field.key, e.target.value)}
      placeholder={field.placeholder}
      maxLength={field.maxLength}
      className={inputCls}
    />
  )
}

// ─── CollectionItemDialog ─────────────────────────────────────────────────────

function CollectionItemDialog({
  schema,
  mode,
  initial,
  onClose,
  onSave,
}: {
  schema: CollectionSchema
  mode: 'add' | 'edit'
  initial: Record<string, unknown>
  onClose: () => void
  onSave: (item: Record<string, unknown>) => void
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...initial })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [attempted, setAttempted] = useState(false)

  // Visible fields only — hidden fields are data-only, never rendered
  const visibleFields = schema.fields.filter((f) => !f.hidden)

  function validate(data: Record<string, unknown>): Record<string, string> {
    const errs: Record<string, string> = {}
    for (const f of visibleFields) {
      if (f.readonly || f.type === 'boolean') continue
      if (!f.required) continue
      const v = data[f.key]
      if (v === '' || v === null || v === undefined) {
        errs[f.key] = `请填写${f.label}`
      }
    }
    return errs
  }

  function handleChange(key: string, val: unknown) {
    const next = { ...draft, [key]: val }
    // Auto-derive age when birthDate changes (TeamMember only — 'age' key guard)
    if (key === 'birthDate' && typeof val === 'string' && 'age' in draft) {
      next['age'] = val ? computeAge(val) : 0
    }
    setDraft(next)
    if (attempted) setErrors(validate(next))
  }

  function handleSave() {
    setAttempted(true)
    const errs = validate(draft)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    // Normalize: nullable fields left unchecked but empty → null (not '')
    const normalized = { ...draft }
    for (const f of visibleFields) {
      if (f.nullable && normalized[f.key] === '') {
        normalized[f.key] = null
      }
    }
    onSave(normalized)
  }

  return (
    // Overlay: click outside the card to close
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[76vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-sm font-semibold text-slate-800">
            {mode === 'add' ? `新增${schema.label}` : `编辑${schema.label}`}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
            {visibleFields.map((f) => {
              const isWide = f.type === 'textarea' || (f.type === 'boolean' && !f.readonly)
              const val = draft[f.key] ?? (f.nullable ? null : f.type === 'boolean' ? false : '')
              const err = errors[f.key]
              return (
                <div key={f.key} className={isWide ? 'sm:col-span-2' : ''}>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      {f.label}
                      {f.required && !f.readonly && (
                        <span className="text-rose-500 ml-0.5">*</span>
                      )}
                    </label>
                    {f.readonly && (
                      <span className="text-xs text-slate-300">（自动计算）</span>
                    )}
                    {f.needsVerification && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full leading-none">
                        <ShieldCheck className="w-3 h-3" />
                        需验证
                      </span>
                    )}
                  </div>

                  <FieldInput
                    field={f}
                    value={val}
                    hasError={Boolean(err)}
                    onChange={handleChange}
                  />

                  {err ? (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {err}
                    </p>
                  ) : f.hint ? (
                    <p className="mt-1 text-xs text-slate-400">{f.hint}</p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-slate-100">
          {Object.keys(errors).length > 0 && attempted && (
            <p className="text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              请填写所有必填项
            </p>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-sm bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 font-medium transition-all"
            >
              <Check className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── RepeatableCollection ─────────────────────────────────────────────────────

interface Props {
  schema: CollectionSchema
  items: CollectionItem[]
  onChange: (newItems: CollectionItem[]) => void
  readOnly?: boolean
  defaultExpanded?: boolean
}

export default function RepeatableCollection({
  schema,
  items,
  onChange,
  readOnly = false,
  defaultExpanded = true,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [dialog, setDialog] = useState<{
    mode: 'add' | 'edit'
    item: Record<string, unknown>
  } | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const tableCols = schema.fields.filter((f) => f.showInTable && !f.hidden)
  const atMax = schema.maxItems !== undefined && items.length >= schema.maxItems
  const belowMin = schema.minItems !== undefined && items.length < schema.minItems

  function openAdd() {
    setPendingDeleteId(null)
    setDialog({ mode: 'add', item: buildBlank(schema) })
  }

  function openEdit(row: Record<string, unknown>) {
    setPendingDeleteId(null)
    setDialog({ mode: 'edit', item: { ...row } })
  }

  function handleDeleteClick(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (pendingDeleteId === id) {
      onChange(items.filter((it) => it._id !== id))
      setPendingDeleteId(null)
    } else {
      setPendingDeleteId(id)
    }
  }

  function handleSave(data: Record<string, unknown>) {
    const asItem = data as unknown as CollectionItem
    if (dialog?.mode === 'add') {
      onChange([...items, asItem])
    } else {
      onChange(items.map((it) => (it._id === asItem._id ? asItem : it)))
    }
    setDialog(null)
  }

  return (
    <>
      <div
        className="border border-slate-200 rounded-2xl bg-white overflow-hidden"
        onClick={() => pendingDeleteId && setPendingDeleteId(null)}
      >
        {/* Aggregate header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none hover:bg-slate-50/80 transition-colors"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-2">
            {expanded
              ? <ChevronUp className="w-4 h-4 text-slate-400" />
              : <ChevronDown className="w-4 h-4 text-slate-400" />}
            <span className="text-sm font-semibold text-slate-700">{schema.aggregateLabel}</span>
            <span className="text-sm text-slate-400">（{items.length}）</span>
            {belowMin && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                至少 {schema.minItems} 条
              </span>
            )}
            {schema.maxItems !== undefined && (
              <span className="text-xs text-slate-300">上限 {schema.maxItems}</span>
            )}
          </div>

          {!readOnly && (
            <button
              onClick={(e) => { e.stopPropagation(); openAdd() }}
              disabled={atMax}
              className={cn(
                'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all',
                atMax
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-brand-blue bg-brand-blue/8 hover:bg-brand-blue/15',
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              新增
            </button>
          )}
        </div>

        {/* Content */}
        {expanded && (
          items.length === 0 ? (
            <div className="border-t border-slate-100 py-9 text-center text-sm text-slate-400">
              暂无{schema.label}记录{!readOnly && '，点击右上角"新增"添加'}
            </div>
          ) : (
            <div className="border-t border-slate-100 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    {tableCols.map((f) => (
                      <th
                        key={f.key}
                        className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 whitespace-nowrap"
                      >
                        {f.label}
                        {f.needsVerification && (
                          <ShieldCheck className="inline ml-1 w-3 h-3 text-amber-500" />
                        )}
                      </th>
                    ))}
                    {!readOnly && (
                      <th className="px-4 py-2.5 text-xs font-medium text-slate-500 text-right">
                        操作
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const row = item as unknown as Record<string, unknown>
                    const isPendingDelete = pendingDeleteId === item._id
                    return (
                      <tr
                        key={item._id}
                        className={cn(
                          'border-t border-slate-50 hover:bg-slate-50/60 transition-colors',
                          idx % 2 !== 0 && 'bg-slate-50/30',
                          isPendingDelete && 'bg-rose-50/40',
                        )}
                      >
                        {tableCols.map((f) => (
                          <td key={f.key} className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap max-w-[200px] truncate">
                            {cellText(f, row[f.key])}
                          </td>
                        ))}
                        {!readOnly && (
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {isPendingDelete ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="text-xs text-rose-500">确认删除？</span>
                                <button
                                  onClick={(e) => handleDeleteClick(item._id, e)}
                                  className="text-xs text-white bg-rose-500 hover:bg-rose-600 px-2.5 py-1 rounded-lg transition-all"
                                >
                                  确认
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setPendingDeleteId(null) }}
                                  className="text-xs text-slate-500 border border-slate-200 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-all"
                                >
                                  取消
                                </button>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEdit(row) }}
                                  className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/8 rounded-lg transition-all"
                                  title="编辑"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteClick(item._id, e)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                  title="删除"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <AnimatePresence>
        {dialog && (
          <CollectionItemDialog
            schema={schema}
            mode={dialog.mode}
            initial={dialog.item}
            onClose={() => setDialog(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </>
  )
}
