import type { FileRef } from './shared'

export type VerifyStatus = 'Unverified' | 'Verified'

export interface User {
  userId: string
  // Auth / platform fields
  username?: string
  nickname?: string
  avatarUrl?: string
  wechatOpenId?: string
  role?: 'entrepreneur' | 'admin' | 'organizer' | 'specialist'
  createdAt?: string
  // E03 profile fields
  realName?: string
  phone?: string
  email?: string
  idCard?: string
  avatar?: FileRef
  bio?: string
  verifyStatus?: VerifyStatus
}

export interface AuthState {
  token: string
  user: User
}
