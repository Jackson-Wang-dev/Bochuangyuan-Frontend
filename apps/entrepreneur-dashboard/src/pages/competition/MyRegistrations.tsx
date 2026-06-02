import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registrationApi } from '@bochuangyuan/api'
import type { Registration, RegistrationStatus } from '@bochuangyuan/types'
import { useRegistrationStore } from '@/store/registrationStore'
import { ChevronRight, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  PreReg: '预报名', PendingReview: '待审核', UnderReview: '审核中',
  Approved: '已通过', Rejected: '已驳回', Locked: '已锁定',
  PrelimRegDone: '初赛报名完成', Terminated: '已终止',
}

const STATUS_COLOR: Record<RegistrationStatus, string> = {
  PreReg: 'bg-slate-100 text-slate-500',
  PendingReview: 'bg-amber-50 text-amber-600',
  UnderReview: 'bg-blue-50 text-blue-600',
  Approved: 'bg-emerald-50 text-emerald-600',
  Rejected: 'bg-red-50 text-red-500',
  Locked: 'bg-purple-50 text-purple-600',
  PrelimRegDone: 'bg-green-50 text-green-600',
  Terminated: 'bg-slate-100 text-slate-400',
}

export default function MyRegistrationsPage() {
  const navigate = useNavigate()
  const { registrations, setRegistrations } = useRegistrationStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: replace with current user's competition ID when multi-competition view is implemented
    // For now, this page lists all registrations cached in store
    setLoading(false)
  }, [])

  if (loading) return <div className="text-sm text-slate-400 text-center py-12">加载中…</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-800">我的报名</h1>
        <p className="text-sm text-slate-400 mt-0.5">查看所有参赛报名记录</p>
      </div>

      {registrations.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
          <ClipboardList className="w-10 h-10" />
          <p className="text-sm">暂无报名记录</p>
          <button onClick={() => navigate('/competition')}
            className="px-4 py-2 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue/90 transition-colors">
            去赛事广场
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <button
              key={reg.regId}
              onClick={() => navigate(`/competition/registrations/${reg.regId}`)}
              className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:border-brand-blue/20 hover:shadow-md transition-all text-left"
            >
              <div className="flex-1 space-y-1">
                <p className="font-bold text-slate-800">报名 {reg.regId.slice(0, 8)}…</p>
                <p className="text-xs text-slate-400">
                  {reg.regType === 'Individual' ? '个人参赛' : '团队参赛'} ·
                  {reg.submittedAt ? ` 提交于 ${new Date(reg.submittedAt).toLocaleDateString()}` : ''}
                </p>
              </div>
              <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', STATUS_COLOR[reg.status])}>
                {STATUS_LABEL[reg.status]}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
