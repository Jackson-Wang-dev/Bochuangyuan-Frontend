import type { Persona } from '../types'

interface PersonaCardProps {
  persona: Persona
  showDescription?: boolean
}

const rarityConfig = {
  稀有: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
  少见: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
  主流: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
}

export default function PersonaCard({ persona, showDescription = true }: PersonaCardProps) {
  const rarity = rarityConfig[persona.rarityLabel]
  const rarityPercent = Math.round(persona.rarity * 100)

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 mx-4">
      <div className="flex items-start justify-between mb-4">
        <div className="text-6xl leading-none">{persona.imageEmoji}</div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${rarity.bg} ${rarity.border}`}
        >
          <span className={`w-2 h-2 rounded-full ${rarity.dot}`} />
          <span className={`text-xs font-bold ${rarity.text}`}>{persona.rarityLabel}</span>
          <span className={`text-xs ${rarity.text}`}>仅 {rarityPercent}%</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">{persona.name}</h2>

      <p className="text-[#5b5fed] font-medium text-sm mb-4 leading-relaxed">
        "{persona.keyword}"
      </p>

      <div className="h-px bg-gray-100 mb-4" />

      {showDescription && (
        <p className="text-gray-600 text-sm leading-[1.85]">{persona.staticDescription}</p>
      )}
    </div>
  )
}
