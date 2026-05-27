import {
  Type,
  AlignLeft,
  Hash,
  Calendar,
  ChevronDown,
  CircleDot,
  CheckSquare,
  Plus,
} from 'lucide-react'
import type { FieldType } from '@bochuangyuan/types'
import type { BuilderMode } from './types'
import { useFormBuilderStore } from './useFormBuilderStore'
import { cn } from '../../lib/cn'

interface PaletteItem {
  type: FieldType
  label: string
  icon: React.FC<{ className?: string }>
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'text',     label: '单行文本', icon: Type },
  { type: 'textarea', label: '多行文本', icon: AlignLeft },
  { type: 'number',   label: '数字',     icon: Hash },
  { type: 'date',     label: '日期',     icon: Calendar },
  { type: 'select',   label: '下拉选择', icon: ChevronDown },
  { type: 'radio',    label: '单选',     icon: CircleDot },
  { type: 'checkbox', label: '多选',     icon: CheckSquare },
]

interface Props {
  mode: BuilderMode
  readOnly?: boolean
}

export function FieldPalette({ mode, readOnly }: Props) {
  const addField = useFormBuilderStore((s) => s.addField)
  const addDimension = useFormBuilderStore((s) => s.addDimension)
  const phases = useFormBuilderStore((s) => s.phases)

  if (mode === 'review') {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          评审阶段
        </p>
        {phases.map((p) => (
          <button
            key={p.phase}
            disabled={readOnly}
            onClick={() => !readOnly && addDimension(p.phase)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-slate-600 hover:border-[#0045c4] hover:text-[#0045c4] transition-colors',
              readOnly && 'opacity-50 cursor-not-allowed',
            )}
          >
            <Plus className="w-4 h-4" />
            {p.label} · 添加维度
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
        字段类型
      </p>
      {PALETTE_ITEMS.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          disabled={readOnly}
          onClick={() => !readOnly && addField(type)}
          draggable={!readOnly}
          onDragStart={(e) => {
            e.dataTransfer.setData('fieldType', type)
          }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-[#0045c4] hover:text-[#0045c4] hover:bg-[#0045c4]/5 transition-all cursor-grab active:cursor-grabbing select-none',
            readOnly && 'opacity-50 cursor-not-allowed',
          )}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </button>
      ))}
    </div>
  )
}
