import { apiClient } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterDto {
  username: string
  password: string
  email: string
  role?: string
}

export interface LoginDto {
  username: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface BackendUser {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export interface PortalInfo {
  user_id: number
  username: string
  role: string
  default_portal: string
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (dto: RegisterDto) =>
    apiClient.post<BackendUser>('/api/v1/auth/register', dto).then((r) => r.data),

  login: (dto: LoginDto) =>
    apiClient.post<TokenResponse>('/api/v1/auth/login', dto).then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient
      .post<TokenResponse>('/api/v1/auth/refresh', { refresh_token: refreshToken })
      .then((r) => r.data),

  me: () =>
    apiClient.get<BackendUser>('/api/v1/auth/me').then((r) => r.data),

  logout: (refreshToken: string) =>
    apiClient
      .post<string>('/api/v1/auth/logout', null, {
        headers: { 'refresh-token': refreshToken },
      })
      .then((r) => r.data),

  portalMe: () =>
    apiClient.get<PortalInfo>('/api/v1/auth/portal/me').then((r) => r.data),
}
