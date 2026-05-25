import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface ScoreRadarData {
  subject: string
  value: number
  fullMark?: number
}

interface ScoreRadarChartProps {
  data: ScoreRadarData[]
  color?: string
}

export function ScoreRadarChart({ data, color = '#0045c4' }: ScoreRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
        <Radar
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          strokeWidth={2}
          dot={{ r: 3, fill: color }}
        />
        <Tooltip
          formatter={(value: number) => [`${value}分`, '评分']}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
