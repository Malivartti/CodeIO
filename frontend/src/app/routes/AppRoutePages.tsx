import AttemptPage from '@pages/AttemptPage';
import ConfirmEmailChangePage from '@pages/ConfirmEmailChangePage';
import DashboardCreateUserPage from '@pages/DashboardCreateUserPage';
import DashboardPage from '@pages/DashboardPage';
import DashboardStatisticsPage from '@pages/DashboardStatisticsPage';
import DashboardTagsPage from '@pages/DashboardTagsPage';
import DashboardUpdateUserPage from '@pages/DashboardUpdateUserPage';
import DashboardUsersPage from '@pages/DashboardUsersPage';
import DashboardViewUserPage from '@pages/DashboardViewUserPage';
import ForgotPasswordPage from '@pages/ForgotPasswordPage';
import LeaderboardPage from '@pages/LeaderboardPage';
import LoginPage from '@pages/LoginPage';
import NotFoundPage from '@pages/NotFoundPage';
import ProfilePage from '@pages/ProfilePage';
import RegisterPage from '@pages/RegisterPage';
import ResetPasswordPage from '@pages/ResetPasswordPage';
import TaskCreatePage from '@pages/TaskCreatePage';
import TaskPage from '@pages/TaskPage';
import TasksPage from '@pages/TasksPage';
import TaskUpdatePage from '@pages/TaskUpdatePage';
import { AccessLevel,AppRoutes } from '@shared/types/routes';
import { ReactNode } from 'react';
import { RouteProps } from 'react-router-dom';



export type TAppRoutePages = RouteProps & {
  path: string;
  element: ReactNode;
  accessLevels: AccessLevel[];
};

export const PagesWithoutHeaderPaths = new Set([
  AppRoutes.LOGIN, AppRoutes.REGISTER, AppRoutes.NOT_FOUND, AppRoutes.FORGOT_PASSWORD, AppRoutes.CONFIRM_EMAIL_CHANGE, AppRoutes.RESET_PASSWORD,
]);

export const AppRoutePages: TAppRoutePages[] = [
  {
    path: AppRoutes.LOGIN,
    element: <LoginPage />,
    accessLevels: [AccessLevel.GUEST],
  },
  {
    path: AppRoutes.REGISTER,
    element: <RegisterPage />,
    accessLevels: [AccessLevel.GUEST],
  },
  {
    path: AppRoutes.DASHBOARD,
    element: <DashboardPage />,
    accessLevels: [AccessLevel.SUPERUSER],
  },
  {
    path: AppRoutes.STATISTICS,
    element: <DashboardStatisticsPage />,
    accessLevels: [AccessLevel.SUPERUSER],
  },
  {
    path: AppRoutes.USERS,
    element: <DashboardUsersPage />,
    accessLevels: [AccessLevel.SUPERUSER],
  },
  {
    path: AppRoutes.USER_CREATE,
    element: <DashboardCreateUserPage />,
    accessLevels: [AccessLevel.SUPERUSER],
  },
  {
    path: AppRoutes.USER,
    element: <DashboardViewUserPage />,
    accessLevels: [AccessLevel.SUPERUSER],
  },
  {
    path: AppRoutes.USER_UPDATE,
    element: <DashboardUpdateUserPage />,
    accessLevels: [AccessLevel.SUPERUSER],
  },
  {
    path: AppRoutes.TAGS,
    element: <DashboardTagsPage />,
    accessLevels: [AccessLevel.SUPERUSER],
  },
  {
    path: AppRoutes.PROFILE,
    element: <ProfilePage />,
    accessLevels: [AccessLevel.USER, AccessLevel.SUPERUSER],
  },
  {
    path: AppRoutes.TASKS,
    element: <TasksPage />,
    accessLevels: [AccessLevel.PUBLIC],
  },
  {
    path: AppRoutes.TASK_CREATE,
    element: <TaskCreatePage />,
    accessLevels: [AccessLevel.USER],
  },
  {
    path: AppRoutes.TASK,
    element: <TaskPage />,
    accessLevels: [AccessLevel.PUBLIC],
  },
  {
    path: AppRoutes.TASK_UPDATE,
    element: <TaskUpdatePage />,
    accessLevels: [AccessLevel.USER],
  },
  {
    path: AppRoutes.ATTEMPT,
    element: <AttemptPage />,
    accessLevels: [AccessLevel.USER],
  },
  {
    path: AppRoutes.LEADERBOARD,
    element: <LeaderboardPage />,
    accessLevels: [AccessLevel.PUBLIC],
  },
  {
    path: AppRoutes.CONFIRM_EMAIL_CHANGE,
    element: <ConfirmEmailChangePage />,
    accessLevels: [AccessLevel.USER],
  },
  {
    path: AppRoutes.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
    accessLevels: [AccessLevel.GUEST],
  },
  {
    path: AppRoutes.RESET_PASSWORD,
    element: <ResetPasswordPage />,
    accessLevels: [AccessLevel.GUEST],
  },
  {
    path: AppRoutes.NOT_FOUND,
    element: <NotFoundPage />,
    accessLevels: [AccessLevel.PUBLIC],
  },
];
