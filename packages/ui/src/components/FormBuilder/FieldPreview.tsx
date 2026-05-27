import type { FormField } from '@bochuangyuan/types'
import { cn } from '../../lib/cn'

interface Props {
  field: FormField
  selected?: boolean
  onClick?: () => void
  readOnly?: boolean
  actions?: React.ReactNode
}

export function FieldPreview({ field, selected, onClick, readOnly, actions }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border-2 p-4 transition-all',
        !readOnly && 'cursor-pointer',
        selected
          ? 'border-[#0045c4] bg-[#0045c4]/5'
          : 'border-slate-200 bg-white hover:border-[#0045c4]/30',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="text-sm font-semibold text-slate-800">{field.label}</span>
          {field.required && <span className="text-red-500 text-sm font-bold">*</span>}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
      {field.description && (
        <p className="text-xs text-slate-400 mb-2">{field.description}</p>
      )}
      <FieldInput field={field} />
    </div>
  )
}

function FieldInput({ field }: { field: FormField }) {
  const baseInput =
    'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 pointer-events-none'

  switch (field.type) {
    case 'text':
      return <input readOnly placeholder={field.placeholder || '请输入…'} className={baseInput} />

    case 'textarea':
      return (
        <textarea
          readOnly
          placeholder={field.placeholder || '请输入…'}
          rows={3}
          className={cn(baseInput, 'resize-none')}
        />
      )

    case 'number':
      return <input readOnly placeholder={field.placeholder || '请输入数字…'} className={baseInput} />

    case 'date':
      return <input readOnly type="date" className={baseInput} />

    case 'select':
      return (
        <select disabled className={baseInput}>
          <option>{field.placeholder || '请选择…'}</option>
          {field.options?.map((o) => (
            <option key={o.value}>{o.label}</option>
          ))}
        </select>
      )

    case 'radio':
      return (
        <div className="space-y-1.5">
          {(field.options ?? []).map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm text-slate-600 cursor-default">
              <input type="radio" readOnly disabled className="accent-[#0045c4]" />
              {o.label}
            </label>
          ))}
        </div>
      )

    case 'checkbox':
      return (
        <div className="space-y-1.5">
          {(field.options ?? []).map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm text-slate-600 cursor-default">
              <input type="checkbox" readOnly disabled className="accent-[#0045c4]" />
              {o.label}
            </label>
          ))}
        </div>
      )

    default:
      return null
  }
}
