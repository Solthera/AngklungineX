document.addEventListener('DOMContentLoaded', () => {
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

  const modeBtns = document.querySelectorAll('.mode-btn');
  const views = {
    freemode: document.getElementById('view-freemode'),
    rhythm: document.getElementById('view-rhythm'),
    learning: document.getElementById('view-learning'),
  };

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.entries(views).forEach(([key, view]) => {
        view.classList.toggle('active', key === mode);
      });
    });
  });

  FreeMode.init();

  // --- Camera Toggle ---
  const btnCamera = document.getElementById('btn-camera');
  const cameraOverlay = document.getElementById('camera-overlay');
  const cameraVideo = document.getElementById('camera-video');
  const cameraCanvas = document.getElementById('camera-canvas');

  let cameraActive = false;

  CameraController.onGesture = (serial) => {
    if (!serial) return;
    FreeMode.pressBySerial(serial);
    setTimeout(() => FreeMode.releaseBySerial(serial), 300);
  };

  btnCamera.addEventListener('click', async () => {
    if (cameraActive) {
      CameraController.stop();
      cameraOverlay.classList.add('hidden');
      btnCamera.textContent = '📷 Camera';
      cameraActive = false;
    } else {
      cameraOverlay.classList.remove('hidden');
      cameraCanvas.width = 640;
      cameraCanvas.height = 480;
      btnCamera.textContent = '⏳ Loading...';
      try {
        await CameraController.start(cameraVideo, cameraCanvas);
        btnCamera.textContent = '📷 Stop';
        cameraActive = true;
      } catch (err) {
        console.error('Camera start failed:', err);
        btnCamera.textContent = '📷 Camera';
        cameraOverlay.classList.add('hidden');
      }
    }
  });
});