interface Badge {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  earnedAt?: string
}

interface AchievementBadgeProps {
  badges: Badge[]
}

function BadgeItem({ badge }: { badge: Badge }) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
      badge.earned ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-100 opacity-50'
    }`}>
      <span className="text-3xl mb-2">{badge.icon}</span>
      <p className="font-semibold text-xs text-slate-700 text-center">{badge.title}</p>
      {badge.earned && badge.earnedAt && (
        <p className="text-[10px] text-amber-500 mt-1">{badge.earnedAt}</p>
      )}
    </div>
  )
}

export function AchievementBadge({ badges }: AchievementBadgeProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {badges.map((badge) => (
        <BadgeItem key={badge.id} badge={badge} />
      ))}
    </div>
  )
}
