import { CheckCircle } from 'lucide-react'
import { StatusBadge } from '@bochuangyuan/ui'
import type { ReviewTask } from '@bochuangyuan/types'

const MOCK_DONE: ReviewTask[] = [
  {
    taskId: 'task-done-1',
    projectId: 'proj-done-1',
    projectName: '智慧农业物联网平台',
    projectDomain: '农业科技',
    submittedVersionId: 'ver-done-1',
    competitionId: 'comp-0',
    competitionName: '2023 创新创业大赛',
    status: 'done',
    assignedAt: '2023-10-01T10:00:00Z',
  },
]

export default function CompletedPage() {
  return (
    <div className="space-y-3 pb-20 md:pb-0">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
        已完成 ({MOCK_DONE.length})
      </h2>

      {MOCK_DONE.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-400 text-sm">暂无已完成评审</div>
      ) : (
        MOCK_DONE.map((task) => (
          <div key={task.taskId} className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-700 truncate">{task.projectName}</span>
                <StatusBadge status="done" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{task.competitionName} · {task.projectDomain}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
