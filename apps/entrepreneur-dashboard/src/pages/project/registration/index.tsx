import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Trophy, FileText, CheckCircle2, XCircle, AlertCircle,
  RotateCcw, Check, Clock,
} from 'lucide-react'
import { useProjectDashboardStore } from '@/store/projectDashboardStore'
import { formatTimestamp, type CompetitionPhase } from '@/mock/projectMock'
import { cn } from '@/lib/utils'

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  '待审核': 'bg-amber-50 text-amber-600',
  '通过':   'bg-emerald-50 text-emerald-600',
  '淘汰':   'bg-red-50 text-red-500',
  '已撤回': 'bg-slate-100 text-slate-500',
}
const STATUS_ICON: Record<string, React.ReactNode> = {
  '待审核': <AlertCircle className="w-4 h-4 text-amber-500" />,
  '通过':   <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  '淘汰':   <XCircle className="w-4 h-4 text-red-400" />,
  '已撤回': <RotateCcw className="w-4 h-4 text-slate-400" />,
}

// ── Phase stepper ─────────────────────────────────────────────────────────────

function PhaseStepper({ phases }: { phases: CompetitionPhase[] }) {
  return (
    <div className="relative">
      {/* connecting line */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-100" style={{ marginLeft: 16, marginRight: 16 }} />

      <div className="relative flex items-start justify-between gap-2">
        {phases.map((phase, i) => {
          const isDone   = phase.status === 'completed'
          const isActive = phase.status === 'active'
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-0 relative z-10">
              {/* Dot */}
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0',
                isDone   ? 'bg-emerald-500 border-emerald-500 text-white' :
                isActive ? 'bg-brand-blue border-brand-blue text-white ring-4 ring-brand-blue/20' :
                           'bg-white border-slate-200 text-slate-300',
              )}>
                {isDone ? <Check className="w-4 h-4" /> : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>

              {/* Label */}
              <p className={cn(
                'text-xs font-bold text-center leading-tight',
                isDone ? 'text-emerald-600' : isActive ? 'text-brand-blue' : 'text-slate-400',
              )}>
                {phase.label}
              </p>

              {/* Date */}
              {phase.date && (
                <p className="text-[10px] text-slate-400 text-center">{phase.date}</p>
              )}

              {/* Active badge */}
              {isActive && (
                <span className="px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded-full whitespace-nowrap">
                  进行中
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Description of active/last-completed phase */}
      {(() => {
        const activePhase = phases.find((p) => p.status === 'active')
        const lastDone = [...phases].reverse().find((p) => p.status === 'completed')
        const highlight = activePhase ?? lastDone
        if (!highlight?.description) return null
        return (
          <div className={cn(
            'mt-4 rounded-xl px-4 py-3 text-sm',
            activePhase ? 'bg-brand-blue/5 text-brand-blue' : 'bg-emerald-50 text-emerald-700',
          )}>
            <p className="font-semibold mb-0.5">{highlight.label}</p>
            <p className="text-xs opacity-80">{highlight.description}</p>
          </div>
        )
      })()}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RegistrationDetailPage() {
  const { id: projectId, regId } = useParams<{ id: string; regId: string }>()
  const navigate = useNavigate()
  const { registrations, competitions } = useProjectDashboardStore()

  const reg = registrations.find((r) => r.id === regId)
  const template = reg ? competitions.find((c) => c.id === reg.competitionId) : null

  if (!reg) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
        <p className="text-sm">报名记录不存在</p>
        <button onClick={() => navigate(`/project/${projectId}`)} className="text-sm text-brand-blue hover:underline">
          返回项目主页
        </button>
      </div>
    )
  }

  function getLabel(key: string): string {
    return template?.fields.find((f) => f.key === key)?.label ?? key
  }

  const filledEntries = Object.entries(reg.filledContent)

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5 flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-black text-slate-800 leading-tight">{reg.competitionName}</h1>
            <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0', STATUS_COLOR[reg.status])}>
              {reg.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            {STATUS_ICON[reg.status]}
            {reg.track} · 提交于 {formatTimestamp(reg.submittedAt)}
          </p>
        </div>
      </div>

      {/* Phase progress */}
      <div className="glass-card p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">赛事进度</p>
        <PhaseStepper phases={reg.phases} />
      </div>

      {/* Filled content */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">报名表内容</p>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            静态快照 · 只读
          </span>
        </div>

        {filledEntries.length === 0 ? (
          <p className="text-sm text-slate-400">无填写内容</p>
        ) : (
          <div className="space-y-4">
            {filledEntries.map(([key, value]) => (
              <div key={key}>
                <p className="text-xs font-semibold text-slate-500 mb-1">{getLabel(key)}</p>
                <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap">
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submitted files */}
      {reg.submittedFiles && reg.submittedFiles.length > 0 && (
        <div className="glass-card p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">提交文件</p>
          <div className="space-y-2">
            {reg.submittedFiles.map((f) => (
              <div key={f.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-brand-blue" />
                </div>
                <span className="text-sm text-slate-700 flex-1 min-w-0 truncate">{f.name}</span>
                <span className="text-xs text-slate-400 flex-shrink-0">{f.size}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action: reuse for another competition */}
      <div className="glass-card p-5 space-y-3">
        <div>
          <p className="text-sm font-bold text-slate-800">以此次报名为基础，报名其他赛事</p>
          <p className="text-xs text-slate-400 mt-0.5">
            将本次已填写的内容预填至新赛事的报名表，仍关联到同一项目。
          </p>
        </div>
        <button
          onClick={() => navigate(`/project/${projectId}/apply?fromReg=${reg.id}`)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
        >
          <Trophy className="w-4 h-4" /> 报名其他赛事
        </button>
      </div>
    </div>
  )
}
