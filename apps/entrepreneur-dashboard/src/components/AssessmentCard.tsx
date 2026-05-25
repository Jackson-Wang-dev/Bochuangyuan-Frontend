import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, RotateCcw, Brain } from 'lucide-react'
import {
  useAssessmentStore,
  useAssessmentUserStore,
  questions,
  DIMENSIONS,
  RadarChart,
  PersonaCard,
  AiReportSection,
  LoadingScreen,
  StoryScene,
  OptionCard,
  ProgressBar,
  generateAiReport,
  generatePoster,
} from '@bochuangyuan/assessment-core'

type Phase = 'intro' | 'quiz' | 'nickname' | 'result'
type Stage = 'radar' | 'persona' | 'loading' | 'report' | 'done'

export function AssessmentCard() {
  const {
    session,
    currentQuestionIndex,
    startSession,
    answerQuestion,
    completeQuiz,
    setNickname,
    setAiReport,
    setCompleted,
    resetSession,
    loadSession,
  } = useAssessmentStore()
  const { clientId, initClientId, saveReport } = useAssessmentUserStore()

  const [phase, setPhase] = useState<Phase>('intro')
  const [stage, setStage] = useState<Stage>('radar')
  const [radarReady, setRadarReady] = useState(false)
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [visible, setVisible] = useState(true)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right')
  const [nicknameInput, setNicknameInput] = useState('')
  const questionStartTime = useRef(Date.now())
  const isExistingSession = useRef(false)

  // Check for existing completed session from either app
  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentSession')
      if (!raw) return
      const s = JSON.parse(raw)
      if (s.matchedPersona && (s.status === 'completed' || s.status === 'quiz_done')) {
        loadSession(s)
        isExistingSession.current = true
        setRadarReady(true)
        setStage('done')
        setPhase('result')
      }
    } catch (_) {}
  }, [loadSession])

  // Staged reveal animation for fresh results
  useEffect(() => {
    if (phase !== 'result' || stage !== 'radar' || isExistingSession.current) return
    const t1 = setTimeout(() => setRadarReady(true), 300)
    const t2 = setTimeout(() => setStage('persona'), 2200)
    const t3 = setTimeout(() => setStage('loading'), 3200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [phase, stage])

  // Reset question timer on question change
  useEffect(() => {
    questionStartTime.current = Date.now()
    setSelectedOptionId(null)
  }, [currentQuestionIndex])

  const handleStart = () => {
    const id = clientId || initClientId()
    startSession(id)
    setPhase('quiz')
  }

  const handleSelect = (optionId: number) => {
    if (isAnimating || selectedOptionId !== null) return
    const q = questions[currentQuestionIndex]
    if (!q) return

    setSelectedOptionId(optionId)
    setIsAnimating(true)

    setTimeout(() => {
      const durationMs = Date.now() - questionStartTime.current
      setSlideDir('left')
      setVisible(false)

      setTimeout(() => {
        answerQuestion(q.id, optionId, durationMs)
        if (currentQuestionIndex + 1 >= questions.length) {
          setPhase('nickname')
          setIsAnimating(false)
        } else {
          setSlideDir('right')
          setVisible(true)
          setSelectedOptionId(null)
          setIsAnimating(false)
        }
      }, 300)
    }, 500)
  }

  const finishQuiz = (name: string) => {
    const trimmed = name.trim()
    if (trimmed) setNickname(trimmed)

    const { scores, persona } = completeQuiz()
    const current = useAssessmentStore.getState().session!
    const report = generateAiReport(persona, current.answers, questions, scores, trimmed || undefined)
    setAiReport(report)
    setCompleted()

    const final = useAssessmentStore.getState().session!
    saveReport(final)

    isExistingSession.current = false
    setRadarReady(false)
    setStage('radar')
    setPhase('result')
  }

  const handleLoadingComplete = useCallback(() => setStage('report'), [])
  const handleReportComplete = useCallback(() => setStage('done'), [])

  const handleReset = () => {
    resetSession()
    setNicknameInput('')
    setSelectedOptionId(null)
    setVisible(true)
    isExistingSession.current = false
    setRadarReady(false)
    setStage('radar')
    setPhase('intro')
  }

  const handleDownloadPoster = () => {
    if (!session) return
    generatePoster(session, `创业者画像-${session.matchedPersona?.name ?? '报告'}.jpg`)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const noAnimation = isExistingSession.current

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center min-h-[360px]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5b5fed] to-[#8b5cf6] flex items-center justify-center mb-6 shadow-xl shadow-[#5b5fed]/20 rotate-6">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">AI 深度创业人格测评</h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-2">
          10 道故事场景决策题，揭示你的核心创业思维模型
        </p>
        <p className="text-slate-400 text-xs mb-8">匹配历史级创业者人格原型 · 6 维能力雷达 · 专属 AI 洞察</p>
        <button
          onClick={handleStart}
          className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          开始测评 →
        </button>
      </div>
    )
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  if (phase === 'quiz' && currentQuestion) {
    return (
      <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#5b5fed] to-[#7c3aed]">
        <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
        <div
          className="transition-all duration-300 ease-in-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible
              ? 'translateX(0)'
              : slideDir === 'left'
                ? 'translateX(-40px)'
                : 'translateX(40px)',
          }}
        >
          <StoryScene
            sequence={currentQuestion.sequence}
            sceneTitle={currentQuestion.sceneTitle}
            sceneDescription={currentQuestion.sceneDescription}
            questionText={currentQuestion.questionText}
          />
          <div className="bg-gray-50 rounded-t-3xl px-4 pt-6 pb-8">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4 px-1">
              你心里的念头
            </p>
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={selectedOptionId === option.id}
                  disabled={selectedOptionId !== null}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Nickname ───────────────────────────────────────────────────────────────
  if (phase === 'nickname') {
    return (
      <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#5b5fed] to-[#7c3aed] flex flex-col items-center justify-center py-12 px-8 min-h-[380px]">
        <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-8">
          测评完成
        </p>
        <h2 className="text-white text-2xl font-bold text-center mb-3 leading-snug">
          最后一步，怎么称呼你？
        </h2>
        <p className="text-white/55 text-sm text-center mb-10">
          画报和报告里会用你提供的名字
        </p>
        <div className="w-full max-w-xs">
          <input
            type="text"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && finishQuiz(nicknameInput)}
            placeholder="输入你的名字或昵称"
            maxLength={12}
            autoFocus
            className="w-full px-5 py-4 rounded-2xl text-center text-lg font-semibold bg-white/15 text-white placeholder-white/35 border border-white/25 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all"
          />
          <button
            onClick={() => finishQuiz(nicknameInput)}
            className="mt-4 w-full py-4 rounded-2xl bg-white text-[#5b5fed] font-bold text-base hover:bg-white/90 transition-all active:scale-[0.98] shadow-lg"
          >
            查看我的报告 →
          </button>
          <button
            onClick={() => finishQuiz('')}
            className="mt-3 w-full py-2 text-white/45 text-sm hover:text-white/65 transition-colors"
          >
            跳过
          </button>
        </div>
      </div>
    )
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (phase === 'result' && session?.matchedPersona) {
    const { matchedPersona, dimensionScores, aiReport } = session
    const sortedScores = [...dimensionScores].sort((a, b) => a.rank - b.rank)

    return (
      <div className="bg-gray-50 rounded-2xl overflow-hidden pb-6">
        <div className="bg-gradient-to-b from-[#5b5fed] via-[#8b5cf6] to-gray-50 px-4 pt-10 pb-6 text-white text-center">
          <p className="text-white/70 text-sm mb-1">测评完成</p>
          <h1 className="text-2xl font-bold">你的创业者人格</h1>
        </div>

        {/* Radar chart */}
        <div
          className={`px-4 py-6 transition-all duration-700 ${
            noAnimation || stage !== 'radar' ? 'opacity-100' : radarReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">
            六维能力雷达
          </h2>
          <div className="bg-white rounded-3xl shadow-lg p-5">
            <RadarChart
              scores={dimensionScores}
              animate={!noAnimation && stage === 'radar'}
              size={260}
            />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {sortedScores.map((s, i) => {
                const dim = DIMENSIONS.find((d) => d.code === s.code)
                return (
                  <div
                    key={s.code}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-xl bg-gray-50"
                    style={{
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

        {/* Persona card */}
        {(noAnimation ||
          stage === 'persona' ||
          stage === 'loading' ||
          stage === 'report' ||
          stage === 'done') && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 px-4">
              你的创业者人格
            </h2>
            <PersonaCard persona={matchedPersona} showDescription />
          </div>
        )}

        {/* Loading screen */}
        {stage === 'loading' && !noAnimation && (
          <div className="mx-4 bg-white rounded-3xl shadow-lg">
            <LoadingScreen onComplete={handleLoadingComplete} />
          </div>
        )}

        {/* AI report */}
        {(stage === 'report' || stage === 'done' || noAnimation) && aiReport && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 px-4">
              专属洞察
            </h2>
            <AiReportSection
              content={aiReport.content}
              shouldStart={(!noAnimation && stage === 'report') || noAnimation}
              onComplete={handleReportComplete}
            />
          </div>
        )}

        {/* Actions */}
        {(stage === 'done' || noAnimation) && (
          <div className="px-4 mt-4 flex gap-3 animate-fade-in">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-[#5b5fed] text-[#5b5fed] font-semibold text-sm hover:bg-[#5b5fed]/5 transition-colors"
            >
              <RotateCcw size={16} />
              重新测评
            </button>
            <button
              onClick={handleDownloadPoster}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#5b5fed] text-white font-semibold text-sm hover:bg-[#4f54d4] transition-colors shadow-lg"
            >
              <Download size={16} />
              保存画报
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}
