import { useState } from 'react'
import { X } from 'lucide-react'
import type { FormField, ReviewRuleSchema } from '@bochuangyuan/types'
import type { BuilderMode } from './types'
import { useFormBuilderStore } from './useFormBuilderStore'
import { cn } from '../../lib/cn'

interface Props {
  mode: BuilderMode
  open: boolean
  onClose: () => void
}

export function FormPreviewModal({ mode, open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <span className="font-bold text-slate-800">
            {mode === 'form' ? '填写预览' : '专家视角预览'}
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'form' ? <FormPreview /> : <ReviewPreview />}
        </div>
      </div>
    </div>
  )
}

function FormPreview() {
  const { fields, formName, formDescription } = useFormBuilderStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800">{formName}</h2>
        {formDescription && <p className="text-sm text-slate-500 mt-1">{formDescription}</p>}
      </div>
      {fields.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">暂无字段</p>
      )}
      {fields.map((field) => (
        <PreviewField key={field.id} field={field} />
      ))}
      {fields.length > 0 && (
        <button className="w-full rounded-xl bg-[#0045c4] text-white font-bold py-3 text-sm hover:bg-[#0045c4]/90 transition-colors">
          提交
        </button>
      )}
    </div>
  )
}

function PreviewField({ field }: { field: FormField }) {
  const [value, setValue] = useState<string | string[]>(
    field.type === 'checkbox' ? [] : '',
  )

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-800 flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>
      {field.description && <p className="text-xs text-slate-400">{field.description}</p>}
      <PreviewInput field={field} value={value} onChange={setValue} />
    </div>
  )
}

function PreviewInput({
  field,
  value,
  onChange,
}: {
  field: FormField
  value: string | string[]
  onChange: (v: string | string[]) => void
}) {
  const base = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#0045c4]'

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || '请输入…'}
          className={base}
        />
      )
    case 'textarea':
      return (
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || '请输入…'}
          rows={4}
          className={cn(base, 'resize-none')}
        />
      )
    case 'number':
      return (
        <input
          type="number"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || '请输入数字…'}
          className={base}
        />
      )
    case 'date':
      return (
        <input
          type="date"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )
    case 'select':
      return (
        <select value={value as string} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="">{field.placeholder || '请选择…'}</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )
    case 'radio':
      return (
        <div className="space-y-2">
          {(field.options ?? []).map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="radio"
                checked={value === o.value}
                onChange={() => onChange(o.value)}
                className="accent-[#0045c4]"
              />
              {o.label}
            </label>
          ))}
        </div>
      )
    case 'checkbox':
      return (
        <div className="space-y-2">
          {(field.options ?? []).map((o) => {
            const checked = (value as string[]).includes(o.value)
            return (
              <label key={o.value} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const arr = value as string[]
                    onChange(checked ? arr.filter((v) => v !== o.value) : [...arr, o.value])
                  }}
                  className="accent-[#0045c4]"
                />
                {o.label}
              </label>
            )
          })}
        </div>
      )
    default:
      return null
  }
}

function ReviewPreview() {
  const { phases } = useFormBuilderStore()

  return (
    <div className="space-y-6">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">专家打分视角（模拟）</p>
      {phases.filter((p) => p.enabled).map((phase) => (
        <div key={phase.phase} className="space-y-4">
          <h3 className="font-bold text-slate-700 text-sm">{phase.label}</h3>
          {phase.dimensions.map((dim) => (
            <div key={dim.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  {dim.label}
                  <span className="ml-1.5 text-xs font-normal text-slate-400">
                    权重 {dim.weight}% · 满分 {dim.maxScore}
                  </span>
                </span>
                <span className="text-sm font-bold text-[#0045c4]">0 分</span>
              </div>
              <input
                type="range"
                min={0}
                max={dim.maxScore}
                defaultValue={0}
                className="w-full accent-[#0045c4]"
              />
              {dim.description && (
                <p className="text-xs text-slate-400">{dim.description}</p>
              )}
            </div>
          ))}
          {phase.commentsRequired && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                评语 <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="请填写评审意见…"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#0045c4]"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
