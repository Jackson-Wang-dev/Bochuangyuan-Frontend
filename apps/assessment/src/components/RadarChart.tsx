import { useEffect, useState } from 'react'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
} from 'recharts'
import type { DimensionScore } from '../types'

interface RadarChartProps {
  scores: DimensionScore[]
  animate?: boolean
  size?: number
}

interface ChartDataPoint {
  subject: string
  score: number
  fullMark: number
}

export default function RadarChart({ scores, animate = true, size = 280 }: RadarChartProps) {
  const [animatedScores, setAnimatedScores] = useState<number[]>(scores.map(() => 0))
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!animate || hasAnimated) {
      setAnimatedScores(scores.map((s) => s.normalizedScore))
      return
    }

    const startTime = Date.now()
    const duration = 1500

    const frame = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)

      setAnimatedScores(scores.map((s) => Math.round(s.normalizedScore * eased)))

      if (progress < 1) {
        requestAnimationFrame(frame)
      } else {
        setHasAnimated(true)
      }
    }

    const raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [scores, animate, hasAnimated])

  const data: ChartDataPoint[] = scores.map((s, i) => ({
    subject: s.name,
    score: animatedScores[i] ?? 0,
    fullMark: 100,
  }))

  return (
    <div style={{ width: size, height: size }} className="mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fontSize: 12,
              fill: '#64748b',
              fontFamily: '"Inter", "Noto Sans SC", system-ui, sans-serif',
            }}
          />
          <Radar
            name="score"
            dataKey="score"
            stroke="#0045c4"
            fill="#0045c4"
            fillOpacity={0.12}
            strokeWidth={2}
            dot={{ fill: '#0045c4', r: 3, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}
