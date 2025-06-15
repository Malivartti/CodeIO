import { ComponentType, LazyExoticComponent } from 'react';

export enum AppRoutes {
  MAIN = '/',
  LOGIN = '/login',
  REGISTER = '/register',
  PROFILE = '/profile',
  TASKS = '/tasks',
  TASK = '/tasks/:id',
  COLLECTIONS = '/collections',
  COLLECTION = '/collections/:id',
  LEADERBOARD = '/leaderboard',
  DASHBOARD = '/dashboard',
  NOT_FOUND = '/404',
  WILDCARD = '*'
}

export enum AccessLevel {
  PUBLIC = 'Все',
  GUEST = 'Гость',
  USER = 'Пользователь',
  SUPERUSER = 'Суперпользователь'
}


export interface RouteConfig {
  path: string;
  component: LazyExoticComponent<ComponentType<any>>;
  accessLevel: AccessLevel;
  exact?: boolean;
}
