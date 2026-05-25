import type { AiVersionDiff } from '@bochuangyuan/types'

interface VersionDiffProps {
  diff: AiVersionDiff | null
  isLoading?: boolean
}

export function VersionDiff({ diff, isLoading }: VersionDiffProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-slate-100 rounded-full" />
        ))}
      </div>
    )
  }

  if (!diff) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        请选择两个版本进行对比
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="font-semibold text-slate-700">版本 {diff.versionAId}</span>
        <span className="text-slate-400">→</span>
        <span className="font-semibold text-slate-700">版本 {diff.versionBId}</span>
        <span className={`ml-auto text-xs font-bold ${diff.wordCountDelta >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
          {diff.wordCountDelta >= 0 ? '+' : ''}{diff.wordCountDelta} 字
        </span>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
        <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-2">AI 综合分析</p>
        {diff.analysis}
      </div>

      {diff.improvements.length > 0 && (
        <div className="space-y-1">
          <p className="font-semibold text-xs text-emerald-600 uppercase tracking-wider">改进点</p>
          {diff.improvements.map((item, i) => (
            <div key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="text-emerald-500 flex-shrink-0">+</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {diff.regressions.length > 0 && (
        <div className="space-y-1">
          <p className="font-semibold text-xs text-rose-500 uppercase tracking-wider">需注意</p>
          {diff.regressions.map((item, i) => (
            <div key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="text-rose-400 flex-shrink-0">−</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
