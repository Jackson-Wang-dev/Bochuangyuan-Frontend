import { ArrowLeft, BookOpen, Download, FileCheck, MoreHorizontal, Share2, Users } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AiReportSection from '../components/AiReportSection'
import LoadingScreen from '../components/LoadingScreen'
import RadarChart from '../components/RadarChart'
import ShareModal from '../components/ShareModal'
import { useAssessmentStore } from '../store/assessmentStore'
import type { AssessmentSession } from '../types'
import { DIMENSIONS } from '../types'
import { generatePoster } from '../utils/generatePoster'

type Stage = 'radar' | 'persona' | 'loading' | 'report' | 'done'

const exploreItems = [
  { icon: BookOpen, title: '创业课程', desc: '从 0 到 1 的系统化创业知识体系' },
  { icon: Users,    title: '创业者社群', desc: '加入与你同频的创业者圈子' },
  { icon: FileCheck, title: '商业计划评估', desc: '专业顾问帮你打磨商业计划书' },
]

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
      <div className="min-h-screen flex items-center justify-center bg-brand-paper">
        <p className="text-slate-500">报告加载中...</p>
      </div>
    )
  }

  const { matchedPersona, dimensionScores, aiReport } = session
  const sortedScores = [...dimensionScores].sort((a, b) => a.rank - b.rank)
  const rarityPercent = Math.round(matchedPersona.rarity * 100)

  // Derive a paddedId from session uuid (last 5 hex chars → decimal-ish)
  const paddedId = session.uuid ? String(parseInt(session.uuid.slice(-4), 16) % 99999).padStart(5, '0') : '00001'

  return (
    <div className="min-h-screen bg-brand-paper pb-32">
      {/* Export target wrapper */}
      <div id="report-export-target">

        {/* Ink header — persona reveal */}
        <div className="ink-blue text-white pt-12 pb-7 px-5 relative">
          {/* Top navigation bar */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[10px] text-white/50 tracking-[0.18em] uppercase">
              Report · #{paddedId}
            </span>
            <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Persona reveal */}
          <div>
            <div className="flex items-end justify-between mb-3">
              <p className="font-mono text-[10px] text-white/50 tracking-[0.18em] uppercase">
                Your persona
              </p>
              {/* Rarity chip */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[10px] font-semibold text-amber-300 tracking-wider">
                  {matchedPersona.rarityLabel} · {rarityPercent}%
                </span>
              </div>
            </div>

            <div className="flex items-end gap-4">
              {/* Monogram tile — first character of persona name on brand-blue gradient */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0045c4] to-[#003ba8] flex items-center justify-center text-white shadow-xl shadow-[#0045c4]/30 shrink-0">
                <span className="font-serif text-4xl font-bold">
                  {matchedPersona.name.charAt(0)}
                </span>
              </div>
              <div className="pb-1">
                <h1 className="text-3xl font-bold tracking-tight leading-tight">
                  {matchedPersona.name}
                </h1>
                <p className="text-[13px] text-white/65 mt-1">
                  Persona · 23 类人格
                </p>
              </div>
            </div>

            {/* Keyword quote — serif italic with brand-blue left rule */}
            <blockquote className="mt-5 border-l-2 border-[#0045c4] pl-4 text-[15px] text-white/85 font-serif italic leading-relaxed">
              "{matchedPersona.keyword}"
            </blockquote>
          </div>
        </div>

        {/* Description card — overlaps ink header slightly */}
        <div className="px-5 -mt-3 relative">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-slate-700 text-[13px] leading-[1.8]">
              {matchedPersona.staticDescription}
            </p>
          </div>
        </div>

        {/* Section 1: Radar */}
        <div
          className={`px-5 pt-5 transition-all duration-700 ${
            noAnimation || stage !== 'radar' ? 'opacity-100' : radarReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-slate-900">六维能力雷达</h2>
            <span className="font-mono text-[10px] text-slate-400 tracking-wider">06 DIMENSIONS</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <RadarChart scores={dimensionScores} animate={!noAnimation && stage === 'radar'} size={280} />

            {/* Bar list — ranked single column */}
            <div className="space-y-2 mt-3">
              {sortedScores.map((s, i) => {
                const barColor =
                  i < 2 ? '#0045c4' : i < 4 ? 'rgba(0,69,196,0.8)' : 'rgba(0,69,196,0.6)'
                return (
                  <div
                    key={s.code}
                    className="grid grid-cols-[16px_1fr_32px] items-center gap-2 text-[12px]"
                    style={{
                      opacity: noAnimation || stage !== 'radar' || radarReady ? 1 : 0,
                      transition: `opacity 0.4s ease ${i * 120}ms`,
                    }}
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

        {/* Section 2: Loading → AI Report */}
        {stage === 'loading' && !noAnimation && (
          <div className="mx-5 mt-5 bg-white rounded-2xl border border-slate-200">
            <LoadingScreen onComplete={handleLoadingComplete} />
          </div>
        )}

        {(stage === 'report' || stage === 'done' || noAnimation) && aiReport && (
          <div className="mb-6 animate-fade-in" style={{ animationFillMode: 'both' }}>
            <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4 px-5 mt-5">
              专属洞察
            </h2>
            <AiReportSection
              content={aiReport.content}
              shouldStart={(!noAnimation && stage === 'report') || noAnimation}
              onComplete={handleReportComplete}
            />
          </div>
        )}
      </div>

      {/* Continue exploring cards */}
      {(stage === 'done' || noAnimation) && (
        <div className="px-5 mt-6 animate-fade-in">
          <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4">
            继续探索
          </h2>
          <div className="grid gap-3">
            {exploreItems.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-slate-100 cursor-pointer hover:border-[#0045c4]/20 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0045c4]/8 text-[#0045c4] flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky bottom actions */}
      {(stage === 'done' || noAnimation) && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] bg-white border-t border-slate-100 px-4 py-4 flex gap-3 animate-fade-in shadow-xl">
          <button
            onClick={() => setShowShare(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors active:scale-[0.98]"
          >
            <Share2 size={16} />
            分享
          </button>
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0045c4] hover:bg-[#003ba8] text-white font-semibold text-sm transition-colors active:scale-[0.98] shadow-sm"
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
