const { contextBridge, ipcRenderer } = require('electron');

// セキュアなAPIをレンダラープロセスに公開
contextBridge.exposeInMainWorld('electronAPI', {
  // DB パス取得
  getDbPath: () => ipcRenderer.invoke('get-db-path'),

  // ファイルダイアログ
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),

  // メニューイベント受信
  onMenuEvent: (callback) => {
    const events = [
      'menu-export-csv',
      'menu-export-excel',
      'nav-shiwake',
      'nav-sokanjo',
      'nav-shisan',
      'nav-taishaku'
    ];
    events.forEach(event => {
      ipcRenderer.on(event, () => callback(event));
    });
  }
});
