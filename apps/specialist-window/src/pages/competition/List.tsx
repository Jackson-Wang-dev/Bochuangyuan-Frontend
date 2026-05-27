import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, ChevronRight, Clock } from 'lucide-react'
import { reviewTaskApi } from '@bochuangyuan/api'
import { useCountdown } from '@bochuangyuan/shared'
import type { ExpertTask } from '@bochuangyuan/types'
import { cn } from '@/lib/utils'
import {
  MOCK_COMPETITIONS,
  MOCK_EXPERT_ID,
  SEED_TASKS,
  type ExpertCompetition,
} from '@/constants/mockData'

const STATUS_MAP: Record<ExpertCompetition['status'], { label: string; cls: string }> = {
  open:      { label: '报名中', cls: 'bg-emerald-100 text-emerald-700' },
  reviewing: { label: '评审中', cls: 'bg-amber-100 text-amber-700' },
  closed:    { label: '已结束', cls: 'bg-slate-100 text-slate-500' },
  finished:  { label: '已完成', cls: 'bg-slate-100 text-slate-500' },
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  return (
    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r}
        fill="none"
        stroke="#0045c4"
        strokeWidth="4"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  )
}

function CompetitionCard({
  comp,
  tasks,
  onClick,
}: {
  comp: ExpertCompetition
  tasks: ExpertTask[]
  onClick: () => void
}) {
  const myTasks = tasks.filter((t) => t.contestId === comp.contestId)
  const submitted = myTasks.filter((t) => t.status === 'submitted').length
  const total = myTasks.length
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0
  const { days, hours, isExpired, isUrgent } = useCountdown(comp.deadline)
  const status = STATUS_MAP[comp.status]

  return (
    <button
      onClick={onClick}
      className="glass-card p-5 w-full text-left border-2 border-transparent hover:border-brand-blue/20 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', status.cls)}>
              {status.label}
            </span>
          </div>
          <h3 className="text-base font-black text-slate-800 truncate">{comp.name}</h3>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span>我的进度：{submitted} / {total} 已提交</span>
            {comp.deadline && (
              <span
                className={cn(
                  'flex items-center gap-1',
                  isExpired ? 'text-red-500' : isUrgent ? 'text-amber-500' : '',
                )}
              >
                <Clock className="w-3 h-3" />
                {isExpired
                  ? '已截止'
                  : days > 0
                  ? `${days}天后截止`
                  : `${hours}h后截止`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative w-12 h-12">
            <ProgressRing pct={pct} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-700">
              {pct}%
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-blue transition-colors" />
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-brand-blue rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  )
}

export default function CompetitionListPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<ExpertTask[]>([])

  useEffect(() => {
    reviewTaskApi.seedMockData(SEED_TASKS)
    reviewTaskApi.list({ expertId: MOCK_EXPERT_ID }).then(setTasks)
  }, [])

  const pendingCount = tasks.filter((t) => t.status !== 'submitted').length

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <div>
        <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-brand-blue" />
          我的赛事
        </h1>
        {pendingCount > 0 && (
          <p className="text-sm text-slate-400 mt-0.5">共 {pendingCount} 个项目待评审</p>
        )}
      </div>

      <div className="space-y-3">
        {MOCK_COMPETITIONS.map((comp) => (
          <CompetitionCard
            key={comp.contestId}
            comp={comp}
            tasks={tasks}
            onClick={() => navigate(`/competitions/${comp.contestId}`)}
          />
        ))}
      </div>
    </div>
  )
}
