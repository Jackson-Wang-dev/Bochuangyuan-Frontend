import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Shield } from 'lucide-react'
import { useUserStore } from '@/store/userStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useUserStore((s) => s.login)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const sendCode = () => {
    if (!phone || countdown > 0) return
    // TODO: call SMS send API before starting countdown
    setCodeSent(true)
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0 }
        return c - 1
      })
    }, 1000)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login — replace with real API call
    login(
      { expertId: 'exp-001', name: '张专家', phone, organization: '清华大学', domain: ['AI', '互联网'] },
      'mock-token',
    )
    navigate('/review/queue')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <span className="text-white font-black text-2xl italic">B</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">博创园</h1>
          <p className="text-slate-500 text-sm">评委端</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">手机号</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                required
                maxLength={11}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">验证码</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入验证码"
                  required
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
              <button
                type="button"
                onClick={sendCode}
                disabled={!phone || countdown > 0}
                className="px-4 py-3 rounded-xl bg-brand-blue/10 text-brand-blue text-sm font-semibold disabled:opacity-40 whitespace-nowrap hover:bg-brand-blue/20 transition-colors"
              >
                {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '发送验证码'}
              </button>
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
