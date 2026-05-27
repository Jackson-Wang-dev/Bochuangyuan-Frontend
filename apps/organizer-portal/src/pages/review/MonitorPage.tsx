import { useState, useMemo } from 'react'
import { Download, Lock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// TODO: API — replace with GET /api/contests/:id/review-progress (or WebSocket)
interface ExpertProgressItem {
  expertId: string
  expertName: string
  organization: string
  total: number
  submitted: number
}

interface ProjectRankItem {
  projectId: string
  projectName: string
  totalScore: number
  rank: number
  recommendCount: number
}

const MOCK_PROGRESS: ExpertProgressItem[] = [
  { expertId: 'e1', expertName: '张教授',   organization: '清华大学',   total: 5, submitted: 4 },
  { expertId: 'e2', expertName: '李研究员', organization: '中科院',     total: 5, submitted: 3 },
  { expertId: 'e3', expertName: '王博士',   organization: '北京大学',   total: 5, submitted: 5 },
  { expertId: 'e4', expertName: '陈专家',   organization: '工业研究院', total: 5, submitted: 1 },
]

const MOCK_RANKINGS: ProjectRankItem[] = [
  { projectId: 'p1', projectName: 'AI 分布式算力平台',    totalScore: 88.5, rank: 1, recommendCount: 3 },
  { projectId: 'p3', projectName: '医疗影像 AI 辅助诊断', totalScore: 85.2, rank: 2, recommendCount: 4 },
  { projectId: 'p5', projectName: '新型储能材料研发',      totalScore: 82.0, rank: 3, recommendCount: 2 },
  { projectId: 'p2', projectName: '碳中和智能监测系统',    totalScore: 78.8, rank: 4, recommendCount: 2 },
  { projectId: 'p4', projectName: '智慧农业物联网平台',    totalScore: 74.3, rank: 5, recommendCount: 1 },
]

export default function MonitorPage() {
  const [locked, setLocked] = useState(false)

  const totalSubmitted = useMemo(
    () => MOCK_PROGRESS.reduce((s, e) => s + e.submitted, 0),
    [],
  )
  const totalTasks = useMemo(
    () => MOCK_PROGRESS.reduce((s, e) => s + e.total, 0),
    [],
  )
  const overallProgress = totalTasks > 0 ? Math.round((totalSubmitted / totalTasks) * 100) : 0

  const handleExport = () => {
    // TODO: API — replace with download Excel from backend
    const data = {
      progress: MOCK_PROGRESS,
      rankings: MOCK_RANKINGS,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `review-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">评审监控</h1>
          <p className="text-sm text-slate-400 mt-0.5">实时跟踪专家评分进度和项目排名</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9] font-semibold text-sm hover:bg-[#0ea5e9]/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出评审报告
          </button>
          <button
            onClick={() => setLocked((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors',
              locked
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            <Lock className="w-4 h-4" />
            {locked ? '已锁定结果' : '锁定结果'}
          </button>
        </div>
      </div>

      {locked && (
        <div className="glass-card p-4 bg-red-50 border-red-200 text-red-700 text-sm font-semibold">
          评审结果已锁定 · 专家端不允许修改评分
        </div>
      )}

      {/* Overall progress */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700">总体进度</h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <RefreshCw className="w-3.5 h-3.5" />
            实时更新
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0045c4] transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-sm font-bold text-slate-700 flex-shrink-0">
            {totalSubmitted} / {totalTasks}（{overallProgress}%）
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expert progress */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-700">专家打分进度</h2>
          {MOCK_PROGRESS.map((expert) => {
            const pct = expert.total > 0 ? Math.round((expert.submitted / expert.total) * 100) : 0
            return (
              <div key={expert.expertId} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-slate-800">{expert.expertName}</span>
                    <span className="text-slate-400 ml-1.5">{expert.organization}</span>
                  </div>
                  <span className="font-bold text-slate-600 flex-shrink-0">
                    {expert.submitted}/{expert.total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      pct === 100 ? 'bg-emerald-500' : 'bg-[#0045c4]',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Project rankings */}
        <div className="glass-card p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-700">项目平均分排行</h2>
          {MOCK_RANKINGS.map((item) => (
            <div
              key={item.projectId}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0',
                  item.rank === 1 && 'bg-yellow-400 text-white',
                  item.rank === 2 && 'bg-slate-300 text-white',
                  item.rank === 3 && 'bg-amber-600 text-white',
                  item.rank > 3 && 'bg-slate-100 text-slate-500',
                )}
              >
                {item.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.projectName}</p>
                <p className="text-xs text-slate-400">
                  {item.recommendCount} 位专家推荐晋级
                </p>
              </div>
              <span className="text-lg font-black text-[#0045c4] flex-shrink-0">
                {item.totalScore.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
