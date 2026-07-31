const FreeMode = {
  notes: [
    { id: 'sol1', label: 'Sol', name: 'Rendah',   serial: 'SOL1', octave: 'low' },
    { id: 'la1',  label: 'La',  name: 'Rendah',   serial: 'LA1',  octave: 'low' },
    { id: 'ti1',  label: 'Ti',  name: 'Rendah',   serial: 'TI1',  octave: 'low' },
    { id: 'do2',  label: 'Do',  name: '',          serial: 'DO2',  octave: 'mid' },
    { id: 're2',  label: 'Re',  name: '',          serial: 'RE2',  octave: 'mid' },
    { id: 'mi2',  label: 'Mi',  name: '',          serial: 'MI2',  octave: 'mid' },
    { id: 'fa2',  label: 'Fa',  name: '',          serial: 'FA2',  octave: 'mid' },
    { id: 'fis2', label: 'Fis', name: '',          serial: 'FIS2', octave: 'mid' },
    { id: 'sol2', label: 'Sol', name: '',          serial: 'SOL2', octave: 'mid' },
    { id: 'la2',  label: 'La',  name: '',          serial: 'LA2',  octave: 'mid' },
    { id: 'ti2',  label: 'Ti',  name: '',          serial: 'TI2',  octave: 'mid' },
    { id: 'do3',  label: 'Do',  name: 'Tinggi',    serial: 'DO3',  octave: 'high' },
    { id: 're3',  label: 'Re',  name: 'Tinggi',    serial: 'RE3',  octave: 'high' },
    { id: 'mi3',  label: 'Mi',  name: 'Tinggi',    serial: 'MI3',  octave: 'high' },
  ],

  activeNotes: new Set(),
  keyMap: {},

  init() {
    const container = document.getElementById('piano-keys');
    if (!container) return;

    const rows = [
      this.notes.filter(n => n.octave === 'low'),
      this.notes.filter(n => n.octave === 'mid'),
      this.notes.filter(n => n.octave === 'high'),
    ];

    rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'note-row';

      row.forEach(note => {
        const key = document.createElement('div');
        key.className = `note-key octave-${note.octave}`;
        key.dataset.serial = note.serial;
        key.innerHTML = `
          <span class="note-label">${note.label}</span>
          <span class="note-name">${note.name}</span>
        `;

        key.addEventListener('mousedown', () => this.press(note.serial, key));
        key.addEventListener('mouseup', () => this.release(note.serial, key));
        key.addEventListener('mouseleave', () => this.release(note.serial, key));

        key.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.press(note.serial, key);
        });
        key.addEventListener('touchend', (e) => {
          e.preventDefault();
          this.release(note.serial, key);
        });

        this.keyMap[note.serial] = key;
        rowDiv.appendChild(key);
      });

      container.appendChild(rowDiv);
    });
  },

  press(serial, keyElement) {
    if (this.activeNotes.has(serial)) return;
    this.activeNotes.add(serial);
    keyElement.classList.add('pressed', 'active');
    Serial.send(serial + '_ON');
  },

  release(serial, keyElement) {
    if (!this.activeNotes.has(serial)) return;
    this.activeNotes.delete(serial);
    keyElement.classList.remove('pressed', 'active');
    Serial.send(serial + '_OFF');
  },

  pressBySerial(serial) {
    const key = this.keyMap[serial];
    if (key) this.press(serial, key);
  },

  releaseBySerial(serial) {
    const key = this.keyMap[serial];
    if (key) this.release(serial, key);
  },
};