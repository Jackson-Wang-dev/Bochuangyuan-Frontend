export interface ScoreDimension {
  key: string
  label: string
  score: number
  weight: number
  comment?: string
}

export interface ReviewTask {
  taskId: string
  projectId: string
  projectName: string
  projectDomain: string
  submittedVersionId: string
  competitionId: string
  competitionName: string
  status: 'pending' | 'scoring' | 'done'
  deadline?: string
  assignedAt: string
}

export interface ScoreDraft {
  taskId: string
  dimensions: ScoreDimension[]
  overallComment: string
  savedAt: string
}

export interface SubmittedScore extends ScoreDraft {
  finalScore: number
  submittedAt: string
}
