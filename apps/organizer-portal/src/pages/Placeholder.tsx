import { Construction } from 'lucide-react'

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
      <Construction className="w-10 h-10" />
      <p className="text-sm font-medium">{title} — 即将上线</p>
    </div>
  )
}
