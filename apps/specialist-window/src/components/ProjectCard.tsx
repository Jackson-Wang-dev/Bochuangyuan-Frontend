import { ChevronRight, Clock, EyeOff, Eye } from 'lucide-react'
import { StatusBadge } from '@bochuangyuan/ui'
import type { ReviewTask } from '@bochuangyuan/types'

interface ProjectCardProps {
  task: ReviewTask
  onClick: () => void
}

function StageBadge({ stage }: { stage: ReviewTask['reviewStage'] }) {
  if (stage === 'initial') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
        <EyeOff className="w-3 h-3" />
        盲审
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
      <Eye className="w-3 h-3" />
      复审
    </span>
  )
}

export function ProjectCard({ task, onClick }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-4 w-full text-left flex items-center gap-4 hover:shadow-md hover:border-brand-blue/20 transition-all active:scale-[0.99]"
    >
      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
        <span className="text-brand-blue font-black text-sm">{task.projectName.slice(0, 1)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800 truncate">{task.projectName}</span>
          <StageBadge stage={task.reviewStage} />
          <StatusBadge status={task.status} />
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          <span>{task.projectDomain}</span>
          <span>·</span>
          <span>{task.competitionName}</span>
          {task.deadline && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.deadline} 截止</span>
            </>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
    </button>
  )
}
