import type { ID, Money, FileRef } from './shared'

export type AwardLevel = 'First' | 'Second' | 'Third' | 'Honorable' | (string & {})
export type PayoutStatus = 'PendingClaim' | 'BankInfoUploaded' | 'QualifyChecking' | 'Paid' | 'CannotPay'
export type ReimburseStatus = 'Pending' | 'UnderReview' | 'Reimbursed'

// E13 — table: awards
export interface Award {
  awardId: ID
  projectId: ID
  competitionId: ID
  finalScore?: number
  finalRank: number
  isWinner: boolean
  awardLevel?: AwardLevel
  certFile?: FileRef
  scoreCorrected?: boolean
}

// E14 — table: settlements
export interface Settlement {
  settleId: ID
  projectId: ID
  userId: ID
  bankCard?: string
  bankName?: string
  mailAddress?: string
  needQualifyCheck?: boolean
  qualifyVerified?: boolean
  prizeAmount?: Money
  payoutStatus: PayoutStatus
  invoiceFiles?: FileRef[]
  reimburseAmount?: Money
  reimburseStatus?: ReimburseStatus
  cannotPayNotice?: string
}
