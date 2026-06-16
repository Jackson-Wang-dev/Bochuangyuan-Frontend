import { useState, useRef, useEffect } from 'react'
import {
  Bot, Plus, Send, Loader2, Sparkles, Trash2, ChevronDown, MessageSquare,
} from 'lucide-react'
import { listProjects, getProject } from '@/api/project'
import type { ApiProjectListItem, ApiProject } from '@/api/project'
import { reviewProjectText, chatWithReview } from '@/api/bpReview'
import type { ChatMessage } from '@/api/bpReview'
import { projectToText } from '@/lib/projectToText'
import { useReviewSessionStore } from '@/store/reviewSessionStore'
import type { ReviewSession } from '@/store/reviewSessionStore'
import { cn } from '@/lib/utils'

// ─── Markdown renderer ────────────────────────────────────────────────────────

function InlineMd({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

// Role-section header colors (cycles through these for each ## heading)
const ROLE_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-400' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
]

function SimpleMarkdown({ content }: { content: string }) {
  // Normalise <br> / <br/> / <br /> → newline, then split
  const normalised = content.replace(/<br\s*\/?>/gi, '\n')
  const lines = normalised.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0
  let roleIdx = 0   // tracks which ## heading we're on for color cycling

  while (i < lines.length) {
    const line = lines[i]!

    if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={i} className="text-sm font-bold text-slate-800 mt-4 mb-1">
          <InlineMd text={line.slice(4)} />
        </h3>
      )
    } else if (line.startsWith('## ')) {
      // Role-section header — prominent banner with color accent
      const color = ROLE_COLORS[roleIdx % ROLE_COLORS.length]!
      roleIdx++
      nodes.push(
        <div key={i} className={`flex items-center gap-2.5 mt-6 mb-3 px-3 py-2.5 rounded-xl border ${color.bg} ${color.border}`}>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.dot}`} />
          <h2 className={`text-sm font-extrabold tracking-wide ${color.text}`}>
            <InlineMd text={line.slice(3)} />
          </h2>
        </div>
      )
    } else if (line.startsWith('# ')) {
      nodes.push(
        <h1 key={i} className="text-base font-black text-slate-800 mt-4 mb-3">
          <InlineMd text={line.slice(2)} />
        </h1>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i]!.startsWith('- ') || lines[i]!.startsWith('* '))) {
        items.push(lines[i]!.slice(2)); i++
      }
      nodes.push(
        <ul key={`ul-${i}`} className="ml-4 space-y-0.5 list-disc marker:text-slate-400 my-1">
          {items.map((item, j) => (
            <li key={j} className="text-sm text-slate-700 leading-relaxed"><InlineMd text={item} /></li>
          ))}
        </ul>
      )
      continue
    } else if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i]!.startsWith('|')) { tableLines.push(lines[i]!); i++ }
      const rows = tableLines.filter(l => !/^\|[-:\s|]+\|$/.test(l))
      const headers = (rows[0] ?? '').split('|').filter(c => c.trim()).map(c => c.trim())
      const dataRows = rows.slice(1).map(r => r.split('|').filter(c => c.trim()).map(c => c.trim()))
      nodes.push(
        <div key={`tbl-${i}`} className="overflow-x-auto my-3 rounded-xl border border-slate-200">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {headers.map((h, j) => <th key={j} className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-slate-50/60'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border-b border-slate-100 last:border-0 px-3 py-2 text-slate-600 align-top">
                      <InlineMd text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    } else if (line === '') {
      nodes.push(<div key={i} className="h-1" />)
    } else {
      // Greeting lines before the first ## are rendered in a muted style
      const isGreeting = roleIdx === 0
      nodes.push(
        <p key={i} className={cn(
          'text-sm leading-relaxed',
          isGreeting ? 'text-slate-400 italic' : 'text-slate-700',
        )}>
          <InlineMd text={line} />
        </p>
      )
    }
    i++
  }
  return <div className="space-y-1">{nodes}</div>
}

// ─── Session sidebar ──────────────────────────────────────────────────────────

function groupByDate(sessions: ReviewSession[]) {
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86_400_000).toDateString()
  const groups: [string, ReviewSession[]][] = [['今天', []], ['昨天', []], ['更早', []]]
  for (const s of sessions) {
    const d = new Date(s.createdAt).toDateString()
    if (d === today) groups[0]![1].push(s)
    else if (d === yesterday) groups[1]![1].push(s)
    else groups[2]![1].push(s)
  }
  return groups.filter(([, items]) => items.length > 0)
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

interface SessionSidebarProps {
  sessions: ReviewSession[]
  activeId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string, e: React.MouseEvent) => void
  onNew: () => void
}

function SessionSidebar({ sessions, activeId, onSelect, onDelete, onNew }: SessionSidebarProps) {
  const groups = groupByDate(sessions)
  return (
    <div className="w-60 flex-shrink-0 flex flex-col bg-slate-50/80 rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 pb-3 space-y-3">
        <div>
          <h1 className="text-sm font-bold text-slate-800">AI 项目评审</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">三视角智能分析</p>
        </div>
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-blue/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新建评审
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-3">
        {groups.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
            <MessageSquare className="w-6 h-6" />
            <p className="text-xs">暂无评审记录</p>
          </div>
        )}
        {groups.map(([label, items]) => (
          <div key={label}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">{label}</p>
            <div className="space-y-0.5">
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  className={cn(
                    'group w-full text-left px-3 py-2.5 rounded-xl transition-all',
                    s.id === activeId
                      ? 'bg-brand-blue/8 text-brand-blue'
                      : 'hover:bg-white text-slate-600',
                  )}
                >
                  <div className="flex items-start justify-between gap-1 min-w-0">
                    <p className="text-xs font-semibold truncate flex-1 min-w-0 leading-snug">
                      {s.projectName}
                    </p>
                    <button
                      onClick={(e) => onDelete(s.id, e)}
                      className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={cn(
                      'text-[10px] px-1 py-0.5 rounded font-medium',
                      s.id === activeId ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 text-slate-400',
                    )}>
                      模式{s.mode}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(s.createdAt).toDateString() === new Date().toDateString()
                        ? formatTime(s.createdAt)
                        : formatDate(s.createdAt)}
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {s.messages.length} 条
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── New review panel ─────────────────────────────────────────────────────────

interface NewReviewPanelProps {
  projects: ApiProjectListItem[]
  selectedId: number | ''
  projectData: ApiProject | null
  projectLoading: boolean
  mode: 'A' | 'B'
  reviewLoading: boolean
  error: string | null
  onSelectProject: (id: number) => void
  onSetMode: (m: 'A' | 'B') => void
  onStart: () => void
}

function NewReviewPanel({
  projects, selectedId, projectData, projectLoading,
  mode, reviewLoading, error,
  onSelectProject, onSetMode, onStart,
}: NewReviewPanelProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/8 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-brand-blue" />
          </div>
          <h2 className="text-base font-bold text-slate-800">新建评审</h2>
          <p className="text-xs text-slate-400">选择项目，AI 将从三个视角生成评审报告</p>
        </div>

        {/* Project selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">选择项目</label>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => { if (e.target.value) onSelectProject(Number(e.target.value)) }}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 pr-8 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all"
            >
              <option value="">— 选择一个项目 —</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.declarationName || p.projectName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {projectLoading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              加载项目数据…
            </div>
          )}
        </div>

        {/* Mode selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">评审模式</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'A', label: '直接评审', desc: '基于项目内容直接分析' },
              { value: 'B', label: '标准评审', desc: '注入历史评审准则' },
            ] as const).map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => onSetMode(value)}
                className={cn(
                  'text-left px-3 py-2.5 rounded-xl border transition-all',
                  mode === value
                    ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                )}
              >
                <div className="text-xs font-semibold">{label}</div>
                <div className={cn('text-[11px] mt-0.5', mode === value ? 'text-brand-blue/60' : 'text-slate-400')}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <button
          onClick={onStart}
          disabled={!projectData || reviewLoading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-blue text-white rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-blue/90 transition-colors"
        >
          {reviewLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" />AI 生成评审报告中…</>
            : <><Sparkles className="w-4 h-4" />开始三视角评审</>}
        </button>
      </div>
    </div>
  )
}

// ─── Chat panel ───────────────────────────────────────────────────────────────

interface ChatPanelProps {
  session: ReviewSession
  messages: ChatMessage[]
  chatLoading: boolean
  input: string
  onInputChange: (v: string) => void
  onSend: () => void
  bottomRef: React.RefObject<HTMLDivElement | null>
}

function ChatPanel({ session, messages, chatLoading, input, onInputChange, onSend, bottomRef }: ChatPanelProps) {
  return (
    <>
      {/* Session header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b border-slate-100">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 truncate">{session.projectName}</p>
          <p className="text-[11px] text-slate-400">
            {new Date(session.createdAt).toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        </div>
        <span className="shrink-0 text-[11px] px-2 py-1 rounded-lg bg-slate-100 text-slate-500 font-medium">
          模式 {session.mode}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn('flex items-start gap-3', msg.role === 'user' && 'flex-row-reverse')}>
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px]',
              msg.role === 'assistant' ? 'bg-brand-blue/10' : 'bg-slate-100',
            )}>
              {msg.role === 'assistant'
                ? <Bot className="w-4 h-4 text-brand-blue" />
                : <span className="font-bold text-slate-500">我</span>}
            </div>
            <div className={cn(
              'rounded-2xl px-4 py-3 max-w-[85%] min-w-0',
              msg.role === 'assistant'
                ? 'bg-slate-50 border border-slate-100'
                : 'bg-brand-blue/8 border border-brand-blue/10',
            )}>
              {msg.role === 'assistant'
                ? <SimpleMarkdown content={msg.content} />
                : <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.content}</p>}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-brand-blue" />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              思考中…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-slate-100 p-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }}
            placeholder="追问：深入分析某个视角、请求修改建议、对比竞品…"
            disabled={chatLoading}
            rows={2}
            className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all disabled:cursor-not-allowed"
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || chatLoading}
            className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center disabled:opacity-30 hover:bg-brand-blue/90 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-300 mt-1.5">Enter 发送 · Shift+Enter 换行</p>
      </div>
    </>
  )
}

// ─── Idle state ───────────────────────────────────────────────────────────────

function IdleState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-300">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
        <Bot className="w-8 h-8" />
      </div>
      <div className="text-center space-y-1.5">
        <p className="text-sm font-medium text-slate-400">选择左侧历史记录，或新建一次评审</p>
        <button
          onClick={onNew}
          className="text-xs text-brand-blue hover:underline"
        >
          + 新建评审
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ViewState =
  | { type: 'idle' }
  | { type: 'new' }
  | { type: 'session'; id: string }

export default function AiReviewPage() {
  const { sessions, createSession, updateSession, deleteSession } = useReviewSessionStore()

  const [view, setView] = useState<ViewState>({ type: 'idle' })

  // New review form state
  const [projects, setProjects] = useState<ApiProjectListItem[]>([])
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [projectData, setProjectData] = useState<ApiProject | null>(null)
  const [projectLoading, setProjectLoading] = useState(false)
  const [newMode, setNewMode] = useState<'A' | 'B'>('A')
  const [newError, setNewError] = useState<string | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  // Active session chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [docText, setDocText] = useState('')
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Track which session is loaded to avoid redundant loads
  const loadedSessionId = useRef<string | null>(null)

  useEffect(() => {
    listProjects().then(setProjects).catch(() => {})
  }, [])

  // Load session data when switching sessions
  useEffect(() => {
    if (view.type !== 'session') { loadedSessionId.current = null; return }
    if (loadedSessionId.current === view.id) return
    const session = sessions.find(s => s.id === view.id)
    if (!session) return
    loadedSessionId.current = view.id
    setMessages(session.messages)
    setDocText(session.docText)
    setInput('')
  }, [view, sessions])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  async function handleSelectProject(id: number) {
    setSelectedId(id)
    setProjectData(null)
    setProjectLoading(true)
    try {
      setProjectData(await getProject(id))
    } finally {
      setProjectLoading(false)
    }
  }

  async function handleStartReview() {
    if (!projectData) return
    setNewError(null)
    const text = projectToText(projectData)
    setReviewLoading(true)
    try {
      const result = await reviewProjectText(text, newMode)
      const initial: ChatMessage[] = [{ role: 'assistant', content: result.report_markdown }]
      const proj = projects.find(p => p.id === selectedId)
      const sessionId = createSession({
        projectId: selectedId as number,
        projectName: proj?.declarationName || proj?.projectName || '未知项目',
        mode: newMode,
        messages: initial,
        docText: text,
      })
      setMessages(initial)
      setDocText(text)
      loadedSessionId.current = sessionId
      setView({ type: 'session', id: sessionId })
    } catch (e) {
      setNewError((e as Error).message)
    } finally {
      setReviewLoading(false)
    }
  }

  async function handleSend() {
    if (view.type !== 'session') return
    const trimmed = input.trim()
    if (!trimmed || chatLoading) return
    const session = sessions.find(s => s.id === view.id)

    const withUser: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(withUser)
    updateSession(view.id, { messages: withUser })
    setInput('')
    setChatLoading(true)
    try {
      const result = await chatWithReview(withUser, docText, session?.mode ?? 'A')
      const final: ChatMessage[] = [...withUser, { role: 'assistant', content: result.reply }]
      setMessages(final)
      updateSession(view.id, { messages: final })
    } catch (e) {
      const errMsgs: ChatMessage[] = [...withUser, { role: 'assistant', content: `请求失败：${(e as Error).message}` }]
      setMessages(errMsgs)
      updateSession(view.id, { messages: errMsgs })
    } finally {
      setChatLoading(false)
    }
  }

  function handleDeleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    deleteSession(id)
    if (view.type === 'session' && view.id === id) setView({ type: 'idle' })
  }

  function handleNew() {
    setView({ type: 'new' })
    setSelectedId('')
    setProjectData(null)
    setNewError(null)
  }

  const activeSession = view.type === 'session' ? sessions.find(s => s.id === view.id) : null

  return (
    <div className="flex gap-5 -m-8" style={{ height: 'calc(100vh - 9.5rem)' }}>
      <SessionSidebar
        sessions={sessions}
        activeId={view.type === 'session' ? view.id : null}
        onSelect={(id) => setView({ type: 'session', id })}
        onDelete={handleDeleteSession}
        onNew={handleNew}
      />

      <div className="flex-1 flex flex-col rounded-2xl border border-slate-100 bg-white overflow-hidden">
        {view.type === 'idle' && <IdleState onNew={handleNew} />}

        {view.type === 'new' && (
          <NewReviewPanel
            projects={projects}
            selectedId={selectedId}
            projectData={projectData}
            projectLoading={projectLoading}
            mode={newMode}
            reviewLoading={reviewLoading}
            error={newError}
            onSelectProject={handleSelectProject}
            onSetMode={setNewMode}
            onStart={handleStartReview}
          />
        )}

        {view.type === 'session' && activeSession && (
          <ChatPanel
            session={activeSession}
            messages={messages}
            chatLoading={chatLoading}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            bottomRef={bottomRef}
          />
        )}
      </div>
    </div>
  )
}
