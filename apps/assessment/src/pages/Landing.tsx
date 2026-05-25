import { ArrowRight, BookOpen, ClipboardList, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssessmentStore } from '../store/assessmentStore'
import { useUserStore } from '../store/userStore'
import type { AssessmentSession } from '../types'

const TOTAL_USERS = 12847

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
      {/* Hero gradient */}
      <div className="bg-brand-gradient px-6 pt-16 pb-12 text-white">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="px-3 py-1.5 bg-white/15 text-white/90 text-xs font-medium rounded-full backdrop-blur-sm">
            ✦ 创业者人格评测
          </span>
        </div>

        {/* Main title */}
        <h1 className="text-4xl font-bold text-center leading-tight mb-3">
          3 分钟
          <br />
          <span className="text-white/90">发现你的创业者人格</span>
        </h1>
        <p className="text-center text-white/75 text-base mb-8">
          23 种创业者类型，你属于哪一种？
        </p>

        {/* Returning user card */}
        {isReturning && lastReport?.matchedPersona && (
          <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl p-4 mb-6">
            <p className="text-white/70 text-xs mb-1">欢迎回来 👋</p>
            <p className="text-white font-semibold text-base">
              你上次的画像是{' '}
              <span className="text-[#FFB547]">
                {lastReport.matchedPersona.imageEmoji} {lastReport.matchedPersona.name}
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

        {/* CTA Buttons */}
        {isReturning ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleViewLast}
              className="w-full flex items-center justify-center gap-2 bg-white text-[#5b5fed] font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <BookOpen size={18} />
              查看上次报告
            </button>
            <button
              onClick={handleStartNew}
              className="w-full flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white font-medium py-4 rounded-2xl hover:bg-white/25 transition-all active:scale-[0.98]"
            >
              重新测试
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartNew}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#5b5fed] font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] animate-pulse-slow"
          >
            开始我的创业旅程
            <ArrowRight size={20} />
          </button>
        )}

        {/* Social proof */}
        <p className="text-center text-white/55 text-xs mt-4">
          已有 {TOTAL_USERS.toLocaleString('zh-CN')} 人测过
        </p>
      </div>

      {/* Features */}
      <div className="flex-1 bg-gray-50 px-6 pt-8 pb-10">
        <h2 className="text-base font-semibold text-gray-700 mb-4 text-center">测评包含什么</h2>

        <div className="grid gap-3">
          {[
            {
              icon: '📖',
              title: '10 道故事化情境题',
              desc: '跟随一位职场人转型创业的真实旅程，在关键决策节点做出你的选择',
            },
            {
              icon: '🎯',
              title: '六维创业者能力雷达',
              desc: '执行力、创新力、风险偏好、资源整合、抗压能力、商业敏锐度',
            },
            {
              icon: '✨',
              title: 'AI 温度报告',
              desc: '不是冷冰冰的分析，是一段像懂你的朋友说话的专属洞察',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-gray-100">
              <span className="text-2xl leading-none mt-0.5">{item.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My reports link */}
        {isReturning && (
          <button
            onClick={() => navigate('/my-reports')}
            className="w-full flex items-center justify-center gap-2 mt-4 py-3 text-sm text-gray-500 hover:text-[#5b5fed] transition-colors"
          >
            <ClipboardList size={15} />
            查看我的历史报告
          </button>
        )}

        {/* Tagline */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-[#5b5fed] mb-1">
            <Sparkles size={14} />
            <span className="text-xs font-medium">博创园 · 创业者成长平台</span>
          </div>
          <p className="text-xs text-gray-400">助力每一位有想法的人，走向创业之路</p>
        </div>
      </div>
    </div>
  )
}
