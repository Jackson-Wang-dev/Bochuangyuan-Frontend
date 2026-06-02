import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { registrationApi, qualificationApi } from '@bochuangyuan/api'
import type { Registration, QualificationReview } from '@bochuangyuan/types'
import { useRegistrationStore } from '@/store/registrationStore'
import { ArrowLeft, CheckCircle2, XCircle, Clock, Lock, AlertCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_INFO: Record<string, { label: string; color: string; icon: React.ElementType; desc: string }> = {
  PreReg: { label: '预报名', color: 'bg-slate-100 text-slate-500', icon: Clock, desc: '您已完成预报名，请等待主办方开放正式报名。' },
  PendingReview: { label: '待审核', color: 'bg-amber-50 text-amber-600', icon: Clock, desc: '您的报名材料正在等待主办方审核。' },
  UnderReview: { label: '审核中', color: 'bg-blue-50 text-blue-600', icon: Clock, desc: '您的报名正在审核中，请耐心等待。' },
  Approved: { label: '已通过', color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2, desc: '恭喜！您的报名已通过资质审核。请在截止日期前完成资料锁定。' },
  Rejected: { label: '已驳回', color: 'bg-red-50 text-red-500', icon: XCircle, desc: '您的报名未通过审核，请根据驳回原因修改后重新提交。' },
  Locked: { label: '已锁定', color: 'bg-purple-50 text-purple-600', icon: Lock, desc: '您的报名材料已锁定，即将进入初审阶段。' },
  PrelimRegDone: { label: '初赛报名完成', color: 'bg-green-50 text-green-600', icon: CheckCircle2, desc: '初赛报名已完成，请关注赛事进展。' },
  Terminated: { label: '已终止', color: 'bg-slate-100 text-slate-400', icon: XCircle, desc: '本次报名已终止（超时未锁定）。' },
}

export default function RegistrationStatusPage() {
  const { regId } = useParams<{ regId: string }>()
  const navigate = useNavigate()
  const { currentRegistration, setCurrentRegistration } = useRegistrationStore()
  const [qualReview, setQualReview] = useState<QualificationReview | null>(null)
  const [locking, setLocking] = useState(false)

  useEffect(() => {
    if (!regId) return
    registrationApi.get(regId).then((reg) => {
      setCurrentRegistration(reg)
      return qualificationApi.get(regId).catch(() => null)
    }).then((qr) => setQualReview(qr))
  }, [regId, setCurrentRegistration])

  const reg = currentRegistration
  const statusInfo = reg ? STATUS_INFO[reg.status] : null

  const handleLock = async () => {
    if (!regId || !confirm('锁定后资料不可修改，确认锁定？')) return
    setLocking(true)
    try {
      const updated = await registrationApi.lock(regId)
      setCurrentRegistration(updated)
    } finally {
      setLocking(false)
    }
  }

  if (!reg) {
    return <div className="text-sm text-slate-400 text-center py-12">加载中…</div>
  }

  const { label, color, icon: Icon, desc } = (statusInfo ?? STATUS_INFO['PreReg'])!

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/competition/registrations')} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-slate-800">报名状态</h1>
      </div>

      {/* Status card */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-3 rounded-2xl', color.replace('text-', 'bg-').replace('bg-', 'bg-') + '/20')}>
            <Icon className={cn('w-6 h-6', color.split(' ')[1])} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn('px-3 py-1 rounded-full text-sm font-bold', color)}>{label}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{desc}</p>
          </div>
        </div>

        {/* Reject reason */}
        {reg.status === 'Rejected' && qualReview?.rejectReason && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-600">驳回原因</p>
              <p className="text-sm text-red-600 mt-0.5">{qualReview.rejectReason}</p>
            </div>
          </div>
        )}

        {/* Registration details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-400">参赛方式</p>
            <p className="font-semibold text-slate-700">{reg.regType === 'Individual' ? '个人参赛' : '团队参赛'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">提交时间</p>
            <p className="font-semibold text-slate-700">
              {reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString() : '--'}
            </p>
          </div>
          {reg.lockedAt && (
            <div>
              <p className="text-xs text-slate-400">锁定时间</p>
              <p className="font-semibold text-slate-700">{new Date(reg.lockedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Form values preview */}
        {Object.keys(reg.formValues ?? {}).length > 0 && (
          <details className="border border-slate-100 rounded-xl">
            <summary className="px-4 py-3 text-sm font-bold text-slate-600 cursor-pointer">报名信息</summary>
            <div className="px-4 pb-4 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(reg.formValues).map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-slate-400">{k}</p>
                  <p className="font-medium text-slate-700">{String(v)}</p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {reg.status === 'PendingReview' || reg.status === 'Rejected' ? (
          <button
            onClick={() => navigate(`/competition/registrations/${regId}/formal`)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-brand-blue text-white rounded-2xl font-bold hover:bg-brand-blue/90 transition-colors"
          >
            <span>{reg.status === 'Rejected' ? '修改报名材料' : '补充正式报名材料'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : null}

        {reg.status === 'Approved' && (
          <button onClick={handleLock} disabled={locking}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors">
            <span>{locking ? '锁定中…' : '确认锁定报名'}</span>
            <Lock className="w-5 h-5" />
          </button>
        )}

        {reg.isGreenChannel && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-sm text-emerald-700 font-medium">绿色通道申请已提交，等待审核</p>
          </div>
        )}
      </div>
    </div>
  )
}
