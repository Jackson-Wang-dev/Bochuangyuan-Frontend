import { ArrowRight, ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AiReportSection from '../components/AiReportSection'
import PersonaCard from '../components/PersonaCard'
import RadarChart from '../components/RadarChart'
import { personas } from '../mock/personas'
import { questions } from '../mock/questions'
import { useUserStore } from '../store/userStore'
import type { AssessmentSession } from '../types'
import { DIMENSIONS } from '../types'
import { generateAiReport } from '../utils/aiReportSimulator'

// TODO: remove buildDemoSession fallback once reportUuid lookup is backed by real API
// Fallback demo session using Edison persona
function buildDemoSession(): AssessmentSession {
  const edisonPersona = personas.find((p) => p.code === 'edison')!

  // Simulate answers that would produce Edison type
  const demoAnswers = [
    { questionId: 1, optionId: 11, durationMs: 4200 },
    { questionId: 2, optionId: 24, durationMs: 3100 },
    { questionId: 3, optionId: 31, durationMs: 5800 },
    { questionId: 4, optionId: 42, durationMs: 2900 },
    { questionId: 5, optionId: 54, durationMs: 4100 },
    { questionId: 6, optionId: 61, durationMs: 3500 },
    { questionId: 7, optionId: 73, durationMs: 6200 },
    { questionId: 8, optionId: 81, durationMs: 7100 },
    { questionId: 9, optionId: 91, durationMs: 3800 },
    { questionId: 10, optionId: 101, durationMs: 5500 },
  ]

  const demoScores = [
    { code: 'execution' as const, name: '执行力', rawScore: 22, normalizedScore: 92, rank: 1 },
    { code: 'innovation' as const, name: '创新力', rawScore: 19, normalizedScore: 95, rank: 2 },
    { code: 'risk_appetite' as const, name: '风险偏好', rawScore: 14, normalizedScore: 64, rank: 4 },
    { code: 'resource_integration' as const, name: '资源整合', rawScore: 10, normalizedScore: 40, rank: 6 },
    { code: 'stress_resistance' as const, name: '抗压能力', rawScore: 15, normalizedScore: 58, rank: 3 },
    { code: 'business_acumen' as const, name: '商业敏锐度', rawScore: 12, normalizedScore: 48, rank: 5 },
  ]

  const report = generateAiReport(edisonPersona, demoAnswers, questions, demoScores)

  return {
    uuid: 'demo-session',
    clientId: 'demo',
    nickname: null,
    status: 'completed',
    answers: demoAnswers,
    dimensionScores: demoScores,
    matchedPersona: edisonPersona,
    aiReport: report,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  }
}

export default function ReportDetail() {
  const { reportUuid } = useParams<{ reportUuid: string }>()
  const navigate = useNavigate()
  const { getReportByUuid } = useUserStore()
  const [session, setSession] = useState<AssessmentSession | null>(null)

  useEffect(() => {
    if (!reportUuid) return
    const found = getReportByUuid(reportUuid)
    setSession(found ?? buildDemoSession())
  }, [reportUuid, getReportByUuid])

  if (!session?.matchedPersona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  const { matchedPersona, dimensionScores, aiReport } = session
  const sortedScores = [...dimensionScores].sort((a, b) => a.rank - b.rank)

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* Header */}
      <div className="bg-result-gradient px-4 pt-10 pb-8 text-white">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          返回
        </button>
        <p className="text-white/65 text-sm mb-1">TA 的创业者人格报告</p>
        <h1 className="text-2xl font-bold">{matchedPersona.imageEmoji} {matchedPersona.name}</h1>
      </div>

      {/* Radar */}
      <div className="px-4 py-6">
        <h2 className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
          六维能力雷达
        </h2>
        <div className="bg-white rounded-3xl shadow-lg p-5">
          <RadarChart scores={dimensionScores} animate={false} size={280} />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {sortedScores.map((s) => {
              const dim = DIMENSIONS.find((d) => d.code === s.code)
              return (
                <div key={s.code} className="flex items-center gap-2 py-1.5 px-2 rounded-xl bg-gray-50">
                  <span className="text-sm font-bold text-[#5b5fed] w-5 text-center">{s.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{dim?.description}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500 tabular-nums">{s.normalizedScore}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Persona */}
      <div className="mb-6">
        <h2 className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 px-4">
          创业者人格
        </h2>
        <PersonaCard persona={matchedPersona} showDescription={true} />
      </div>

      {/* AI Report */}
      {aiReport && (
        <div className="mb-8">
          <h2 className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 px-4">
            专属洞察
          </h2>
          <AiReportSection content={aiReport.content} shouldStart={true} />
        </div>
      )}

      {/* Big CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] bg-white border-t border-gray-100 px-4 py-4 shadow-xl">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#5b5fed] text-white font-bold text-base rounded-2xl shadow-lg hover:bg-[#4f54d4] transition-colors active:scale-[0.98]"
        >
          测测你是哪一型创业者？
          <ArrowRight size={20} />
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">免费 · 3 分钟 · 23 种创业者类型</p>
      </div>
    </div>
  )
}
