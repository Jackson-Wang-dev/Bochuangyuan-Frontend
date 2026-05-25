import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import MyReports from './pages/MyReports'
import Quiz from './pages/Quiz'
import ReportDetail from './pages/ReportDetail'
import Result from './pages/Result'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen max-w-[768px] mx-auto">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/result" element={<Result />} />
          <Route path="/report/:reportUuid" element={<ReportDetail />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
