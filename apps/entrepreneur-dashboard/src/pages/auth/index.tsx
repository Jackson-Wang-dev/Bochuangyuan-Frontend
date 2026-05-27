import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type LoginMode = 'phone' | 'wechat'

export default function AuthPage() {
  const [mode, setMode] = useState<LoginMode>('phone')
  const navigate = useNavigate()

  const handleLogin = () => {
    // TODO: replace with real phone SMS auth and WeChat OAuth
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">博创园</h1>
          <p className="text-sm text-slate-400 mt-1">创业者门户</p>
        </div>

        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          <button
            onClick={() => setMode('phone')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              mode === 'phone' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            手机号登录
          </button>
          <button
            onClick={() => setMode('wechat')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              mode === 'wechat' ? 'bg-green-500 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            微信登录
          </button>
        </div>

        {mode === 'phone' ? (
          <div className="space-y-3">
            <input
              type="tel"
              placeholder="请输入手机号"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="验证码"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* TODO: call SMS send API on click */}
              <button className="px-4 py-3 bg-slate-100 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors whitespace-nowrap">
                获取验证码
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 space-y-3">
            <div className="w-40 h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
              微信二维码（开发中）
            </div>
            <p className="text-xs text-slate-400">使用微信扫一扫登录</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          登录
        </button>
      </div>
    </div>
  )
}
