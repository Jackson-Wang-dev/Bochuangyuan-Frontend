import { ArrowRight, BookOpenText, CalendarDays, Newspaper, Rss } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNewsList } from '../api/site'
import { SiteFooter, SiteHeader } from '../components'
import { mockHomeData } from '../data/mockSiteData'
import type { SiteNewsArticle } from '../types'

const ALL_CATEGORY = '全部'

export function NewsListPage() {
  const [items, setItems] = useState<SiteNewsArticle[]>(mockHomeData.news)
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY)

  useEffect(() => {
    let alive = true
    void getNewsList().then((next) => alive && setItems(next))
    return () => {
      alive = false
    }
  }, [])

  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.type))), [items])
  const filteredItems = useMemo(
    () => (activeCategory === ALL_CATEGORY ? items : items.filter((item) => item.type === activeCategory)),
    [items, activeCategory],
  )
  const featured = filteredItems[0]

  return (
    <main className="min-h-screen bg-brand-paper text-slate-900">
      <SiteHeader navItems={mockHomeData.navItems} />
      <section className="hero-ink overflow-hidden px-4 pb-12 pt-28 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/52">博创观察</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">新闻资讯与政策动态</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">聚合政策解读、赛事预告、产业观察与项目服务方法，后续可接入 CMS 或真实资讯接口。</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[ALL_CATEGORY, ...categories].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  activeCategory === category ? 'border-white bg-white text-brand-ink' : 'border-white/12 bg-white/8 text-white/72 hover:bg-white/12'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {featured && (
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="rounded-lg bg-brand-blue px-2.5 py-1 font-medium text-white">重点</span>
                  <span>{featured.type}</span>
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {featured.date}</span>
                  <span>{featured.author}</span>
                </div>
                <h2 className="mt-5 text-2xl font-semibold leading-tight text-slate-950 md:text-3xl">
                  <Link to={`/news/${featured.slug}`} className="hover:text-brand-blue">{featured.title}</Link>
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{featured.summary}</p>
                <Link to={`/news/${featured.slug}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-2">
                  阅读全文 <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            )}

            {!featured && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">该分类下暂无资讯。</div>
            )}

            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
              {filteredItems.slice(1).map((item) => (
                <article key={item.slug} className="py-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="rounded-lg bg-brand-blue/8 px-2.5 py-1 font-medium text-brand-blue">{item.type}</span>
                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {item.date}</span>
                    <span>{item.author}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold leading-snug text-slate-950">
                    <Link to={`/news/${item.slug}`} className="hover:text-brand-blue">{item.title}</Link>
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
                  <Link to={`/news/${item.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue">
                    查看详情 <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Newspaper className="h-4 w-4 text-brand-blue" /> 栏目分类</div>
              <div className="mt-4 space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      activeCategory === category ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{category}</span>
                    <span className="font-mono text-xs text-slate-400">{items.filter((item) => item.type === category).length}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><BookOpenText className="h-4 w-4 text-brand-blue" /> 推荐阅读</div>
              <div className="mt-4 space-y-4">
                {items.map((item) => (
                  <Link key={item.slug} to={`/news/${item.slug}`} className="block border-l-2 border-brand-blue/20 pl-3 text-sm leading-6 text-slate-600 hover:border-brand-blue hover:text-brand-blue">
                    {item.title}
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-brand-ink p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold"><Rss className="h-4 w-4 text-brand-cyan" /> 数据接口</div>
              <p className="mt-3 text-sm leading-7 text-white/66">当前为模拟内容。配置 VITE_BC_SITE_API_BASE_URL 后，页面会优先读取 /site/news 与 /site/news/:slug。</p>
            </section>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}