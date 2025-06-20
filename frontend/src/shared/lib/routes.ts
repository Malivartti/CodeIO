import { AppRoutes } from '@shared/types/routes';

export class NavigationHelpers {
  static getTaskUrl(taskId: string | number): string {
    return AppRoutes.TASK.replace(':id', String(taskId));
  }

  static getTaskUpdateUrl(taskId: string | number): string {
    return AppRoutes.TASK_UPDATE.replace(':id', String(taskId));
  }

  static getAttemptUrl(taskId: string | number): string {
    return AppRoutes.ATTEMPT.replace(':id', String(taskId));
  }

  static getUsertUrl(taskId: string): string {
    return AppRoutes.USER.replace(':id', String(taskId));
  }

  static getUserUpdatetUrl(taskId: string): string {
    return AppRoutes.USER_UPDATE.replace(':id', String(taskId));
  }


  static getDefaultRouteForUser(isAuthenticated: boolean, isSuperuser: boolean): AppRoutes {
    if (!isAuthenticated || !isSuperuser) return AppRoutes.TASKS;
    return AppRoutes.DASHBOARD;
  }
}
