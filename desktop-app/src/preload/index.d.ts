import { ElectronAPI } from '@electron-toolkit/preload';
import { Route } from '../main/database';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getRoutes: () => Promise<Route[]>;
      addRoute: (route: Route) => Promise<void>;
      deleteRoute: (id: string) => Promise<void>;
      exportData: () => Promise<{
        success: boolean;
        message?: string;
        path?: string;
      }>;
    };
  }
}

// Ensure this file is treated as a module
export {};
