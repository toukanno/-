const buttons = document.querySelectorAll('.mode-btn');
const resetBtn = document.getElementById('resetBtn');
const status = document.getElementById('status');

let activeMode = null;

async function sendMessage(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  return chrome.tabs.sendMessage(tab.id, message);
}

buttons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const mode = btn.dataset.mode;

    if (activeMode === mode) {
      // Toggle off
      btn.classList.remove('active');
      activeMode = null;
      status.textContent = 'Click a mode to visualize';
      await sendMessage({ action: 'deactivate', mode });
    } else {
      // Deactivate previous
      buttons.forEach(b => b.classList.remove('active'));
      if (activeMode) {
        await sendMessage({ action: 'deactivate', mode: activeMode });
      }
      // Activate new
      btn.classList.add('active');
      activeMode = mode;
      status.textContent = `${btn.textContent.trim()} mode active`;
      await sendMessage({ action: 'activate', mode });
    }
  });
});

resetBtn.addEventListener('click', async () => {
  buttons.forEach(b => b.classList.remove('active'));
  activeMode = null;
  status.textContent = 'All visualizations cleared';
  await sendMessage({ action: 'reset' });
});
