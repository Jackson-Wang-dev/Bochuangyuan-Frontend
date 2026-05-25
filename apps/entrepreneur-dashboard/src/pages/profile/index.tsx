import { useState } from 'react'
import { ProfileHeader } from '@/components/ProfileHeader'
import { PersonalityRadar } from '@/components/PersonalityRadar'
import { GrowthTimeline } from '@/components/GrowthTimeline'
import { GrowthAnalytics } from '@/components/GrowthAnalytics'
import { cn } from '@/lib/utils'
import type { PersonalityData, TimelineEvent, GrowthDataPoint } from '@/types'

const PERSONALITY_DATA: PersonalityData[] = [
  { subject: '技术洞察', value: 95, fullMark: 100 },
  { subject: '市场直觉', value: 85, fullMark: 100 },
  { subject: '领导力', value: 90, fullMark: 100 },
  { subject: '风险意识', value: 75, fullMark: 100 },
  { subject: '创新能级', value: 92, fullMark: 100 },
]

const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 'ev-1', date: '2024-03-15', title: '高级合伙人认证', description: '成功通过博创网高级合伙人层级考核。', type: 'certificate', icon: 'certificate' },
  { id: 'ev-2', date: '2023-11-20', title: '全国大学生创业大赛金奖', description: '主导的"AI+分布式算力"项目获得年度最具创新潜力奖。', type: 'award', icon: 'award' },
  { id: 'ev-3', date: '2023-06-05', title: '首次获得天使轮融资', description: '成功获得国内顶尖风投机构300万天使轮投资。', type: 'milestone', icon: 'milestone' },
]

const GROWTH_DATA: GrowthDataPoint[] = [
  { date: 'Jan', technical: 65, market: 40, health: 80, aiAdoption: 30, riskControl: 70 },
  { date: 'Feb', technical: 72, market: 48, health: 75, aiAdoption: 45, riskControl: 72 },
  { date: 'Mar', technical: 85, market: 60, health: 85, aiAdoption: 70, riskControl: 85 },
  { date: 'Apr', technical: 92, market: 75, health: 84, aiAdoption: 120, riskControl: 92 },
]

const USER_DATA = {
  name: '王发',
  id: 'BCY-2024-001',
  tag: '高级合伙人',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop',
}

type Tab = 'profile' | 'growth'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('growth')

  return (
    <div className="space-y-6">
      <ProfileHeader data={USER_DATA} />

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([['profile', '能力档案'], ['growth', '成长分析']] as [Tab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-bold transition-all',
              activeTab === tab ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-bold text-slate-800 mb-4">AI 能力雷达</h3>
            <PersonalityRadar data={PERSONALITY_DATA} />
          </div>
          <div className="glass-card p-6">
            <GrowthTimeline events={TIMELINE_EVENTS} onUpload={() => {}} />
          </div>
        </div>
      )}

      {activeTab === 'growth' && (
        <div className="glass-card p-6">
          <GrowthAnalytics data={GROWTH_DATA} />
        </div>
      )}
    </div>
  )
}
