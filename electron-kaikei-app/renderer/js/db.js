/**
 * db.js - SQLiteデータベース管理
 * better-sqlite3 を Node.js 側で直接使用（IPC経由）
 *
 * ※ Electron では renderer プロセスから直接 Node.js モジュールを使えないため、
 *    本番では main プロセス側の IPC ハンドラーで DB 操作を行うべきですが、
 *    参考実装として localStorage ベースの軽量版を提供します。
 *    実際の本番実装では IPC + better-sqlite3 への移行を推奨します。
 */

class KaikeiDB {
  constructor() {
    this.storageKey = 'kaikei_data';
    this._data = this._load();
    this._initDefaultData();
  }

  _load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  _save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this._data));
  }

  _initDefaultData() {
    if (this._data) return;

    // デフォルト勘定科目（一般的な省庁・行政向け科目）
    const defaultKanjoMaster = [
      // 資産
      { id: 1,  code: '101', name: '現金',             category: '資産',   balanceType: 'debit' },
      { id: 2,  code: '102', name: '普通預金',          category: '資産',   balanceType: 'debit' },
      { id: 3,  code: '103', name: '当座預金',          category: '資産',   balanceType: 'debit' },
      { id: 4,  code: '110', name: '未収金',            category: '資産',   balanceType: 'debit' },
      { id: 5,  code: '120', name: '前払金',            category: '資産',   balanceType: 'debit' },
      { id: 6,  code: '130', name: '建物',              category: '資産',   balanceType: 'debit' },
      { id: 7,  code: '131', name: '機械器具',          category: '資産',   balanceType: 'debit' },
      { id: 8,  code: '132', name: '備品',              category: '資産',   balanceType: 'debit' },
      // 負債
      { id: 10, code: '201', name: '未払金',            category: '負債',   balanceType: 'credit' },
      { id: 11, code: '202', name: '前受金',            category: '負債',   balanceType: 'credit' },
      { id: 12, code: '210', name: '借入金',            category: '負債',   balanceType: 'credit' },
      // 純資産
      { id: 20, code: '301', name: '資本金',            category: '純資産', balanceType: 'credit' },
      { id: 21, code: '302', name: '繰越剰余金',        category: '純資産', balanceType: 'credit' },
      // 収益
      { id: 30, code: '401', name: '国庫補助金収入',    category: '収益',   balanceType: 'credit' },
      { id: 31, code: '402', name: '業務収入',          category: '収益',   balanceType: 'credit' },
      { id: 32, code: '403', name: '雑収入',            category: '収益',   balanceType: 'credit' },
      // 費用
      { id: 40, code: '501', name: '人件費',            category: '費用',   balanceType: 'debit' },
      { id: 41, code: '502', name: '旅費交通費',        category: '費用',   balanceType: 'debit' },
      { id: 42, code: '503', name: '消耗品費',          category: '費用',   balanceType: 'debit' },
      { id: 43, code: '504', name: '通信費',            category: '費用',   balanceType: 'debit' },
      { id: 44, code: '505', name: '印刷製本費',        category: '費用',   balanceType: 'debit' },
      { id: 45, code: '506', name: '委託費',            category: '費用',   balanceType: 'debit' },
      { id: 46, code: '507', name: '賃貸借費',          category: '費用',   balanceType: 'debit' },
      { id: 47, code: '508', name: '水道光熱費',        category: '費用',   balanceType: 'debit' },
      { id: 48, code: '509', name: '諸経費',            category: '費用',   balanceType: 'debit' },
    ];

    // サンプル仕訳データ
    const currentYear = new Date().getFullYear();
    const fy = `${currentYear}`;
    const sampleShiwake = [
      { id: 1, fiscalYear: fy, date: `${currentYear}-04-01`, debitKanjoId: 2,  creditKanjoId: 30, debitAmount: 5000000, creditAmount: 5000000, description: '国庫補助金交付' },
      { id: 2, fiscalYear: fy, date: `${currentYear}-04-05`, debitKanjoId: 40, creditKanjoId: 2,  debitAmount: 800000,  creditAmount: 800000,  description: '4月分給与支払' },
      { id: 3, fiscalYear: fy, date: `${currentYear}-04-10`, debitKanjoId: 42, creditKanjoId: 1,  debitAmount: 15000,   creditAmount: 15000,   description: '事務用品購入' },
      { id: 4, fiscalYear: fy, date: `${currentYear}-04-15`, debitKanjoId: 41, creditKanjoId: 1,  debitAmount: 25000,   creditAmount: 25000,   description: '出張旅費精算' },
      { id: 5, fiscalYear: fy, date: `${currentYear}-04-20`, debitKanjoId: 45, creditKanjoId: 10, debitAmount: 200000,  creditAmount: 200000,  description: 'システム開発委託' },
    ];

    this._data = {
      kanjoMaster: defaultKanjoMaster,
      shiwake: sampleShiwake,
      nextKanjoId: 100,
      nextShiwakeId: 10,
    };
    this._save();
  }

  // ===== 勘定科目マスタ =====
  getAllKanjo() {
    return [...this._data.kanjoMaster].sort((a, b) => a.code.localeCompare(b.code));
  }

  getKanjoById(id) {
    return this._data.kanjoMaster.find(k => k.id === id) || null;
  }

  insertKanjo(kanjo) {
    const id = this._data.nextKanjoId++;
    const record = { ...kanjo, id };
    this._data.kanjoMaster.push(record);
    this._save();
    return record;
  }

  updateKanjo(id, kanjo) {
    const idx = this._data.kanjoMaster.findIndex(k => k.id === id);
    if (idx === -1) return false;
    this._data.kanjoMaster[idx] = { ...this._data.kanjoMaster[idx], ...kanjo };
    this._save();
    return true;
  }

  deleteKanjo(id) {
    const idx = this._data.kanjoMaster.findIndex(k => k.id === id);
    if (idx === -1) return false;
    this._data.kanjoMaster.splice(idx, 1);
    this._save();
    return true;
  }

  // ===== 仕訳 =====
  getAllShiwake(fiscalYear, dateFrom, dateTo) {
    let records = this._data.shiwake.filter(s => s.fiscalYear === fiscalYear);
    if (dateFrom) records = records.filter(s => s.date >= dateFrom);
    if (dateTo)   records = records.filter(s => s.date <= dateTo);
    return records.sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  }

  getShiwakeById(id) {
    return this._data.shiwake.find(s => s.id === id) || null;
  }

  insertShiwake(shiwake) {
    const id = this._data.nextShiwakeId++;
    const record = { ...shiwake, id };
    this._data.shiwake.push(record);
    this._save();
    return record;
  }

  updateShiwake(id, shiwake) {
    const idx = this._data.shiwake.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this._data.shiwake[idx] = { ...this._data.shiwake[idx], ...shiwake };
    this._save();
    return true;
  }

  deleteShiwake(id) {
    const idx = this._data.shiwake.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this._data.shiwake.splice(idx, 1);
    this._save();
    return true;
  }

  // ===== 集計クエリ =====

  /** 試算表データ取得 */
  getShisanData(fiscalYear) {
    const shiwakeList = this.getAllShiwake(fiscalYear);
    const kanjoMap = {};

    for (const k of this.getAllKanjo()) {
      kanjoMap[k.id] = { ...k, debitTotal: 0, creditTotal: 0 };
    }

    for (const s of shiwakeList) {
      if (kanjoMap[s.debitKanjoId])  kanjoMap[s.debitKanjoId].debitTotal  += s.debitAmount;
      if (kanjoMap[s.creditKanjoId]) kanjoMap[s.creditKanjoId].creditTotal += s.creditAmount;
    }

    return Object.values(kanjoMap)
      .filter(k => k.debitTotal > 0 || k.creditTotal > 0)
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  /** 総勘定元帳データ取得 */
  getSokanjoData(fiscalYear, kanjoId) {
    const shiwakeList = this.getAllShiwake(fiscalYear);
    const rows = [];
    let balance = 0;
    const kanjo = this.getKanjoById(kanjoId);
    if (!kanjo) return [];

    for (const s of shiwakeList) {
      if (s.debitKanjoId === kanjoId) {
        balance += s.debitAmount;
        rows.push({ date: s.date, description: s.description, debit: s.debitAmount, credit: 0, balance });
      } else if (s.creditKanjoId === kanjoId) {
        balance -= s.creditAmount;
        rows.push({ date: s.date, description: s.description, debit: 0, credit: s.creditAmount, balance });
      }
    }
    return rows;
  }

  /** BS/PL 用勘定残高取得 */
  getKanjoBalances(fiscalYear) {
    const shisanData = this.getShisanData(fiscalYear);
    const balances = {};
    for (const item of shisanData) {
      const balance = item.balanceType === 'debit'
        ? item.debitTotal - item.creditTotal
        : item.creditTotal - item.debitTotal;
      balances[item.id] = { ...item, balance };
    }
    return balances;
  }
}

// グローバルインスタンス
const db = new KaikeiDB();
