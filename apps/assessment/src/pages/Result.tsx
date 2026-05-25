import { Download, Share2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AiReportSection from '../components/AiReportSection'
import LoadingScreen from '../components/LoadingScreen'
import PersonaCard from '../components/PersonaCard'
import RadarChart from '../components/RadarChart'
import ShareModal from '../components/ShareModal'
import { useAssessmentStore } from '../store/assessmentStore'
import type { AssessmentSession } from '../types'
import { DIMENSIONS } from '../types'
import { generatePoster } from '../utils/generatePoster'

type Stage = 'radar' | 'persona' | 'loading' | 'report' | 'done'

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session: storeSession } = useAssessmentStore()

  // Support viewing a passed-in historical session
  const locationSession = (location.state as { session?: AssessmentSession } | null)?.session
  const session = locationSession ?? storeSession

  const [stage, setStage] = useState<Stage>('radar')
  const [showShare, setShowShare] = useState(false)
  const [radarReady, setRadarReady] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const noAnimation = !!locationSession

  useEffect(() => {
    if (!session) {
      navigate('/')
      return
    }

    if (noAnimation) {
      setStage('done')
      return
    }

    // Start radar animation, then after 2s show persona
    const t1 = setTimeout(() => setRadarReady(true), 300)
    const t2 = setTimeout(() => setStage('persona'), 2200)
    const t3 = setTimeout(() => setStage('loading'), 3200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [session, navigate, noAnimation])

  const handleLoadingComplete = useCallback(() => {
    setStage('report')
  }, [])

  const handleReportComplete = useCallback(() => {
    setStage('done')
  }, [])

  const handleExport = async () => {
    if (!session?.matchedPersona) return
    await generatePoster(session, `创业者画像-${session.matchedPersona.name}.jpg`)
  }

  if (!session?.matchedPersona || !session.dimensionScores.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">报告加载中...</p>
      </div>
    )
  }

  const { matchedPersona, dimensionScores, aiReport } = session

  const sortedScores = [...dimensionScores].sort((a, b) => a.rank - b.rank)

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Export target wrapper */}
      <div id="report-export-target">
        {/* Header gradient */}
        <div className="bg-result-gradient px-4 pt-12 pb-6 text-white text-center">
          <p className="text-white/70 text-sm mb-1">测评完成</p>
          <h1 className="text-2xl font-bold">你的创业者人格</h1>
        </div>

        {/* Section 1: Radar */}
        <div className={`px-4 py-6 transition-all duration-700 ${noAnimation || stage !== 'radar' ? 'opacity-100' : radarReady ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">
            六维能力雷达
          </h2>

          <div className="bg-white rounded-3xl shadow-lg p-5">
            <RadarChart scores={dimensionScores} animate={!noAnimation && stage === 'radar'} size={290} />

            {/* Score list */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {sortedScores.map((s, i) => {
                const dim = DIMENSIONS.find((d) => d.code === s.code)
                return (
                  <div
                    key={s.code}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-xl bg-gray-50"
                    style={{
                      animationDelay: `${i * 120}ms`,
                      opacity: noAnimation || stage !== 'radar' || radarReady ? 1 : 0,
                      transition: `opacity 0.4s ease ${i * 120}ms`,
                    }}
                  >
                    <span className="text-sm font-bold text-[#5b5fed] w-5 text-center">
                      {s.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400 truncate">{dim?.description}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-500 tabular-nums">
                      {s.normalizedScore}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Persona */}
        {(noAnimation || stage === 'persona' || stage === 'loading' || stage === 'report' || stage === 'done') && (
          <div
            className="mb-6 animate-fade-in"
            style={{ animationFillMode: 'both' }}
          >
            <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 px-4">
              你的创业者人格
            </h2>
            <PersonaCard persona={matchedPersona} showDescription={true} />

            {(stage === 'loading' || stage === 'report' || stage === 'done') && !noAnimation && (
              <p className="text-center text-sm text-gray-400 mt-4 animate-pulse">
                正在为你生成专属洞察...
              </p>
            )}
          </div>
        )}

        {/* Section 3: Loading → AI Report */}
        {(stage === 'loading' && !noAnimation) && (
          <div className="mx-4 bg-white rounded-3xl shadow-lg">
            <LoadingScreen onComplete={handleLoadingComplete} />
          </div>
        )}

        {(stage === 'report' || stage === 'done' || noAnimation) && aiReport && (
          <div className="mb-6 animate-fade-in" style={{ animationFillMode: 'both' }}>
            <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 px-4">
              专属洞察
            </h2>
            <AiReportSection
              content={aiReport.content}
              shouldStart={!noAnimation && stage === 'report' || noAnimation}
              onComplete={handleReportComplete}
            />
          </div>
        )}
      </div>

      {/* Platform recommendation cards */}
      {(stage === 'done' || noAnimation) && (
        <div className="px-4 mt-6 animate-fade-in">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 text-center">
            继续探索
          </h2>
          <div className="grid gap-3">
            {[
              { emoji: '📚', title: '创业课程', desc: '从 0 到 1 的系统化创业知识体系' },
              { emoji: '🤝', title: '创业者社群', desc: '加入与你同频的创业者圈子' },
              { emoji: '📋', title: '商业计划评估', desc: '专业顾问帮你打磨商业计划书' },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{item.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky bottom actions */}
      {(stage === 'done' || noAnimation) && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] bg-white border-t border-gray-100 px-4 py-4 flex gap-3 animate-fade-in shadow-xl">
          <button
            onClick={() => setShowShare(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-[#5b5fed] text-[#5b5fed] font-semibold text-sm hover:bg-[#5b5fed]/5 transition-colors active:scale-[0.98]"
          >
            <Share2 size={16} />
            分享
          </button>
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#5b5fed] text-white font-semibold text-sm hover:bg-[#4f54d4] transition-colors active:scale-[0.98] shadow-lg"
          >
            <Download size={16} />
            保存图片
          </button>
        </div>
      )}

      {/* Share modal */}
      {showShare && session && (
        <ShareModal
          reportUuid={session.uuid}
          personaName={matchedPersona.name}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
