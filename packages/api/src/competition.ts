import type {
  Competition,
  Track,
  RegistrationFormConfig,
  Registration,
  QualificationReview,
  ManualResult,
  GreenChannelReview,
  GreenChannelResult,
  Judge,
  JudgeAssignment,
  ReviewStage,
  Review,
  StageResult,
  Award,
  AwardLevel,
  Settlement,
  CompetitionNotification,
  Album,
  CompetitionSchedule,
  FileRef,
  ID,
} from '@bochuangyuan/types'
import { apiClient } from './client'

type PaginationParams = { page?: number; pageSize?: number }
type Page<T> = { list: T[]; total: number; page: number; pageSize: number }

// ---- Competitions ----
export const competitionApi = {
  list: (params?: PaginationParams & { status?: string; keyword?: string }) =>
    apiClient.get<Page<Competition>>('/competitions', { params }).then((r) => r.data),

  get: (id: ID) =>
    apiClient.get<Competition>(`/competitions/${id}`).then((r) => r.data),

  create: (dto: Omit<Competition, 'competitionId'>) =>
    apiClient.post<Competition>('/competitions', dto).then((r) => r.data),

  update: (id: ID, dto: Partial<Competition>) =>
    apiClient.put<Competition>(`/competitions/${id}`, dto).then((r) => r.data),

  publish: (id: ID) =>
    apiClient.post<Competition>(`/competitions/${id}/publish`).then((r) => r.data),

  remove: (id: ID) =>
    apiClient.delete(`/competitions/${id}`),

  tracks: {
    save: (id: ID, tracks: Track[]) =>
      apiClient.put(`/competitions/${id}/tracks`, { tracks }).then((r) => r.data),
  },

  formConfig: {
    get: (competitionId: ID) =>
      apiClient.get<RegistrationFormConfig>(`/competitions/${competitionId}/form-config`).then((r) => r.data),

    save: (competitionId: ID, dto: Partial<RegistrationFormConfig>) =>
      apiClient.put<RegistrationFormConfig>(`/competitions/${competitionId}/form-config`, dto).then((r) => r.data),
  },
}

// ---- Registrations ----
export const registrationApi = {
  list: (competitionId: ID, params?: PaginationParams & { status?: string; keyword?: string }) =>
    apiClient.get<Page<Registration>>(`/competitions/${competitionId}/registrations`, { params }).then((r) => r.data),

  get: (regId: ID) =>
    apiClient.get<Registration>(`/registrations/${regId}`).then((r) => r.data),

  submitPreReg: (dto: Pick<Registration, 'competitionId' | 'projectId' | 'regType' | 'formValues' | 'isExistingProject'>) =>
    apiClient.post<Registration>('/registrations/pre-reg', dto).then((r) => r.data),

  submitFormal: (regId: ID, dto: { formValues?: Record<string, unknown>; attachments?: FileRef[] }) =>
    apiClient.put<Registration>(`/registrations/${regId}/formal`, dto).then((r) => r.data),

  edit: (regId: ID, dto: Partial<Pick<Registration, 'formValues'>>) =>
    apiClient.patch<Registration>(`/registrations/${regId}`, dto).then((r) => r.data),

  lock: (regId: ID) =>
    apiClient.post<Registration>(`/registrations/${regId}/lock`).then((r) => r.data),

  applyGreenChannel: (regId: ID, materials: FileRef[]) =>
    apiClient.post<GreenChannelReview>(`/registrations/${regId}/green-channel`, { materials }).then((r) => r.data),
}

// ---- Qualification review ----
export const qualificationApi = {
  get: (regId: ID) =>
    apiClient.get<QualificationReview>(`/registrations/${regId}/qualification`).then((r) => r.data),

  review: (regId: ID, dto: { result: ManualResult; reason?: string }) =>
    apiClient.post<QualificationReview>(`/registrations/${regId}/qualification/review`, dto).then((r) => r.data),
}

// ---- Green channel ----
export const greenChannelApi = {
  list: (competitionId: ID) =>
    apiClient.get<GreenChannelReview[]>(`/competitions/${competitionId}/green-channel`).then((r) => r.data),

  review: (regId: ID, dto: { result: GreenChannelResult; comment?: string }) =>
    apiClient.post<GreenChannelReview>(`/registrations/${regId}/green-channel/review`, dto).then((r) => r.data),
}

// ---- Judges ----
export const judgeApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<Page<Judge>>('/judges', { params }).then((r) => r.data),

  create: (dto: Omit<Judge, 'judgeId'>) =>
    apiClient.post<Judge>('/judges', dto).then((r) => r.data),

  update: (id: ID, dto: Partial<Judge>) =>
    apiClient.put<Judge>(`/judges/${id}`, dto).then((r) => r.data),

  remove: (id: ID) =>
    apiClient.delete(`/judges/${id}`),
}

