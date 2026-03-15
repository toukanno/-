/**
 * app.js - メインアプリケーションロジック
 */

// ===== ユーティリティ =====
const fmt = {
  /** 金額フォーマット */
  amount: (n) => n === 0 ? '-' : `¥${Number(n).toLocaleString()}`,
  /** 日付フォーマット YYYY-MM-DD → YYYY/MM/DD */
  date: (d) => d ? d.replace(/-/g, '/') : '',
};

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ===== 会計年度 =====
const currentYear = new Date().getFullYear();
let currentFiscalYear = String(currentYear);

function initFiscalYear() {
  const sel = document.getElementById('fiscalYear');
  for (let y = currentYear; y >= currentYear - 5; y--) {
    const opt = document.createElement('option');
    opt.value = String(y);
    opt.textContent = `${y}年度`;
    if (String(y) === currentFiscalYear) opt.selected = true;
    sel.appendChild(opt);
  }
  sel.addEventListener('change', () => {
    currentFiscalYear = sel.value;
    renderCurrentPage();
  });
}

// ===== ナビゲーション =====
let currentPage = 'shiwake';

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));

  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  currentPage = page;
  renderCurrentPage();
}

function renderCurrentPage() {
  switch (currentPage) {
    case 'shiwake':     renderShiwake(); break;
    case 'sokanjo':     renderSokanjo(); break;
    case 'shisan':      renderShisan(); break;
    case 'taishaku':    renderTaishaku(); break;
    case 'soneki':      renderSoneki(); break;
    case 'kanjo-master': renderKanjoMaster(); break;
  }
}

