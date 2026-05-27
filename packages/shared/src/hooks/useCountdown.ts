import { useEffect, useState } from 'react'

interface CountdownResult {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  isUrgent: boolean
}

function getRemaining(deadline: string): CountdownResult {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isUrgent: false }
  }
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    isUrgent: diff < 24 * 60 * 60 * 1000,
  }
}

export function useCountdown(deadline: string | undefined): CountdownResult {
  const [result, setResult] = useState<CountdownResult>(() =>
    deadline
      ? getRemaining(deadline)
      : { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false, isUrgent: false },
  )

  useEffect(() => {
    if (!deadline) return
    setResult(getRemaining(deadline))
    const id = setInterval(() => setResult(getRemaining(deadline)), 1000)
    return () => clearInterval(id)
  }, [deadline])

  return result
}
