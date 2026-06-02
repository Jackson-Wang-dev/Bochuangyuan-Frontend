import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { registrationApi } from '@bochuangyuan/api'
import type { Registration } from '@bochuangyuan/types'
import { ArrowLeft, Upload, Zap, Check } from 'lucide-react'

export default function FormalRegPage() {
  const { regId } = useParams<{ regId: string }>()
  const navigate = useNavigate()
  const [reg, setReg] = useState<Registration | null>(null)
  const [applyGreenChannel, setApplyGreenChannel] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!regId) return
    registrationApi.get(regId).then(setReg)
  }, [regId])

  const handleSubmit = async () => {
    if (!regId) return
    setSubmitting(true)
    try {
      if (applyGreenChannel) {
        await registrationApi.applyGreenChannel(regId, [])
      }
      await registrationApi.submitFormal(regId, {})
      navigate(`/competition/registrations/${regId}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!reg) {
    return <div className="text-sm text-slate-400 text-center py-12">加载中…</div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800">正式报名</h1>
          <p className="text-sm text-slate-400">补充材料并提交正式报名</p>
        </div>
      </div>

      {/* Upload section */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-700">上传参赛材料</h2>

        {/* BP upload placeholder */}
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-brand-blue/40 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-slate-300" />
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600">点击上传商业计划书</p>
            <p className="text-xs text-slate-400 mt-0.5">支持 PDF、PPT、Word，最大 50MB</p>
          </div>
          <button className="px-4 py-2 bg-brand-blue/10 text-brand-blue text-sm font-bold rounded-xl hover:bg-brand-blue/20 transition-colors">
            选择文件
          </button>
        </div>
      </div>

      {/* Green channel option */}
      <div className={`glass-card p-5 transition-all ${applyGreenChannel ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={applyGreenChannel} onChange={(e) => setApplyGreenChannel(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-emerald-600" />
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-slate-700">申请绿色通道</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              如您的项目有显著优势，可申请绿色通道。主办方审核通过后，您将直接晋级半决赛，跳过初赛阶段。
            </p>
          </div>
        </label>

        {applyGreenChannel && (
          <div className="mt-4 border-2 border-dashed border-emerald-200 rounded-xl p-6 flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-emerald-400" />
            <p className="text-sm text-slate-500">上传绿色通道申请材料</p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
        <button onClick={handleSubmit} disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 disabled:opacity-50 transition-colors">
          <Check className="w-4 h-4" /> {submitting ? '提交中…' : '提交正式报名'}
        </button>
      </div>
    </div>
  )
}
