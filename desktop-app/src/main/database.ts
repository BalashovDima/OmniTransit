import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'routes.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export interface Route {
  id: string;
  type: 'bus' | 'tram';
  name: string;
  command1: number;
  command2: number;
  text: string;
}

const START_VERSION = 1;

// Define migrations starting from your chosen version
const migrations: Record<number, () => void> = {
  1: () => {
    db.prepare(
      `
      CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('bus', 'tram')),
        name TEXT NOT NULL,
        command1 INTEGER NOT NULL,
        command2 INTEGER NOT NULL,
        text TEXT NOT NULL
      )
    `,
    ).run();
  },
  // 2: () => {
  // Your first actual change after the baseline
  // db.prepare(`ALTER TABLE routes ADD COLUMN ...`).run()
  // }
};

export function initDB(): void {
  const result = db.pragma('user_version') as any;
  let currentVersion =
    typeof result === 'number' ? result : result[0].user_version;

  // If new DB, skip the history and start just before our baseline
  if (currentVersion === 0) {
    currentVersion = START_VERSION - 1;
  }

  // Find the highest version number defined in our migrations
  const migrationVersions = Object.keys(migrations).map(Number);
  const targetVersion = Math.max(...migrationVersions);

  // Run all migrations from current + 1 up to the latest
  while (currentVersion < targetVersion) {
    const nextVersion = currentVersion + 1;
    const migration = migrations[nextVersion];

    if (migration) {
      db.transaction(() => {
        console.log(`Applying migration to version ${nextVersion}...`);
        migration();
        db.pragma(`user_version = ${nextVersion}`);
      })();
    }

    currentVersion = nextVersion;
  }
}

export function getAllRoutes(): Route[] {
  const stmt = db.prepare('SELECT * FROM routes');
  return stmt.all() as Route[];
}

export function addRoute(route: Route): void {
  const stmt = db.prepare(`
    INSERT INTO routes (id, type, name, command1, command2, text)
    VALUES (@id, @type, @name, @command1, @command2, @text)
  `);
  stmt.run(route);
}

export function deleteRoute(id: string): void {
  const stmt = db.prepare('DELETE FROM routes WHERE id = ?');
  stmt.run(id);
}
