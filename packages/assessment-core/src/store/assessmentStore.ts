import { create } from 'zustand'
import { questions } from '../data/questions'
import { personas } from '../data/personas'
import type { AiReport, Answer, AssessmentSession, DimensionScore, Persona } from '../types'
import { generateUuid } from '../utils/clientId'
import { matchPersona } from '../utils/personaMatcher'
import { calculateScores } from '../utils/scoring'

interface AssessmentStore {
  session: AssessmentSession | null
  currentQuestionIndex: number
  isTransitioning: boolean

  startSession: (clientId: string) => void
  answerQuestion: (questionId: number, optionId: number, durationMs: number) => void
  completeQuiz: () => { scores: DimensionScore[]; persona: Persona }
  setNickname: (name: string) => void
  setAiReport: (report: AiReport) => void
  setCompleted: () => void
  resetSession: () => void
  loadSession: (session: AssessmentSession) => void
  setTransitioning: (v: boolean) => void
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  session: null,
  currentQuestionIndex: 0,
  isTransitioning: false,

  startSession: (clientId) => {
    const now = new Date().toISOString()
    const session: AssessmentSession = {
      uuid: generateUuid(),
      clientId,
      nickname: null,
      status: 'started',
      answers: [],
      dimensionScores: [],
      matchedPersona: null,
      aiReport: null,
      createdAt: now,
      completedAt: null,
    }
    set({ session, currentQuestionIndex: 0 })
    localStorage.setItem('currentSession', JSON.stringify(session))
  },

  answerQuestion: (questionId, optionId, durationMs) => {
    const { session } = get()
    if (!session) return

    const answer: Answer = { questionId, optionId, durationMs }
    const updatedAnswers = [...session.answers, answer]
    const updatedSession = { ...session, answers: updatedAnswers }

    set((state) => ({
      session: updatedSession,
      currentQuestionIndex: state.currentQuestionIndex + 1,
    }))
    localStorage.setItem('currentSession', JSON.stringify(updatedSession))
  },

  completeQuiz: () => {
    const { session } = get()
    if (!session) throw new Error('No active session')

    const scores = calculateScores(session.answers, questions)
    const persona = matchPersona(scores, personas)

    const updatedSession: AssessmentSession = {
      ...session,
      status: 'quiz_done',
      dimensionScores: scores,
      matchedPersona: persona,
    }

    set({ session: updatedSession })
    localStorage.setItem('currentSession', JSON.stringify(updatedSession))

    return { scores, persona }
  },

  setNickname: (name) => {
    const { session } = get()
    if (!session) return
    const updatedSession = { ...session, nickname: name }
    set({ session: updatedSession })
    localStorage.setItem('currentSession', JSON.stringify(updatedSession))
  },

  setAiReport: (report) => {
    const { session } = get()
    if (!session) return

    const updatedSession = { ...session, aiReport: report }
    set({ session: updatedSession })
    localStorage.setItem('currentSession', JSON.stringify(updatedSession))
  },

  setCompleted: () => {
    const { session } = get()
    if (!session) return

    const updatedSession: AssessmentSession = {
      ...session,
      status: 'completed',
      completedAt: new Date().toISOString(),
    }
    set({ session: updatedSession })
    localStorage.setItem('currentSession', JSON.stringify(updatedSession))
  },

  resetSession: () => {
    set({ session: null, currentQuestionIndex: 0 })
    localStorage.removeItem('currentSession')
  },

  loadSession: (session) => {
    set({ session, currentQuestionIndex: session.answers.length })
  },

  setTransitioning: (v) => set({ isTransitioning: v }),
}))
