import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { reviewTaskApi } from '@bochuangyuan/api'
import { useCountdown } from '@bochuangyuan/shared'
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

function toReviewTask(t: ExpertTask): ReviewTask {
  return {
    taskId: t.id,
    projectId: t.projectId,
    projectName: t.projectName,
    projectDomain: '',
    submittedVersionId: '',
    competitionId: t.contestId ?? '',
    competitionName: '',
    status: t.status === 'submitted' ? 'done' : t.status === 'in_progress' ? 'scoring' : 'pending',
    reviewStage: 'initial',
    assignedAt: '',
  }
}

export default function CompetitionWorkspacePage() {
  const { contestId } = useParams<{ contestId: string }>()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<ExpertTask[]>([])
  const [activePhase, setActivePhase] = useState<ExpertTask['phase'] | 'all'>('all')

  const competition = MOCK_COMPETITIONS.find((c) => c.contestId === contestId)
  const { days, hours, isExpired, isUrgent } = useCountdown(competition?.deadline)

  useEffect(() => {
    reviewTaskApi.seedMockData(SEED_TASKS)
    reviewTaskApi.list({ expertId: MOCK_EXPERT_ID }).then((all) => {
      setTasks(all.filter((t) => t.contestId === contestId))
    })
  }, [contestId])

  if (!competition) {
    return (
      <div className="glass-card p-8 text-center text-slate-400 text-sm">赛事不存在</div>
    )
  }

  const pending = tasks.filter((t) => t.status !== 'submitted')
  const submitted = tasks.filter((t) => t.status === 'submitted')
  const filtered =
    activePhase === 'all' ? pending : pending.filter((t) => t.phase === activePhase)

  const phaseCount = (phase: ExpertTask['phase']) =>
    pending.filter((t) => t.phase === phase).length

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate('/competitions')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          返回赛事列表
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-800">{competition.name}</h1>
            {competition.deadline && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 mt-1 text-sm',
                  isExpired ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-slate-400',
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                {isExpired
                  ? '评审已截止'
                  : days > 0
                  ? `剩余 ${days} 天`
                  : `剩余 ${hours}h`}
              </span>
            )}
          </div>
          <div className="text-right text-sm flex-shrink-0">
            <span className="text-slate-400">已完成</span>
            <span className="ml-1.5 font-black text-slate-800">
              {submitted.length} / {tasks.length}
            </span>
          </div>
        </div>
      </div>

      <ReviewProgress total={tasks.length} done={submitted.length} />

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

      {/* Task list */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((task) => (
            <ProjectCard
              key={task.id}
              task={toReviewTask(task)}
              onClick={() => navigate(`/competitions/${contestId}/review/${task.id}`)}
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
