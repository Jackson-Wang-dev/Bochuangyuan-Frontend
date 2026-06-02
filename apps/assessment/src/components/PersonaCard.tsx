import type { Persona } from '../types'

interface PersonaCardProps {
  persona: Persona
  showDescription?: boolean
  /** 'ink' = inside dark header, 'paper' = inside white card */
  variant?: 'ink' | 'paper'
}

export default function PersonaCard({
  persona,
  showDescription = true,
  variant = 'paper',
}: PersonaCardProps) {
  const rarityPercent = Math.round(persona.rarity * 100)

  if (variant === 'ink') {
    // Rendered inside the ink-blue header — light-on-dark styling
    return (
      <div className="px-5 pb-4">
        <div className="flex items-end gap-4 mb-4">
          {/* Monogram tile */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0045c4] to-[#003ba8] flex items-center justify-center text-white shadow-xl shadow-[#0045c4]/30 shrink-0">
            <span className="font-serif text-4xl font-bold">
              {persona.name.charAt(0)}
            </span>
          </div>
          <div className="pb-1">
            {/* Rarity chip */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] font-semibold text-amber-300 tracking-wider">
                {persona.rarityLabel} · {rarityPercent}%
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
              {persona.name}
            </h2>
            <p className="text-[13px] text-white/65 mt-1">Persona · 23 类人格</p>
          </div>
        </div>

        {/* Keyword quote */}
        <blockquote className="border-l-2 border-[#0045c4] pl-4 text-[15px] text-white/85 font-serif italic leading-relaxed">
          "{persona.keyword}"
        </blockquote>
      </div>
    )
  }

  // Default 'paper' variant — white card
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mx-4">
      {/* Top: monogram + rarity */}
      <div className="flex items-start justify-between mb-4">
        {/* Monogram tile */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0045c4] to-[#003ba8] flex items-center justify-center text-white shadow-md">
          <span className="font-serif text-3xl font-bold">
            {persona.name.charAt(0)}
          </span>
        </div>
        {/* Rarity chip */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0045c4]/8 border border-[#0045c4]/15">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0045c4]" />
          <span className="text-[10px] font-semibold text-[#0045c4] tracking-wider">
            {persona.rarityLabel} · 仅 {rarityPercent}%
          </span>
        </div>
      </div>

      {/* Name */}
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{persona.name}</h2>

      {/* Keyword — serif italic with brand-blue left rule */}
      <blockquote className="border-l-2 border-[#0045c4] pl-3 text-[13px] font-serif italic text-slate-600 mb-4 leading-relaxed">
        "{persona.keyword}"
      </blockquote>

      <div className="h-px bg-slate-100 mb-4" />

      {showDescription && (
        <p className="text-slate-600 text-[13px] leading-[1.85]">{persona.staticDescription}</p>
      )}
    </div>
  )
}
