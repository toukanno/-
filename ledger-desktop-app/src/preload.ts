import { contextBridge, ipcRenderer } from 'electron';

type LedgerEntryInput = {
  date: string;
  account: string;
  description: string;
  amount: number;
};

contextBridge.exposeInMainWorld('ledgerApi', {
  list: () => ipcRenderer.invoke('ledger:list'),
  add: (entry: LedgerEntryInput) => ipcRenderer.invoke('ledger:add', entry)
});
