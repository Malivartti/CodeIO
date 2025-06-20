import { ComponentType, LazyExoticComponent } from 'react';

export enum AppRoutes {
  MAIN = '/',
  LOGIN = '/login',
  REGISTER = '/register',
  PROFILE = '/profile',
  TASKS = '/tasks',
  TASK_CREATE = '/tasks/create',
  TASK = '/tasks/:id',
  TASK_UPDATE = '/tasks/:id/update',
  ATTEMPT = '/attempts/:id',
  LEADERBOARD = '/leaderboard',
  DASHBOARD = '/dashboard',
  STATISTICS = '/dashboard/stats',
  USERS = '/dashboard/users',
  USER_CREATE = '/dashboard/users/create',
  USER = '/dashboard/users/:id',
  USER_UPDATE = '/dashboard/users/:id/update',
  TAGS = '/dashboard/tags',
  CONFIRM_EMAIL_CHANGE = '/confirm-email-change',
  FORGOT_PASSWORD = '/forgot-password',
  RESET_PASSWORD = '/reset-password',
  NOT_FOUND = '/404',
  WILDCARD = '*'
}

export enum AccessLevel {
  PUBLIC = 'public',
  GUEST = 'guest',
  USER = 'user',
  SUPERUSER = 'superuser'
}


export interface RouteConfig {
  path: string;
  component: LazyExoticComponent<ComponentType<any>>;
  accessLevel: AccessLevel;
  exact?: boolean;
}
