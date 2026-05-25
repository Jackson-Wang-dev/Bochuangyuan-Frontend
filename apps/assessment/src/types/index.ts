export type DimensionCode =
  | 'execution'
  | 'innovation'
  | 'risk_appetite'
  | 'resource_integration'
  | 'stress_resistance'
  | 'business_acumen'

export interface Dimension {
  code: DimensionCode
  name: string
  description: string
}

export interface Option {
  id: number
  label: 'A' | 'B' | 'C' | 'D'
  content: string
  scores: Partial<Record<DimensionCode, number>>
}

export interface Question {
  id: number
  sequence: number
  sceneTitle: string
  sceneDescription: string
  questionText: string
  options: Option[]
}

export interface Answer {
  questionId: number
  optionId: number
  durationMs: number
}

export interface DimensionScore {
  code: DimensionCode
  name: string
  rawScore: number
  normalizedScore: number
  rank: number
}

export type PersonaCategory = 'top2' | 'single_high' | 'all_high' | 'all_low'

export interface PersonaTriggerRule {
  type: PersonaCategory
  primaryDim?: DimensionCode
  secondaryDim?: DimensionCode
  dominantDim?: DimensionCode
  minPrimaryScore?: number
  minSecondaryScore?: number
  minDominantScore?: number
  maxOtherScore?: number
  minAllScore?: number
  maxAllScore?: number
}

export interface Persona {
  code: string
  name: string
  category: PersonaCategory
  keyword: string
  staticDescription: string
  imageEmoji: string
  rarity: number
  rarityLabel: '稀有' | '少见' | '主流'
  triggerRule: PersonaTriggerRule
}

export interface AiReport {
  content: string
}

export type AssessmentStatus = 'started' | 'quiz_done' | 'completed'

export interface AssessmentSession {
  uuid: string
  clientId: string
  nickname: string | null
  status: AssessmentStatus
  answers: Answer[]
  dimensionScores: DimensionScore[]
  matchedPersona: Persona | null
  aiReport: AiReport | null
  createdAt: string
  completedAt: string | null
}

export const DIMENSIONS: Dimension[] = [
  { code: 'execution', name: '执行力', description: '把想法快速落地，不拖不弃' },
  { code: 'innovation', name: '创新力', description: '对新鲜事物开放，勇于突破常规' },
  { code: 'risk_appetite', name: '风险偏好', description: '面对不确定性的反应倾向' },
  { code: 'resource_integration', name: '资源整合', description: '善于连接，让资源流动起来' },
  { code: 'stress_resistance', name: '抗压能力', description: '在高压下保持稳定输出的韧性' },
  { code: 'business_acumen', name: '商业敏锐度', description: '对机会、模式和价值的本能感知' },
]
