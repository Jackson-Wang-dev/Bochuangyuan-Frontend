import { ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { getHomeData } from '../api/site'
import {
  CompetitionCarousel,
  FeatureCard,
  HeroCompetitionCarousel,
  NewsCard,
  PartnersStrip,
  SectionHeader,
  SiteFooter,
  SiteHeader,
} from '../components'
import { ScrollReveal } from '../components/ScrollReveal'
import { useCountUp, parseStatValue, useInView } from '../hooks'
import { mockHomeData } from '../data/mockSiteData'
import { getDashboardUrl } from '../lib/dashboard'
import { useSiteAuth } from '../store/siteAuth'
import type { SiteHomeData, HeroStat } from '../types'

function AnimatedStat({ stat, accent }: { stat: HeroStat; accent: 'cyan' | 'blue' }) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const { num, prefix, suffix } = parseStatValue(stat.value)
  const display = useCountUp({ end: num, enabled: isInView, prefix, suffix })

  return (
    <div ref={ref} className="rounded-xl border border-white/15 bg-white/5 p-3">
      <div className="font-mono text-lg font-semibold tabular-nums text-white">{display}</div>
      <div className="mt-0.5 text-[11px] leading-4 text-white/55">{stat.label}</div>
    </div>
  )
}

export function HomePage() {
  const [data, setData] = useState<SiteHomeData>(mockHomeData)
  const { user, accessToken } = useSiteAuth()
  const sectionRefs = useRef<HTMLElement[]>([])
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const scrollLockRef = useRef(false)

  useEffect(() => {
    let alive = true
    void getHomeData().then((next) => alive && setData(next))
    return () => {
      alive = false
    }
  }, [])

  function setSectionRef(index: number) {
    return (node: HTMLElement | null) => {
      if (node) sectionRefs.current[index] = node
    }
  }

  function scrollToSection(direction: 1 | -1) {
    if (scrollLockRef.current || typeof window === 'undefined') return
    const sections = sectionRefs.current.filter(Boolean)
    const currentIndex = sections.reduce((nearestIndex, section, index) => {
      const currentDistance = Math.abs(section.getBoundingClientRect().top - 64)
      const nearest = sections[nearestIndex]
      const nearestDistance = Math.abs((nearest?.getBoundingClientRect().top ?? 0) - 64)
      return currentDistance < nearestDistance ? index : nearestIndex
    }, 0)
    const next = sections[Math.min(Math.max(currentIndex + direction, 0), sections.length - 1)]
    if (!next || next === sections[currentIndex]) return
    scrollLockRef.current = true
    next.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      scrollLockRef.current = false
    }, 720)
  }

  function handlePagePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === 'mouse') return
    touchStartRef.current = { x: event.clientX, y: event.clientY }
  }

  function handlePagePointerUp(event: ReactPointerEvent<HTMLElement>) {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return
    if ((event.target as HTMLElement).closest('[data-horizontal-swipe], .mobile-snap-row')) return
    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (Math.abs(deltaY) < 120 || Math.abs(deltaY) < Math.abs(deltaX) * 1.35) return
    scrollToSection(deltaY < 0 ? 1 : -1)
  }

  return (
    <main
      id="main-content"
      className="min-h-screen bg-brand-paper text-slate-900 page-enter"
      onPointerDown={handlePagePointerDown}
      onPointerUp={handlePagePointerUp}
    >
      <SiteHeader navItems={data.navItems} />

      <section ref={setSectionRef(0)} className="hero-ink flex min-h-[100svh] scroll-mt-16 flex-col justify-center overflow-hidden px-4 pb-8 pt-24 text-white sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <div className="animate-[fade-in-up_0.6s_cubic-bezier(0.16,1,0.3,1)_0.1s_both] inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-brand-cyan sm:px-4 sm:py-2 sm:text-sm">
              <Sparkles className="h-4 w-4" /> 博士后创新创业陪伴系统官网
            </div>
            <h1 className="animate-[fade-in-up_0.6s_cubic-bezier(0.16,1,0.3,1)_0.2s_both] mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-7xl">博创网</h1>
            <p className="animate-[fade-in-up_0.6s_cubic-bezier(0.16,1,0.3,1)_0.3s_both] mt-4 max-w-2xl text-lg leading-8 text-white/88 md:text-xl">陪伴博士后创新创业的全周期</p>
            <p className="animate-[fade-in-up_0.6s_cubic-bezier(0.16,1,0.3,1)_0.4s_both] mt-4 max-w-2xl text-sm leading-7 text-white/58 md:text-base">
              面向博士后创新创业的统一门户，承接测评、项目管理、招商转化与数据看板，让大赛只是陪伴旅程的起点。
            </p>
            <div className="animate-[fade-in-up_0.6s_cubic-bezier(0.16,1,0.3,1)_0.5s_both] mt-6 grid max-w-md grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {data.stats.map((stat) => (
                <AnimatedStat key={stat.label} stat={stat} accent="cyan" />
              ))}
            </div>
            {user && (
              <div className="animate-[fade-in-up_0.6s_cubic-bezier(0.16,1,0.3,1)_0.6s_both] mt-6 hidden items-center gap-3 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/20 text-sm font-semibold text-brand-cyan">
                  {user.username.slice(0, 1).toUpperCase()}
                </span>
                <span className="text-sm text-white/70">欢迎回来，<span className="text-white">{user.username}</span></span>
                <a
                  href={getDashboardUrl('', accessToken)}
                  className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-all duration-200 hover:bg-white/20"
                >
                  进入工作台 <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            )}
            <button
              type="button"
              onClick={() => scrollToSection(1)}
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur transition-colors hover:bg-white/10 lg:hidden"
            >
              查看赛事动态 <ArrowRight className="h-3.5 w-3.5 rotate-90" />
            </button>
          </div>

          <div className="animate-[fade-in-up_0.8s_cubic-bezier(0.16,1,0.3,1)_0.4s_both] hidden min-w-0 flex-col lg:flex">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-brand-cyan">LIVE COMPETITIONS</p>
              <Link to="/competitions" className="inline-flex items-center gap-1 text-xs font-medium text-white/55 transition-colors duration-200 hover:text-white">
                查看全部 <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <HeroCompetitionCarousel items={data.competitions} />
          </div>
        </div>
      </section>

      <section ref={setSectionRef(1)} className="hero-ink flex min-h-[calc(100svh-4rem)] scroll-mt-16 flex-col justify-center px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-8 text-white lg:hidden">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-brand-cyan">LIVE COMPETITIONS</p>
            <Link to="/competitions" className="inline-flex items-center gap-1 text-xs font-medium text-white/55 transition-colors duration-200 hover:text-white">
              查看全部 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <HeroCompetitionCarousel items={data.competitions} />
        </div>
      </section>

      <section ref={setSectionRef(2)} id="ecosystem" className="scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <SectionHeader eyebrow="ECOSYSTEM" title="线上平台与线下资源协同" desc="官网先承接公开展示和入口聚合，后续可与创业陪伴系统、赛事工作台和资源 CRM 打通。" />
          </ScrollReveal>
          <ScrollReveal stagger className="mobile-snap-row mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 md:mt-10 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3">
            {data.ecosystem.map((item) => <FeatureCard key={item.title} item={item} />)}
          </ScrollReveal>
        </div>
      </section>

      <section ref={setSectionRef(3)} id="competitions" className="scroll-mt-16 bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <SectionHeader eyebrow="COMPETITIONS" title="大赛动态与项目入口" desc="展示正在开放、征集中和回顾中的赛事，静止时自动轮播，详情页已预留后端数据替换接口。" />
          </ScrollReveal>
          <ScrollReveal className="mt-8 sm:mt-10">
            <CompetitionCarousel items={data.competitions} />
          </ScrollReveal>
          <ScrollReveal className="mt-8 text-center">
            <Link to="/competitions" className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-medium text-white shadow-sm shadow-brand-blue/20 transition-all duration-200 hover:bg-brand-blue-2 hover:shadow-md hover:shadow-brand-blue/25">
              查看全部赛事 <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <section ref={setSectionRef(4)} id="products" className="scroll-mt-16 bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <SectionHeader eyebrow="SERVICES" title="围绕创业陪伴的核心产品" desc="从创业者测评、项目协作、评审管理到资源对接，覆盖官网展示与未来业务承接。" />
          </ScrollReveal>
          <ScrollReveal stagger className="mobile-snap-row mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 md:mt-10 md:grid md:grid-cols-2 md:overflow-visible md:pb-0">
            {data.products.map((item) => <FeatureCard key={item.title} item={item} />)}
          </ScrollReveal>
        </div>
      </section>

      <section ref={setSectionRef(5)} className="scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <SectionHeader eyebrow="PARTNERS" title="支持单位与合作机构" desc="联动高校、科研机构、产业园区与金融伙伴，共同支撑赛事与项目落地。" />
          </ScrollReveal>
          <ScrollReveal stagger className="mt-8 sm:mt-10">
            <PartnersStrip partners={data.partners} />
          </ScrollReveal>
        </div>
      </section>

      <section ref={setSectionRef(6)} className="scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <SectionHeader eyebrow="NEWS" title="新闻资讯与政策动态" desc="以博客化方式沉淀政策解读、赛事预告和产业观察。" />
          </ScrollReveal>
          <ScrollReveal stagger className="mobile-snap-row mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 md:mt-10 md:block md:divide-y md:divide-slate-200 md:overflow-visible md:rounded-2xl md:border md:border-slate-200 md:bg-white md:px-6 md:pb-0 md:shadow-sm">
            {data.news.slice(0, 4).map((item) => <NewsCard key={item.slug} item={item} />)}
          </ScrollReveal>
          <ScrollReveal className="mt-8 text-center">
            <Link to="/news" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-brand-blue hover:text-brand-blue hover:shadow-sm">
              进入资讯页 <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}