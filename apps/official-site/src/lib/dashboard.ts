const DASHBOARD_BASE = (import.meta as ImportMeta & { env: { VITE_BC_DASHBOARD_URL?: string } }).env.VITE_BC_DASHBOARD_URL?.replace(/\/$/, '') ?? ''

export function hasDashboardUrl(): boolean {
  return Boolean(DASHBOARD_BASE)
}

export function getDashboardUrl(path = '', accessToken?: string | null): string {
  if (!DASHBOARD_BASE) return '#'
  const url = `${DASHBOARD_BASE}${path}`
  if (!accessToken) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}bcyToken=${encodeURIComponent(accessToken)}`
}
