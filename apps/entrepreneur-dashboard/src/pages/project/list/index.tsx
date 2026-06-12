import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Calendar, ChevronRight, ImagePlus, MapPin, Cpu } from 'lucide-react'
import { useProjectDashboardStore } from '@/store/projectDashboardStore'
import { listProjects } from '@/api/project'
import { summaryToProject } from '@/api/projectMapper'
import type { Project } from '@/types/project'
import { cn } from '@/lib/utils'

// ─── Cover helpers ────────────────────────────────────────────────────────────

const DOMAIN_GRADIENT: Record<string, string> = {
  '人工智能与大数据':   'from-blue-500 to-violet-600',
  '生物医药与健康':    'from-emerald-500 to-teal-600',
  '新能源与环保':     'from-green-400 to-emerald-600',
  '高端装备与先进制造': 'from-slate-500 to-slate-700',
  '新材料':          'from-rose-500 to-pink-600',
  '数字经济与信息技术': 'from-cyan-500 to-blue-600',
  '现代农业':        'from-lime-500 to-green-600',
}

function coverGradient(project: Project): string {
  const topLabel = project.professionalDomain.top?.label ?? ''
  return DOMAIN_GRADIENT[topLabel] ?? 'from-brand-blue to-brand-blue/80'
}

function AutoCover({ project, className }: { project: Project; className?: string }) {
  const grad = coverGradient(project)
  const leaf = project.professionalDomain.leaf?.label
    ?? project.professionalDomain.top?.label
    ?? '科技创业'
  return (
    <div className={cn(`bg-gradient-to-br ${grad} flex flex-col items-center justify-center p-3 gap-1 select-none`, className)}>
      <p className="text-white text-center text-xs font-bold leading-snug line-clamp-2">
        {project.declarationName || project.projectName}
      </p>
      <p className="text-white/60 text-center text-[10px] line-clamp-1">{leaf}</p>
    </div>
  )
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  const { updateProjectV3 } = useProjectDashboardStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const regCount = project.events.filter((e) => e.type === '报名').length
  const lastUpdated = project.updatedAt.slice(0, 10)

  const domainLabel = [
    project.professionalDomain.top?.label,
    project.professionalDomain.leaf?.label,
  ]
    .filter(Boolean)
    .join(' › ')

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      updateProjectV3(project.id, { coverImage: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-brand-blue/25 hover:shadow-md transition-all group overflow-hidden">
      {/* Cover */}
      <div className="relative w-28 shrink-0">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.declarationName}
            className="w-full h-full object-cover"
          />
        ) : (
          <AutoCover project={project} className="w-full h-full" />
        )}
        {/* Upload overlay */}
        <button
          onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
          className="absolute inset-0 flex items-end justify-end p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          title="更换封面"
        >
          <span className="p-1 bg-black/40 hover:bg-black/60 rounded-lg text-white transition-colors">
            <ImagePlus className="w-3 h-3" />
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {/* Content area */}
      <button
        onClick={() => navigate(`/project/${project.id}`)}
        className="flex-1 p-4 text-left min-w-0 flex items-center gap-3"
      >
        <div className="flex-1 min-w-0 space-y-2">
          {/* Name */}
          <div>
            <h3 className="font-bold text-slate-800 text-base leading-tight truncate">
              {project.declarationName || '未设定申报用名'}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">{project.projectName}</p>
          </div>

          {/* Domain + coreTech badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {domainLabel && (
              <span className="flex items-center gap-1 text-xs text-brand-blue bg-brand-blue/8 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                <MapPin className="w-3 h-3 shrink-0" />
                {domainLabel}
              </span>
            )}
            {project.coreTech && (
              <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full whitespace-nowrap max-w-[180px] truncate">
                <Cpu className="w-3 h-3 shrink-0" />
                {project.coreTech}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {project.teamMembers.length + 1} 人
            </span>
            {regCount > 0 && <span>报名 {regCount} 次</span>}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {lastUpdated}
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue shrink-0 transition-colors" />
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectListPage() {
  const navigate = useNavigate()
  const { projectsV3, setProjectsV3 } = useProjectDashboardStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    listProjects()
      .then((items) => setProjectsV3(items.map(summaryToProject)))
      .catch(() => setError('获取项目列表失败，请刷新重试'))
      .finally(() => setLoading(false))
  }, [setProjectsV3])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">我的项目</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            悬停封面可更换图片；点击卡片进入项目详情
          </p>
        </div>
        <button
          onClick={() => navigate('/project/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-bold hover:bg-brand-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建项目
        </button>
      </div>

      {error ? (
        <div className="flex flex-col items-center py-20 text-red-400 gap-3">
          <p className="text-sm">{error}</p>
        </div>
      ) : projectsV3.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-slate-400 gap-3">
          <p className="text-sm">还没有项目，点击右上角新建</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projectsV3.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}
