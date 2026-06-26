import {
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  Globe2,
  Landmark,
  LineChart,
  MapPin,
  Newspaper,
  Network,
  Radar,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { HeroStat, SiteCompetition, SiteFeature, SiteNavItem, SiteNewsArticle, SitePastProject } from './types'

const iconMap: Record<string, LucideIcon> = {
  Award,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  Globe2,
  Landmark,
  LineChart,
  Newspaper,
  Network,
  Radar,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
}

export function BochuangLogo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="#0045c4" />
      <path
        d="M12 10h10.4c4.6 0 7.5 2.3 7.5 6 0 2.1-1 3.7-2.8 4.7 2.4.9 3.7 2.7 3.7 5.3 0 4.1-3.2 6.7-8.2 6.7H12V10Zm6.1 5v4h3.6c1.4 0 2.2-.7 2.2-2s-.8-2-2.2-2h-3.6Zm0 8.6v4.1h4.2c1.5 0 2.4-.8 2.4-2.1 0-1.3-.9-2-2.4-2h-4.2Z"
        fill="white"
      />
    </svg>
  )
}

export function SiteHeader({ navItems }: { navItems: SiteNavItem[] }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-brand-ink/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-white">
          <BochuangLogo />
          <div>
            <div className="text-base font-bold tracking-tight">博创网</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">Doctor Venture</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="rounded-xl px-3.5 py-2 text-sm font-medium text-white/68 hover:bg-white/10 hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#login" className="hidden rounded-xl px-3.5 py-2 text-sm font-medium text-white/72 hover:bg-white/10 hover:text-white sm:inline-flex">
            登录
          </a>
          <a href="#login" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-ink shadow-sm hover:bg-white/95">
            注册入口 <ArrowRight className="h-4 w-4 text-brand-blue" />
          </a>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer id="about" className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 border-t border-slate-200 pt-8 md:flex-row md:items-start">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <BochuangLogo />
            <div>
              <div className="font-semibold text-slate-950">博创网</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Doctor Venture</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">博创网连接博士后人才、企业需求、园区载体与创新创业赛事，持续服务项目从发现到成长。</p>
        </div>
        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-blue" /> 高校与流动站网络</div>
          <div className="flex items-center gap-2"><Award className="h-4 w-4 text-brand-blue" /> 创业服务基地</div>
          <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-brand-blue" /> 赛事运营与招商转化</div>
          <div className="flex items-center gap-2"><CircleDollarSign className="h-4 w-4 text-brand-blue" /> 政策与资本对接</div>
        </div>
      </div>
    </footer>
  )
}

export function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{desc}</p>
    </div>
  )
}

export function FeatureCard({ item }: { item: SiteFeature }) {
  const Icon = iconMap[item.icon] ?? Sparkles
  return (
    <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/8 text-brand-blue">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p>
      </div>
    </article>
  )
}

export function StatCard({ stat }: { stat: HeroStat }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <div className="font-mono text-2xl font-semibold tabular-nums text-white">{stat.value}</div>
      <div className="mt-1 text-xs text-white/52">{stat.label}</div>
    </div>
  )
}

export function CompetitionCard({ item }: { item: SiteCompetition }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-brand-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {item.status}
        </span>
        <span className="font-mono text-xs text-slate-400">{item.time}</span>
      </div>
      <h3 className="mt-5 text-xl font-semibold leading-snug text-slate-950">{item.name}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{item.track}</p>
      <div className="mt-6 flex items-end justify-between border-t border-slate-200 pt-4">
        <div>
          <div className="font-mono text-2xl font-semibold tabular-nums text-brand-blue">{item.metric}</div>
          <div className="text-xs text-slate-500">项目规模</div>
        </div>
        <Link to={`/competitions/${item.slug}`} className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-2">
          查看详情
        </Link>
      </div>
    </article>
  )
}

export function PastProjectCard({ item }: { item: SitePastProject }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue/8 px-2.5 py-1 text-xs font-medium text-brand-blue">
          <Trophy className="h-3.5 w-3.5" /> {item.year} 优秀项目
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" /> {item.location}</span>
      </div>
      <h3 className="mt-5 text-xl font-semibold leading-snug text-slate-950">{item.name}</h3>
      <p className="mt-2 text-sm text-brand-blue">{item.field} / {item.stage}</p>
      <p className="mt-4 text-sm leading-7 text-slate-600">{item.highlight}</p>
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-200 pt-4">
        {item.metrics.map((metric) => (
          <div key={metric.label}>
            <div className="font-mono text-lg font-semibold tabular-nums text-slate-950">{metric.value}</div>
            <div className="mt-1 text-[11px] text-slate-500">{metric.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {item.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{tag}</span>)}
      </div>
      <div className="mt-auto pt-5 text-xs leading-6 text-slate-500">{item.competition}</div>
    </article>
  )
}

export function NewsCard({ item }: { item: SiteNewsArticle }) {
  return (
    <article className="grid gap-3 py-5 md:grid-cols-[120px_1fr_80px] md:items-center">
      <span className="w-fit rounded-lg bg-brand-blue/8 px-2.5 py-1 text-xs font-medium text-brand-blue">{item.type}</span>
      <div>
        <Link to={`/news/${item.slug}`} className="text-base font-medium text-slate-900 hover:text-brand-blue">
          {item.title}
        </Link>
        <p className="mt-1 text-sm leading-6 text-slate-500">{item.summary}</p>
      </div>
      <span className="font-mono text-sm text-slate-400 md:text-right">{item.date}</span>
    </article>
  )
}

export function DetailPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  )
}