interface StorySceneProps {
  sequence: number
  sceneTitle: string
  sceneDescription: string
  questionText: string
}

export default function StoryScene({
  sequence,
  sceneTitle,
  sceneDescription,
  questionText,
}: StorySceneProps) {
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2.5 py-1 bg-[#5b5fed]/10 text-[#5b5fed] text-xs font-bold rounded-full">
          第 {String(sequence).padStart(2, '0')} 关
        </span>
        <span className="text-gray-500 text-sm">·</span>
        <span className="text-gray-600 text-sm font-medium">{sceneTitle}</span>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-5 mb-4 border border-gray-100">
        <p className="text-gray-700 text-base leading-[1.85] tracking-wide">{sceneDescription}</p>
      </div>

      <p className="text-gray-900 text-lg font-semibold leading-relaxed px-1">{questionText}</p>
    </div>
  )
}
