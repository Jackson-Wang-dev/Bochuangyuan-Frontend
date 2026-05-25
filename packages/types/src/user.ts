export interface User {
  userId: string
  nickname: string
  avatarUrl?: string
  phone?: string
  wechatOpenId?: string
  role: 'entrepreneur' | 'admin' | 'organizer' | 'specialist'
  createdAt: string
}

export interface AuthState {
  token: string
  user: User
}
