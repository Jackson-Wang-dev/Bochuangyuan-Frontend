import type { Answer, DimensionCode, DimensionScore } from '../types'
import { DIMENSIONS } from '../types'
import type { Question } from '../types'

function computeMaxScores(questions: Question[]): Record<DimensionCode, number> {
  const maxScores = {} as Record<DimensionCode, number>
  for (const dim of DIMENSIONS) {
    maxScores[dim.code] = 0
  }

  for (const question of questions) {
    for (const dim of DIMENSIONS) {
      const scores = question.options.map((o) => o.scores[dim.code] ?? 0)
      const maxForDim = scores.reduce((max, s) => Math.max(max, s), 0)
      maxScores[dim.code] = (maxScores[dim.code] ?? 0) + maxForDim
    }
  }

  return maxScores
}

export function calculateScores(answers: Answer[], questions: Question[]): DimensionScore[] {
  const rawScores = {} as Record<DimensionCode, number>
  for (const dim of DIMENSIONS) {
    rawScores[dim.code] = 0
  }

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) continue

    const option = question.options.find((o) => o.id === answer.optionId)
    if (!option) continue

    for (const [dimCode, score] of Object.entries(option.scores)) {
      const key = dimCode as DimensionCode
      rawScores[key] = (rawScores[key] ?? 0) + (score ?? 0)
    }
  }

  const maxScores = computeMaxScores(questions)

  const scores: DimensionScore[] = DIMENSIONS.map((dim) => {
    const raw = rawScores[dim.code] ?? 0
    const maxPossible = maxScores[dim.code] ?? 1
    return {
      code: dim.code,
      name: dim.name,
      rawScore: raw,
      normalizedScore: maxPossible > 0 ? Math.round((raw / maxPossible) * 100) : 0,
      rank: 0,
    }
  })

  // Assign ranks (1 = highest)
  const sorted = [...scores].sort((a, b) => b.rawScore - a.rawScore)
  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i]
    if (!entry) continue
    const score = scores.find((s) => s.code === entry.code)
    if (score) score.rank = i + 1
  }

  return scores
}
