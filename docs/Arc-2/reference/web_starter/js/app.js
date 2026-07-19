/*
 * AngklungineX Arc-2 — Main App
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Serial Connection UI ---
  const btnConnect = document.getElementById('btn-connect');
  const statusText = document.getElementById('status-text');

  Serial.onOpen = () => {
    btnConnect.textContent = '🔌 Disconnect';
    btnConnect.classList.add('connected');
    statusText.textContent = 'Connected';
    statusText.style.color = '#2ecc71';
  };

  Serial.onClose = () => {
    btnConnect.textContent = '🔌 Connect';
    btnConnect.classList.remove('connected');
    statusText.textContent = 'Disconnected';
    statusText.style.color = '#888';
  };

  btnConnect.addEventListener('click', async () => {
    if (Serial.isConnected) {
      await Serial.disconnect();
    } else {
      await Serial.connect();
    }
  });

  // --- Mode Navigation ---
  const modeBtns = document.querySelectorAll('.mode-btn');
  const views = {
    freemode: document.getElementById('view-freemode'),
    rhythm: document.getElementById('view-rhythm'),
    learning: document.getElementById('view-learning'),
  };

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;

      // Update active button
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show corresponding view
      Object.entries(views).forEach(([key, view]) => {
        view.classList.toggle('active', key === mode);
      });
    });
  });

  // --- Init Free Play ---
  FreeMode.init();
});
