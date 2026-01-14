import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'

const dbPath = path.join(app.getPath('userData'), 'routes.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

export interface Route {
  id: string
  type: 'bus' | 'tram'
  name: string
  command1: number
  command2: number
  text: string
}

export function initDB(): void {
  const stmt = db.prepare(`
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('bus', 'tram')),
      name TEXT NOT NULL,
      command1 INTEGER NOT NULL,
      command2 INTEGER NOT NULL,
      text TEXT NOT NULL
    )
  `)
  stmt.run()
}

export function getAllRoutes(): Route[] {
  const stmt = db.prepare('SELECT * FROM routes')
  return stmt.all() as Route[]
}

export function addRoute(route: Route): void {
  const stmt = db.prepare(`
    INSERT INTO routes (id, type, name, command1, command2, text)
    VALUES (@id, @type, @name, @command1, @command2, @text)
  `)
  stmt.run(route)
}

export function deleteRoute(id: string): void {
  const stmt = db.prepare('DELETE FROM routes WHERE id = ?')
  stmt.run(id)
}
