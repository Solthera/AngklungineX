const CameraController = {
  active: false,
  model: null,
  gestureMap: null,

  webcam: null,
  canvas: null,
  ctx: null,
  video: null,

  currentGesture: null,
  onGesture: null,

  async init() {
    const resp = await fetch('assets/models/svm_model.json');
    this.model = await resp.json();
    this.gestureMap = {
      'sol_bawah': 'SOL1', 'la_bawah': 'LA1', 'ti_bawah': 'TI1',
      'do': 'DO2', 're': 'RE2', 'mi': 'MI2', 'fa': 'FA2',
      'fa#': 'FIS2', 'sol': 'SOL2', 'la': 'LA2', 'ti': 'TI2',
      "do'": 'DO3', "re'": 'RE3', "mi'": 'MI3',
    };
  },

  async start(videoEl, canvasEl) {
    if (this.active) return;
    if (!this.model) await this.init();

    this.video = videoEl;
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');

    this.webcam = new Camera(videoEl, {
      onFrame: () => this._processFrame(),
      width: 640,
      height: 480,
    });
    await this.webcam.start();

    this.hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    this.hands.onResults((results) => this._onResults(results));

    this.active = true;
  },

  stop() {
    if (!this.active) return;
    if (this.webcam) this.webcam.stop();
    this.hands = null;
    this.active = false;
    this.currentGesture = null;
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  async _processFrame() {
    if (this.hands && this.video.readyState >= 2) {
      await this.hands.send({ image: this.video });
    }
  },

  _onResults(results) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i].classification[0].label;

        if (handedness === 'Right') {
          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#e94560', lineWidth: 2 });
          for (const lm of landmarks) {
            const x = lm.x * this.canvas.width;
            const y = lm.y * this.canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
          }

          const preprocessed = this._preprocess(landmarks);
          const predicted = this._classify(preprocessed);
          const serial = this.gestureMap[predicted] || null;

          if (serial && serial !== this.currentGesture) {
            this.currentGesture = serial;
            if (this.onGesture) this.onGesture(serial);
          } else if (!serial && this.currentGesture) {
            this.currentGesture = null;
            if (this.onGesture) this.onGesture(null);
          }

          if (predicted) {
            ctx.font = 'bold 18px sans-serif';
            ctx.fillStyle = '#e94560';
            ctx.textAlign = 'center';
            ctx.fillText(predicted, this.canvas.width / 2, 30);
          }
        }
      }
    } else {
      if (this.currentGesture) {
        this.currentGesture = null;
        if (this.onGesture) this.onGesture(null);
      }
    }
  },

  _preprocess(landmarks) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const list = landmarks.map(lm => [lm.x * w, lm.y * h]);
    const baseX = list[0][0];
    const baseY = list[0][1];
    const relative = list.map(p => [p[0] - baseX, p[1] - baseY]);
    const flat = relative.flat();
    const maxVal = Math.max(...flat.map(Math.abs), 1e-8);
    return flat.map(v => v / maxVal);
  },

  _classify(features) {
    const { support_vectors, dual_coef, intercept, gamma, classes, n_classes } = this.model;
    const nSV = support_vectors.length;
    const nPairs = n_classes * (n_classes - 1) / 2;

    const votes = new Array(n_classes).fill(0);

    let pairIdx = 0;
    for (let i = 0; i < n_classes - 1; i++) {
      for (let j = i + 1; j < n_classes; j++) {
        let decision = intercept[pairIdx];
        const coefs = dual_coef[pairIdx];
        for (let k = 0; k < nSV; k++) {
          if (Math.abs(coefs[k]) > 1e-10) {
            decision += coefs[k] * this._rbfKernel(features, support_vectors[k], gamma);
          }
        }
        if (decision > 0) votes[i]++; else votes[j]++;
        pairIdx++;
      }
    }

    let bestIdx = 0;
    let bestVotes = votes[0];
    for (let i = 1; i < n_classes; i++) {
      if (votes[i] > bestVotes) { bestVotes = votes[i]; bestIdx = i; }
    }

    return classes[bestIdx];
  },

  _rbfKernel(x, y, gamma) {
    let sum = 0;
    for (let i = 0; i < x.length; i++) {
      const d = x[i] - y[i];
      sum += d * d;
    }
    return Math.exp(-gamma * sum);
  },
};