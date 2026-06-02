import { ChevronRight, Clock, EyeOff, Eye } from 'lucide-react'
import type { ReviewTask } from '@bochuangyuan/types'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  task: ReviewTask
  onClick: () => void
}

function StageBadge({ stage }: { stage: ReviewTask['reviewStage'] }) {
  if (stage === 'initial') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-bg text-slate px-[7px] py-px rounded-[6px]">
        <EyeOff className="w-3 h-3" />
        盲审
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-brand-50 text-brand-d px-[7px] py-px rounded-[6px]">
      <Eye className="w-3 h-3" />
      复审
    </span>
  )
}

function StatusTag({ status }: { status: ReviewTask['status'] }) {
  const isDone = status === 'done'
  return (
    <span className={cn(
      'text-[11px] font-semibold px-[7px] py-px rounded-[6px]',
      isDone ? 'bg-green-bg text-green' : 'bg-amber-bg text-amber',
    )}>
      {isDone ? '已评审' : '待评审'}
    </span>
  )
}

export function ProjectCard({ task, onClick }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="glass-card p-4 w-full text-left flex items-center gap-4 hover:border-brand-100 transition-all"
    >
      <div className="w-10 h-10 rounded-[9px] bg-brand-50 grid place-items-center flex-none">
        <span className="text-brand-d font-bold text-[15px]">{task.projectName.slice(0, 1)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold text-ink truncate">{task.projectName}</span>
          <StageBadge stage={task.reviewStage} />
          <StatusTag status={task.status} />
        </div>
        <div className="flex items-center gap-3 mt-1 text-[12px] text-faint">
          {task.projectDomain && <span>{task.projectDomain}</span>}
          {task.projectDomain && task.competitionName && <span>·</span>}
          {task.competitionName && <span>{task.competitionName}</span>}
          {task.deadline && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.deadline} 截止</span>
            </>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-faint flex-none" />
    </button>
  )
}
