import fs from 'fs'
import path from 'path'
import { Route } from './database'

export function generateEsp32Files(routes: Route[], outputDir: string): void {
  const busesDir = path.join(outputDir, 'data', 'buses')
  const tramsDir = path.join(outputDir, 'data', 'trams')

  // Create directories recursively
  if (!fs.existsSync(busesDir)) fs.mkdirSync(busesDir, { recursive: true })
  if (!fs.existsSync(tramsDir)) fs.mkdirSync(tramsDir, { recursive: true })

  routes.forEach((route) => {
    const targetDir = route.type === 'bus' ? busesDir : tramsDir
    // Filename based on Route Name, sanitized.
    // Spec says "/data/buses/*.json", implies 1 file per route? 
    // Or maybe just a single file logic? Re-reading: "/data/buses/*.json" - yes multiple files.
    // I'll use route name or ID for filename. Let's use name, sanitized.
    const safeName = route.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const filePath = path.join(targetDir, `${safeName}.json`)

    const data = {
      id: route.id,
      name: route.name,
      cmd1: route.command1, // Shortened or hex? User asked for command1/2. Keeping as number (int)
      cmd2: route.command2,
      text: route.text
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  })
}
