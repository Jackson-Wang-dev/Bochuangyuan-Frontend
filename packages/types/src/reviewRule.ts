export interface ReviewDimension {
  id: string
  label: string
  weight: number
  maxScore: number
  description?: string
  _backendKey?: string
}

export interface ReviewPhaseConfig {
  phase: 'preliminary' | 'semifinal' | 'final' | 'roadshow'
  label: string
  enabled: boolean
  dimensions: ReviewDimension[]
  commentsRequired: boolean
  advanceQuota?: number
  deadline?: string
}

export interface ReviewRuleSchema {
  id: string
  name: string
  phases: ReviewPhaseConfig[]
  createdAt: string
  updatedAt: string
  contestId?: string
  version?: number
  _syncStatus?: 'local' | 'synced' | 'conflict'
}

export interface ReviewScore {
  dimensionId: string
  score: number
}

// Expert-facing review task (new review system)
export interface ExpertTask {
  id: string
  phase: ReviewPhaseConfig['phase']
  projectId: string
  projectName: string
  projectSummary?: string
  attachments?: { name: string; url: string; type: string }[]
  expertId: string
  status: 'pending' | 'in_progress' | 'submitted'
  scores: ReviewScore[]
  comment: string
  recommendAdvance: boolean
  submittedAt?: string
  contestId?: string
  _lockVersion?: number
}

export interface ExpertProgress {
  expertId: string
  expertName: string
  total: number
  submitted: number
}

export interface ProjectReviewSummary {
  projectId: string
  projectName: string
  totalScore: number
  rank: number
  expertScores: { expertId: string; total: number; submitted: boolean }[]
  recommendCount: number
}
