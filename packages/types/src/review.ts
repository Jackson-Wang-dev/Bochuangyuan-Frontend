export interface ScoreDimension {
  key: string
  label: string
  score: number
  weight: number
  comment?: string
}

// 初审 = blind review (desensitized), 复审 = final review (full info)
export type ReviewStage = 'initial' | 'final'

export interface ProjectSubmitter {
  name: string
  school: string
  phone: string
  email: string
  teamName?: string
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
  reviewStage: ReviewStage
  deadline?: string
  assignedAt: string
  submitter?: ProjectSubmitter  // only populated in 'final' stage
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
