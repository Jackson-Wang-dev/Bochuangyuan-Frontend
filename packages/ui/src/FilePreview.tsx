import { FileText, Image, File, ExternalLink } from 'lucide-react'
import { cn } from './lib/cn'

interface FilePreviewProps {
  url: string
  name: string
  className?: string
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext ?? '')) return Image
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext ?? '')) return FileText
  return File
}

export function FilePreview({ url, name, className }: FilePreviewProps) {
  const Icon = getFileIcon(name)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors group',
        className,
      )}
    >
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-blue-500" />
      </div>
      <span className="flex-1 text-sm text-slate-700 truncate font-medium">{name}</span>
      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
    </a>
  )
}
