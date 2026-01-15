export interface Route {
  id: string;
  type: 'bus' | 'tram';
  name: string;
  ibisLineCmd: number;
  ibisDestinationCmd: number;
  // Uint8Array is compatible with Buffer/BLOB in IPC and SQLite
  alfaSignBytes: Uint8Array;
}
