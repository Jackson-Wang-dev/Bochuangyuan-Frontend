import type { DimensionCode, DimensionScore, Persona } from '../types'

function normScore(scores: DimensionScore[], code: DimensionCode): number {
  return scores.find((s) => s.code === code)?.normalizedScore ?? 0
}

export function matchPersona(scores: DimensionScore[], personas: Persona[]): Persona {
  const sorted = [...scores].sort((a, b) => b.normalizedScore - a.normalizedScore)

  // 1. all_high: 六个维度归一化得分都 >= 70
  const allHighPersona = personas.find((p) => p.category === 'all_high')
  if (allHighPersona && scores.every((s) => s.normalizedScore >= 70)) {
    return allHighPersona
  }

  // 2. all_low: 六个维度归一化得分都 <= 35
  const allLowPersona = personas.find((p) => p.category === 'all_low')
  if (allLowPersona && scores.every((s) => s.normalizedScore <= 35)) {
    return allLowPersona
  }

  // 3. single_high: 某维度归一化 >= 72，且其他维度都 <= 55
  for (const persona of personas.filter((p) => p.category === 'single_high')) {
    const rule = persona.triggerRule
    if (!rule.dominantDim) continue

    const dominant = normScore(scores, rule.dominantDim)
    const others = scores.filter((s) => s.code !== rule.dominantDim)
    if (dominant >= 72 && others.every((s) => s.normalizedScore <= 55)) {
      return persona
    }
  }

  // 4. top2: 前两名维度的组合精确匹配，且第一名 >= 55，第二名 >= 45
  const top1 = sorted[0]
  const top2 = sorted[1]

  if (top1 && top2 && top1.normalizedScore >= 55 && top2.normalizedScore >= 45) {
    const topSet = new Set([top1.code, top2.code])

    for (const persona of personas.filter((p) => p.category === 'top2')) {
      const rule = persona.triggerRule
      if (!rule.primaryDim || !rule.secondaryDim) continue

      const ruleSet = new Set([rule.primaryDim, rule.secondaryDim])
      const matches = ruleSet.size === topSet.size && [...ruleSet].every((d) => topSet.has(d))

      if (matches) return persona
    }
  }

  // 5. 宽松 top2：只要前两名维度匹配，不管分数高低
  if (top1 && top2) {
    const topSet = new Set([top1.code, top2.code])
    for (const persona of personas.filter((p) => p.category === 'top2')) {
      const rule = persona.triggerRule
      if (!rule.primaryDim || !rule.secondaryDim) continue
      const ruleSet = new Set([rule.primaryDim, rule.secondaryDim])
      if (ruleSet.size === topSet.size && [...ruleSet].every((d) => topSet.has(d))) {
        return persona
      }
    }
  }

  // 6. 兜底：探索型
  return allLowPersona ?? personas[0]!
}
