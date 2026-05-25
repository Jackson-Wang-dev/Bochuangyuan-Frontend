import { cn } from './lib/cn'

type StatusVariant =
  | 'draft' | 'open' | 'reviewing' | 'closed' | 'finished'
  | 'pending' | 'scoring' | 'done'
  | 'enrolled' | 'scored' | 'awarded'

const VARIANT_MAP: Record<StatusVariant, { label: string; className: string }> = {
  draft:     { label: '草稿',   className: 'bg-slate-100 text-slate-500' },
  open:      { label: '报名中', className: 'bg-emerald-50 text-emerald-600' },
  reviewing: { label: '评审中', className: 'bg-blue-50 text-blue-600' },
  closed:    { label: '已截止', className: 'bg-orange-50 text-orange-600' },
  finished:  { label: '已结束', className: 'bg-slate-100 text-slate-500' },
  pending:   { label: '待评审', className: 'bg-amber-50 text-amber-600' },
  scoring:   { label: '评分中', className: 'bg-blue-50 text-blue-600' },
  done:      { label: '已完成', className: 'bg-emerald-50 text-emerald-600' },
  enrolled:  { label: '已报名', className: 'bg-sky-50 text-sky-600' },
  scored:    { label: '已评分', className: 'bg-violet-50 text-violet-600' },
  awarded:   { label: '已获奖', className: 'bg-amber-50 text-amber-700' },
}

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = VARIANT_MAP[status] ?? { label: status, className: 'bg-slate-100 text-slate-500' }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', variant.className, className)}>
      {variant.label}
    </span>
  )
}
