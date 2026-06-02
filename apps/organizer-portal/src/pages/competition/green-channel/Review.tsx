import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { greenChannelApi } from '@bochuangyuan/api'
import type { GreenChannelReview, GreenChannelResult } from '@bochuangyuan/types'
import { CheckCircle2, XCircle, FileText, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function GreenChannelReviewPage() {
  const { id: competitionId } = useParams<{ id: string }>()
  const [reviews, setReviews] = useState<GreenChannelReview[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (!competitionId) return
    greenChannelApi.list(competitionId).then((list) => {
      setReviews(list)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [competitionId])

  const handleReview = async (regId: string, result: GreenChannelResult) => {
    setProcessing(regId)
    try {
      const updated = await greenChannelApi.review(regId, { result, comment: comment || undefined })
      setReviews((prev) => prev.map((r) => (r.regId === regId ? updated : r)))
      setExpanded(null)
      setComment('')
    } finally {
      setProcessing(null)
    }
  }

  const pending = reviews.filter((r) => !r.result)
  const done = reviews.filter((r) => !!r.result)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-black text-slate-800">绿色通道审核</h1>
        </div>
        <p className="text-sm text-slate-500">通过后项目直接晋级半决赛</p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 text-center py-12">加载中…</div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400 gap-2">
          <Zap className="w-8 h-8" />
          <p className="text-sm">暂无绿色通道申请</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pending */}
          {pending.map((gc) => (
            <div key={gc.gcId} className="glass-card overflow-hidden border-l-4 border-emerald-400">
              <button
                onClick={() => setExpanded((v) => (v === gc.gcId ? null : gc.gcId))}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-700">报名 {gc.regId}</p>
                  <p className="text-xs text-slate-400">{gc.materials.length} 份材料</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">待审核</span>
                  {expanded === gc.gcId ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {expanded === gc.gcId && (
                <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/30">
                  {/* Materials */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">申报材料</p>
                    <div className="space-y-1.5">
                      {gc.materials.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600 flex-1 truncate">{file.name}</span>
                          <a href={file.key} target="_blank" rel="noreferrer"
                            className="text-xs font-bold text-brand-blue hover:underline">查看</a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review actions */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">审核意见</p>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                      placeholder="填写审核意见（可选）"
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(gc.regId, 'Pass')}
                        disabled={processing === gc.gcId}
                        className={cn(
                          'flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50',
                          'bg-emerald-600 text-white hover:bg-emerald-700',
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4" /> 通过 — 直晋半决赛
                      </button>
                      <button
                        onClick={() => handleReview(gc.regId, 'Fail')}
                        disabled={processing === gc.gcId}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-all"
                      >
                        <XCircle className="w-4 h-4" /> 不通过
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Done */}
          {done.length > 0 && (
            <details className="glass-card p-4">
              <summary className="text-sm font-bold text-slate-500 cursor-pointer">
                已完成审核 ({done.length})
              </summary>
              <div className="mt-3 space-y-2">
                {done.map((gc) => (
                  <div key={gc.gcId} className="flex items-center justify-between py-2 border-b border-slate-50">
                    <p className="text-sm font-medium text-slate-700">报名 {gc.regId}</p>
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-bold',
                      gc.result === 'Pass' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
                    )}>
                      {gc.result === 'Pass' ? '已通过' : '未通过'}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
