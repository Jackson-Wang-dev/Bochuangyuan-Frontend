export interface HeroStat {
  value: string
  label: string
  trend: number[]
}

export interface SiteNavGroupItem {
  label: string
  href: string
  desc?: string
}

export interface SiteNavGroup {
  title: string
  items: SiteNavGroupItem[]
}

export interface SiteNavItem {
  label: string
  href: string
  groups?: SiteNavGroup[]
}

export interface SitePartner {
  name: string
  tag: string
}

export interface SiteFeature {
  icon: string
  title: string
  desc: string
}

export type CompetitionCategory = '创新赛事' | '人才项目'

export interface SiteCompetition {
  slug: string
  name: string
  status: string
  time: string
  track: string
  metric: string
  summary: string
  location: string
  deadline: string
  reward: string
  rewardUnit: string
  tags: string[]
  image: string
  category: CompetitionCategory
  tracks: string[]
}

export interface CompetitionTimelineItem {
  title: string
  date: string
  detail: string
}

export interface CompetitionDetail extends SiteCompetition {
  intro: string
  objective: string
  eligibility: string[]
  milestones: CompetitionTimelineItem[]
  materials: string[]
  services: string[]
}

export interface SiteNewsArticle {
  slug: string
  type: string
  title: string
  date: string
  summary: string
  author: string
  body: string[]
}

export interface SiteHomeData {
  navItems: SiteNavItem[]
  stats: HeroStat[]
  ecosystem: SiteFeature[]
  competitions: SiteCompetition[]
  products: SiteFeature[]
  news: SiteNewsArticle[]
  partners: SitePartner[]
}