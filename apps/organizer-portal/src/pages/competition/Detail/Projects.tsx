import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { registrationApi } from '@bochuangyuan/api'
import type { Registration, RegistrationStatus } from '@bochuangyuan/types'
import { Users, FileText } from 'lucide-react'

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  PreReg: '预报名',
  PendingReview: '待审核',
  UnderReview: '审核中',
  Approved: '已通过',
  Rejected: '已驳回',
  Locked: '已锁定',
  PrelimRegDone: '初赛报名完成',
  Terminated: '已终止',
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

export default function CompetitionProjectsTab() {
  const { id } = useParams<{ id: string }>()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    registrationApi.list(id).then((page) => {
      setRegistrations(page.list)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="text-sm text-slate-400 text-center py-12">加载中…</div>
  }

  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
        <FileText className="w-8 h-8" />
        <p className="text-sm">暂无报名记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-500">共 {registrations.length} 个参赛项目</span>
      </div>

      <div className="space-y-2">
        {registrations.map((reg) => (
          <div key={reg.regId} className="glass-card p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-700">{reg.projectId}</p>
              <p className="text-xs text-slate-400">
                {reg.regType === 'Individual' ? '个人' : '团队'} ·
                提交于 {reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString() : '--'}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[reg.status]}`}>
              {STATUS_LABEL[reg.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
