import { ChevronLeft, Eye, FileText, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import type { AssessmentSession } from '../types'

export default function MyReports() {
  const navigate = useNavigate()
  const { allReports, clientId, initClientId, deleteReport } = useUserStore()
  const [myReports, setMyReports] = useState<AssessmentSession[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const id = clientId || initClientId()
    const reports = allReports
      .filter((r) => r.clientId === id && r.status === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setMyReports(reports)
  }, [allReports, clientId, initClientId])

  const handleDelete = (uuid: string) => {
    if (deleteConfirm === uuid) {
      deleteReport(uuid)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(uuid)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-brand-paper">
      {/* Header — ink-blue */}
      <div className="ink-blue px-4 pt-10 pb-6 text-white">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          返回首页
        </button>
        <h1 className="text-2xl font-bold">我的报告</h1>
        <p className="text-white/65 text-[13px] mt-1">
          共 <span className="font-mono tabular-nums">{myReports.length}</span> 份测评记录
        </p>
      </div>

      {/* Reports list */}
      <div className="px-4 py-6">
        {myReports.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-[#0045c4]/8 text-[#0045c4] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <p className="text-slate-600 font-medium mb-2">暂无测评记录</p>
            <p className="text-slate-400 text-[13px] mb-6">完成一次测评后，报告会保存在这里</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#0045c4] text-white font-medium rounded-2xl text-sm hover:bg-[#003ba8] transition-colors"
            >
              开始测评
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {myReports.map((report, index) => {
              const persona = report.matchedPersona
              if (!persona) return null

              const isLatest = index === 0
              const date = new Date(report.createdAt)
              const dateStr = date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
              const timeStr = date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div
                  key={report.uuid}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {/* Monogram tile */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0045c4] to-[#003ba8] flex items-center justify-center text-white flex-shrink-0">
                      <span className="font-serif text-xl font-bold">
                        {persona.name.charAt(0)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-slate-900 text-sm truncate">{persona.name}</p>
                        {isLatest && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-[#0045c4]/8 text-[#0045c4] text-xs font-semibold rounded-md">
                            最新
                          </span>
                        )}
                      </div>
                      <blockquote className="text-[#0045c4] text-xs mb-1 truncate font-serif italic">
                        "{persona.keyword}"
                      </blockquote>
                      <p className="text-slate-400 text-xs font-mono tabular-nums">
                        {dateStr} {timeStr}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/report/${report.uuid}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#0045c4] text-white text-xs font-medium hover:bg-[#003ba8] transition-colors"
                    >
                      <Eye size={14} />
                      查看报告
                    </button>
                    <button
                      onClick={() => handleDelete(report.uuid)}
                      className={[
                        'flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all',
                        deleteConfirm === report.uuid
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500',
                      ].join(' ')}
                    >
                      <Trash2 size={14} />
                      {deleteConfirm === report.uuid ? '确认删除' : '删除'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
