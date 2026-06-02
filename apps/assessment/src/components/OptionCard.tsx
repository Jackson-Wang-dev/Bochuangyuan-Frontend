import { Check } from 'lucide-react'
import type { Option } from '../types'

interface OptionCardProps {
  option: Option
  index: number
  selected: boolean
  disabled: boolean
  onSelect: (optionId: number) => void
}

export default function OptionCard({ option, index, selected, disabled, onSelect }: OptionCardProps) {
  const letter = String.fromCharCode(65 + index) // A, B, C, D

  const handleClick = () => {
    if (disabled) return
    onSelect(option.id)
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={[
        'w-full text-left bg-white rounded-2xl p-4 border flex items-start gap-3 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-[#0045c4]/30',
        selected
          ? 'border-2 border-[#0045c4] shadow-sm shadow-[#0045c4]/10'
          : disabled
            ? 'border-slate-200 opacity-60 cursor-not-allowed'
            : 'border-slate-200 hover:border-[#0045c4]/40 cursor-pointer',
      ].join(' ')}
    >
      {/* A/B/C/D mono badge */}
      <span
        className={[
          'w-6 h-6 rounded-full text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5 transition-colors',
          selected ? 'bg-[#0045c4] text-white' : 'bg-slate-100 text-slate-500',
        ].join(' ')}
      >
        {letter}
      </span>

      {/* Option text */}
      <p
        className={[
          'text-[13.5px] leading-relaxed flex-1',
          selected ? 'text-slate-900 font-medium' : 'text-slate-800',
        ].join(' ')}
      >
        {option.content}
      </p>

      {/* Check icon when selected */}
      {selected && <Check className="w-4 h-4 text-[#0045c4] mt-0.5 shrink-0" />}
    </button>
  )
}
