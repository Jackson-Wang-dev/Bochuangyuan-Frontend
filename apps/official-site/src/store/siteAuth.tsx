import { authApi, type BackendUser } from '@bochuangyuan/api'
import { create } from 'zustand'

const TOKEN_KEY = 'bcyToken'

interface SiteAuthState {
  user: BackendUser | null
  accessToken: string | null
  isLoginOpen: boolean
  isLoggingIn: boolean
  loginError: string | null
  openLogin: () => void
  closeLogin: () => void
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const useSiteAuth = create<SiteAuthState>((set) => ({
  user: null,
  accessToken: typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY),
  isLoginOpen: false,
  isLoggingIn: false,
  loginError: null,
  openLogin: () => set({ isLoginOpen: true, loginError: null }),
  closeLogin: () => set({ isLoginOpen: false, loginError: null }),
  login: async (username, password) => {
    set({ isLoggingIn: true, loginError: null })
    try {
      const tokens = await authApi.login({ username, password })
      localStorage.setItem(TOKEN_KEY, tokens.access_token)
      const user = await authApi.me()
      set({ user, accessToken: tokens.access_token, isLoginOpen: false, isLoggingIn: false })
    } catch {
      set({ isLoggingIn: false, loginError: '用户名或密码错误，请重试' })
    }
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, accessToken: null })
  },
}))

// A returning visitor may already carry a token from a previous session; resolve the profile in the background.
if (typeof window !== 'undefined') {
  const existingToken = localStorage.getItem(TOKEN_KEY)
  if (existingToken) {
    void authApi
      .me()
      .then((user) => useSiteAuth.setState({ user, accessToken: existingToken }))
      .catch(() => useSiteAuth.getState().logout())
  }
}
