// Types
export type {
  DimensionCode,
  Dimension,
  Option,
  Question,
  Answer,
  DimensionScore,
  PersonaCategory,
  PersonaTriggerRule,
  Persona,
  AiReport,
  AssessmentStatus,
  AssessmentSession,
} from './types'
export { DIMENSIONS } from './types'

// Data
export { questions } from './data/questions'
export { personas } from './data/personas'
export { reportTemplates, dimNames } from './data/aiReports'

// Utils
export { generateUuid, getOrCreateClientId } from './utils/clientId'
export { calculateScores } from './utils/scoring'
export { matchPersona } from './utils/personaMatcher'
export { generateAiReport } from './utils/aiReportSimulator'
export { generatePoster } from './utils/generatePoster'

// Stores
export { useAssessmentStore } from './store/assessmentStore'
export { useAssessmentUserStore } from './store/userStore'

// Components
export { default as RadarChart } from './components/RadarChart'
export { default as PersonaCard } from './components/PersonaCard'
export { default as AiReportSection } from './components/AiReportSection'
export { default as LoadingScreen } from './components/LoadingScreen'
export { default as StoryScene } from './components/StoryScene'
export { default as OptionCard } from './components/OptionCard'
export { default as ProgressBar } from './components/ProgressBar'
