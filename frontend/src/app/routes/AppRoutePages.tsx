import CollectionPage from '@pages/CollectionPage';
import CollectionsPage from '@pages/CollectionsPage';
import DashboardPage from '@pages/DashboardPage';
import LeaderboardPage from '@pages/LeaderboardPage';
import LoginPage from '@pages/LoginPage';
import NotFoundPage from '@pages/NotFoundPage';
import ProfilePage from '@pages/ProfilePage';
import RegisterPage from '@pages/RegisterPage';
import TaskPage from '@pages/TaskPage';
import TasksPage from '@pages/TasksPage';
import { AccessLevel,AppRoutes } from '@shared/types/routes';
import { ReactNode } from 'react';
import { RouteProps } from 'react-router-dom';

import MainPageRedirect from './MainPageRedirect';


export type TAppRoutePages = RouteProps & {
  path: string;
  element: ReactNode;
  accessLevels: AccessLevel[];
};

export const AppRoutePages: TAppRoutePages[] = [
  {
    path: AppRoutes.MAIN,
    element: <MainPageRedirect />,
    accessLevels: [AccessLevel.PUBLIC],
  },
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
    path: AppRoutes.TASK,
    element: <TaskPage />,
    accessLevels: [AccessLevel.PUBLIC],
  },
  {
    path: AppRoutes.COLLECTIONS,
    element: <CollectionsPage />,
    accessLevels: [AccessLevel.PUBLIC],
  },
  {
    path: AppRoutes.COLLECTION,
    element: <CollectionPage />,
    accessLevels: [AccessLevel.PUBLIC],
  },
  {
    path: AppRoutes.LEADERBOARD,
    element: <LeaderboardPage />,
    accessLevels: [AccessLevel.PUBLIC],
  },
  {
    path: AppRoutes.NOT_FOUND,
    element: <NotFoundPage />,
    accessLevels: [AccessLevel.PUBLIC],
  },
];
