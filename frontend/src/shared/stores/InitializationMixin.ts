import { makeAutoObservable } from 'mobx';

export class InitializationMixin {
  isInitializing = true;
  initializationError: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async performInitialization(initFn: () => Promise<void>): Promise<void> {
    try {
      await initFn();
      this.setInitializationComplete();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка инициализации';
      this.setInitializationError(errorMessage);
    }
  }

  private setInitializationComplete(): void {
    this.isInitializing = false;
    this.initializationError = null;
  }

  private setInitializationError(error: string): void {
    this.isInitializing = false;
    this.initializationError = error;
  }

  get isInitialized(): boolean {
    return !this.isInitializing && !this.initializationError;
  }

  get hasInitializationError(): boolean {
    return Boolean(this.initializationError);
  }
}
