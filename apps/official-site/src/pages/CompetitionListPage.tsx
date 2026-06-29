import { ArrowRight, CalendarDays, MapPin, Trophy } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCompetitions } from '../api/site'
import { CompetitionCard, SectionHeader, SiteFooter, SiteHeader } from '../components'
import { mockHomeData } from '../data/mockSiteData'
import { COMPETITION_CATEGORIES, COMPETITION_TRACK_TAGS } from '../lib/competition'
import type { CompetitionCategory, SiteCompetition } from '../types'

const ALL_CATEGORY = '全部'
const CATEGORY_OPTIONS: Array<typeof ALL_CATEGORY | CompetitionCategory> = [ALL_CATEGORY, ...COMPETITION_CATEGORIES]

export function CompetitionListPage() {
  const [items, setItems] = useState<SiteCompetition[]>(mockHomeData.competitions)
  const [activeCategory, setActiveCategory] = useState<typeof ALL_CATEGORY | CompetitionCategory>(ALL_CATEGORY)
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    void getCompetitions().then((next) => alive && setItems(next))
    return () => {
      alive = false
    }
  }, [])

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (activeCategory === ALL_CATEGORY || item.category === activeCategory) &&
          (selectedTracks.length === 0 || item.tracks.some((track) => selectedTracks.includes(track))),
      ),
    [items, activeCategory, selectedTracks],
  )

  function toggleTrack(track: string) {
    setSelectedTracks((prev) => (prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]))
  }

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

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-medium text-slate-500">赛事类型</span>
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    activeCategory === category ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-medium text-slate-500">赛道</span>
              {COMPETITION_TRACK_TAGS.map((track) => (
                <button
                  key={track}
                  onClick={() => toggleTrack(track)}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    selectedTracks.includes(track) ? 'bg-brand-cyan text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {track}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {filteredItems.map((item) => <CompetitionCard key={item.slug} item={item} />)}
          </div>
          {filteredItems.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">没有符合当前筛选条件的赛事。</div>
          )}
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