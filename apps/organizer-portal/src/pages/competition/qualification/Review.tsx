import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { registrationApi, qualificationApi } from '@bochuangyuan/api'
import type { Registration, QualificationReview, ManualResult } from '@bochuangyuan/types'
import { CheckCircle2, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const RESULT_CONFIG: Record<ManualResult, { label: string; color: string; icon: React.ElementType }> = {
  Pass: { label: '通过', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
  Missing: { label: '材料缺失', color: 'text-amber-600 bg-amber-50', icon: AlertCircle },
  Abnormal: { label: '异常', color: 'text-orange-600 bg-orange-50', icon: AlertCircle },
  Reject: { label: '驳回', color: 'text-red-600 bg-red-50', icon: XCircle },
}

interface RegWithReview extends Registration {
  qualReview?: QualificationReview
}

export default function QualificationReviewPage() {
  const { id: competitionId } = useParams<{ id: string }>()
  const [items, setItems] = useState<RegWithReview[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (!competitionId) return
    registrationApi.list(competitionId, { status: 'PendingReview' }).then(async (page) => {
      const withReviews = await Promise.all(
        page.list.map(async (reg) => {
          try {
            const qualReview = await qualificationApi.get(reg.regId)
            return { ...reg, qualReview }
          } catch {
            return { ...reg }
          }
        }),
      )
      setItems(withReviews)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [competitionId])

  const handleReview = async (regId: string, result: ManualResult) => {
    if (result === 'Reject' && !rejectReason) {
      alert('驳回时必须填写原因')
      return
    }
    setReviewing(regId)
    try {
      const updated = await qualificationApi.review(regId, { result, reason: result !== 'Pass' ? rejectReason : undefined })
      setItems((prev) =>
        prev.map((item) =>
          item.regId === regId
            ? { ...item, status: result === 'Pass' ? 'Approved' : 'Rejected', qualReview: updated }
            : item,
        ),
      )
      setExpanded(null)
      setRejectReason('')
    } finally {
      setReviewing(null)
    }
  }

  const pendingItems = items.filter((r) => r.status === 'PendingReview' || r.status === 'UnderReview')
  const doneItems = items.filter((r) => r.status !== 'PendingReview' && r.status !== 'UnderReview')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">资质审核</h1>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4 text-amber-500" />
          待审核 {pendingItems.length} 项
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 text-center py-12">加载中…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-slate-400 text-center py-16">暂无待审核报名</div>
      ) : (
        <div className="space-y-3">
          {pendingItems.map((reg) => (
            <div key={reg.regId} className="glass-card overflow-hidden">
              {/* Row */}
              <button
                onClick={() => setExpanded((v) => (v === reg.regId ? null : reg.regId))}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-700">{reg.projectId}</p>
                  <p className="text-xs text-slate-400">
                    {reg.regType === 'Individual' ? '个人' : '团队'} ·
                    提交于 {reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString() : '--'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">
                    待审核
                  </span>
                  {expanded === reg.regId ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Expanded review panel */}
              {expanded === reg.regId && (
                <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/30">
                  <div className="text-xs font-bold text-slate-400 uppercase">报名信息</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(reg.formValues ?? {}).slice(0, 6).map(([k, v]) => (
                      <div key={k} className="space-y-0.5">
                        <p className="text-xs text-slate-400">{k}</p>
                        <p className="font-medium text-slate-700">{String(v)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">审核操作</p>
                    <div className="flex gap-2 flex-wrap">
                      {(['Pass', 'Missing', 'Abnormal', 'Reject'] as ManualResult[]).map((result) => {
                        const { label, color, icon: Icon } = RESULT_CONFIG[result]
                        return (
                          <button key={result} onClick={() => handleReview(reg.regId, result)}
                            disabled={reviewing === reg.regId}
                            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50', color)}>
                            <Icon className="w-3.5 h-3.5" /> {label}
                          </button>
                        )
                      })}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">驳回 / 异常原因（驳回时必填）</label>
                      <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="请填写原因"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Done section */}
          {doneItems.length > 0 && (
            <details className="glass-card p-4">
              <summary className="text-sm font-bold text-slate-500 cursor-pointer">
                已完成审核 ({doneItems.length})
              </summary>
              <div className="mt-3 space-y-2">
                {doneItems.map((reg) => {
                  const result = reg.qualReview?.manualResult
                  const cfg = result ? RESULT_CONFIG[result] : null
                  return (
                    <div key={reg.regId} className="flex items-center justify-between py-2 border-b border-slate-50">
                      <p className="text-sm font-medium text-slate-700">{reg.projectId}</p>
                      {cfg && (
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', cfg.color)}>
                          {cfg.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
