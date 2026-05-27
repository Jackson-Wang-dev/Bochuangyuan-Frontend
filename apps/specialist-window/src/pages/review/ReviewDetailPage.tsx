import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Send,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { reviewTaskApi, reviewRuleApi } from '@bochuangyuan/api'
import { useDebounce } from '@bochuangyuan/shared'
import { cn } from '@/lib/utils'
import type { ExpertTask, ReviewDimension } from '@bochuangyuan/types'
import { MOCK_COMPETITIONS, SEED_TASKS } from '@/constants/mockData'

const PHASE_LABELS: Record<ExpertTask['phase'], string> = {
  preliminary: '初审',
  semifinal:   '复审',
  final:       '终评',
  roadshow:    '路演',
}

const DEFAULT_DIMENSIONS: ReviewDimension[] = [
  { id: 'dim-1', label: '创新性',   weight: 40, maxScore: 10 },
  { id: 'dim-2', label: '可行性',   weight: 35, maxScore: 10 },
  { id: 'dim-3', label: '团队能力', weight: 25, maxScore: 10 },
]

const DRAFT_KEY = (taskId: string) => `bochuangyuan:draft:${taskId}`

export default function ReviewDetailPage() {
  // contestId present when entered via /competitions/:contestId/review/:taskId
  const { contestId, taskId } = useParams<{ contestId?: string; taskId: string }>()
  const navigate = useNavigate()

  const [task, setTask] = useState<ExpertTask | null>(null)
  const [scopedTasks, setScopedTasks] = useState<ExpertTask[]>([])
  const [dimensions, setDimensions] = useState<ReviewDimension[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [recommend, setRecommend] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Back destination depends on entry point
  const backPath = contestId ? `/competitions/${contestId}` : '/review/queue'
  const competitionName = contestId
    ? (MOCK_COMPETITIONS.find((c) => c.contestId === contestId)?.name ?? '')
    : ''

  useEffect(() => {
    reviewTaskApi.seedMockData(SEED_TASKS)

    // Load all tasks, then scope to same competition if entered from competition workspace
    reviewTaskApi.list().then((all) => {
      const scoped = contestId ? all.filter((t) => t.contestId === contestId) : all
      setScopedTasks(scoped)
    })
  }, [contestId])

  useEffect(() => {
    if (!taskId) return
    reviewTaskApi.get(taskId).then((t) => {
      if (!t) return
      setTask(t)

      if (t.contestId) {
        reviewRuleApi.getByContest(t.contestId).then((rule) => {
          const phase = rule?.phases.find((p) => p.phase === t.phase)
          setDimensions(phase?.dimensions.length ? phase.dimensions : DEFAULT_DIMENSIONS)
        })
      } else {
        setDimensions(DEFAULT_DIMENSIONS)
      }

      const raw = localStorage.getItem(DRAFT_KEY(taskId))
      if (raw) {
        try {
          const draft = JSON.parse(raw) as {
            scores: Record<string, number>
            comment: string
            recommend: boolean
          }
          setScores(draft.scores)
          setComment(draft.comment)
          setRecommend(draft.recommend)
          return
        } catch { /* ignore */ }
      }
      const initial: Record<string, number> = {}
      t.scores.forEach((s) => { initial[s.dimensionId] = s.score })
      setScores(initial)
      setComment(t.comment)
      setRecommend(t.recommendAdvance)
    })
  }, [taskId])

  const draftPayload = useDebounce({ scores, comment, recommend }, 500)
  useEffect(() => {
    if (!taskId || !task || task.status === 'submitted') return
    localStorage.setItem(DRAFT_KEY(taskId), JSON.stringify(draftPayload))
  }, [draftPayload, taskId, task])

  const currentIdx = scopedTasks.findIndex((t) => t.id === taskId)
  const prevTask = currentIdx > 0 ? scopedTasks[currentIdx - 1] : null
  const nextTask = currentIdx < scopedTasks.length - 1 ? scopedTasks[currentIdx + 1] : null

  const taskNav = (id: string) =>
    contestId ? `/competitions/${contestId}/review/${id}` : `/review/${id}`

  const totalWeightedScore = dimensions.reduce((sum, dim) => {
    return sum + ((scores[dim.id] ?? 0) * dim.weight) / 100
  }, 0)

  const handleSubmit = async () => {
    if (submitting || !task || !taskId) return

    const missing = dimensions.filter((d) => scores[d.id] === undefined)
    if (missing.length > 0) {
      toast.error(`请为所有维度打分（缺少：${missing.map((d) => d.label).join('、')}）`)
      return
    }

    if (!window.confirm('提交后不可修改，确认提交？')) return

    setSubmitting(true)
    try {
      const patch: Partial<ExpertTask> = {
        scores: dimensions.map((d) => ({ dimensionId: d.id, score: scores[d.id] ?? 0 })),
        comment,
        recommendAdvance: recommend,
      }
      await reviewTaskApi.submit(taskId, patch)
      localStorage.removeItem(DRAFT_KEY(taskId))
      setTask((prev) => (prev ? { ...prev, ...patch, status: 'submitted' } : prev))
      toast.success('评分已提交！')

      const pendingInScope = scopedTasks.filter(
        (t) => t.status !== 'submitted' && t.id !== taskId,
      )
      const nextPending = pendingInScope[0]
      if (nextPending) {
        setTimeout(() => navigate(taskNav(nextPending.id)), 1200)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-[#0045c4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isSubmitted = task.status === 'submitted'

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Top nav */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {contestId ? '返回赛事' : '返回队列'}
        </button>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold flex-wrap justify-end">
          {competitionName && (
            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold">
              {competitionName}
            </span>
          )}
          <span className="px-2 py-1 rounded-full bg-slate-100">
            {PHASE_LABELS[task.phase]}
          </span>
          <span>
            第 {currentIdx + 1} / {scopedTasks.length} 个
          </span>
        </div>
        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#0045c4] hover:bg-[#0045c4]/90 transition-colors',
              submitting && 'opacity-70 cursor-not-allowed',
            )}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            提交评分
          </button>
        )}
      </div>

      <h1 className="text-lg font-black text-slate-800">{task.projectName}</h1>

      {isSubmitted && (
        <div className="glass-card p-4 bg-emerald-50 border-emerald-200 text-emerald-700 text-sm font-semibold text-center">
          评分已提交，感谢您的评审！
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: project info */}
        <div className="flex-1 space-y-3">
          {task.projectSummary && (
            <div className="glass-card p-4 space-y-1.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">项目简介</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{task.projectSummary}</p>
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className="glass-card p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Paperclip className="w-3 h-3" /> 附件
              </h3>
              {task.attachments.map((att) => (
                <a
                  key={att.name}
                  href={att.url}
                  className="flex items-center gap-2 text-sm text-[#0045c4] hover:underline"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  {att.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right: score panel */}
        <div className="md:w-72 lg:w-80 flex-shrink-0 space-y-4">
          <div className="glass-card p-5 space-y-5">
            <h3 className="text-sm font-bold text-slate-700">评分</h3>

            {dimensions.map((dim) => {
              const val = scores[dim.id] ?? 0
              return (
                <div key={dim.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-slate-700">{dim.label}</span>
                      <span className="ml-1.5 text-xs text-slate-400">权重 {dim.weight}%</span>
                    </div>
                    <span className="text-sm font-black text-[#0045c4]">
                      {val} / {dim.maxScore}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={dim.maxScore}
                    step={1}
                    value={val}
                    disabled={isSubmitted}
                    onChange={(e) =>
                      setScores((prev) => ({ ...prev, [dim.id]: Number(e.target.value) }))
                    }
                    className="w-full accent-[#0045c4] disabled:opacity-50"
                  />
                  {dim.description && (
                    <p className="text-xs text-slate-400">{dim.description}</p>
                  )}
                </div>
              )
            })}

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-600">加权总分</span>
                <span className="font-black text-lg text-[#0045c4]">
                  {totalWeightedScore.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">评语</label>
              <textarea
                rows={4}
                disabled={isSubmitted}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="请填写评审意见…"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#0045c4] disabled:bg-slate-50"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={recommend}
                disabled={isSubmitted}
                onChange={(e) => setRecommend(e.target.checked)}
                className="w-4 h-4 accent-[#0045c4]"
              />
              <span className="text-sm font-semibold text-slate-700">推荐晋级</span>
            </label>
          </div>
        </div>
      </div>

      {/* Prev / Next nav */}
      <div className="flex items-center justify-between pt-2">
        <button
          disabled={!prevTask}
          onClick={() => prevTask && navigate(taskNav(prevTask.id))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          上一个
        </button>
        <button
          disabled={!nextTask}
          onClick={() => nextTask && navigate(taskNav(nextTask.id))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          下一个
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
