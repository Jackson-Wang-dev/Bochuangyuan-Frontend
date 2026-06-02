import { useNavigate } from 'react-router-dom'
import { Plus, Briefcase, Users, Calendar, ChevronRight, Zap } from 'lucide-react'
import { useProjectDashboardStore } from '@/store/projectDashboardStore'
import { formatTimestamp, type ProjectV2 } from '@/mock/projectMock'
import { cn } from '@/lib/utils'

const TRACK_COLOR: Record<string, string> = {
  '医疗健康': 'bg-rose-50 text-rose-600',
  '新能源':   'bg-emerald-50 text-emerald-600',
  '智慧城市': 'bg-blue-50 text-blue-600',
  '人工智能': 'bg-violet-50 text-violet-600',
  '智慧物流': 'bg-amber-50 text-amber-600',
}

const MATURITY_COLOR: Record<string, string> = {
  概念: 'bg-slate-100 text-slate-500',
  原型: 'bg-blue-50 text-blue-500',
  小试: 'bg-amber-50 text-amber-600',
  中试: 'bg-orange-50 text-orange-600',
  量产: 'bg-emerald-50 text-emerald-600',
}

function ProjectCard({ project, registrationCount }: { project: ProjectV2; registrationCount: number }) {
  const navigate = useNavigate()
  const lastEvent = [...project.events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]
  const trackColor = TRACK_COLOR[project.track] ?? 'bg-slate-50 text-slate-500'
  const maturityColor = MATURITY_COLOR[project.maturityLevel] ?? 'bg-slate-100 text-slate-500'

  return (
    <button
      onClick={() => navigate(`/project/${project.id}`)}
      className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-brand-blue/30 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-brand-blue/8 flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-5 h-5 text-brand-blue" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 text-base leading-tight">{project.displayName}</h3>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', trackColor)}>
              {project.track}
            </span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', maturityColor)}>
              {project.maturityLevel}
            </span>
          </div>

          {/* Official name */}
          <p className="text-xs text-slate-400 truncate">{project.officialName}</p>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {project.teamSize} 人
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              融资 {project.fundingAmount > 0 ? `${project.fundingAmount} 万` : '未融资'}
            </span>
            <span className="flex items-center gap-1">
              报名记录 {registrationCount} 次
            </span>
            {lastEvent && (
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                最近活动 {formatTimestamp(lastEvent.timestamp)}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue flex-shrink-0 transition-colors mt-1" />
      </div>
    </button>
  )
}

export default function ProjectListPage() {
  const navigate = useNavigate()
  const { projects, registrations } = useProjectDashboardStore()

  const regCountByProject = registrations.reduce<Record<string, number>>((acc, r) => {
    acc[r.projectId] = (acc[r.projectId] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">我的项目</h1>
          <p className="text-sm text-slate-400 mt-0.5">项目是随时间成长的主体，点击进入项目主页</p>
        </div>
        <button
          onClick={() => navigate('/project/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建项目
        </button>
      </div>

      {/* Project cards */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-slate-400 gap-3">
          <Briefcase className="w-10 h-10" />
          <p className="text-sm">还没有项目，点击右上角新建</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} registrationCount={regCountByProject[p.id] ?? 0} />
          ))}
        </div>
      )}
    </div>
  )
}
