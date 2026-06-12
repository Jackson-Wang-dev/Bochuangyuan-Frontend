import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '@bochuangyuan/api'
import { useUserStore } from '@/store/userStore'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useUserStore((s) => s.setAuth)

  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'register') {
        await authApi.register({ username, password, email, role: 'entrepreneur' })
        setMode('login')
        setPassword('')
        setError(null)
        return
      }

      const tokens = await authApi.login({ username, password })
      // fetch user info with the new access token
      localStorage.setItem('bcyToken', tokens.access_token)
      const user = await authApi.me()
      setAuth(user, tokens.access_token, tokens.refresh_token)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string | { msg: string }[] } } })?.response?.data
          ?.detail
      if (Array.isArray(msg)) {
        setError(msg.map((d) => d.msg).join('；'))
      } else {
        setError(msg ?? '操作失败，请重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">博创园</h1>
          <p className="text-sm text-slate-400 mt-1">创业者门户</p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null) }}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null) }}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              mode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            注册
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          {mode === 'register' && (
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <p className="text-xs text-red-500 px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? '请稍候…' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>
      </div>
    </div>
  )
}
