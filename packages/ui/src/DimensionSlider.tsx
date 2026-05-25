import type { ScoreDimension } from '@bochuangyuan/types'
import { cn } from './lib/cn'

interface DimensionSliderProps {
  dimension: ScoreDimension
  readonly?: boolean
  onChange?: (key: string, score: number) => void
}

export function DimensionSlider({ dimension, readonly = false, onChange }: DimensionSliderProps) {
  const { key, label, score, weight, comment } = dimension

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="text-xs text-slate-400">权重 {weight}%</span>
        </div>
        <span className={cn('text-lg font-black tabular-nums', score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-blue-600' : 'text-orange-500')}>
          {score}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={score}
        disabled={readonly}
        onChange={(e) => onChange?.(key, Number(e.target.value))}
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer',
          'bg-gradient-to-r from-blue-200 to-blue-500',
          readonly && 'opacity-60 cursor-default',
        )}
        style={{ '--tw-gradient-to-position': `${score}%` } as React.CSSProperties}
      />
      {comment !== undefined && (
        <input
          type="text"
          value={comment}
          disabled={readonly}
          placeholder="可填写此维度备注（选填）"
          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50"
        />
      )}
    </div>
  )
}
