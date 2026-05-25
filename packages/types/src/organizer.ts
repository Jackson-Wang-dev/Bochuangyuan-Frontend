import type { ScoreDimension } from './review'

export interface ScoreDimensionConfig {
  key: string
  label: string
  weight: number
  description?: string
}

export interface OrganizerCompetition {
  competitionId: string
  name: string
  organizerId: string
  status: 'draft' | 'open' | 'reviewing' | 'closed' | 'finished'
  enrollDeadline: string
  reviewDeadline: string
  scoreDimensions: ScoreDimensionConfig[]
  enrollCount: number
  createdAt: string
  description?: string
  coverUrl?: string
}

export interface Expert {
  expertId: string
  name: string
  organization: string
  domain: string[]
  source: 'platform' | 'manual'
  contactInfo?: string
}

export interface ExpertScoreView {
  expertId: string
  expertName: string
  dimensions: ScoreDimension[]
  finalScore: number
  submittedAt: string
}

export interface EnrollmentRecord {
  enrollId: string
  competitionId: string
  projectId: string
  projectName: string
  versionId: string
  entrepreneurId: string
  entrepreneurName: string
  status: 'enrolled' | 'reviewing' | 'scored' | 'awarded'
  scores: ExpertScoreView[]
  finalScore?: number
  enrolledAt: string
}

export interface ReviewAssignment {
  assignmentId: string
  competitionId: string
  expertId: string
  enrollIds: string[]
  assignedAt: string
}

export interface StaffMember {
  staffId: string
  name: string
  email: string
  role: 'admin' | 'reviewer' | 'viewer'
  joinedAt: string
}

export interface OperationLog {
  logId: string
  operatorId: string
  operatorName: string
  action: string
  targetType: string
  targetId: string
  detail: string
  createdAt: string
}
