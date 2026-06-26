export interface HeroStat {
  value: string
  label: string
}

export interface SiteNavItem {
  label: string
  href: string
}

export interface SiteFeature {
  icon: string
  title: string
  desc: string
}

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

export interface SitePastProject {
  slug: string
  name: string
  year: string
  field: string
  competition: string
  location: string
  stage: string
  highlight: string
  summary: string
  tags: string[]
  metrics: Array<{ label: string; value: string }>
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
  pastProjects: SitePastProject[]
  products: SiteFeature[]
  news: SiteNewsArticle[]
}