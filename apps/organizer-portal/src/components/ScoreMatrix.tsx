import type { EnrollmentRecord } from '@bochuangyuan/types'
import { cn } from '@/lib/utils'

interface ScoreMatrixProps {
  enrollments: EnrollmentRecord[]
}

export function ScoreMatrix({ enrollments }: ScoreMatrixProps) {
  const expertNames = Array.from(
    new Set(enrollments.flatMap((e) => e.scores.map((s) => s.expertName))),
  )

  return (
    <div className="glass-card overflow-x-auto">
      <table className="w-full text-sm min-w-max">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">项目</th>
            {expertNames.map((name) => (
              <th key={name} className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap">
                {name}
              </th>
            ))}
            <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap text-right">均分</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {enrollments
            .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0))
            .map((e) => (
              <tr key={e.enrollId} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{e.projectName}</td>
                {expertNames.map((name) => {
                  const score = e.scores.find((s) => s.expertName === name)
                  return (
                    <td key={name} className="px-4 py-3 text-center tabular-nums">
                      {score ? (
                        <span className={cn(
                          'font-bold',
                          score.finalScore >= 80 ? 'text-emerald-600' : score.finalScore >= 60 ? 'text-brand-blue' : 'text-orange-500',
                        )}>
                          {score.finalScore.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  )
                })}
                <td className="px-4 py-3 text-right font-black tabular-nums text-slate-800">
                  {e.finalScore != null ? e.finalScore.toFixed(1) : <span className="text-slate-300">—</span>}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
