import { Bookmark, Info, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OptionCard from '../components/OptionCard'
import StoryScene from '../components/StoryScene'
// TODO: replace with questions fetched from API
import { questions } from '../mock/questions'
import { useAssessmentStore } from '../store/assessmentStore'
import { useUserStore } from '../store/userStore'
import { generateAiReport } from '../utils/aiReportSimulator'

export default function Quiz() {
  const navigate = useNavigate()
  const { session, currentQuestionIndex, answerQuestion, completeQuiz, startSession, setNickname, setAiReport, setCompleted } =
    useAssessmentStore()
  const { clientId, initClientId, saveReport } = useUserStore()

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right')
  const [visible, setVisible] = useState(true)
  const [showNameInput, setShowNameInput] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const questionStartTime = useRef(Date.now())

  // Ensure we have a session
  useEffect(() => {
    if (!session) {
      const id = clientId || initClientId()
      startSession(id)
    }
  }, [session, clientId, initClientId, startSession])

  // Reset timer on question change
  useEffect(() => {
    questionStartTime.current = Date.now()
    setSelectedOptionId(null)
  }, [currentQuestionIndex])

  const currentQuestion = questions[currentQuestionIndex]
  const total = questions.length

  const finishQuiz = (name: string) => {
    const trimmed = name.trim()
    if (trimmed) setNickname(trimmed)

    const { scores, persona } = completeQuiz()
    const currentSession = useAssessmentStore.getState().session!

    const report = generateAiReport(persona, currentSession.answers, questions, scores, trimmed || undefined)
    setAiReport(report)
    setCompleted()

    const finalSession = useAssessmentStore.getState().session!
    saveReport(finalSession)

    navigate('/result')
  }

  const handleSelect = (optionId: number) => {
    if (isAnimating || selectedOptionId !== null || !currentQuestion) return

    setSelectedOptionId(optionId)
    setIsAnimating(true)

    setTimeout(() => {
      const durationMs = Date.now() - questionStartTime.current

      // Slide out
      setSlideDir('left')
      setVisible(false)

      setTimeout(() => {
        answerQuestion(currentQuestion.id, optionId, durationMs)

        const nextIndex = currentQuestionIndex + 1

        if (nextIndex >= questions.length) {
          // Last question answered — show name input
          setShowNameInput(true)
          setIsAnimating(false)
        } else {
          // Slide in next question
          setSlideDir('right')
          setVisible(true)
          setSelectedOptionId(null)
          setIsAnimating(false)
        }
      }, 300)
    }, 500)
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-paper">
        <p className="text-slate-500">加载中...</p>
      </div>
    )
  }

  // Name input final screen — ink-blue treatment
  if (showNameInput) {
    return (
      <div className="min-h-screen flex flex-col ink-blue">
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <p className="font-mono text-[11px] text-white/50 tracking-[0.18em] uppercase mb-8">
            测评完成
          </p>
          <h2 className="text-white text-2xl font-bold text-center mb-3 leading-snug">
            最后一步，怎么称呼你？
          </h2>
          <p className="text-white/55 text-[13px] text-center mb-10">
            报告里会用你提供的名字
          </p>

          <div className="w-full max-w-xs">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && nicknameInput.trim() && finishQuiz(nicknameInput)}
              placeholder="输入你的名字或昵称"
              maxLength={12}
              autoFocus
              className="w-full px-5 py-4 rounded-2xl text-center text-lg font-semibold bg-white/10 text-white placeholder-white/35 border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
            />

            <button
              onClick={() => finishQuiz(nicknameInput)}
              disabled={!nicknameInput.trim()}
              className="mt-4 w-full py-4 rounded-2xl bg-white text-[#0045c4] font-bold text-base hover:bg-white/95 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              查看我的报告 →
            </button>

            <button
              onClick={() => finishQuiz('')}
              className="mt-3 w-full py-2 text-white/45 text-[13px] hover:text-white/65 transition-colors"
            >
              跳过
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-paper">
        <p className="text-slate-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-paper">
      {/* Top sticky bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 pt-12 pb-3">
        <div className="flex items-center justify-between mb-2">
          {/* Close button */}
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Center: question counter + scene title */}
          <div className="text-center">
            <div className="font-mono tabular-nums text-[13px] font-semibold text-slate-900">
              {String(currentQuestionIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase mt-0.5">
              {currentQuestion.sceneTitle}
            </div>
          </div>

          {/* Bookmark placeholder */}
          <button className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* 10-segment progress row */}
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < currentQuestionIndex + 1 ? 'bg-[#0045c4]' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
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
          {/* Story scene */}
          <StoryScene
            sequence={currentQuestion.sequence}
            sceneTitle={currentQuestion.sceneTitle}
            sceneDescription={currentQuestion.sceneDescription}
            questionText={currentQuestion.questionText}
          />

          {/* Options */}
          <div className="px-5 pt-5 pb-6 space-y-2.5">
            {currentQuestion.options.map((option, index) => (
              <OptionCard
                key={option.id}
                option={option}
                index={index}
                selected={selectedOptionId === option.id}
                disabled={selectedOptionId !== null}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Accompany whisper */}
          <div className="px-5 pb-8 flex items-center gap-2 text-[11px] text-slate-400">
            <Info className="w-3 h-3" />
            <span>没有标准答案 — 你的选择会指向不同人格</span>
          </div>
        </div>
      </div>
    </div>
  )
}
