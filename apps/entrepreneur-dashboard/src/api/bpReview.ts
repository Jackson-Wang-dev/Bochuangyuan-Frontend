import { reviewAll, chatReview } from '@/lib/reviewPipeline'

export interface ReviewResult {
  mode: string
  report_markdown: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResult {
  reply: string
  doc_text: string
}

export async function reviewProjectText(text: string, mode: 'A' | 'B' = 'A'): Promise<ReviewResult> {
  const report_markdown = await reviewAll(text, mode)
  return { mode, report_markdown }
}

export async function chatWithReview(
  messages: ChatMessage[],
  docText: string,
  mode: 'A' | 'B' = 'A',
): Promise<ChatResult> {
  const reply = await chatReview(messages, docText, mode)
  return { reply, doc_text: docText }
}
