// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env as Record<string, string | undefined>

export type LLMRole = 'system' | 'user' | 'assistant'

export interface LLMMessage {
  role: LLMRole
  content: string
}

export async function llmChat(messages: LLMMessage[]): Promise<string> {
  const apiKey = env.VITE_DEEPSEEK_API_KEY ?? ''
  const baseUrl = (env.VITE_DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com').replace(/\/$/, '')
  const model = env.VITE_DEEPSEEK_MODEL ?? 'deepseek-chat'

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.3 }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`LLM 调用失败 (${res.status})${text ? '：' + text.slice(0, 200) : ''}`)
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }> }
  return data.choices[0]?.message.content ?? ''
}
