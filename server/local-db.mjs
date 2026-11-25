import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { sqliteStore } from './store.mjs';

export function localDatabase(filename) {
  const database = new DatabaseSync(filename);
  database.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  database.exec(readFileSync(new URL('../drizzle/0000_game.sql', import.meta.url), 'utf8'));
  const store = sqliteStore({
    prepare(sql) {
      const statement = database.prepare(sql);
      function query(values) {
        return {
          bind: (...params) => query(params),
          async run() { return { meta: statement.run(...values) }; },
          async all() { return { results: statement.all(...values) }; },
          async first() { return statement.get(...values); }
        };
      }
      return query([]);
    }
  });
  return { store, close: () => database.close() };
}
