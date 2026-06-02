// ---- Shared primitives ----
export type { ID, ISODate, Money, FileRef } from './shared'

// ---- Non-competition types ----
export type { VerifyStatus, User, AuthState } from './user'
export type { ProjectContent, ProjectVersion, Project } from './project'
export type {
  EnterpriseBasicInfo,
  Honor,
  IntellectualProperty,
  Product,
  TeamMember,
  EnterpriseProfile,
} from './enterprise'
export type { MaterialFile, MaterialFolder } from './material'
export type { AiAssessmentDimension, AiAssessmentResult, AiVersionDiff } from './ai'
export type { FieldType, FieldOption, FormField, FormSchema } from './formBuilder'

// ---- E01 Competition ----
export type {
  CompetitionStatus,
  CompetitionTag,
  SignUpType,
  Track,
  Sponsor,
  PhaseNode,
  Competition,
} from './competition'

// ---- E02 RegistrationFormConfig ----
export type { FormFieldDef, ReviewFieldDef, RegistrationFormConfig } from './registration-form'

// ---- E05~E08 Team / Registration ----
export type {
  ProjectTeamMember,
  RegType,
  RegistrationStatus,
  ManualResult,
  QualReviewStatus,
  GreenChannelResult,
  Registration,
  QualificationReview,
  GreenChannelReview,
} from './registration'

// ---- E09~E12 Judge / Review / StageResult ----
export type {
  JudgeRole,
  ReviewStage,
  AssignProgress,
  SubmitStatus,
  StageStatus,
  Judge,
  JudgeAssignment,
  Review,
  StageResult,
} from './judge'

// ---- E13~E14 Award / Settlement ----
export type {
  AwardLevel,
  PayoutStatus,
  ReimburseStatus,
  Award,
  Settlement,
} from './award'

// ---- E15~E17 Ops ----
export type { CompetitionNotification, Album, CompetitionSchedule } from './ops'

// ---- E18 Desensitization ----
export type { DesensStatus, DesensitizationRecord } from './desensitization'

// ---- FormBuilder internal types (used by @bochuangyuan/ui FormBuilder component) ----
export type {
  ReviewDimension,
  ReviewPhaseConfig,
  ReviewRuleSchema,
  ReviewScore,
  ExpertTask,
  ExpertProgress,
  ProjectReviewSummary,
} from './reviewRule'
export type { ScoreDimension, ReviewTask, ScoreDraft, SubmittedScore, ProjectSubmitter } from './review'
