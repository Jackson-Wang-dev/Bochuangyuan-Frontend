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
      <div className="min-h-screen flex items-center justify-center bg-brand-paper">
        <p className="text-slate-500">加载中...</p>
      </div>
    )
  }

  const { matchedPersona, dimensionScores, aiReport } = session
  const sortedScores = [...dimensionScores].sort((a, b) => a.rank - b.rank)

  return (
    <div className="min-h-screen bg-brand-paper pb-36">
      {/* Header — ink-blue */}
      <div className="ink-blue px-4 pt-10 pb-8 text-white">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white/70 text-[13px] mb-4 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          返回
        </button>
        <p className="font-mono text-[10px] text-white/50 tracking-[0.18em] uppercase mb-2">
          TA 的创业者人格报告
        </p>
        <h1 className="text-2xl font-bold">{matchedPersona.name}</h1>
      </div>

      {/* Radar */}
      <div className="px-4 py-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-slate-900">六维能力雷达</h2>
          <span className="font-mono text-[10px] text-slate-400 tracking-wider">06 DIMENSIONS</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <RadarChart scores={dimensionScores} animate={false} size={280} />
          {/* Bar list */}
          <div className="space-y-2 mt-3">
            {sortedScores.map((s, i) => {
              const barColor =
                i < 2 ? '#0045c4' : i < 4 ? 'rgba(0,69,196,0.8)' : 'rgba(0,69,196,0.6)'
              return (
                <div
                  key={s.code}
                  className="grid grid-cols-[16px_1fr_32px] items-center gap-2 text-[12px]"
                >
                  <span
                    className={`font-mono font-semibold ${
                      i < 2 ? 'text-[#0045c4]' : 'text-slate-400'
                    }`}
                  >
                    {String(s.rank).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span className="font-medium text-slate-700">{s.name}</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${s.normalizedScore}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                  <span
                    className={`font-mono tabular-nums font-semibold text-right ${
                      i < 4 ? 'text-slate-700' : 'text-slate-500'
                    }`}
                  >
                    {s.normalizedScore}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Persona */}
      <div className="mb-6">
        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-3 px-4">
          创业者人格
        </h2>
        <PersonaCard persona={matchedPersona} showDescription={true} />
      </div>

      {/* AI Report */}
      {aiReport && (
        <div className="mb-8">
          <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-3 px-4">
            专属洞察
          </h2>
          <AiReportSection content={aiReport.content} shouldStart={true} />
        </div>
      )}

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] bg-white border-t border-slate-100 px-4 py-4 shadow-xl">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#0045c4] text-white font-bold text-base rounded-2xl shadow-sm hover:bg-[#003ba8] transition-colors active:scale-[0.98]"
        >
          测测你是哪一型创业者？
          <ArrowRight size={20} />
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          免费 · 预计 3 分钟 · <span className="font-mono tabular-nums">23</span> 种创业者类型
        </p>
      </div>
    </div>
  )
}
