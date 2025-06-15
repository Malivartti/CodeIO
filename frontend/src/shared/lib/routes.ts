import { AppRoutes } from '@shared/types/routes';

export class NavigationHelpers {
  static getTaskUrl(contestId: string | number): string {
    return AppRoutes.TASK.replace(':id', String(contestId));
  }

  static getCollectionUrl(problemId: string | number): string {
    return AppRoutes.COLLECTION.replace(':id', String(problemId));
  }

  static getDefaultRouteForUser(isAuthenticated: boolean, isSuperuser: boolean): AppRoutes {
    if (!isAuthenticated || !isSuperuser) return AppRoutes.TASKS;
    return AppRoutes.DASHBOARD;
  }
}
