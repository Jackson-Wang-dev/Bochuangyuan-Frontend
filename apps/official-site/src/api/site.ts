import { mockCompetitionDetails, mockHomeData, mockNewsBySlug } from '../data/mockSiteData'
import type { CompetitionDetail, SiteHomeData, SiteNewsArticle } from '../types'

const API_BASE = (import.meta as ImportMeta & { env: { VITE_BC_SITE_API_BASE_URL?: string } }).env.VITE_BC_SITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

async function requestJson<T>(path: string, fallback: T): Promise<T> {
  if (!API_BASE) return fallback

  try {
    const response = await fetch(`${API_BASE}${path}`)
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)
    return (await response.json()) as T
  } catch {
    return fallback
  }
}

export function getHomeData() {
  return requestJson<SiteHomeData>('/site/home', mockHomeData)
}

export function getCompetitions() {
  return requestJson<SiteHomeData['competitions']>('/site/competitions', mockHomeData.competitions)
}

export function getCompetitionDetail(slug: string) {
  const fallback = (mockCompetitionDetails[slug] ?? mockHomeData.competitions[0]!) as CompetitionDetail
  return requestJson<CompetitionDetail>(`/site/competitions/${slug}`, fallback)
}

export function getNewsList() {
  return requestJson<SiteNewsArticle[]>('/site/news', mockHomeData.news)
}

export function getNewsDetail(slug: string) {
  const fallback = mockNewsBySlug[slug] ?? mockHomeData.news[0]!
  return requestJson<SiteNewsArticle>(`/site/news/${slug}`, fallback)
}