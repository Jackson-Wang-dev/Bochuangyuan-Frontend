import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DimensionItem {
  key: string
  label: string
  weight: number
  description?: string
}

interface DimensionEditorProps {
  dimensions: DimensionItem[]
  onChange: (dims: DimensionItem[]) => void
}

export function DimensionEditor({ dimensions, onChange }: DimensionEditorProps) {
  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0)
  const isValid = totalWeight === 100

  const add = () => {
    onChange([...dimensions, { key: `dim-${Date.now()}`, label: '', weight: 0, description: '' }])
  }

  const remove = (key: string) => {
    onChange(dimensions.filter((d) => d.key !== key))
  }

  const update = (key: string, field: keyof DimensionItem, value: string | number) => {
    onChange(dimensions.map((d) => d.key === key ? { ...d, [field]: value } : d))
  }

  return (
    <div className="space-y-3">
      {dimensions.map((dim, i) => (
        <div key={dim.key} className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 w-6 flex-shrink-0">#{i + 1}</span>
            <input
              type="text"
              value={dim.label}
              onChange={(e) => update(dim.key, 'label', e.target.value)}
              placeholder="维度名称（如：技术成熟度）"
              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
            <div className="flex items-center gap-1 w-24 flex-shrink-0">
              <input
                type="number"
                min={0}
                max={100}
                value={dim.weight}
                onChange={(e) => update(dim.key, 'weight', Number(e.target.value))}
                className="w-16 text-sm border border-slate-200 rounded-lg px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
              <span className="text-xs text-slate-400">%</span>
            </div>
            <button
              onClick={() => remove(dim.key)}
              className="text-slate-300 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={dim.description ?? ''}
            onChange={(e) => update(dim.key, 'description', e.target.value)}
            placeholder="打分说明（选填，下发给评委展示）"
            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-500 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 ml-9"
          />
        </div>
      ))}

      <div className="flex items-center justify-between">
        <button
          onClick={add}
          className="flex items-center gap-2 text-sm text-brand-blue font-semibold hover:text-brand-blue/70 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加维度
        </button>

        <div className={cn('flex items-center gap-1.5 text-sm font-semibold', isValid ? 'text-emerald-600' : 'text-orange-500')}>
          {!isValid && <AlertCircle className="w-4 h-4" />}
          权重合计：{totalWeight}%{isValid ? ' ✓' : '（需等于 100%）'}
        </div>
      </div>
    </div>
  )
}
