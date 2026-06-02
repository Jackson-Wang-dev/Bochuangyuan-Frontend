// ProgressBar is no longer used as a standalone component — the top bar in
// Quiz.tsx now owns the segmented progress row. This stub is kept so that any
// existing imports don't break during the migration.

interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-1 px-5 py-3">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < current ? 'bg-[#0045c4]' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  )
}
