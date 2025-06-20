import { authStore } from '@features/auth';
import { IInitializableStore } from '@shared/types/store';
import { autorun,makeAutoObservable } from 'mobx';

class AppStore {
  criticalStoresInitialized = false;

  constructor() {
    makeAutoObservable(this);
    this.initializeCriticalStores();
  }

  private async initializeCriticalStores(): Promise<void> {
    const stores: IInitializableStore[] = [authStore];

    await Promise.allSettled(
      stores.map(store => this.waitForInitialization(store))
    );

    this.criticalStoresInitialized = true;
  }

  private async waitForInitialization(store: IInitializableStore): Promise<void> {
    return new Promise((resolve) => {
      if (store.isInitialized || store.hasInitializationError) {
        resolve();
        return;
      }

      const dispose = autorun(() => {
        if (store.isInitialized || store.hasInitializationError) {
          dispose();
          resolve();
        }
      });
    });
  }

  get allStoresReady(): boolean {
    return this.criticalStoresInitialized;
  }
}

export const appStore = new AppStore();
