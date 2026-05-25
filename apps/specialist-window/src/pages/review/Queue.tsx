import { useNavigate } from 'react-router-dom'
import { ReviewProgress } from '@/components/ReviewProgress'
import { ProjectCard } from '@/components/ProjectCard'
import type { ReviewTask } from '@bochuangyuan/types'

const MOCK_TASKS: ReviewTask[] = [
  {
    taskId: 'task-1',
    projectId: 'proj-1',
    projectName: 'AI 分布式算力平台',
    projectDomain: '人工智能',
    submittedVersionId: 'ver-1',
    competitionId: 'comp-1',
    competitionName: '2024 全国大学生创业大赛',
    status: 'pending',
    deadline: '2024-06-30',
    assignedAt: '2024-06-01T10:00:00Z',
  },
  {
    taskId: 'task-2',
    projectId: 'proj-2',
    projectName: '碳中和智能监测系统',
    projectDomain: '新能源',
    submittedVersionId: 'ver-2',
    competitionId: 'comp-1',
    competitionName: '2024 全国大学生创业大赛',
    status: 'scoring',
    deadline: '2024-06-30',
    assignedAt: '2024-06-01T10:00:00Z',
  },
  {
    taskId: 'task-3',
    projectId: 'proj-3',
    projectName: '医疗影像 AI 辅助诊断',
    projectDomain: '医疗健康',
    submittedVersionId: 'ver-3',
    competitionId: 'comp-1',
    competitionName: '2024 全国大学生创业大赛',
    status: 'pending',
    deadline: '2024-06-30',
    assignedAt: '2024-06-01T10:00:00Z',
  },
]

export default function QueuePage() {
  const navigate = useNavigate()
  const pending = MOCK_TASKS.filter((t) => t.status !== 'done')
  const done = MOCK_TASKS.filter((t) => t.status === 'done')

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <ReviewProgress total={MOCK_TASKS.length} done={done.length} />

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
          待评审 ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 text-sm">暂无待评审项目</div>
        ) : (
          pending.map((task) => (
            <ProjectCard
              key={task.taskId}
              task={task}
              onClick={() => navigate(`/review/${task.taskId}/score`)}
            />
          ))
        )}
      </div>
    </div>
  )
}
