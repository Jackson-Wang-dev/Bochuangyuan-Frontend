import { MessageCircle } from 'lucide-react'

interface StorySceneProps {
  sequence: number
  sceneTitle: string
  sceneDescription: string
  questionText: string
}

export default function StoryScene({
  sequence,
  sceneDescription,
  questionText,
}: StorySceneProps) {
  return (
    <div className="px-5 pt-6">
      {/* Mono eyebrow */}
      <p className="font-mono text-[10px] text-[#0045c4] tracking-[0.18em] uppercase mb-2">
        Scene · {String(sequence).padStart(2, '0')}
      </p>

      {/* Serif scene heading */}
      <h2 className="font-serif text-[22px] font-semibold text-slate-900 leading-[1.35] tracking-tight">
        {sceneDescription}
      </h2>

      {/* Question pill */}
      <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0045c4]/8 text-[#0045c4] text-[12px] font-medium">
        <MessageCircle className="w-3.5 h-3.5" />
        {questionText}
      </div>
    </div>
  )
}
