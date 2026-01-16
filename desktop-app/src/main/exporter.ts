import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { app } from 'electron';
import { Route } from './database';

export function generateEsp32Files(routes: Route[], outputDir: string): void {
  const busesDir = path.join(outputDir, 'data', 'buses');
  const tramsDir = path.join(outputDir, 'data', 'trams');

  // Create directories recursively
  if (!fs.existsSync(busesDir)) fs.mkdirSync(busesDir, { recursive: true });
  if (!fs.existsSync(tramsDir)) fs.mkdirSync(tramsDir, { recursive: true });

  // Resolve Python script path
  // app.getAppPath() usually returns the directory containing package.json (desktop-app)
  const scriptPath = path.resolve(
    app.getAppPath(),
    '..',
    'alfa-bus-protocol',
    'exporter_bridge.py',
  );

  const pythonPath = path.resolve(
    app.getAppPath(),
    '..',
    'alfa-bus-protocol',
    '.venv',
    process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
  );

  const fontPath = path.resolve(path.dirname(scriptPath), 'ArialRegular.ttf');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unused = path.resolve(
    app.getAppPath(),

    '../alfa-bus-protocol/exporter_bridge.py',
  );

  const indexData = {
    buses: [] as { name: string; file: string }[],
    trams: [] as { name: string; file: string }[],
  };

  routes.forEach((route) => {
    const targetDir = route.type === 'bus' ? busesDir : tramsDir;
    // Use ID for filename to avoid collisions and character issues
    const fileName = `${route.id}.json`;
    const filePath = path.join(targetDir, fileName);

    if (route.type === 'bus') {
      indexData.buses.push({ name: route.name, file: route.id });
    } else if (route.type === 'tram') {
      indexData.trams.push({ name: route.name, file: route.id });
    }

    // Generate binary file using the python bridge
    const binFileName = route.alfaSignBinFile || `${route.id}.bin`;
    const binFilePath = path.join(targetDir, binFileName);

    try {
      // Default to Arial.ttf (system font) and standard dimensions for now
      // These could be parameterized in the DB if needed later
      execFileSync(pythonPath, [
        scriptPath,
        '--text',
        `"${route.alfaSignText}"`,
        '--font',
        fontPath,
        '--width',
        '112', // Standard width
        '--height',
        '16', // Standard height
        '--type',
        'led',
        '--out',
        binFilePath,
      ]);
    } catch (error) {
      console.error(`Failed to generate binary for route ${route.id}:`, error);
      // We continue even if binary generation fails, but log it
    }

    const data = {
      id: route.id,
      name: route.name,
      ibisLineCmd: route.ibisLineCmd,
      ibisDestinationCmd: route.ibisDestinationCmd,
      alfaSignText: route.alfaSignText,
      alfaSignBinFile: binFileName,
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  });

  const indexJsonPath = path.join(outputDir, 'data', 'index.json');
  fs.writeFileSync(indexJsonPath, JSON.stringify(indexData, null, 2));
}
