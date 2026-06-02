import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { OrganizerLayout } from '@/layouts/OrganizerLayout'

const LoginPage             = lazy(() => import('@/pages/auth/Login'))
// H02 赛事列表
const CompetitionList       = lazy(() => import('@/pages/competition/List'))
// H03 赛事详情
const CompetitionDetail     = lazy(() => import('@/pages/competition/Detail/index'))
const BasicInfoTab          = lazy(() => import('@/pages/competition/Detail/BasicInfo'))
const CompetitionProjectsTab = lazy(() => import('@/pages/competition/Detail/Projects'))
// H04 新建/编辑
const CompetitionCreate     = lazy(() => import('@/pages/competition/Create'))
const CompetitionEdit       = lazy(() => import('@/pages/competition/Edit'))
// H06 评委名册
const JudgesPage            = lazy(() => import('@/pages/judges/Management'))
// H07 报名管理
const RegistrationListPage  = lazy(() => import('@/pages/competition/registrations/List'))
// H08 资质审核
const QualificationPage     = lazy(() => import('@/pages/competition/qualification/Review'))
// H09 绿色通道审核
const GreenChannelPage      = lazy(() => import('@/pages/competition/green-channel/Review'))
// H10~H12 评审管理 (Prelim / Semifinal / Final)
const ReviewManagementPage  = lazy(() => import('@/pages/competition/review/Management'))
// H13 获奖与奖项
const AwardsPage            = lazy(() => import('@/pages/competition/awards/Management'))
// H14 结算
const SettlementPage        = lazy(() => import('@/pages/competition/settlement/Management'))
// H15~H17 Ops — placeholders
const Placeholder           = lazy(() => import('@/pages/Placeholder'))
// System
const StaffManagement       = lazy(() => import('@/pages/staff/Management'))
const OperationLog          = lazy(() => import('@/pages/logs/OperationLog'))

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

      // H02
      { path: 'competitions', element: <S><CompetitionList /></S> },

      // H04 新建
      { path: 'competitions/new', element: <S><CompetitionCreate /></S> },

      // H03 赛事详情 (inner tabs) + H04 编辑 + H06~H17
      {
        path: 'competitions/:id',
        children: [
          // Detail with inner tabs (pathless layout)
          {
            element: <S><CompetitionDetail /></S>,
            children: [
              { index: true, element: <Navigate to="basic-info" replace /> },
              { path: 'basic-info', element: <S><BasicInfoTab /></S> },
              { path: 'projects',   element: <S><CompetitionProjectsTab /></S> },
            ],
          },
          // H04 edit
          { path: 'edit',          element: <S><CompetitionEdit /></S> },
          // H06 (competition-scoped judges)
          { path: 'judges',        element: <S><JudgesPage /></S> },
          // H07
          { path: 'registrations', element: <S><RegistrationListPage /></S> },
          // H08
          { path: 'qualification', element: <S><QualificationPage /></S> },
          // H09
          { path: 'green-channel', element: <S><GreenChannelPage /></S> },
          // H10~H12 — one component, stage via prop
          { path: 'prelim',    element: <S><ReviewManagementPage stage="Prelim" /></S> },
          { path: 'semifinal', element: <S><ReviewManagementPage stage="Semifinal" /></S> },
          { path: 'final',     element: <S><ReviewManagementPage stage="Final" /></S> },
          // H13
          { path: 'awards',        element: <S><AwardsPage /></S> },
          // H14
          { path: 'settlement',    element: <S><SettlementPage /></S> },
          // H15~H17 Ops placeholders
          { path: 'notifications', element: <S><Placeholder title="通知管理" /></S> },
          { path: 'album',         element: <S><Placeholder title="赛事相册" /></S> },
          { path: 'schedule',      element: <S><Placeholder title="赛程管理" /></S> },
        ],
      },

      // H06 global judges management
      { path: 'judges', element: <S><JudgesPage /></S> },

      // System
      { path: 'staff', element: <S><StaffManagement /></S> },
      { path: 'logs',  element: <S><OperationLog /></S> },
    ],
  },
  { path: '*', element: <Navigate to="/competitions" replace /> },
])
