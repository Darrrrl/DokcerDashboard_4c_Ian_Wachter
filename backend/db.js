import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';


const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, '../data/dockerdash.db'));


db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');


db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    container_id   TEXT NOT NULL,
    container_name TEXT NOT NULL,
    type           TEXT NOT NULL,
    triggered_by   TEXT DEFAULT 'user',
    timestamp      INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
    
  );
`);


const insertSetting = db.prepare(
  'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
);
insertSetting.run('language', 'de');
insertSetting.run('ws_reconnect_interval', '5000');
insertSetting.run('dark_mode', 'true');

export default db;