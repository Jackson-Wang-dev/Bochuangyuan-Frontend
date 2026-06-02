import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, Circle, ChevronRight, Trophy, Star, Users, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhaseInfo {
  key: string
  label: string
  desc: string
  date: string
  status: 'done' | 'active' | 'upcoming'
}

interface ScoreEntry {
  judgeName: string
  score: number
  comment?: string
}

interface PhaseResult {
  phase: string
  rank?: number
  total?: number
  avgScore?: number
  scores?: ScoreEntry[]
  promoted: boolean
}

const MOCK_PHASES: PhaseInfo[] = [
  { key: 'signup',   label: '报名阶段',   desc: '完成预报名和正式报名材料提交',      date: '2024-03-01 ~ 2024-06-01',  status: 'done'     },
  { key: 'review',   label: '资质审核',   desc: '主办方对报名材料进行审核',          date: '2024-06-01 ~ 2024-06-15',  status: 'done'     },
  { key: 'prelim',   label: '初赛评审',   desc: '评委根据商业计划书进行初轮打分',    date: '2024-06-15 ~ 2024-07-15',  status: 'done'     },
  { key: 'semifinal',label: '复赛评审',   desc: '入围项目进行复赛路演与答辩',        date: '2024-07-15 ~ 2024-08-15',  status: 'active'   },
  { key: 'final',    label: '决赛评审',   desc: '复赛晋级项目进行决赛终极展示',      date: '2024-08-15 ~ 2024-09-15',  status: 'upcoming' },
  { key: 'awards',   label: '颁奖典礼',   desc: '公布获奖名单，颁发奖金与证书',      date: '2024-09-30',               status: 'upcoming' },
]

const MOCK_PHASE_RESULTS: Record<string, PhaseResult> = {
  prelim: {
    phase: '初赛',
    rank: 3, total: 48,
    avgScore: 86.5,
    scores: [
      { judgeName: '王教授', score: 88, comment: '商业模式清晰，技术壁垒较强' },
      { judgeName: '李博士', score: 85, comment: '市场分析到位，团队背景扎实' },
      { judgeName: '张总监', score: 86.5 },
    ],
    promoted: true,
  },
}

const PHASE_STATUS_STYLE = {
  done:     { dot: 'bg-emerald-500', line: 'bg-emerald-200', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-600' },
  active:   { dot: 'bg-brand-blue ring-4 ring-brand-blue/20', line: 'bg-slate-200', text: 'text-brand-blue', badge: 'bg-blue-50 text-brand-blue' },
  upcoming: { dot: 'bg-slate-200', line: 'bg-slate-100', text: 'text-slate-400', badge: 'bg-slate-100 text-slate-400' },
}

export default function CompetitionProgressPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const activeIdx = MOCK_PHASES.findIndex((p) => p.status === 'active')

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800">比赛进展</h1>
          <p className="text-sm text-slate-400 mt-0.5">2024 博创杯双创大赛</p>
        </div>
      </div>

      {/* Current stage highlight */}
      {activeIdx >= 0 && (
        <div className="bg-gradient-to-r from-brand-blue to-blue-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-bold mb-2 uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse" />
            当前阶段
          </div>
          <h2 className="text-xl font-black">{MOCK_PHASES[activeIdx]!.label}</h2>
          <p className="text-blue-100 text-sm mt-1">{MOCK_PHASES[activeIdx]!.desc}</p>
          <div className="flex items-center gap-1.5 mt-3 text-blue-100 text-xs">
            <Clock className="w-3.5 h-3.5" />
            {MOCK_PHASES[activeIdx]!.date}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-black text-slate-700 mb-5">赛程时间线</h2>
        <div className="space-y-0">
          {MOCK_PHASES.map((phase, idx) => {
            const style = PHASE_STATUS_STYLE[phase.status]
            const isLast = idx === MOCK_PHASES.length - 1
            return (
              <div key={phase.key} className="flex gap-4">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center">
                  <div className={cn('w-3 h-3 rounded-full flex-shrink-0 mt-1', style.dot)} />
                  {!isLast && <div className={cn('w-0.5 flex-1 mt-1', style.line)} style={{ minHeight: 32 }} />}
                </div>

                {/* Content */}
                <div className={cn('pb-6 flex-1', isLast && 'pb-0')}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-sm font-bold', style.text)}>{phase.label}</span>
                    {phase.status === 'done' && (
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', style.badge)}>已完成</span>
                    )}
                    {phase.status === 'active' && (
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', style.badge)}>进行中</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{phase.desc}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{phase.date}</p>

                  {/* Phase result card */}
                  {phase.status === 'done' && MOCK_PHASE_RESULTS[phase.key] && (
                    <PhaseResultCard result={MOCK_PHASE_RESULTS[phase.key]!} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-2">
        <button
          onClick={() => navigate(id ? `/competition/mine/${id}/result` : '/competition/results')}
          className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-brand-blue/20 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">获奖与结算</p>
              <p className="text-xs text-slate-400">查看最终获奖情况与奖金发放</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </div>
  )
}

function PhaseResultCard({ result }: { result: PhaseResult }) {
  return (
    <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        {result.rank != null && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-blue">
            <Star className="w-3.5 h-3.5" />
            第 {result.rank} 名 / 共 {result.total} 支队伍
          </div>
        )}
        {result.avgScore != null && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <FileText className="w-3.5 h-3.5" />
            均分 {result.avgScore.toFixed(1)}
          </div>
        )}
        <span className={cn(
          'ml-auto px-2 py-0.5 rounded-full text-xs font-bold',
          result.promoted ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
        )}>
          {result.promoted ? '已晋级' : '已淘汰'}
        </span>
      </div>

      {result.scores && result.scores.length > 0 && (
        <div className="space-y-1">
          {result.scores.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
              <Users className="w-3 h-3 flex-shrink-0 text-slate-300" />
              <span className="font-medium text-slate-600 w-16 flex-shrink-0">{s.judgeName}</span>
              <span className="font-black text-brand-blue tabular-nums">{s.score.toFixed(1)}</span>
              {s.comment && <span className="text-slate-400 truncate">{s.comment}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
