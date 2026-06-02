import type { ID, ISODate } from './shared'

export type JudgeRole = 'Prelim' | 'Semifinal' | 'Final'
export type ReviewStage = 'Prelim' | 'Semifinal' | 'Final'
export type AssignProgress = 'NotStarted' | 'InProgress' | 'Done'
export type SubmitStatus = 'Draft' | 'Submitted'
export type StageStatus =
  | 'PrelimInProgress'
  | 'PrelimDone'
  | 'SemifinalInProgress'
  | 'SemifinalDone'
  | 'FinalInProgress'
  | 'Ranked'
  | 'Ended'

// E09 — table: judges
export interface Judge {
  judgeId: ID
  name: string
  org?: string
  contact?: string
  expertise?: string[]
  role?: JudgeRole
}

// E10 — table: judge_assignments
export interface JudgeAssignment {
  assignId: ID
  competitionId: ID
  stage: ReviewStage
  judgeId: ID
  projectIds: ID[]
  assignedAt: ISODate
  progress?: AssignProgress
}

// E11 — table: reviews (one judge's score+comment for one project in one stage)
export interface Review {
  scoreId: ID
  projectId: ID
  judgeId: ID
  stage: ReviewStage
  dimScores: Record<string, number>
  totalScore: number
  comment?: string
  submitStatus: SubmitStatus
  submittedAt?: ISODate
}

// E12 — table: stage_results
export interface StageResult {
  projectId: ID
  competitionId: ID
  stage: ReviewStage
  avgScore?: number
  rank?: number
  promoted?: boolean
  stageStatus: StageStatus
}
