import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Eye } from 'lucide-react'
import { reviewTaskApi } from '@bochuangyuan/api'
import { ReviewProgress } from '@/components/ReviewProgress'
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

const AVATAR_COLORS = ['#2B50E2', '#0E9F6E', '#9333EA', '#DD6B20', '#0891B2', '#DB2777']

const contestName = (contestId?: string) =>
  contestId ? (MOCK_COMPETITIONS.find((c) => c.contestId === contestId)?.name ?? '') : ''

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

const PHASE_LABEL: Record<string, string> = {
  preliminary: '初审',
  semifinal:   '复审',
  final:       '终评',
  roadshow:    '路演',
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
  const filtered =
    activePhase === 'all' ? pending : pending.filter((t) => t.phase === activePhase)

  const countFor = (phase: ExpertTask['phase']) =>
    pending.filter((t) => t.phase === phase).length

  return (
    <div className="space-y-0">
      <ReviewProgress total={tasks.length} done={done.length} />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className="inline-flex bg-[#EEF0F4] rounded-[9px] p-[3px] gap-0.5">
          {PHASE_TABS.map(({ phase, label }) => {
            const count = phase === 'all' ? pending.length : countFor(phase)
            const active = activePhase === phase
            return (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className={cn(
                  'flex items-center gap-1.5 text-[13px] font-medium px-[13px] py-[6px] rounded-[7px] transition-all',
                  active
                    ? 'bg-panel text-ink font-semibold shadow-sm'
                    : 'text-muted hover:text-ink',
                )}
              >
                {label}
                <span
                  className={cn(
                    'text-[11px] font-semibold rounded-full px-1.5 min-w-[18px] text-center',
                    active ? 'bg-brand text-white' : 'bg-[#DDE0E6] text-slate',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-faint">
            {activePhase === 'all'
              ? '暂无待评审项目'
              : `暂无${PHASE_TABS.find((t) => t.phase === activePhase)?.label}任务`}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['项目', '赛道', '阶段', '状态', '操作'].map((h, i) => (
                  <th
                    key={h}
                    className="text-left px-4 py-[11px] text-[11.5px] font-semibold text-faint uppercase tracking-[.03em] bg-[#FAFBFC] border-b border-line"
                    style={i === 4 ? { textAlign: 'right' } : undefined}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, idx) => {
                const rt = toReviewTask(task)
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                const letter = task.projectName.charAt(0)
                const isDone = rt.status === 'done'

                return (
                  <tr
                    key={task.id}
                    onClick={() => navigate(`/review/${task.id}`)}
                    className="cursor-pointer border-b border-line last:border-none hover:bg-[#FAFBFE] transition-colors"
                  >
                    {/* Project */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-[38px] h-[38px] rounded-[9px] grid place-items-center font-bold text-[15px] text-white flex-none"
                          style={{ background: avatarColor }}
                        >
                          {letter}
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold text-ink">{task.projectName}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-[7px] py-px rounded-[6px] bg-slate-bg text-slate">
                              盲审
                            </span>
                            <span className="text-[12px] text-faint font-mono">{task.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Track */}
                    <td className="px-4 py-3">
                      <span className="text-[12px] bg-slate-bg text-slate px-2.5 py-1 rounded-[7px] font-medium">
                        综合
                      </span>
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3">
                      <span className="inline-flex text-[12px] font-semibold px-[9px] py-[3px] rounded-[6px] bg-brand-50 text-brand-d">
                        {PHASE_LABEL[task.phase] ?? task.phase}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold px-[9px] py-[3px] rounded-[6px] bg-green-bg text-green">
                          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                          已评审
                        </span>
                      ) : (
                        <span className="inline-flex text-[12px] font-semibold px-[9px] py-[3px] rounded-[6px] bg-amber-bg text-amber">
                          待评审
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      {isDone ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/review/${task.id}`) }}
                          className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3 py-[6px] rounded-lg bg-[#F4F5F8] text-muted border border-line hover:bg-[#EAECF0] transition-colors"
                        >
                          <Eye className="w-[14px] h-[14px]" />
                          查看
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/review/${task.id}`) }}
                          className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3 py-[6px] rounded-lg bg-brand-50 text-brand-d border border-brand-100 hover:bg-brand hover:text-white hover:border-brand transition-colors"
                        >
                          <Zap className="w-[14px] h-[14px]" />
                          评审
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
