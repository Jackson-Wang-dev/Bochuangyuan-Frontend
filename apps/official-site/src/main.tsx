import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './index.css'
import { CompetitionDetailPage } from './pages/CompetitionDetailPage'
import { CompetitionListPage } from './pages/CompetitionListPage'
import { HomePage } from './pages/HomePage'
import { NewsDetailPage } from './pages/NewsDetailPage'
import { NewsListPage } from './pages/NewsListPage'
import { NotFoundPage } from './pages/NotFoundPage'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/competitions" element={<CompetitionListPage />} />
        <Route path="/competitions/:slug" element={<CompetitionDetailPage />} />
        <Route path="/news" element={<NewsListPage />} />
        <Route path="/news/:slug" element={<NewsDetailPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
