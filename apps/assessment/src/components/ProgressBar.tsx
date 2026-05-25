interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.round((current / total) * 100)

  return (
    <div className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-white/80 font-medium">创业旅程</span>
        <span className="text-sm text-white font-bold font-display">
          {current} / {total}
        </span>
      </div>
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
