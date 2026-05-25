import { useEffect, useRef, useState } from 'react'

interface AiReportSectionProps {
  content: string
  shouldStart: boolean
  onComplete?: () => void
}

const CHARS_PER_SECOND = 40

export default function AiReportSection({
  content,
  shouldStart,
  onComplete,
}: AiReportSectionProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!shouldStart || !content) return
    if (isDone) {
      setDisplayedText(content)
      return
    }

    setIsTyping(true)
    indexRef.current = 0
    setDisplayedText('')

    const msPerChar = 1000 / CHARS_PER_SECOND

    intervalRef.current = setInterval(() => {
      indexRef.current += 1
      const next = content.slice(0, indexRef.current)
      setDisplayedText(next)

      if (indexRef.current >= content.length) {
        clearInterval(intervalRef.current!)
        setIsTyping(false)
        setIsDone(true)
        onComplete?.()
      }
    }, msPerChar)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [shouldStart, content, isDone, onComplete])

  const handleSkip = () => {
    if (isDone) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDisplayedText(content)
    setIsTyping(false)
    setIsDone(true)
    onComplete?.()
  }

  const paragraphs = displayedText.split('\n\n').filter(Boolean)

  return (
    <div
      className="relative bg-white rounded-3xl mx-4 p-6 shadow-lg border border-gray-100"
      onClick={!isDone ? handleSkip : undefined}
      style={{ cursor: !isDone ? 'pointer' : 'default' }}
    >
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-[#5b5fed] to-[#8b5cf6] rounded-r-full" />

      <div className="pl-3">
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="mb-4 last:mb-0"
            style={{
              fontSize: '17px',
              lineHeight: '1.85',
              color: '#2d3748',
            }}
          >
            {para}
            {i === paragraphs.length - 1 && isTyping && (
              <span className="typewriter-cursor" />
            )}
          </p>
        ))}

        {shouldStart && displayedText === '' && (
          <span className="typewriter-cursor" />
        )}
      </div>

      {!isDone && shouldStart && (
        <p className="text-xs text-gray-400 text-center mt-4">点击任意处跳过</p>
      )}
    </div>
  )
}
