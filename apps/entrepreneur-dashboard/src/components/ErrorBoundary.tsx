import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-500">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-slate-700">页面加载出错</p>
            <p className="text-xs text-slate-400 max-w-xs">{this.state.message}</p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, message: '' })
              window.location.reload()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
