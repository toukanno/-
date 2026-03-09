type LedgerEntry = {
  id: number;
  date: string;
  account: string;
  description: string;
  amount: number;
  createdAt: string;
};

declare global {
  interface Window {
    ledgerApi: {
      list: () => Promise<LedgerEntry[]>;
      add: (entry: Omit<LedgerEntry, 'id' | 'createdAt'>) => Promise<{ id: number }>;
    };
  }
}

const form = document.querySelector<HTMLFormElement>('#entry-form');
const tbody = document.querySelector<HTMLTableSectionElement>('#entry-table-body');
const totalEl = document.querySelector<HTMLSpanElement>('#total-amount');

async function refreshEntries(): Promise<void> {
  if (!tbody || !totalEl) return;

  const entries = await window.ledgerApi.list();
  tbody.innerHTML = entries
    .map(
      (entry) => `
      <tr>
        <td>${entry.date}</td>
        <td>${entry.account}</td>
        <td>${entry.description}</td>
        <td class="amount">${entry.amount.toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const total = entries.reduce((acc, curr) => acc + curr.amount, 0);
  totalEl.textContent = total.toLocaleString();
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const date = (document.querySelector<HTMLInputElement>('#date')?.value || '').trim();
  const account = (document.querySelector<HTMLInputElement>('#account')?.value || '').trim();
  const description = (document.querySelector<HTMLInputElement>('#description')?.value || '').trim();
  const amount = Number(document.querySelector<HTMLInputElement>('#amount')?.value || 0);

  if (!date || !account || !description || Number.isNaN(amount)) return;

  await window.ledgerApi.add({ date, account, description, amount });
  form.reset();
  await refreshEntries();
});

void refreshEntries();
