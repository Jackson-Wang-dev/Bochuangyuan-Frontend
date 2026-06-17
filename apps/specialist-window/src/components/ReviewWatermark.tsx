import { useMemo } from 'react'
import { useUserStore } from '@/store/userStore'

// ---------------------------------------------------------------------------
// TODO: replace these with server-provided values via API when available.
//   name     → resolved from the authenticated session token
//   ip       → client IP detected server-side (X-Forwarded-For / REMOTE_ADDR)
//   datetime → server timestamp of page load (prevents clock-manipulation)
// ---------------------------------------------------------------------------
const MOCK_IP = '192.168.1.88'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatDatetime(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function buildTileUrl(name: string, ip: string, datetime: string): string {
  // One SVG tile per repeat cell. The <text> is centered and rotated -30°.
  // encodeURIComponent handles Chinese characters and any SVG-unsafe chars.
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">` +
    `<text x="150" y="100" transform="rotate(-30 150 100)"` +
    ` text-anchor="middle"` +
    ` font-family="system-ui,-apple-system,Helvetica,sans-serif"` +
    ` fill="rgba(15,23,42,0.09)">` +
    `<tspan x="150" dy="-14" font-size="14" font-weight="600">${name}</tspan>` +
    `<tspan x="150" dy="18" font-size="12">${ip}</tspan>` +
    `<tspan x="150" dy="16" font-size="12">${datetime}</tspan>` +
    `</text></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export function ReviewWatermark() {
  const { user } = useUserStore()

  // useMemo so the data URL is only rebuilt when the user identity changes.
  // In production, pass { name, ip, datetime } from an API response instead.
  const backgroundImage = useMemo(() => {
    const name = user?.name ?? '评委'
    const ip = MOCK_IP
    const datetime = formatDatetime(new Date())
    return buildTileUrl(name, ip, datetime)
  }, [user?.name])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{
        backgroundImage,
        backgroundRepeat: 'repeat',
        backgroundSize: '300px 200px',
      }}
    />
  )
}
