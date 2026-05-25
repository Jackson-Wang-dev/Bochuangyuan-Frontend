import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { ArchiveDashboard } from '@/components/ArchiveDashboard'
import { AssessmentModal } from '@/components/AssessmentModal'
import type { PersonalityData, TimelineEvent, GrowthDataPoint } from '@/types'

const PERSONALITY_DATA: PersonalityData[] = [
  { subject: '技术洞察', value: 95, fullMark: 100 },
  { subject: '市场直觉', value: 85, fullMark: 100 },
  { subject: '领导力', value: 90, fullMark: 100 },
  { subject: '风险意识', value: 75, fullMark: 100 },
  { subject: '创新能级', value: 92, fullMark: 100 },
]

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'ev-1',
    date: '2024-03-15',
    title: '高级合伙人认证',
    description: '成功通过博创网（BoChuang）高级合伙人层级考核，具备多项目管理与风控决策权。',
    type: 'certificate',
    icon: 'certificate',
  },
  {
    id: 'ev-2',
    date: '2023-11-20',
    title: '全国大学生创业大赛金奖',
    description: '主导的"AI+分布式算力"项目在万人重围中脱颖而出，获得年度最具创新潜力奖。',
    type: 'award',
    icon: 'award',
  },
  {
    id: 'ev-3',
    date: '2023-06-05',
    title: '首次获得天使轮融资',
    description: '通过Nexus平台对接，成功获得国内顶尖风投机构300万天使轮投资。',
    type: 'milestone',
    icon: 'milestone',
  },
]

const GROWTH_DATA: GrowthDataPoint[] = [
  { date: 'Jan', technical: 65, market: 40, health: 80, aiAdoption: 30, riskControl: 70 },
  { date: 'Feb', technical: 72, market: 48, health: 75, aiAdoption: 45, riskControl: 72 },
  { date: 'Mar', technical: 85, market: 60, health: 85, aiAdoption: 70, riskControl: 85 },
  { date: 'Apr', technical: 92, market: 75, health: 84, aiAdoption: 120, riskControl: 92 },
]

export default function HomePage() {
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <ArchiveDashboard
        timelineEvents={TIMELINE_EVENTS}
        growthData={GROWTH_DATA}
        personalityData={PERSONALITY_DATA}
        onStartAssessment={() => setIsAssessmentOpen(true)}
        onRegisterCompetition={() => navigate('/competition')}
        onGoToBPEdit={() => navigate('/project/bp')}
      />

      <AnimatePresence>
        {isAssessmentOpen && (
          <AssessmentModal
            key="assessment"
            isOpen={isAssessmentOpen}
            onClose={() => setIsAssessmentOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
