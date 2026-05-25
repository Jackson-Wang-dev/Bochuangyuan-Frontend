import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { OrganizerLayout } from '@/layouts/OrganizerLayout'

const LoginPage          = lazy(() => import('@/pages/auth/Login'))
const CompetitionList    = lazy(() => import('@/pages/competition/List'))
const CompetitionCreate  = lazy(() => import('@/pages/competition/Create'))
const CompetitionEdit    = lazy(() => import('@/pages/competition/Edit'))
const CompetitionDetail  = lazy(() => import('@/pages/competition/Detail/index'))
const ProjectListPage    = lazy(() => import('@/pages/competition/Detail/ProjectList'))
const ProjectDetailPage  = lazy(() => import('@/pages/competition/Detail/ProjectDetail'))
const ScoreOverviewPage  = lazy(() => import('@/pages/competition/Detail/ScoreOverview'))
const ExpertSelection    = lazy(() => import('@/pages/expert/Selection'))
const ExpertAssignment   = lazy(() => import('@/pages/expert/Assignment'))
const StaffManagement    = lazy(() => import('@/pages/staff/Management'))
const OperationLog       = lazy(() => import('@/pages/logs/OperationLog'))

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
    element: <OrganizerLayout />,
    children: [
      { index: true, element: <Navigate to="/competitions" replace /> },
      { path: 'competitions',        element: <S><CompetitionList /></S> },
      { path: 'competitions/create', element: <S><CompetitionCreate /></S> },
      {
        path: 'competitions/:id',
        element: <S><CompetitionDetail /></S>,
        children: [
          { index: true,              element: <Navigate to="projects" replace /> },
          { path: 'projects',         element: <S><ProjectListPage /></S> },
          { path: 'score-overview',   element: <S><ScoreOverviewPage /></S> },
          { path: 'experts',          element: <S><ExpertSelection /></S> },
          { path: 'assignment',       element: <S><ExpertAssignment /></S> },
        ],
      },
      { path: 'competitions/:id/edit',              element: <S><CompetitionEdit /></S> },
      { path: 'competitions/:id/projects/:enrollId', element: <S><ProjectDetailPage /></S> },
      { path: 'staff',               element: <S><StaffManagement /></S> },
      { path: 'logs',                element: <S><OperationLog /></S> },
    ],
  },
  { path: '*', element: <Navigate to="/competitions" replace /> },
])
