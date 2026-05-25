import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { StatusBadge } from '@bochuangyuan/ui'
import { cn } from '@/lib/utils'

const TABS = [
  { label: '参赛项目', to: 'projects' },
  { label: '评分汇总', to: 'score-overview' },
  { label: '专家遴选', to: 'experts' },
  { label: '评审分配', to: 'assignment' },
]

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate('/competitions')} className="mt-1 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-800">2024 全国大学生创业大赛</h1>
              <StatusBadge status="reviewing" />
            </div>
            <p className="text-sm text-slate-400 mt-0.5">评审截止：2024-06-30 · 48 支队伍</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/competitions/${id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
        >
          <Edit className="w-3.5 h-3.5" /> 编辑
        </button>
      </div>

      {/* Tabs */}
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

      {/* Sub-page content */}
      <Outlet />
    </div>
  )
}
