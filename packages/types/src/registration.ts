import type { ID, ISODate, FileRef } from './shared'

export type RegType = 'Individual' | 'Team'

export type RegistrationStatus =
  | 'PreReg'
  | 'PendingReview'
  | 'UnderReview'
  | 'Approved'
  | 'Rejected'
  | 'Locked'
  | 'PrelimRegDone'
  | 'Terminated'

export type ManualResult = 'Pass' | 'Missing' | 'Abnormal' | 'Reject'
export type QualReviewStatus = 'PendingManual' | 'UnderReview' | 'Approved' | 'Rejected'
export type GreenChannelResult = 'Pass' | 'Fail'

// E05 — table: team_members (competition team, not enterprise team)
export interface ProjectTeamMember {
  memberId: ID
  projectId: ID
  name: string
  role: 'Leader' | 'Member'
  contact?: string
}

// E06 — table: registrations
export interface Registration {
  regId: ID
  competitionId: ID
  projectId: ID
  userId: ID
  formValues: Record<string, unknown>
  regType: RegType
  isExistingProject?: boolean
  isGreenChannel?: boolean
  status: RegistrationStatus
  submittedAt?: ISODate
  lockedAt?: ISODate
}

// E07 — table: qualification_reviews (manual only, no AI)
export interface QualificationReview {
  reviewId: ID
  regId: ID
  manualReviewerId?: ID
  manualResult?: ManualResult
  rejectReason?: string
  status: QualReviewStatus
  fixRecords?: { at: ISODate; note: string }[]
  updatedAt?: ISODate
}

// E08 — table: green_channel_reviews
export interface GreenChannelReview {
  gcId: ID
  regId: ID
  materials: FileRef[]
  reviewerId?: ID
  result?: GreenChannelResult
  comment?: string
  directToSemifinal?: boolean
}
