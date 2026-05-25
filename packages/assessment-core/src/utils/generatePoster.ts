import type { AssessmentSession, DimensionScore } from '../types'
import { DIMENSIONS } from '../types'

const W = 750
const H = 1120
const SIDE = 55
const FONT = '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif'

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const char of text) {
    const test = line + char
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      lines.push(line)
      line = char
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawRadar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  scores: DimensionScore[],
) {
  const n = scores.length
  const startAngle = -Math.PI / 2

  const vertex = (i: number, r: number) => {
    const angle = startAngle + (i * 2 * Math.PI) / n
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  for (const ratio of [0.25, 0.5, 0.75, 1.0]) {
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const { x, y } = vertex(i, radius * ratio)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  for (let i = 0; i < n; i++) {
    const { x, y } = vertex(i, radius)
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y)
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const { x, y } = vertex(i, radius * (scores[i]!.normalizedScore / 100))
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(180,190,255,0.38)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.88)'
  ctx.lineWidth = 2.5
  ctx.stroke()

  for (let i = 0; i < n; i++) {
    const { x, y } = vertex(i, radius * (scores[i]!.normalizedScore / 100))
    ctx.beginPath()
    ctx.arc(x, y, 4.5, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.font = `600 18px ${FONT}`
  ctx.textBaseline = 'middle'

  const labelRadius = radius + 32
  for (let i = 0; i < n; i++) {
    const angle = startAngle + (i * 2 * Math.PI) / n
    const { x, y } = vertex(i, labelRadius)

    if (Math.cos(angle) > 0.1) ctx.textAlign = 'left'
    else if (Math.cos(angle) < -0.1) ctx.textAlign = 'right'
    else ctx.textAlign = 'center'

    ctx.fillText(scores[i]!.name, x, y)
  }
}

export async function generatePoster(session: AssessmentSession, filename: string): Promise<void> {
  const { matchedPersona, dimensionScores, aiReport } = session
  if (!matchedPersona || !dimensionScores.length) return

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#4338ca')
  bg.addColorStop(0.55, '#6d28d9')
  bg.addColorStop(1, '#5b21b6')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const topGlow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 480)
  topGlow.addColorStop(0, 'rgba(255,255,255,0.10)')
  topGlow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = topGlow
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(255,255,255,0.48)'
  ctx.font = `500 22px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('博创园 · 创业者人格测评', W / 2, 56)

  ctx.font = `78px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'white'
  ctx.fillText(matchedPersona.imageEmoji, W / 2, 148)

  const nickname = session.nickname?.trim()
  if (nickname) {
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.font = `600 32px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(nickname, W / 2, 240)

    ctx.fillStyle = 'white'
    ctx.font = `bold 46px ${FONT}`
    ctx.fillText(`是${matchedPersona.name}`, W / 2, 292)
  } else {
    ctx.fillStyle = 'white'
    ctx.font = `bold 50px ${FONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(matchedPersona.name, W / 2, 262)
  }

  const keywordY = nickname ? 340 : 312
  ctx.fillStyle = 'rgba(255,255,255,0.68)'
  ctx.font = `400 25px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`"${matchedPersona.keyword}"`, W / 2, keywordY)

  const radarCY = nickname ? 540 : 522
  const orderedScores: DimensionScore[] = DIMENSIONS.map(
    (dim) =>
      dimensionScores.find((s) => s.code === dim.code) ?? {
        ...dim,
        rawScore: 0,
        normalizedScore: 0,
        rank: 6,
      },
  )
  drawRadar(ctx, W / 2, radarCY, 108, orderedScores)

  const sep1Y = radarCY + 162
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(SIDE, sep1Y)
  ctx.lineTo(W - SIDE, sep1Y)
  ctx.stroke()

  const aiLabelY = sep1Y + 32
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = `500 19px ${FONT}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('AI 洞察', SIDE, aiLabelY)

  if (aiReport?.content) {
    const firstPara = aiReport.content.split('\n\n')[0] ?? aiReport.content
    const excerpt = firstPara.length > 210 ? firstPara.slice(0, 207) + '…' : firstPara

    ctx.fillStyle = 'rgba(255,255,255,0.86)'
    ctx.font = `400 23px ${FONT}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    const lines = wrapText(ctx, excerpt, W - SIDE * 2)
    const maxLines = 5
    lines.slice(0, maxLines).forEach((line, i) => {
      ctx.fillText(line, SIDE, aiLabelY + 28 + i * 38)
    })
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(SIDE, 1000)
  ctx.lineTo(W - SIDE, 1000)
  ctx.stroke()

  const rarityPercent = Math.round(matchedPersona.rarity * 100)
  const badgeText = `${matchedPersona.rarityLabel} · 仅 ${rarityPercent}% 的人是此类型`
  ctx.font = `500 19px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const bw = ctx.measureText(badgeText).width + 44
  const bh = 36
  const bx = W / 2 - bw / 2
  const by = 1028

  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  roundRect(ctx, bx, by, bw, bh, 18)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.fillText(badgeText, W / 2, by + bh / 2)

  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  ctx.font = `400 18px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('扫码测一测，你是哪一型创业者？', W / 2, 1082)

  canvas.toBlob(
    (blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    'image/jpeg',
    0.92,
  )
}
