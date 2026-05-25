export interface AiAssessmentDimension {
  subject: string
  value: number
  fullMark: number
  description?: string
}

export interface AiAssessmentResult {
  assessmentId: string
  userId: string
  dimensions: AiAssessmentDimension[]
  overallScore: number
  summary: string
  suggestions: string[]
  createdAt: string
}

export interface AiVersionDiff {
  versionAId: string
  versionBId: string
  analysis: string
  improvements: string[]
  regressions: string[]
  wordCountDelta: number
}
