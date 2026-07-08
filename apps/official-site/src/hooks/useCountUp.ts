import { useEffect, useState } from 'react'

interface UseCountUpOptions {
  end: number
  duration?: number
  enabled?: boolean
  prefix?: string
  suffix?: string
}

export function useCountUp({ end, duration = 1200, enabled = true, prefix = '', suffix = '' }: UseCountUpOptions) {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`)

  useEffect(() => {
    if (!enabled) return

    let raf: number
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * end)
      setDisplay(`${prefix}${current.toLocaleString()}${suffix}`)

      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [end, duration, enabled, prefix, suffix])

  return display
}

/** Extract numeric value from strings like "4000+" -> 4000, "10000+" -> 10000 */
export function parseStatValue(raw: string): { num: number; prefix: string; suffix: string } {
  const match = raw.match(/^([^0-9]*)(\d[\d,]*)([^0-9]*)$/)
  if (match) {
    return {
      prefix: match[1] ?? '',
      num: parseInt(match[2]!.replace(/,/g, ''), 10),
      suffix: match[3] ?? '',
    }
  }
  return { num: 0, prefix: raw, suffix: '' }
}
