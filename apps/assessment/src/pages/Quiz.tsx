import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OptionCard from '../components/OptionCard'
import ProgressBar from '../components/ProgressBar'
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#5b5fed] to-[#7c3aed]">
        <div className="flex-1 flex flex-col items-center justify-center px-8">
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
              onKeyDown={(e) => e.key === 'Enter' && nicknameInput.trim() && finishQuiz(nicknameInput)}
              placeholder="输入你的名字或昵称"
              maxLength={12}
              autoFocus
              className="w-full px-5 py-4 rounded-2xl text-center text-lg font-semibold bg-white/15 text-white placeholder-white/35 border border-white/25 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all"
            />

            <button
              onClick={() => finishQuiz(nicknameInput)}
              disabled={!nicknameInput.trim()}
              className="mt-4 w-full py-4 rounded-2xl bg-white text-[#5b5fed] font-bold text-base hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
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
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#5b5fed] to-[#7c3aed]">
      {/* Progress */}
      <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />

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
          {/* Story scene on gradient bg */}
          <div className="px-0 pt-2 pb-4">
            <StoryScene
              sequence={currentQuestion.sequence}
              sceneTitle={currentQuestion.sceneTitle}
              sceneDescription={currentQuestion.sceneDescription}
              questionText={currentQuestion.questionText}
            />
          </div>

          {/* White card for options */}
          <div className="bg-gray-50 rounded-t-3xl min-h-screen px-4 pt-6 pb-8">
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
    </div>
  )
}
