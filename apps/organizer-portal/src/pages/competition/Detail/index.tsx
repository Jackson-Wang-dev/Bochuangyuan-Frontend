import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { useCompetitionStore } from '@/store/competitionStore'
import { competitionApi } from '@bochuangyuan/api'
import type { CompetitionStatus } from '@bochuangyuan/types'

const TABS = [
  { label: '基本信息', to: 'basic-info' },
  { label: '赛事项目', to: 'projects' },
]

const STATUS_LABEL: Record<CompetitionStatus, string> = {
  Draft: '草稿',
  Unpublished: '未发布',
  Registering: '报名中',
  Ongoing: '进行中',
  Ended: '已结束',
}

const STATUS_COLOR: Record<CompetitionStatus, string> = {
  Draft: 'bg-slate-100 text-slate-500',
  Unpublished: 'bg-amber-50 text-amber-600',
  Registering: 'bg-emerald-50 text-emerald-600',
  Ongoing: 'bg-blue-50 text-blue-600',
  Ended: 'bg-slate-100 text-slate-400',
}

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentCompetition, setCurrentCompetition } = useCompetitionStore()

  useEffect(() => {
    if (!id) return
    competitionApi.get(id).then(setCurrentCompetition).catch(() => {})
  }, [id, setCurrentCompetition])

  const comp = currentCompetition
  const status = comp?.status ?? 'Draft'

  const handlePublish = async () => {
    if (!id) return
    const updated = await competitionApi.publish(id)
    setCurrentCompetition(updated)
  }

  const handleDelete = async () => {
    if (!id || !confirm('确认删除该赛事？此操作不可恢复。')) return
    await competitionApi.remove(id)
    navigate('/competitions')
  }

  return (
    <div className="space-y-5">
      {/* Detail header */}
      <div className="glass-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/competitions')}
              className="mt-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-800">
                  {comp?.name ?? '加载中…'}
                </h1>
                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold', STATUS_COLOR[status])}>
                  {STATUS_LABEL[status]}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                报名时间：{comp?.signUpStart ?? '--'} ～ {comp?.signUpEnd ?? '--'}
                {comp?.matchStart && ` · 比赛：${comp.matchStart} ～ ${comp.matchEnd ?? '--'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {(status === 'Draft' || status === 'Unpublished') && (
              <button
                onClick={handlePublish}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                发布赛事
              </button>
            )}
            <button
              onClick={() => navigate(`/competitions/${id}/edit`)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> 编辑
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-100 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> 删除
            </button>
          </div>
        </div>
      </div>

      {/* Inner tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'px-4 py-2 rounded-lg text-sm font-bold transition-all',
                isActive ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
