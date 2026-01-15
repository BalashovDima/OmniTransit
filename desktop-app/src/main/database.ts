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
  ibisLineCmd: number;
  ibisDestinationCmd: number;
  alfaSignBytes: Buffer | Uint8Array;
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
  2: () => {
    db.prepare(
      `
        CREATE TABLE routes_new (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL CHECK(type IN ('bus', 'tram')),
          name TEXT NOT NULL,
          ibisLineCmd INTEGER NOT NULL,
          ibisDestinationCmd INTEGER NOT NULL,
          alfaSignBytes BLOB NOT NULL
        )
      `,
    ).run();

    db.prepare(
      `
        INSERT INTO routes_new (id, type, name, ibisLineCmd, ibisDestinationCmd, alfaSignBytes)
        SELECT id, type, name, command1, command2, CAST(text AS BLOB)
        FROM routes
      `,
    ).run();

    db.prepare('DROP TABLE routes').run();

    db.prepare('ALTER TABLE routes_new RENAME TO routes').run();
  },
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

export function updateRoute(route: Route): void {
  const stmt = db.prepare(`
    UPDATE routes 
    SET type = @type, name = @name, ibisLineCmd = @ibisLineCmd, 
        ibisDestinationCmd = @ibisDestinationCmd, alfaSignBytes = @alfaSignBytes
    WHERE id = @id
  `);
  stmt.run(route);
}

export function addRoute(route: Route): void {
  const stmt = db.prepare(`
    INSERT INTO routes (id, type, name, ibisLineCmd, ibisDestinationCmd, alfaSignBytes)
    VALUES (@id, @type, @name, @ibisLineCmd, @ibisDestinationCmd, @alfaSignBytes)
  `);
  stmt.run(route);
}

export function deleteRoute(id: string): void {
  const stmt = db.prepare('DELETE FROM routes WHERE id = ?');
  stmt.run(id);
}
