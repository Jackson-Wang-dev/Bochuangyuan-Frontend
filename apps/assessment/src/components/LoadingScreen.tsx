import { useEffect, useState } from 'react'

const LOADING_STEPS = [
  '正在分析你的答题轨迹...',
  '正在解读你的人格密码...',
  '正在为你绘制创业者画像...',
  '马上为你揭晓...',
]

interface LoadingScreenProps {
  onComplete: () => void
  duration?: number
}

export default function LoadingScreen({ onComplete, duration = 2800 }: LoadingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const stepDuration = duration / LOADING_STEPS.length
    let step = 0

    const interval = setInterval(() => {
      setOpacity(0)
      setTimeout(() => {
        step += 1
        if (step < LOADING_STEPS.length) {
          setStepIndex(step)
          setOpacity(1)
        } else {
          clearInterval(interval)
        }
      }, 300)
    }, stepDuration)

    const timer = setTimeout(() => {
      onComplete()
    }, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [duration, onComplete])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      {/* Glow orb */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-[#0045c4] animate-glow" />
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-[#0045c4] opacity-30 blur-xl animate-pulse" />
        {/* Spinning ring */}
        <div className="absolute -inset-2 border-2 border-[#0045c4]/30 border-t-[#0045c4] rounded-full animate-spin" />
      </div>

      {/* Step text */}
      <p
        className="text-gray-700 text-base font-medium text-center transition-opacity duration-300"
        style={{ opacity }}
      >
        {LOADING_STEPS[stepIndex]}
      </p>

      {/* Dots */}
      <div className="flex gap-1.5 mt-6">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === stepIndex ? 'bg-[#0045c4] scale-125' : 'bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
