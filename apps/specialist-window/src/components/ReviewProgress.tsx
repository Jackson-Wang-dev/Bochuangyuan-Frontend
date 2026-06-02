import { Clock, CheckCircle2, Activity } from 'lucide-react'

interface ReviewProgressProps {
  total: number
  done: number
}

export function ReviewProgress({ total, done }: ReviewProgressProps) {
  const pending = total - done
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="grid grid-cols-3 gap-3.5 mb-5">
      {/* Pending */}
      <div className="glass-card px-[18px] py-4">
        <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted mb-2">
          <Clock className="w-[15px] h-[15px]" />
          待评审
        </div>
        <div className="text-[28px] font-bold tracking-tight leading-none text-ink">
          {pending} <span className="text-[14px] font-medium text-faint">项</span>
        </div>
      </div>

      {/* Done */}
      <div className="glass-card px-[18px] py-4">
        <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted mb-2">
          <CheckCircle2 className="w-[15px] h-[15px]" />
          已完成
        </div>
        <div className="text-[28px] font-bold tracking-tight leading-none text-ink">
          {done} <span className="text-[14px] font-medium text-faint">项</span>
        </div>
      </div>

      {/* Progress accent */}
      <div
        className="rounded-[10px] px-[18px] py-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2B50E2, #3a5bf0)',
          border: '1px solid transparent',
          boxShadow: '0 1px 3px rgb(16 24 40/.07)',
        }}
      >
        <div className="flex items-center gap-1.5 text-[12.5px] font-medium mb-2" style={{ color: '#cdd6fb' }}>
          <Activity className="w-[15px] h-[15px]" />
          评审进度
        </div>
        <div className="text-[28px] font-bold tracking-tight leading-none text-white">
          {pct}<span className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,.7)' }}>%</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.28)' }}>
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
