import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const AuthPage                = lazy(() => import('@/pages/auth'))
const HomePage                = lazy(() => import('@/pages/home'))
const ProfilePage             = lazy(() => import('@/pages/profile'))
const ProjectListPage         = lazy(() => import('@/pages/project/list'))
const ProjectNewPage              = lazy(() => import('@/pages/project/new'))
const ProjectDashboardPage        = lazy(() => import('@/pages/project/dashboard'))
const ProjectRegistrationPage     = lazy(() => import('@/pages/project/registration'))
const ProjectEditorPage           = lazy(() => import('@/pages/project/editor'))
const ProjectVersionPage          = lazy(() => import('@/pages/project/version'))
const CollectionsDemoPage         = lazy(() => import('@/pages/project/collections-demo'))
const ProjectApplyPage            = lazy(() => import('@/pages/project/apply'))
const EnterpriseInfoPage      = lazy(() => import('@/pages/enterprise/info'))
const EnterpriseHonorPage     = lazy(() => import('@/pages/enterprise/honor'))
const EnterpriseIpPage        = lazy(() => import('@/pages/enterprise/ip'))
const EnterpriseProductPage   = lazy(() => import('@/pages/enterprise/product'))
const EnterpriseTeamPage      = lazy(() => import('@/pages/enterprise/team'))
const MaterialLibraryPage     = lazy(() => import('@/pages/material-library'))
const AiAssessmentPage        = lazy(() => import('@/pages/ai-assessment'))

// Competition pages
// M03 赛事广场
const CompetitionBrowsePage   = lazy(() => import('@/pages/competition/Browse'))
// M04 报名
const CompetitionRegisterPage = lazy(() => import('@/pages/competition/Register'))
// M05 正式报名 & 补材料
const FormalRegPage           = lazy(() => import('@/pages/competition/FormalReg'))
// M06 报名状态 & 结果
const RegistrationStatusPage  = lazy(() => import('@/pages/competition/RegistrationStatus'))
// My registrations list (implied by M06 pattern)
const MyRegistrationsPage     = lazy(() => import('@/pages/competition/MyRegistrations'))
// 破格通道申请
const GreenChannelPage        = lazy(() => import('@/pages/competition/GreenChannel'))
// Placeholders for M07~M10 (P4-P7)
const CompetitionProgressPage = lazy(() => import('@/pages/competition/Progress'))
const CompetitionResultsPage  = lazy(() => import('@/pages/competition/Results'))

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
          { path: 'home',                     element: <HomePage /> },
          { path: 'profile',                  element: <ProfilePage /> },
          { path: 'project',                  element: <ProjectListPage /> },
          { path: 'project/new',                        element: <ProjectNewPage /> },
          { path: 'project/collections-demo',           element: <CollectionsDemoPage /> },
          { path: 'project/bp',                         element: <ProjectEditorPage /> },
          { path: 'project/:id',                        element: <ProjectDashboardPage /> },
          { path: 'project/:id/registration/:regId',    element: <ProjectRegistrationPage /> },
          { path: 'project/:id/editor',                 element: <ProjectEditorPage /> },
          { path: 'project/:id/versions',               element: <ProjectVersionPage /> },
          { path: 'project/:id/apply',                  element: <ProjectApplyPage /> },
          { path: 'enterprise/info',          element: <EnterpriseInfoPage /> },
          { path: 'enterprise/honor',         element: <EnterpriseHonorPage /> },
          { path: 'enterprise/ip',            element: <EnterpriseIpPage /> },
          { path: 'enterprise/product',       element: <EnterpriseProductPage /> },
          { path: 'enterprise/team',          element: <EnterpriseTeamPage /> },
          { path: 'materials',                element: <MaterialLibraryPage /> },
          { path: 'ai-assessment',            element: <AiAssessmentPage /> },

          // Competition routes
          // M03 赛事广场
          { path: 'competition',              element: <CompetitionBrowsePage /> },
          // M04 报名 (accessed from competition detail)
          { path: 'competition/:id/register', element: <CompetitionRegisterPage /> },
          // My registrations list
          { path: 'competition/registrations',element: <MyRegistrationsPage /> },
          // M06 报名状态
          { path: 'competition/registrations/:regId', element: <RegistrationStatusPage /> },
          // M05 正式报名
          { path: 'competition/registrations/:regId/formal', element: <FormalRegPage /> },
          // 破格通道申请
          { path: 'competition/registrations/:regId/green-channel', element: <GreenChannelPage /> },
          // M07 比赛进展 (placeholder)
          { path: 'competition/progress',     element: <CompetitionProgressPage /> },
          { path: 'competition/mine/:id/progress', element: <CompetitionProgressPage /> },
          // M09/M10 结果与领奖 (placeholder)
          { path: 'competition/results',      element: <CompetitionResultsPage /> },
          { path: 'competition/mine/:id/result', element: <CompetitionResultsPage /> },
          { path: 'competition/mine/:id/settlement', element: <CompetitionResultsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/home" replace /> },
])
