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
  logo?: string
}

export interface SiteFeature {
  icon: string
  title: string
  desc: string
}

export type CompetitionCategory = '创新赛事' | '人才项目'

export type CompetitionStatus = '报名开放中' | '项目征集中' | '报名预热中' | '即将开放' | '回顾展示'

export interface SiteCompetition {
  id: number
  slug: string
  name: string
  status: CompetitionStatus
  time: string
  trackDescription: string
  metric: string
  summary: string
  location: string
  deadline: string
  reward: number
  rewardUnit: string
  tags: string[]
  image: string
  category: CompetitionCategory
  tracks: string[]
}

export interface CompetitionTimelineItem {
  order: number
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

export type NewsType = '政策信息' | '赛事动态' | '科创消息' | '网站动态' | '园区合作' | '人才计划'

export interface SiteNewsArticle {
  id: number
  slug: string
  type: NewsType
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