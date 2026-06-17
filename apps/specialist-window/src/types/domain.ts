// Domain types for the specialist (评委) review system.
// App-local to avoid conflicts with @bochuangyuan/types shared package.

export type ID = string
export type ISODate = string

// ---- Expert (评委) ----

export type ExpertRole = 'reviewer' | 'leader'

export interface Expert {
  id: ID
  name: string
  role: ExpertRole
  groupId: ID
}

// ---- ReviewGroup (评审小组) ----

export interface ReviewGroup {
  id: ID
  competitionId: ID
  name: string
  leaderId: ID
  memberIds: ID[]
}

// ---- Competition & Rubric ----

export interface RubricDimension {
  id: ID
  name: string
  description: string
  maxScore: number
  weight: number // 0–1; all dimensions in a rubric must sum to 1
}

export interface Competition {
  id: ID
  name: string
  rubric: RubricDimension[]
}

// ---- Volume / Section / Field ----

export type FieldType = 'text' | 'number' | 'list' | 'table' | 'image' | 'file'

export interface Field {
  id: ID         // globally stable anchor; referenced by AIChallenge and Annotation
  label: string
  valueHtml: string
  type: FieldType
}

export interface Section {
  id: ID
  title: string
  fields: Field[]
}

export type VolumeType = 'blind' | 'open'

export interface Volume {
  id: ID
  type: VolumeType
  sections: Section[]
}

export interface ReviewProject {
  id: ID
  competitionId: ID
  title: string
  blindVolume: Volume
  openVolume: Volume
}

// getProject() response: openVolume is omitted in 'blind' stage
export interface ProjectPayload {
  id: ID
  competitionId: ID
  title: string
  blindVolume: Volume
  openVolume?: Volume
}

// ---- RiskReport (风控体检报告) ----

export type RiskLevel = 'low' | 'medium' | 'high'

export interface RiskItem {
  category: string
  finding: string
  level: RiskLevel
  detail?: string
}

export interface RiskReport {
  id: ID
  projectId: ID
  generatedAt: ISODate
  summary: string
  items: RiskItem[]
}

// ---- AI Objective Score & Challenge ----

export interface AIObjectiveScore {
  projectId: ID
  dimensionId: ID
  score: number
  rationale: string
}

export type AIChallengeKind = 'challenge' | 'question'

export interface AIChallenge {
  id: ID
  projectId: ID
  fieldId: ID  // references a Field.id within this project's volumes
  text: string
  kind: AIChallengeKind
}

// ---- Annotation (批注) ----

export interface Annotation {
  id: ID
  projectId: ID
  fieldId: ID  // references a Field.id
  startOffset: number
  endOffset: number
  quotedText: string
  comment: string
  authorId: ID
  createdAt: ISODate
}

// ---- ScoreSubmission (打分) ----

export type ReviewStageType = 'blind' | 'open'
export type ScoreStatus = 'draft' | 'submitted'

export interface DimensionScore {
  dimensionId: ID
  score: number
  comment?: string
}

export interface ScoreSubmission {
  id: ID
  projectId: ID
  expertId: ID
  stage: ReviewStageType
  dimensionScores: DimensionScore[]
  overallComment: string
  totalWeighted: number
  status: ScoreStatus
  submittedAt?: ISODate
}

// ---- ReScoringRequest (重新打分申请) ----

export type ReScoringStatus = 'pending' | 'approved' | 'rejected'

export interface ReScoringRequest {
  id: ID
  projectId: ID
  targetExpertId: ID
  requestedByLeaderId: ID
  reason: string
  status: ReScoringStatus
  createdAt: ISODate
}

// ---- Assignment (评审任务) ----

export type AssignmentStatus = 'pending' | 'done'

export interface Assignment {
  expertId: ID
  projectId: ID
  stage: ReviewStageType
  status: AssignmentStatus
}

// ---- Viewer context for annotation visibility filtering ----

export type ViewerRole = 'self' | 'leader' | 'admin'

export interface AnnotationViewer {
  expertId: ID
  role: ViewerRole
  groupId?: ID
}
