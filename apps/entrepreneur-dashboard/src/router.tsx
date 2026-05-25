import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Route-level code splitting — per react-best-practices bundle optimization
const AuthPage = lazy(() => import('@/pages/auth'))
const HomePage = lazy(() => import('@/pages/home'))
const ProfilePage = lazy(() => import('@/pages/profile'))
const ProjectListPage = lazy(() => import('@/pages/project/list'))
const ProjectEditorPage = lazy(() => import('@/pages/project/editor'))
const ProjectVersionPage = lazy(() => import('@/pages/project/version'))
const ProjectApplyPage = lazy(() => import('@/pages/project/apply'))
const EnterpriseInfoPage = lazy(() => import('@/pages/enterprise/info'))
const EnterpriseHonorPage = lazy(() => import('@/pages/enterprise/honor'))
const EnterpriseIpPage = lazy(() => import('@/pages/enterprise/ip'))
const EnterpriseProductPage = lazy(() => import('@/pages/enterprise/product'))
const EnterpriseTeamPage = lazy(() => import('@/pages/enterprise/team'))
const MaterialLibraryPage = lazy(() => import('@/pages/material-library'))
const CompetitionPage = lazy(() => import('@/pages/competition'))
const AiAssessmentPage = lazy(() => import('@/pages/ai-assessment'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function SuspenseOutlet() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  )
}

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AuthPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      {
        element: <SuspenseOutlet />,
        children: [
          { path: 'home', element: <HomePage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'project', element: <ProjectListPage /> },
          { path: 'project/bp', element: <ProjectEditorPage /> },
          { path: 'project/:id/editor', element: <ProjectEditorPage /> },
          { path: 'project/:id/versions', element: <ProjectVersionPage /> },
          { path: 'project/:id/apply', element: <ProjectApplyPage /> },
          { path: 'enterprise/info', element: <EnterpriseInfoPage /> },
          { path: 'enterprise/honor', element: <EnterpriseHonorPage /> },
          { path: 'enterprise/ip', element: <EnterpriseIpPage /> },
          { path: 'enterprise/product', element: <EnterpriseProductPage /> },
          { path: 'enterprise/team', element: <EnterpriseTeamPage /> },
          { path: 'materials', element: <MaterialLibraryPage /> },
          { path: 'competition', element: <CompetitionPage /> },
          { path: 'ai-assessment', element: <AiAssessmentPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/home" replace /> },
])
