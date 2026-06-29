import {
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  FileCheck2,
  Globe2,
  Landmark,
  LineChart,
  LogOut,
  MapPin,
  Newspaper,
  Network,
  Radar,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardUrl, hasDashboardUrl } from './lib/dashboard'
import { formatCountdown } from './lib/competition'
import { useSiteAuth } from './store/siteAuth'
import type { HeroStat, SiteCompetition, SiteFeature, SiteNavItem, SiteNewsArticle, SitePartner } from './types'

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
  const { user, accessToken, isLoginOpen, isLoggingIn, loginError, openLogin, closeLogin, logout, login } = useSiteAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openNavIndex, setOpenNavIndex] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-slate-950">
          <BochuangLogo />
          <div>
            <div className="text-base font-bold tracking-tight">博创网</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Doctor Venture</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setOpenNavIndex(null)}>
          {navItems.map((item, index) => (
            <div key={item.href} className="relative" onMouseEnter={() => setOpenNavIndex(item.groups ? index : null)}>
              <a href={item.href} className="rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                {item.label}
              </a>
              {item.groups && openNavIndex === index && (
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3">
                  <div className="flex gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" style={{ minWidth: item.groups.length > 1 ? 480 : 280 }}>
                    {item.groups.map((group) => (
                      <div key={group.title} className="min-w-[200px]">
                        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue">{group.title}</div>
                        <div className="mt-3 space-y-3">
                          {group.items.map((groupItem) => (
                            <Link
                              key={groupItem.href + groupItem.label}
                              to={groupItem.href}
                              className="block rounded-xl px-2 py-1.5 -mx-2 hover:bg-slate-50"
                              onClick={() => setOpenNavIndex(null)}
                            >
                              <div className="text-sm font-medium text-slate-900">{groupItem.label}</div>
                              {groupItem.desc && <div className="mt-0.5 text-xs leading-5 text-slate-500">{groupItem.desc}</div>}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setIsMenuOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-xs font-semibold text-white">{user.username.slice(0, 1).toUpperCase()}</span>
                {user.username}
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-2xl border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-xl">
                  <div className="px-3 py-2 text-xs text-slate-400">{user.role}账号</div>
                  <a href={getDashboardUrl('', accessToken)} className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50">
                    <User className="h-4 w-4 text-brand-blue" /> 进入工作台
                  </a>
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4 text-slate-400" /> 退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={openLogin} className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-blue-2">
              登录 <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <LoginModal isOpen={isLoginOpen} isLoggingIn={isLoggingIn} error={loginError} onClose={closeLogin} onLogin={login} />
    </header>
  )
}

export function LoginModal({
  isOpen,
  isLoggingIn,
  error,
  onClose,
  onLogin,
}: {
  isOpen: boolean
  isLoggingIn: boolean
  error: string | null
  onClose: () => void
  onLogin: (username: string, password: string) => Promise<void>
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-950">创业者登录</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">使用您的博创网账号登录，登录后可在站内报名赛事并直接进入创业者工作台。</p>
        <form
          className="mt-5 space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            void onLogin(username, password)
          }}
        >
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="用户名"
            required
            autoComplete="username"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="密码"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-blue"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-2 disabled:opacity-60"
          >
            {isLoggingIn ? '登录中…' : '登录'}
          </button>
        </form>
      </div>
    </div>
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

export function StatCard({ stat, accent = 'cyan' }: { stat: HeroStat; accent?: 'cyan' | 'blue' }) {
  const max = Math.max(...stat.trend, 1)
  const barColor = accent === 'cyan' ? 'bg-brand-cyan' : 'bg-brand-blue'
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
      <div className="font-mono text-2xl font-semibold tabular-nums text-white">{stat.value}</div>
      <div className="mt-1 text-xs text-white/52">{stat.label}</div>
      <div className="mt-3 flex h-8 items-end gap-1">
        {stat.trend.map((point, index) => (
          <span key={index} className={`flex-1 rounded-sm ${barColor}`} style={{ height: `${Math.max((point / max) * 100, 8)}%`, opacity: 0.45 + (index / stat.trend.length) * 0.55 }} />
        ))}
      </div>
    </div>
  )
}

export function PartnersStrip({ partners }: { partners: SitePartner[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {partners.map((partner) => (
        <div key={partner.name} className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-5 text-center">
          <span className="text-sm font-semibold text-slate-700">{partner.name}</span>
          <span className="text-[11px] text-slate-400">{partner.tag}</span>
        </div>
      ))}
    </div>
  )
}

export function CompetitionCard({ item }: { item: SiteCompetition }) {
  const countdown = formatCountdown(item.deadline)
  const { user, accessToken, openLogin } = useSiteAuth()
  const registerHref = user && hasDashboardUrl() ? getDashboardUrl(`/competition/${item.slug}/register`, accessToken) : undefined
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/92 px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {item.status}
          </span>
          {countdown && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-ink/85 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
              <Clock className="h-3 w-3" /> {countdown}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-semibold leading-snug text-slate-950">{item.name}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">{item.category}</span>
          {item.tracks.map((track) => <span key={track} className="rounded-full bg-brand-cyan/10 px-2.5 py-1 text-xs text-brand-cyan">{track}</span>)}
          {item.tags.map((tag) => <span key={tag} className="rounded-full bg-brand-blue/8 px-2.5 py-1 text-xs text-brand-blue">{tag}</span>)}
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{item.track}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-sm">
          <div className="flex items-center gap-1.5 text-slate-600"><MapPin className="h-3.5 w-3.5 text-brand-blue" /> {item.location}</div>
          <div className="flex items-center gap-1.5 text-slate-600"><CalendarDays className="h-3.5 w-3.5 text-brand-blue" /> 截止 {item.deadline}</div>
          <div className="flex items-center gap-1.5 text-slate-600"><Trophy className="h-3.5 w-3.5 text-brand-blue" /> {item.reward}{item.rewardUnit}</div>
          <div className="flex items-center gap-1.5 text-slate-600"><Users className="h-3.5 w-3.5 text-brand-blue" /> 规模 {item.metric}</div>
        </div>
        <div className="mt-5 flex gap-2">
          <Link
            to={`/competitions/${item.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-brand-blue hover:text-brand-blue"
          >
            查看详情
          </Link>
          {registerHref ? (
            <a
              href={registerHref}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-blue-2"
            >
              报名赛事 <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <button
              onClick={openLogin}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-blue-2"
            >
              报名赛事 <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function computePerView(): number {
  if (typeof window === 'undefined') return 1
  if (window.innerWidth >= 1024) return 3
  if (window.innerWidth >= 640) return 2
  return 1
}

function usePerView(): number {
  const [perView, setPerView] = useState(computePerView)

  useEffect(() => {
    function onResize() {
      setPerView(computePerView())
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return perView
}

export function CompetitionCarousel({ items }: { items: SiteCompetition[] }) {
  const perView = usePerView()
  const pages = useMemo(() => {
    const chunks: SiteCompetition[][] = []
    for (let i = 0; i < items.length; i += perView) chunks.push(items.slice(i, i + perView))
    return chunks
  }, [items, perView])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (activeIndex >= pages.length) setActiveIndex(0)
  }, [pages.length, activeIndex])

  useEffect(() => {
    if (isPaused || pages.length <= 1) return
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % pages.length)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [isPaused, pages.length])

  function goTo(index: number) {
    setActiveIndex(((index % pages.length) + pages.length) % pages.length)
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {pages.map((page, pageIndex) => (
            <div key={pageIndex} className="grid w-full flex-shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {page.map((item) => <CompetitionCard key={item.slug} item={item} />)}
            </div>
          ))}
        </div>
      </div>
      {pages.length > 1 && (
        <>
          <button
            aria-label="上一个"
            onClick={() => goTo(activeIndex - 1)}
            className="absolute -left-3 top-1/2 flex -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md hover:text-brand-blue"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="下一个"
            onClick={() => goTo(activeIndex + 1)}
            className="absolute -right-3 top-1/2 flex -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md hover:text-brand-blue"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="mt-5 flex items-center justify-center gap-2">
            {pages.map((_, index) => (
              <button
                key={index}
                aria-label={`查看第 ${index + 1} 组`}
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-brand-blue' : 'w-1.5 bg-slate-300'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
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