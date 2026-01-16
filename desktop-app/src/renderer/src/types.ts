export interface Route {
  id: string;
  type: 'bus' | 'tram';
  name: string;
  ibisLineCmd: number;
  ibisDestinationCmd: number;
  // No longer using bytes, now plain text and reference to bin file name
  alfaSignText: string;
  alfaSignBinFile: string;
}
