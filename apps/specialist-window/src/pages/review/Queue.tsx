import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { reviewTaskApi } from '@bochuangyuan/api'
import { ReviewProgress } from '@/components/ReviewProgress'
import { ProjectCard } from '@/components/ProjectCard'
import type { ExpertTask, ReviewTask } from '@bochuangyuan/types'
import { cn } from '@/lib/utils'
import { MOCK_COMPETITIONS, MOCK_EXPERT_ID, SEED_TASKS } from '@/constants/mockData'

const PHASE_TABS: { phase: ExpertTask['phase'] | 'all'; label: string }[] = [
  { phase: 'all',         label: '全部' },
  { phase: 'preliminary', label: '初审' },
  { phase: 'semifinal',   label: '复审' },
  { phase: 'final',       label: '终评' },
  { phase: 'roadshow',    label: '路演' },
]

const contestName = (contestId?: string) =>
  contestId
    ? (MOCK_COMPETITIONS.find((c) => c.contestId === contestId)?.name ?? '')
    : ''

function toReviewTask(t: ExpertTask): ReviewTask {
  return {
    taskId: t.id,
    projectId: t.projectId,
    projectName: t.projectName,
    projectDomain: '',
    submittedVersionId: '',
    competitionId: t.contestId ?? '',
    competitionName: contestName(t.contestId),
    status: t.status === 'submitted' ? 'done' : t.status === 'in_progress' ? 'scoring' : 'pending',
    reviewStage: 'initial',
    assignedAt: '',
  }
}

export default function QueuePage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<ExpertTask[]>([])
  const [activePhase, setActivePhase] = useState<ExpertTask['phase'] | 'all'>('all')

  useEffect(() => {
    reviewTaskApi.seedMockData(SEED_TASKS)
    reviewTaskApi.list({ expertId: MOCK_EXPERT_ID }).then(setTasks)
  }, [])

  const pending = tasks.filter((t) => t.status !== 'submitted')
  const done = tasks.filter((t) => t.status === 'submitted')
  const filteredPending =
    activePhase === 'all' ? pending : pending.filter((t) => t.phase === activePhase)

  const phaseCount = (phase: ExpertTask['phase']) =>
    pending.filter((t) => t.phase === phase).length

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <ReviewProgress total={tasks.length} done={done.length} />

      {/* Phase tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {PHASE_TABS.map(({ phase, label }) => {
          const count = phase === 'all' ? pending.length : phaseCount(phase)
          return (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all',
                activePhase === phase
                  ? 'bg-[#0045c4] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    'text-xs font-black px-1.5 rounded-full',
                    activePhase === phase
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-300 text-slate-600',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {filteredPending.length > 0 ? (
        <div className="space-y-2">
          {filteredPending.map((task) => (
            <ProjectCard
              key={task.id}
              task={toReviewTask(task)}
              onClick={() => navigate(`/review/${task.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 text-center text-slate-400 text-sm">
          {activePhase === 'all'
            ? '暂无待评审项目'
            : `暂无${PHASE_TABS.find((t) => t.phase === activePhase)?.label}任务`}
        </div>
      )}

    </div>
  )
}