// ===== 仕訳帳 =====
function renderShiwake() {
  const dateFrom = document.getElementById('filter-date-from').value || '';
  const dateTo   = document.getElementById('filter-date-to').value   || '';
  const records  = db.getAllShiwake(currentFiscalYear, dateFrom || undefined, dateTo || undefined);
  const kanjoMap = {};
  db.getAllKanjo().forEach(k => kanjoMap[k.id] = k);

  const tbody = document.getElementById('shiwake-tbody');
  tbody.innerHTML = '';

  let totalDebit = 0, totalCredit = 0;

  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#999;padding:24px">仕訳データがありません</td></tr>';
  }

  records.forEach((s, idx) => {
    totalDebit  += s.debitAmount;
    totalCredit += s.creditAmount;
    const debitKanjo  = kanjoMap[s.debitKanjoId];
    const creditKanjo = kanjoMap[s.creditKanjoId];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-right">${idx + 1}</td>
      <td>${fmt.date(s.date)}</td>
      <td class="debit-color">${debitKanjo ? debitKanjo.name : '?'}</td>
      <td class="text-right debit-color amount">${fmt.amount(s.debitAmount)}</td>
      <td class="credit-color">${creditKanjo ? creditKanjo.name : '?'}</td>
      <td class="text-right credit-color amount">${fmt.amount(s.creditAmount)}</td>
      <td>${s.description || ''}</td>
      <td style="text-align:center">
        <button class="btn-icon" onclick="editShiwake(${s.id})" title="編集">✏️</button>
        <button class="btn-icon" onclick="deleteShiwake(${s.id})" title="削除">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('shiwake-total-debit').textContent  = `¥${totalDebit.toLocaleString()}`;
  document.getElementById('shiwake-total-credit').textContent = `¥${totalCredit.toLocaleString()}`;
}

function openShiwakeModal(shiwake = null) {
  const kanjoList = db.getAllKanjo();
  const options = kanjoList.map(k => `<option value="${k.id}">${k.code} ${k.name}</option>`).join('');

  document.getElementById('input-debit-kanjo').innerHTML  = '<option value="">選択してください</option>' + options;
  document.getElementById('input-credit-kanjo').innerHTML = '<option value="">選択してください</option>' + options;

  if (shiwake) {
    document.getElementById('modal-shiwake-title').textContent = '仕訳編集';
    document.getElementById('shiwake-id').value              = shiwake.id;
    document.getElementById('input-date').value              = shiwake.date;
    document.getElementById('input-debit-kanjo').value       = shiwake.debitKanjoId;
    document.getElementById('input-debit-amount').value      = shiwake.debitAmount;
    document.getElementById('input-credit-kanjo').value      = shiwake.creditKanjoId;
    document.getElementById('input-credit-amount').value     = shiwake.creditAmount;
    document.getElementById('input-description').value       = shiwake.description || '';
  } else {
    document.getElementById('modal-shiwake-title').textContent = '仕訳入力';
    document.getElementById('shiwake-id').value = '';
    document.getElementById('form-shiwake').reset();
    // デフォルト日付を今日に設定
    document.getElementById('input-date').value = new Date().toISOString().slice(0, 10);
  }
  openModal('modal-shiwake');
}

function saveShiwake() {
  const date         = document.getElementById('input-date').value;
  const debitKanjoId = parseInt(document.getElementById('input-debit-kanjo').value);
  const debitAmount  = parseInt(document.getElementById('input-debit-amount').value);
  const creditKanjoId= parseInt(document.getElementById('input-credit-kanjo').value);
  const creditAmount = parseInt(document.getElementById('input-credit-amount').value);
  const description  = document.getElementById('input-description').value.trim();

  if (!date || isNaN(debitKanjoId) || isNaN(debitAmount) || isNaN(creditKanjoId) || isNaN(creditAmount)) {
    showToast('必須項目を入力してください', 'error');
    return;
  }
  if (debitAmount !== creditAmount) {
    showToast('借方金額と貸方金額が一致しません', 'error');
    return;
  }
  if (debitAmount <= 0) {
    showToast('金額は1以上を入力してください', 'error');
    return;
  }

  const idVal = document.getElementById('shiwake-id').value;
  const record = { fiscalYear: currentFiscalYear, date, debitKanjoId, debitAmount, creditKanjoId, creditAmount, description };

  if (idVal) {
    db.updateShiwake(parseInt(idVal), record);
    showToast('仕訳を更新しました', 'success');
  } else {
    db.insertShiwake(record);
    showToast('仕訳を登録しました', 'success');
  }

  closeModal('modal-shiwake');
  renderShiwake();
}

function editShiwake(id) {
  const s = db.getShiwakeById(id);
  if (s) openShiwakeModal(s);
}

function deleteShiwake(id) {
  if (!confirm('この仕訳を削除しますか？')) return;
  db.deleteShiwake(id);
  showToast('仕訳を削除しました', 'warning');
  renderShiwake();
}

// ===== 総勘定元帳 =====
function renderSokanjo() {
  const kanjoList = db.getAllKanjo();
  const sel = document.getElementById('sokanjo-kanjo-select');
  const currentVal = sel.value;

  sel.innerHTML = '<option value="">勘定科目を選択</option>';
  kanjoList.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k.id;
    opt.textContent = `${k.code} ${k.name}`;
    sel.appendChild(opt);
  });
  if (currentVal) sel.value = currentVal;

  const kanjoId = parseInt(sel.value);
  const tbody = document.getElementById('sokanjo-tbody');
  tbody.innerHTML = '';

  if (!kanjoId) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:24px">勘定科目を選択してください</td></tr>';
    return;
  }

  const rows = db.getSokanjoData(currentFiscalYear, kanjoId);

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:24px">データがありません</td></tr>';
    return;
  }

  rows.forEach(row => {
    const tr = document.createElement('tr');
    const balanceClass = row.balance >= 0 ? 'balance-positive' : 'balance-negative';
    tr.innerHTML = `
      <td>${fmt.date(row.date)}</td>
      <td>${row.description || ''}</td>
      <td class="text-right debit-color amount">${row.debit > 0 ? fmt.amount(row.debit) : '-'}</td>
      <td class="text-right credit-color amount">${row.credit > 0 ? fmt.amount(row.credit) : '-'}</td>
      <td class="text-right ${balanceClass} amount">${fmt.amount(Math.abs(row.balance))}${row.balance < 0 ? '（貸）' : ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== 試算表 =====
function renderShisan() {
  const data = db.getShisanData(currentFiscalYear);
  const tbody = document.getElementById('shisan-tbody');
  tbody.innerHTML = '';

  let totalDebit = 0, totalCredit = 0, totalBalDebit = 0, totalBalCredit = 0;

  data.forEach(item => {
    totalDebit  += item.debitTotal;
    totalCredit += item.creditTotal;

    const balDebit  = item.balanceType === 'debit'  ? Math.max(0, item.debitTotal - item.creditTotal) : 0;
    const balCredit = item.balanceType === 'credit' ? Math.max(0, item.creditTotal - item.debitTotal) : 0;
    totalBalDebit  += balDebit;
    totalBalCredit += balCredit;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.code} ${item.name}</td>
      <td class="text-right debit-color amount">${fmt.amount(item.debitTotal)}</td>
      <td class="text-right credit-color amount">${fmt.amount(item.creditTotal)}</td>
      <td class="text-right amount">${balDebit  > 0 ? fmt.amount(balDebit)  : '-'}</td>
      <td class="text-right amount">${balCredit > 0 ? fmt.amount(balCredit) : '-'}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('shisan-total-debit').textContent   = `¥${totalDebit.toLocaleString()}`;
  document.getElementById('shisan-total-credit').textContent  = `¥${totalCredit.toLocaleString()}`;
  document.getElementById('shisan-balance-debit').textContent = `¥${totalBalDebit.toLocaleString()}`;
  document.getElementById('shisan-balance-credit').textContent= `¥${totalBalCredit.toLocaleString()}`;
}

// ===== 貸借対照表 =====
function renderTaishaku() {
  const balances = db.getKanjoBalances(currentFiscalYear);
  const assets   = Object.values(balances).filter(b => b.category === '資産');
  const liab     = Object.values(balances).filter(b => b.category === '負債');
  const equity   = Object.values(balances).filter(b => b.category === '純資産');

  function buildSection(items, title) {
    if (items.length === 0) return '';
    let html = `<div class="bs-section-title" style="padding:8px 16px;font-size:12px;color:#666;background:#f8f8f8;border-bottom:1px solid #e0e0e0">${title}</div>`;
    for (const item of items) {
      html += `<div class="bs-item"><span>${item.name}</span><span class="amount">¥${item.balance.toLocaleString()}</span></div>`;
    }
    return html;
  }

  const totalAssets = assets.reduce((s, b) => s + b.balance, 0);
  const totalLiab   = liab.reduce((s, b) => s + b.balance, 0);
  const totalEquity = equity.reduce((s, b) => s + b.balance, 0);

  document.getElementById('bs-assets').innerHTML = buildSection(assets, '流動資産・固定資産');
  document.getElementById('bs-liabilities').innerHTML =
    buildSection(liab, '負債') + buildSection(equity, '純資産');
  document.getElementById('bs-total-assets').textContent    = `¥${totalAssets.toLocaleString()}`;
  document.getElementById('bs-total-liabilities').textContent = `¥${(totalLiab + totalEquity).toLocaleString()}`;
}

// ===== 損益計算書 =====
function renderSoneki() {
  const balances = db.getKanjoBalances(currentFiscalYear);
  const revenues = Object.values(balances).filter(b => b.category === '収益');
  const expenses = Object.values(balances).filter(b => b.category === '費用');

  const totalRevenue = revenues.reduce((s, b) => s + b.balance, 0);
  const totalExpense = expenses.reduce((s, b) => s + b.balance, 0);
  const netIncome    = totalRevenue - totalExpense;

  const tbody = document.getElementById('pl-tbody');
  let html = '';

  html += `<tr class="pl-section-header"><td colspan="2">収益の部</td></tr>`;
  revenues.forEach(r => {
    html += `<tr><td>${r.name}</td><td class="text-right amount">¥${r.balance.toLocaleString()}</td></tr>`;
  });
  html += `<tr class="pl-total"><td><strong>収益合計</strong></td><td class="text-right amount"><strong>¥${totalRevenue.toLocaleString()}</strong></td></tr>`;

  html += `<tr><td colspan="2" style="height:12px"></td></tr>`;

  html += `<tr class="pl-section-header"><td colspan="2">費用の部</td></tr>`;
  expenses.forEach(e => {
    html += `<tr><td>${e.name}</td><td class="text-right amount">¥${e.balance.toLocaleString()}</td></tr>`;
  });
  html += `<tr class="pl-total"><td><strong>費用合計</strong></td><td class="text-right amount"><strong>¥${totalExpense.toLocaleString()}</strong></td></tr>`;

  html += `<tr><td colspan="2" style="height:12px"></td></tr>`;
  const netClass = netIncome >= 0 ? 'balance-positive' : 'balance-negative';
  const netLabel = netIncome >= 0 ? '当期純利益' : '当期純損失';
  html += `<tr class="pl-total"><td><strong>${netLabel}</strong></td><td class="text-right amount ${netClass}"><strong>¥${Math.abs(netIncome).toLocaleString()}</strong></td></tr>`;

  tbody.innerHTML = html;
}

// ===== 勘定科目マスタ =====
function renderKanjoMaster() {
  const list  = db.getAllKanjo();
  const tbody = document.getElementById('kanjo-tbody');
  tbody.innerHTML = '';

  list.forEach(k => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${k.code}</td>
      <td>${k.name}</td>
      <td>${k.category}</td>
      <td>${k.balanceType === 'debit' ? '借方' : '貸方'}</td>
      <td style="text-align:center">
        <button class="btn-icon" onclick="editKanjo(${k.id})" title="編集">✏️</button>
        <button class="btn-icon" onclick="deleteKanjo(${k.id})" title="削除">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openKanjoModal(kanjo = null) {
  if (kanjo) {
    document.getElementById('kanjo-id').value               = kanjo.id;
    document.getElementById('input-kanjo-code').value       = kanjo.code;
    document.getElementById('input-kanjo-name').value       = kanjo.name;
    document.getElementById('input-kanjo-category').value   = kanjo.category;
    document.getElementById('input-kanjo-balance-type').value = kanjo.balanceType;
  } else {
    document.getElementById('kanjo-id').value = '';
    document.getElementById('form-kanjo').reset();
  }
  openModal('modal-kanjo');
}

function saveKanjo() {
  const code        = document.getElementById('input-kanjo-code').value.trim();
  const name        = document.getElementById('input-kanjo-name').value.trim();
  const category    = document.getElementById('input-kanjo-category').value;
  const balanceType = document.getElementById('input-kanjo-balance-type').value;

  if (!code || !name || !category) {
    showToast('必須項目を入力してください', 'error');
    return;
  }

  const idVal = document.getElementById('kanjo-id').value;
  const record = { code, name, category, balanceType };

  if (idVal) {
    db.updateKanjo(parseInt(idVal), record);
    showToast('勘定科目を更新しました', 'success');
  } else {
    db.insertKanjo(record);
    showToast('勘定科目を登録しました', 'success');
  }

  closeModal('modal-kanjo');
  renderKanjoMaster();
}

function editKanjo(id) {
  const k = db.getKanjoById(id);
  if (k) openKanjoModal(k);
}

function deleteKanjo(id) {
  if (!confirm('この勘定科目を削除しますか？\n仕訳で使用中の科目は削除しないでください。')) return;
  db.deleteKanjo(id);
  showToast('勘定科目を削除しました', 'warning');
  renderKanjoMaster();
}

// ===== CSV エクスポート =====
async function exportCSV() {
  const records = db.getAllShiwake(currentFiscalYear);
  const kanjoMap = {};
  db.getAllKanjo().forEach(k => kanjoMap[k.id] = k);

  const headers = ['No.', '日付', '借方科目', '借方金額', '貸方科目', '貸方金額', '摘要'];
  const rows = records.map((s, i) => [
    i + 1,
    s.date,
    kanjoMap[s.debitKanjoId]  ? kanjoMap[s.debitKanjoId].name  : '',
    s.debitAmount,
    kanjoMap[s.creditKanjoId] ? kanjoMap[s.creditKanjoId].name : '',
    s.creditAmount,
    `"${(s.description || '').replace(/"/g, '""')}"`
  ]);

  const bom = '\uFEFF'; // UTF-8 BOM for Excel
  const csv = bom + [headers, ...rows].map(r => r.join(',')).join('\n');

  if (window.electronAPI) {
    const result = await window.electronAPI.showSaveDialog({
      title: 'CSV出力',
      defaultPath: `仕訳帳_${currentFiscalYear}.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    });
    if (!result.canceled && result.filePath) {
      await window.electronAPI.writeFile(result.filePath, csv);
      showToast('CSVを出力しました', 'success');
    }
  } else {
    // ブラウザ環境でのフォールバック
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `仕訳帳_${currentFiscalYear}.csv`;
    a.click();
  }
}

// ===== イベントリスナー設定 =====
document.addEventListener('DOMContentLoaded', () => {
  initFiscalYear();

  // ナビゲーション
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.page));
  });

  // 仕訳帳
  document.getElementById('btn-add-shiwake').addEventListener('click', () => openShiwakeModal());
  document.getElementById('btn-filter').addEventListener('click', renderShiwake);
  document.getElementById('btn-save-shiwake').addEventListener('click', saveShiwake);

  // 総勘定元帳
  document.getElementById('sokanjo-kanjo-select').addEventListener('change', renderSokanjo);

  // 試算表
  document.getElementById('btn-refresh-shisan').addEventListener('click', renderShisan);

  // 勘定科目マスタ
  document.getElementById('btn-add-kanjo').addEventListener('click', () => openKanjoModal());
  document.getElementById('btn-save-kanjo').addEventListener('click', saveKanjo);

  // CSV出力
  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);

  // モーダル閉じる
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) modal.classList.remove('open');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) modal.classList.remove('open');
    });
  });

  // Electron メニューイベント
  if (window.electronAPI) {
    window.electronAPI.onMenuEvent((event) => {
      switch (event) {
        case 'menu-export-csv':  exportCSV(); break;
        case 'nav-shiwake':     navigateTo('shiwake'); break;
        case 'nav-sokanjo':     navigateTo('sokanjo'); break;
        case 'nav-shisan':      navigateTo('shisan'); break;
        case 'nav-taishaku':    navigateTo('taishaku'); break;
      }
    });
  }

  // 初期描画
  renderShiwake();
});
