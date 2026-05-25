import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import type { AiAssessmentDimension } from '@bochuangyuan/types'

interface RadarChartProps {
  data: AiAssessmentDimension[]
  size?: number
}

export function AssessmentRadarChart({ data, size = 300 }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="能力评估"
          dataKey="value"
          stroke="#2563eb"
          fill="#3b82f6"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