// ---- Assignments ----
export const assignmentApi = {
  assign: (competitionId: ID, stage: ReviewStage, judgeId: ID, projectIds: ID[]) =>
    apiClient.post<JudgeAssignment>('/assignments', { competitionId, stage, judgeId, projectIds }).then((r) => r.data),

  listByJudge: (judgeId: ID, stage: ReviewStage) =>
    apiClient.get<JudgeAssignment[]>('/assignments', { params: { judgeId, stage } }).then((r) => r.data),

  progress: (competitionId: ID, stage: ReviewStage) =>
    apiClient.get<JudgeAssignment[]>('/assignments/progress', { params: { competitionId, stage } }).then((r) => r.data),
}

// ---- Scoring & results ----
export const reviewApi = {
  submit: (dto: Omit<Review, 'scoreId' | 'submittedAt'>) =>
    apiClient.post<Review>('/reviews', dto).then((r) => r.data),

  listByAssignment: (assignId: ID) =>
    apiClient.get<Review[]>(`/assignments/${assignId}/reviews`).then((r) => r.data),

  listByProject: (projectId: ID, stage: ReviewStage) =>
    apiClient.get<Review[]>(`/projects/${projectId}/reviews`, { params: { stage } }).then((r) => r.data),
}

export const stageResultApi = {
  compile: (competitionId: ID, stage: ReviewStage) =>
    apiClient.post<StageResult[]>(`/competitions/${competitionId}/stage-results/${stage}/compile`).then((r) => r.data),

  listByCompetition: (competitionId: ID) =>
    apiClient.get<StageResult[]>(`/competitions/${competitionId}/stage-results`).then((r) => r.data),
}

// ---- Awards & settlement ----
export const awardApi = {
  compile: (competitionId: ID) =>
    apiClient.post<Award[]>(`/competitions/${competitionId}/awards/compile`).then((r) => r.data),

  setWinners: (competitionId: ID, projectIds: ID[]) =>
    apiClient.post(`/competitions/${competitionId}/awards/winners`, { projectIds }),

  setLevels: (competitionId: ID, levels: { projectId: ID; level: AwardLevel }[]) =>
    apiClient.post(`/competitions/${competitionId}/awards/levels`, { levels }),

  uploadCert: (projectId: ID, file: FileRef) =>
    apiClient.post(`/projects/${projectId}/cert`, { file }),
}

export const settlementApi = {
  get: (projectId: ID) =>
    apiClient.get<Settlement>(`/projects/${projectId}/settlement`).then((r) => r.data),

  uploadBankInfo: (projectId: ID, dto: Pick<Settlement, 'bankCard' | 'bankName' | 'mailAddress'>) =>
    apiClient.put<Settlement>(`/projects/${projectId}/settlement/bank`, dto).then((r) => r.data),

  verifyQualify: (projectId: ID, ok: boolean) =>
    apiClient.post<Settlement>(`/projects/${projectId}/settlement/qualify`, { ok }).then((r) => r.data),

  payout: (projectId: ID) =>
    apiClient.post(`/projects/${projectId}/settlement/payout`),

  reimburseUpload: (projectId: ID, invoices: FileRef[]) =>
    apiClient.post<Settlement>(`/projects/${projectId}/settlement/reimburse/invoices`, { invoices }).then((r) => r.data),

  reimburse: (projectId: ID, amount: number) =>
    apiClient.post<Settlement>(`/projects/${projectId}/settlement/reimburse`, { amount }).then((r) => r.data),
}

// ---- Ops: notifications, album, schedule ----
export const notificationApi = {
  list: (competitionId: ID) =>
    apiClient.get<CompetitionNotification[]>(`/competitions/${competitionId}/notifications`).then((r) => r.data),

  create: (dto: Omit<CompetitionNotification, 'noticeId' | 'createdAt'>) =>
    apiClient.post<CompetitionNotification>('/notifications', dto).then((r) => r.data),

  update: (id: ID, dto: Partial<CompetitionNotification>) =>
    apiClient.put<CompetitionNotification>(`/notifications/${id}`, dto).then((r) => r.data),

  remove: (id: ID) =>
    apiClient.delete(`/notifications/${id}`),
}

export const albumApi = {
  get: (competitionId: ID) =>
    apiClient.get<Album>(`/competitions/${competitionId}/album`).then((r) => r.data),

  save: (competitionId: ID, images: FileRef[]) =>
    apiClient.put<Album>(`/competitions/${competitionId}/album`, { images }).then((r) => r.data),
}

export const scheduleApi = {
  list: (competitionId: ID) =>
    apiClient.get<CompetitionSchedule[]>(`/competitions/${competitionId}/schedules`).then((r) => r.data),

  save: (dto: Omit<CompetitionSchedule, 'scheduleId'>) =>
    apiClient.post<CompetitionSchedule>('/schedules', dto).then((r) => r.data),

  update: (id: ID, dto: Partial<CompetitionSchedule>) =>
    apiClient.put<CompetitionSchedule>(`/schedules/${id}`, dto).then((r) => r.data),

  remove: (id: ID) =>
    apiClient.delete(`/schedules/${id}`),
}
