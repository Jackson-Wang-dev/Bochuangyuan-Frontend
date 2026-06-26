import { ArrowRight, CalendarDays, MapPin, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCompetitions } from '../api/site'
import { CompetitionCard, SectionHeader, SiteFooter, SiteHeader } from '../components'
import { mockHomeData } from '../data/mockSiteData'
import type { SiteCompetition } from '../types'

export function CompetitionListPage() {
  const [items, setItems] = useState<SiteCompetition[]>(mockHomeData.competitions)

  useEffect(() => {
    let alive = true
    void getCompetitions().then((next) => alive && setItems(next))
    return () => {
      alive = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-brand-paper text-slate-900">
      <SiteHeader navItems={mockHomeData.navItems} />
      <section className="hero-ink overflow-hidden px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/52">赛事列表</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">赛事列表与详情预览</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">当前以模拟数据展示，后续可直接切换到真实赛事接口。</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2"><Trophy className="h-4 w-4" /> 赛事</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2"><MapPin className="h-4 w-4" /> 区域</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2"><CalendarDays className="h-4 w-4" /> 时间线</span>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="赛事目录" title="当前开放赛事" desc="每张卡片都链接到赛事详情页，接口层已保留真实数据替换能力。" />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {items.map((item) => <CompetitionCard key={item.slug} item={item} />)}
          </div>
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-600 shadow-sm">
            官网层已经预留 <code className="rounded bg-slate-100 px-1.5 py-1 text-xs text-slate-800">VITE_BC_SITE_API_BASE_URL</code>，后续可切换到真实数据。
            <div className="mt-4">
              <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-2">
                返回首页 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}