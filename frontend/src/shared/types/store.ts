export interface IInitializableStore {
  isInitializing: boolean;
  initializationError: string | null;
  isInitialized: boolean;
  hasInitializationError: boolean;
}
