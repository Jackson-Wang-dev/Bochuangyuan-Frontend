import { useState } from 'react'
import type { Option } from '../types'

interface OptionCardProps {
  option: Option
  selected: boolean
  disabled: boolean
  onSelect: (optionId: number) => void
}

export default function OptionCard({ option, selected, disabled, onSelect }: OptionCardProps) {
  const [pressing, setPressing] = useState(false)

  const handleClick = () => {
    if (disabled) return
    onSelect(option.id)
  }

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => setPressing(false)}
      onMouseLeave={() => setPressing(false)}
      disabled={disabled}
      className={[
        'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[#5b5fed]/40',
        selected
          ? 'border-[#5b5fed] bg-[#5b5fed]/10 shadow-lg scale-[1.01]'
          : disabled
            ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
            : pressing
              ? 'border-[#5b5fed]/60 bg-[#5b5fed]/5 scale-[0.99] shadow-md'
              : 'border-gray-200 bg-white hover:border-[#5b5fed]/50 hover:shadow-md hover:scale-[1.005] cursor-pointer',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200',
            selected ? 'bg-[#5b5fed] text-white' : 'bg-gray-100 text-gray-500',
          ].join(' ')}
        >
          {option.label}
        </span>
        <p
          className={[
            'text-base leading-relaxed pt-0.5 transition-colors duration-200',
            selected ? 'text-[#5b5fed] font-medium' : 'text-gray-700',
          ].join(' ')}
        >
          {option.content}
        </p>
      </div>
    </button>
  )
}
