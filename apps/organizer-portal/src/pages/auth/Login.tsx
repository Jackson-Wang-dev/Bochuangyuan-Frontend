import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock } from 'lucide-react'
import { useUserStore } from '@/store/userStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useUserStore((s) => s.login)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    login(
      { organizerId: 'org-001', name: '管理员', organization: account || '博创园主办方' },
      'mock-token',
    )
    navigate('/competitions')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white font-black text-2xl italic">B</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">博创园</h1>
          <p className="text-slate-500 text-sm">赛事主办方端</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">机构账号</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="请输入机构账号"
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-blue/90 transition-colors shadow-sm"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  )
}
