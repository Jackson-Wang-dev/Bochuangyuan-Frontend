import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { registrationApi } from '@bochuangyuan/api'
import type { Registration, RegistrationStatus } from '@bochuangyuan/types'
import { Search, Clock, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const ALL_STATUSES = Object.keys(STATUS_LABEL) as RegistrationStatus[]

export default function RegistrationListPage() {
  const { id: competitionId } = useParams<{ id: string }>()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState<RegistrationStatus | 'all'>('all')

  const load = () => {
    if (!competitionId) return
    registrationApi.list(competitionId).then((page) => {
      setRegistrations(page.list)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [competitionId])

  const handleLock = async (reg: Registration) => {
    if (!confirm(`确认锁定报名 ${reg.regId}？锁定后参赛者无法修改资料。`)) return
    await registrationApi.lock(reg.regId)
    setRegistrations((prev) =>
      prev.map((r) => (r.regId === reg.regId ? { ...r, status: 'Locked' } : r)),
    )
  }

  const filtered = registrations.filter((r) => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchKeyword = !keyword || r.projectId.includes(keyword) || r.userId.includes(keyword)
    return matchStatus && matchKeyword
  })

  const pendingCount = registrations.filter((r) => r.status === 'PendingReview').length
  const lockedCount = registrations.filter((r) => r.status === 'Locked').length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">报名管理</h1>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            待审核 {pendingCount}
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-purple-500" />
            已锁定 {lockedCount}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all',
              filterStatus === 'all' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            全部 ({registrations.length})
          </button>
          {ALL_STATUSES.map((s) => {
            const count = registrations.filter((r) => r.status === s).length
            if (count === 0) return null
            return (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all',
                  filterStatus === s ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700',
                )}>
                {STATUS_LABEL[s]} ({count})
              </button>
            )
          })}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索项目/用户 ID"
            className="pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-52 focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-sm text-slate-400 text-center py-12">加载中…</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                {['项目 ID', '参赛者', '类型', '提交时间', '状态', '操作'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-400 py-12">暂无数据</td></tr>
              ) : (
                filtered.map((reg) => (
                  <tr key={reg.regId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{reg.projectId}</td>
                    <td className="px-4 py-3 text-slate-600">{reg.userId}</td>
                    <td className="px-4 py-3 text-slate-500">{reg.regType === 'Individual' ? '个人' : '团队'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {reg.submittedAt ? new Date(reg.submittedAt).toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', STATUS_COLOR[reg.status])}>
                        {STATUS_LABEL[reg.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {reg.status === 'Approved' && (
                        <button onClick={() => handleLock(reg)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                          <Lock className="w-3 h-3" /> 锁定
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
