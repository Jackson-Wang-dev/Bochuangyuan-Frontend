interface ReviewProgressProps {
  total: number
  done: number
}

export function ReviewProgress({ total, done }: ReviewProgressProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-slate-700">评审进度</span>
          <span className="text-slate-500">{done} / {total} 项</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-blue rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-2xl font-black text-brand-blue tabular-nums">{pct}%</span>
    </div>
  )
}
