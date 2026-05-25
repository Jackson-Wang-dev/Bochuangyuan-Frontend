import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-sm'
          : 'bg-slate-100 text-slate-700 rounded-bl-sm'
      }`}>
        {message.content}
      </div>
    </div>
  )
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', content: '你好！我是博创 AI 助手，有任何关于创业、项目申报的问题都可以问我 😊' },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    // TODO: 调用 src/api/ai.ts 接口
    setTimeout(() => {
      const assistantMsg: Message = {
        id: `${Date.now()}-reply`,
        role: 'assistant',
        content: '收到您的问题，AI 接口接入后将为您提供智能回复。',
      }
      setMessages((prev) => [...prev, assistantMsg])
    }, 800)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-blue-700 transition-colors z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-8 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 bg-blue-600 text-white">
            <span className="font-bold text-sm">博创 AI 助手</span>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
          <div className="flex gap-2 p-3 border-t border-slate-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入问题..."
              className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              发送
            </button>
          </div>
        </div>
      )}
    </>
  )
}
