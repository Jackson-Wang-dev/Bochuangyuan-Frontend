import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Wallet, FileDown, CheckCircle2, Clock, XCircle, Star, ChevronRight, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type AwardLevel = 'First' | 'Second' | 'Third' | 'Excellence' | 'Special' | null

interface AwardInfo {
  level: AwardLevel
  competitionName: string
  announcedAt: string
  bonus: number
  certificateReady: boolean
}

interface SettlementInfo {
  status: 'Pending' | 'Verified' | 'Paid'
  bankFilled: boolean
  paidAt?: string
  amount: number
}

const MOCK_AWARD: AwardInfo = {
  level: 'Second',
  competitionName: '2024 博创杯双创大赛',
  announcedAt: '2024-09-30',
  bonus: 20000,
  certificateReady: true,
}

const MOCK_SETTLEMENT: SettlementInfo = {
  status: 'Verified',
  bankFilled: true,
  amount: 20000,
}

const LEVEL_META: Record<NonNullable<AwardLevel>, { label: string; color: string; bg: string; icon: string }> = {
  First:     { label: '一等奖', color: 'text-amber-600',   bg: 'bg-amber-50   border-amber-200',  icon: '🥇' },
  Second:    { label: '二等奖', color: 'text-slate-600',   bg: 'bg-slate-50   border-slate-200',  icon: '🥈' },
  Third:     { label: '三等奖', color: 'text-amber-800',   bg: 'bg-amber-50/60 border-amber-100', icon: '🥉' },
  Excellence:{ label: '优秀奖', color: 'text-sky-600',     bg: 'bg-sky-50     border-sky-200',    icon: '⭐' },
  Special:   { label: '特别奖', color: 'text-violet-600',  bg: 'bg-violet-50  border-violet-200', icon: '✨' },
}

const SETTLEMENT_STATUS: Record<SettlementInfo['status'], { label: string; icon: React.ElementType; color: string; desc: string }> = {
  Pending:  { label: '待审核', icon: Clock,         color: 'text-amber-500',  desc: '您的银行信息已提交，等待主办方审核' },
  Verified: { label: '审核通过', icon: CheckCircle2, color: 'text-blue-500',   desc: '审核已通过，等待主办方确认打款' },
  Paid:     { label: '已打款', icon: CheckCircle2,  color: 'text-emerald-500',desc: '奖金已打款至您的银行账户' },
}

export default function CompetitionResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const award = MOCK_AWARD
  const settlement = MOCK_SETTLEMENT
  const levelMeta = award.level ? LEVEL_META[award.level] : null
  const settlementMeta = SETTLEMENT_STATUS[settlement.status]
  const SettlementIcon = settlementMeta.icon

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800">结果与领奖</h1>
          <p className="text-sm text-slate-400 mt-0.5">{award.competitionName}</p>
        </div>
      </div>

      {/* Award banner */}
      {levelMeta && award.level ? (
        <div className={cn('rounded-2xl border p-6 space-y-4', levelMeta.bg)}>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{levelMeta.icon}</div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">获奖级别</p>
              <h2 className={cn('text-2xl font-black', levelMeta.color)}>{levelMeta.label}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{award.competitionName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-xs text-slate-400">公布时间</p>
              <p className="font-bold text-slate-700 text-sm mt-0.5">{award.announcedAt}</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-xs text-slate-400">奖金金额</p>
              <p className={cn('font-black text-lg mt-0.5', levelMeta.color)}>¥{award.bonus.toLocaleString()}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center space-y-3">
          <XCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-600">本次赛事未获奖</p>
          <p className="text-sm text-slate-400">感谢您的参与，期待下次再见</p>
        </div>
      )}

      {/* Certificate */}
      {award.level && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">电子获奖证书</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {award.certificateReady ? '证书已生成，可下载保存' : '证书生成中，请稍后'}
                </p>
              </div>
            </div>
            <button
              disabled={!award.certificateReady}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors',
                award.certificateReady
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed',
              )}
            >
              <FileDown className="w-4 h-4" />
              下载证书
            </button>
          </div>
        </div>
      )}

      {/* Settlement */}
      {award.level && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-black text-slate-700">奖金结算</h2>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <SettlementIcon className={cn('w-5 h-5', settlementMeta.color)} />
            <div className="flex-1">
              <span className={cn('text-sm font-bold', settlementMeta.color)}>{settlementMeta.label}</span>
              <p className="text-xs text-slate-400 mt-0.5">{settlementMeta.desc}</p>
            </div>
            <span className="text-lg font-black text-slate-800">¥{settlement.amount.toLocaleString()}</span>
          </div>

          {/* Bank info status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">银行账户信息</span>
            {settlement.bankFilled ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> 已填写
              </span>
            ) : (
              <button className="flex items-center gap-1 text-brand-blue font-bold text-xs hover:underline">
                去填写 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {settlement.paidAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">打款时间</span>
              <span className="font-bold text-slate-700">{settlement.paidAt}</span>
            </div>
          )}

          {/* Settlement steps */}
          <div className="space-y-2 pt-1">
            {(['填写银行信息', '主办方审核', '确认打款'] as const).map((step, i) => {
              const stepDone = (settlement.status === 'Paid') ||
                (settlement.status === 'Verified' && i < 2) ||
                (settlement.bankFilled && i === 0)
              return (
                <div key={step} className="flex items-center gap-3 text-xs">
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0',
                    stepDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400',
                  )}>
                    {stepDone ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className={stepDone ? 'text-slate-700 font-semibold' : 'text-slate-400'}>{step}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Back to progress */}
      <button
        onClick={() => navigate(id ? `/competition/mine/${id}/progress` : '/competition/progress')}
        className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-brand-blue/20 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Star className="w-5 h-5 text-brand-blue" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">查看比赛进展</p>
            <p className="text-xs text-slate-400">回顾完整赛程时间线</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </button>
    </div>
  )
}
