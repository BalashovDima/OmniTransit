import fs from 'fs';
import path from 'path';
import { Route } from './database';

export function generateEsp32Files(routes: Route[], outputDir: string): void {
  const busesDir = path.join(outputDir, 'data', 'buses');
  const tramsDir = path.join(outputDir, 'data', 'trams');

  // Create directories recursively
  if (!fs.existsSync(busesDir)) fs.mkdirSync(busesDir, { recursive: true });
  if (!fs.existsSync(tramsDir)) fs.mkdirSync(tramsDir, { recursive: true });

  const indexData = {
    buses: [] as string[],
    trams: [] as string[],
  };

  routes.forEach((route) => {
    const targetDir = route.type === 'bus' ? busesDir : tramsDir;
    // Filename based on Route Name, sanitized.
    const safeName = route.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (route.type === 'bus') {
      indexData.buses.push(route.name);
    } else if (route.type === 'tram') {
      indexData.trams.push(route.name);
    }

    const filePath = path.join(targetDir, `${safeName}.json`);

    const data = {
      id: route.id,
      name: route.name,
      ibisLineCmd: route.ibisLineCmd,
      ibisDestinationCmd: route.ibisDestinationCmd,
      alfaSignBytes: Array.from(route.alfaSignBytes),
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  });

  const indexJsonPath = path.join(outputDir, 'data', 'index.json');
  fs.writeFileSync(indexJsonPath, JSON.stringify(indexData, null, 2));
}
