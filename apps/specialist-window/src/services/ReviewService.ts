// Adapter interface for the specialist review service.
// Swap MockReviewService for a real HTTP implementation without touching call sites.

import type {
  Expert,
  RubricDimension,
  ProjectPayload,
  RiskReport,
  AIObjectiveScore,
  AIChallenge,
  Annotation,
  ScoreSubmission,
  ReScoringRequest,
  Assignment,
  AnnotationViewer,
  ReviewStageType,
  DimensionScore,
  ID,
} from '@/types/domain'

// ---- Input shapes for mutation methods ----

export interface CreateAnnotationInput {
  projectId: ID
  fieldId: ID
  startOffset: number
  endOffset: number
  quotedText: string
  comment: string
  authorId: ID
}

export interface UpdateAnnotationInput {
  comment: string
}

export interface ScoreInput {
  projectId: ID
  expertId: ID
  stage: ReviewStageType
  dimensionScores: DimensionScore[]
  overallComment: string
}

export interface CreateReScoringRequestInput {
  projectId: ID
  targetExpertId: ID
  requestedByLeaderId: ID
  reason: string
}

// ---- Service adapter interface ----

export interface ReviewService {
  /** Mock: maps any wechatCode to an expert (prod: exchange code for session) */
  login(wechatCode: string): Promise<Expert>

  getCurrentExpert(): Promise<Expert>

  /** Returns all assignments for an expert, driving the pending/done lists */
  getAssignments(expertId: ID): Promise<Assignment[]>

  /**
   * Returns the project with volumes appropriate for the stage:
   * - 'blind': only blindVolume (openVolume is omitted to prevent data leakage)
   * - 'open': both blindVolume and openVolume
   */
  getProject(projectId: ID, stage: ReviewStageType): Promise<ProjectPayload>

  getRubric(competitionId: ID): Promise<RubricDimension[]>

  getRiskReport(projectId: ID): Promise<RiskReport>

  getAIObjectiveScores(projectId: ID): Promise<AIObjectiveScore[]>

  getAIChallenges(projectId: ID): Promise<AIChallenge[]>

  /**
   * Returns annotations filtered by viewer identity:
   * - 'self'  : only annotations the viewer authored
   * - 'leader': all annotations from members of the viewer's group
   * - 'admin' : all annotations for the project
   */
  getAnnotations(projectId: ID, viewer: AnnotationViewer): Promise<Annotation[]>

  createAnnotation(input: CreateAnnotationInput): Promise<Annotation>
  updateAnnotation(annotationId: ID, input: UpdateAnnotationInput): Promise<Annotation>
  deleteAnnotation(annotationId: ID): Promise<void>

  /** Returns the current submission (draft or submitted), or null if none exists */
  getScore(projectId: ID, expertId: ID): Promise<ScoreSubmission | null>

  /** Upserts a draft submission; idempotent */
  saveScoreDraft(input: ScoreInput): Promise<ScoreSubmission>

  /** Saves and marks the submission as submitted; fails if already submitted */
  submitScore(input: ScoreInput): Promise<ScoreSubmission>

  /** Leader-only: all group members' submissions for a project */
  getGroupScores(groupId: ID, projectId: ID): Promise<ScoreSubmission[]>

  createReScoringRequest(input: CreateReScoringRequestInput): Promise<ReScoringRequest>
}
