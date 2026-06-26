import { ArrowRight, Database, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPastProjects } from '../api/site'
import { PastProjectCard, SectionHeader, SiteFooter, SiteHeader } from '../components'
import { mockHomeData } from '../data/mockSiteData'
import type { SitePastProject } from '../types'

export function PastProjectListPage() {
  const [items, setItems] = useState<SitePastProject[]>(mockHomeData.pastProjects)

  useEffect(() => {
    let alive = true
    void getPastProjects().then((next) => alive && setItems(next))
    return () => {
      alive = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-brand-paper text-slate-900">
      <SiteHeader navItems={mockHomeData.navItems} />
      <section className="hero-ink overflow-hidden px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/52">往届优秀项目</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">从赛事中生长出来的高潜项目</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">集中展示往届赛事沉淀出的代表项目，后续可接入真实项目库、获奖名单或成果转化接口。</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2"><Trophy className="h-4 w-4" /> 获奖项目</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2"><Database className="h-4 w-4" /> 项目库接口</span>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="PROJECT LIBRARY" title="优秀项目展示" desc="当前使用模拟项目数据，字段已按项目库常见结构预留。" />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {items.map((item) => <PastProjectCard key={item.slug} item={item} />)}
          </div>
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-600 shadow-sm">
            项目列表接口已预留为 <code className="rounded bg-slate-100 px-1.5 py-1 text-xs text-slate-800">/site/past-projects</code>，配置 <code className="rounded bg-slate-100 px-1.5 py-1 text-xs text-slate-800">VITE_BC_SITE_API_BASE_URL</code> 后可替换为真实项目数据。
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