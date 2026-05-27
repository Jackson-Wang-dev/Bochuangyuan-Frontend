import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ReviewLayout } from '@/layouts/ReviewLayout'

const LoginPage               = lazy(() => import('@/pages/auth/Login'))
const CompetitionListPage     = lazy(() => import('@/pages/competition/List'))
const CompetitionWorkspace    = lazy(() => import('@/pages/competition/Workspace'))
const QueuePage               = lazy(() => import('@/pages/review/Queue'))
const ScoreFormPage           = lazy(() => import('@/pages/review/ScoreForm'))
const ReviewDetailPage        = lazy(() => import('@/pages/review/ReviewDetailPage'))
const CompletedPage           = lazy(() => import('@/pages/review/Completed'))
const NoticeListPage          = lazy(() => import('@/pages/notification/NoticeList'))

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <S><LoginPage /></S>,
  },
  {
    path: '/',
    element: <ReviewLayout />,
    children: [
      { index: true, element: <Navigate to="/competitions" replace /> },

      // Competition-first navigation
      { path: 'competitions',                              element: <S><CompetitionListPage /></S> },
      { path: 'competitions/:contestId',                   element: <S><CompetitionWorkspace /></S> },
      { path: 'competitions/:contestId/review/:taskId',    element: <S><ReviewDetailPage /></S> },

      // Flat "all tasks" queue (cross-competition)
      { path: 'review/queue',          element: <S><QueuePage /></S> },
      { path: 'review/completed',      element: <S><CompletedPage /></S> },
      { path: 'review/:taskId/score',  element: <S><ScoreFormPage /></S> },
      { path: 'review/:taskId',        element: <S><ReviewDetailPage /></S> },

      { path: 'notifications',         element: <S><NoticeListPage /></S> },
    ],
  },
  { path: '*', element: <Navigate to="/competitions" replace /> },
])
