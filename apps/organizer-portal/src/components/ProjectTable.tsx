import { StatusBadge } from '@bochuangyuan/ui'
import type { EnrollmentRecord } from '@bochuangyuan/types'
import { cn } from '@/lib/utils'

interface ProjectTableProps {
  enrollments: EnrollmentRecord[]
  onSelect?: (e: EnrollmentRecord) => void
}

export function ProjectTable({ enrollments, onSelect }: ProjectTableProps) {
  return (
    <div className="glass-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">项目名称</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">参赛者</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">状态</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">得分</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {enrollments.map((e) => (
            <tr
              key={e.enrollId}
              onClick={() => onSelect?.(e)}
              className={cn('hover:bg-slate-50 transition-colors', onSelect && 'cursor-pointer')}
            >
              <td className="px-4 py-3 font-medium text-slate-800">{e.projectName}</td>
              <td className="px-4 py-3 text-slate-500">{e.entrepreneurName}</td>
              <td className="px-4 py-3">
                <StatusBadge status={e.status} />
              </td>
              <td className="px-4 py-3 text-right font-bold text-slate-700">
                {e.finalScore != null ? e.finalScore.toFixed(1) : <span className="text-slate-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {enrollments.length === 0 && (
        <div className="py-12 text-center text-slate-400 text-sm">暂无参赛项目</div>
      )}
    </div>
  )
}
