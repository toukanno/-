import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import Database from 'better-sqlite3';

let mainWindow: BrowserWindow | null = null;
const dbPath = path.join(app.getPath('userData'), 'ledger.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS ledger_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    account TEXT NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('ledger:list', () => {
  const stmt = db.prepare(
    'SELECT id, date, account, description, amount, created_at as createdAt FROM ledger_entries ORDER BY date DESC, id DESC'
  );
  return stmt.all();
});

ipcMain.handle('ledger:add', (_event, payload: { date: string; account: string; description: string; amount: number }) => {
  const stmt = db.prepare(
    'INSERT INTO ledger_entries (date, account, description, amount) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(payload.date, payload.account, payload.description, payload.amount);
  return { id: info.lastInsertRowid };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  db.close();
});
