import { CheckCircle, EyeOff, Eye } from 'lucide-react'
import { StatusBadge } from '@bochuangyuan/ui'
import type { ReviewTask } from '@bochuangyuan/types'

// TODO: replace with API call to fetch completed review tasks (endpoint TBD)
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
    reviewStage: 'initial',
    assignedAt: '2023-10-01T10:00:00Z',
  },
  {
    taskId: 'task-done-2',
    projectId: 'proj-done-2',
    projectName: '新能源汽车充电优化系统',
    projectDomain: '新能源',
    submittedVersionId: 'ver-done-2',
    competitionId: 'comp-0',
    competitionName: '2023 创新创业大赛',
    status: 'done',
    reviewStage: 'final',
    assignedAt: '2023-10-05T10:00:00Z',
    submitter: {
      name: '李浩然',
      school: '上海交通大学',
      phone: '137****5566',
      email: 'li***@sjtu.edu.cn',
      teamName: '绿能先锋队',
    },
  },
]

function StagePill({ stage }: { stage: ReviewTask['reviewStage'] }) {
  if (stage === 'initial') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
        <EyeOff className="w-2.5 h-2.5" />
        初审
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
      <Eye className="w-2.5 h-2.5" />
      复审
    </span>
  )
}

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
                <StagePill stage={task.reviewStage} />
                <StatusBadge status="done" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {task.competitionName} · {task.projectDomain}
                {task.reviewStage === 'final' && task.submitter && (
                  <span className="ml-1">· {task.submitter.name}（{task.submitter.school}）</span>
                )}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
