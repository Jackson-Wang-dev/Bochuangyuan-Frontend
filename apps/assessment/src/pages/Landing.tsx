import { ArrowRight, BookOpen, ChevronRight, MessageSquareQuote, Radar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssessmentStore } from '../store/assessmentStore'
import { useUserStore } from '../store/userStore'
import type { AssessmentSession } from '../types'

// Geometric "B" SVG mark — same mark used across all apps
function BochuangLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#0045c4" />
      <path
        d="M11 9 H23 C27.4 9 30 11.6 30 15.4 C30 17.8 28.8 19.8 26.9 20.6 C29.4 21.4 31 23.6 31 26.4 C31 30.4 28 33 23.4 33 H11 V9 Z M16 13 V19 H22 C23.8 19 25 17.8 25 16 C25 14.2 23.8 13 22 13 H16 Z M16 23 V29 H23 C25 29 26 27.6 26 26 C26 24.2 24.9 23 23 23 H16 Z"
        fill="white"
      />
    </svg>
  )
}

interface StatProps {
  value: string
  label: string
}

function Stat({ value, label }: StatProps) {
  return (
    <div className="p-3 text-center">
      <div className="font-mono tabular-nums text-lg font-semibold">{value}</div>
      <div className="text-[10px] text-white/50 tracking-wider uppercase mt-0.5">{label}</div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  tag: string
  desc: string
}

function FeatureCard({ icon: Icon, title, tag, desc }: FeatureCardProps) {
  return (
    <div className="rounded-2xl p-3.5 flex items-start gap-3.5 border border-slate-200 hover:border-[#0045c4]/30 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-[#0045c4]/8 text-[#0045c4] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <p className="font-semibold text-slate-900 text-[14px]">{title}</p>
          <span className="text-[10px] font-mono text-slate-400">{tag}</span>
        </div>
        <p className="text-slate-500 text-[12px] mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { initClientId } = useUserStore()
  const { startSession, resetSession } = useAssessmentStore()
  const getLastActiveReport = useUserStore((s) => s.getLastActiveReport)
  const [clientId, setClientId] = useState('')
  const [lastReport, setLastReport] = useState<AssessmentSession | null>(null)

  useEffect(() => {
    const id = initClientId()
    setClientId(id)
    const report = getLastActiveReport()
    setLastReport(report)
  }, [initClientId, getLastActiveReport])

  const handleStartNew = () => {
    resetSession()
    startSession(clientId)
    navigate('/quiz')
  }

  const handleViewLast = () => {
    navigate('/result', { state: { session: lastReport } })
  }

  const isReturning = !!lastReport

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero — brand-ink with blue glow */}
      <div className="ink-blue px-6 pt-14 pb-10 text-white relative overflow-hidden">
        {/* Brand row */}
        <div className="flex items-center justify-between mt-2 mb-12">
          <div className="flex items-center gap-2">
            <BochuangLogo size={24} />
            <span className="text-sm font-semibold tracking-tight">博创园</span>
          </div>
          {isReturning && (
            <button
              onClick={() => navigate('/my-reports')}
              className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors"
            >
              我的报告 <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Returning user card */}
        {isReturning && lastReport?.matchedPersona && (
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 mb-6">
            <p className="text-white/70 text-xs mb-1">欢迎回来</p>
            <p className="text-white font-semibold text-base">
              你上次的画像是{' '}
              <span className="text-amber-300">
                {lastReport.matchedPersona.name}
              </span>
            </p>
            <p className="text-white/65 text-xs mt-1">
              {new Date(lastReport.createdAt).toLocaleDateString('zh-CN', {
                month: 'long',
                day: 'numeric',
              })}{' '}
              完成
            </p>
          </div>
        )}

        {/* Editorial headline */}
        <p className="font-mono text-[11px] text-white/50 tracking-[0.18em] uppercase mb-3">
          Founder · Persona Test · v3
        </p>
        <h1 className="text-[34px] font-bold leading-[1.15] tracking-tight">
          你属于
          <br />
          <span className="text-white">哪一种创业者？</span>
        </h1>

        {/* Stats strip */}
        <div className="grid grid-cols-3 mt-7 border border-white/10 rounded-2xl divide-x divide-white/10 bg-white/5 backdrop-blur-sm">
          <Stat value="12,847" label="已完成" />
          <Stat value="23"     label="人格类型" />
          <Stat value="6"      label="能力维度" />
        </div>

        {/* CTA */}
        {isReturning ? (
          <div className="flex flex-col gap-3 mt-5">
            <button
              onClick={handleViewLast}
              className="w-full flex items-center justify-between gap-3 bg-white hover:bg-white/95 text-[#0a1733] font-semibold py-4 px-5 rounded-2xl shadow-lg shadow-black/20 transition-all active:scale-[0.98]"
            >
              <span className="text-[15px]">查看上次报告</span>
              <ArrowRight className="w-4 h-4 text-[#0045c4]" />
            </button>
            <button
              onClick={handleStartNew}
              className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-medium py-4 rounded-2xl hover:bg-white/15 transition-all active:scale-[0.98]"
            >
              重新测试
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartNew}
            className="w-full mt-5 flex items-center justify-between gap-3 bg-white hover:bg-white/95 text-[#0a1733] font-semibold py-4 px-5 rounded-2xl shadow-lg shadow-black/20 transition-all active:scale-[0.98]"
          >
            <span className="text-[15px]">开始评测</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <span>预计 3 分钟</span>
              <ArrowRight className="w-4 h-4 text-[#0045c4]" />
            </span>
          </button>
        )}
      </div>

      {/* Features */}
      <div className="bg-white px-6 pt-7 pb-10 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-slate-900">评测包含</h2>
          <span className="font-mono text-[10px] text-slate-400 tracking-wider">03 PARTS</span>
        </div>

        <div className="grid gap-2.5">
          <FeatureCard
            icon={BookOpen}
            title="10 道情境题"
            tag="3 MIN"
            desc="跟随一位职场人的创业旅程，在关键决策节点做出你的选择。"
          />
          <FeatureCard
            icon={Radar}
            title="六维能力雷达"
            tag="DATA"
            desc="执行力 · 创新力 · 风险偏好 · 资源整合 · 抗压 · 商业敏锐。"
          />
          <FeatureCard
            icon={MessageSquareQuote}
            title="专属洞察报告"
            tag="REPORT"
            desc="一封写给你的、像朋友说话的报告。"
          />
        </div>

        <p className="mt-7 text-[11px] text-slate-400 text-center font-medium leading-relaxed">
          博创园 · 创业者成长平台<br />
          <span className="text-slate-300">陪你走完从想法到落地的每一步</span>
        </p>
      </div>
    </div>
  )
}
