import { contextBridge, ipcRenderer } from 'electron';
import { Route } from '../main/database';

// Custom APIs for renderer
const api = {
  getRoutes: (): Promise<Route[]> => ipcRenderer.invoke('get-routes'),
  addRoute: (route: Route): Promise<void> =>
    ipcRenderer.invoke('add-route', route),
  updateRoute: (route: Route): Promise<void> =>
    ipcRenderer.invoke('update-route', route),
  deleteRoute: (id: string): Promise<void> =>
    ipcRenderer.invoke('delete-route', id),
  exportData: (): Promise<{
    success: boolean;
    message?: string;
    path?: string;
  }> => ipcRenderer.invoke('export-data'),
};

// Use `contextBridge` APIs to expose IPC to the renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.api = api;
}
