import type { Answer, AiReport, DimensionScore, Persona } from '../types'
import type { Question } from '../types'
import {
  dimNames,
  q1Notes,
  q2Notes,
  q3Notes,
  q4Notes,
  q5Notes,
  q6Notes,
  q7Notes,
  q8Notes,
  q9Notes,
  reportTemplates,
} from '../mock/aiReports'

function getOptionId(answers: Answer[], questionId: number): number | undefined {
  return answers.find((a) => a.questionId === questionId)?.optionId
}

function note(map: Record<number, string>, id: number | undefined): string {
  if (id === undefined) return ''
  return map[id] ?? ''
}

export function generateAiReport(
  persona: Persona,
  answers: Answer[],
  _questions: Question[],
  dimensionScores: DimensionScore[],
  nickname?: string,
): AiReport {
  const template = reportTemplates.find((t) => t.personaCode === persona.code)

  const sorted = [...dimensionScores].sort((a, b) => b.rawScore - a.rawScore)
  const top1Name = dimNames[sorted[0]?.code ?? ''] ?? sorted[0]?.name ?? '执行力'
  const top2Name = dimNames[sorted[1]?.code ?? ''] ?? sorted[1]?.name ?? '创新力'

  const q1Id = getOptionId(answers, 1)
  const q2Id = getOptionId(answers, 2)
  const q3Id = getOptionId(answers, 3)
  const q4Id = getOptionId(answers, 4)
  const q5Id = getOptionId(answers, 5)
  const q6Id = getOptionId(answers, 6)
  const q7Id = getOptionId(answers, 7)
  const q8Id = getOptionId(answers, 8)
  const q9Id = getOptionId(answers, 9)

  const q1Note = note(q1Notes, q1Id)
  const q1Para = q1Note ? q1Note + '\n\n' : ''

  const displayName = nickname?.trim() || '你'

  const replacements: Record<string, string> = {
    '{nickname}': displayName,
    '{top_dim1}': top1Name,
    '{top_dim2}': top2Name,
    '{q1_note}': q1Para,
    '{q2_note}': note(q2Notes, q2Id),
    '{q3_note}': note(q3Notes, q3Id),
    '{q4_note}': note(q4Notes, q4Id),
    '{q5_note}': note(q5Notes, q5Id),
    '{q6_note}': note(q6Notes, q6Id),
    '{q7_note}': note(q7Notes, q7Id) ? note(q7Notes, q7Id) + '\n\n' : '',
    '{q8_note}': note(q8Notes, q8Id),
    '{q9_note}': note(q9Notes, q9Id),
  }

  let content: string

  if (template) {
    content = template.template
    for (const [key, value] of Object.entries(replacements)) {
      content = content.split(key).join(value)
    }
  } else {
    // Generic fallback report
    const q3Text = note(q3Notes, q3Id)
    const q6Text = note(q6Notes, q6Id)
    content = `我仔细看了${displayName}的答题轨迹，发现了一些有趣的东西。

${q1Para}你的雷达图在${top1Name}和${top2Name}这两个维度上拉得比较充分，而其他维度相对均衡。这说明你已经在某些方向上有了清晰的自我认知，同时也在其他方向保持着开放的可能性。

${q3Text ? q3Text + '\n\n这一刻的选择里，有很多关于你是谁的信息。\n\n' : ''}${q6Text ? '面对数据的落差时，你的反应是：' + q6Text + '。这说明你对失败有一种健康的态度。\n\n' : ''}创业这件事，本质上是一场关于自我认知的旅程。你现在看到的画像，只是一个起点。随着你继续走下去，这张图会越来越清晰，越来越属于你自己。`
  }

  return { content }
}
