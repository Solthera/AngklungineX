/*
 * AngklungineX Arc-2 — Web Serial API Wrapper
 *
 * Functions:
 *   Serial.connect()       — request port + open
 *   Serial.disconnect()    — close port
 *   Serial.send(cmd)       — send command ("SOL1_ON", "DO2_OFF", etc)
 *   Serial.isConnected()   — boolean
 *   Serial.onOpen          — callback
 *   Serial.onClose         — callback
 *   Serial.onError         — callback
 */

const Serial = {
  port: null,
  reader: null,
  writer: null,
  isConnected: false,

  onOpen: null,
  onClose: null,
  onError: null,

  async connect() {
    try {
      // Request port
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      // Setup streams
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();

      this.isConnected = true;
      if (this.onOpen) this.onOpen();

      // Start reading responses (background)
      this._readLoop();
    } catch (err) {
      console.error('Serial connect error:', err);
      if (this.onError) this.onError(err);
    }
  },

  async disconnect() {
    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
      if (this.writer) {
        this.writer.releaseLock();
        this.writer = null;
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      this.isConnected = false;
      if (this.onClose) this.onClose();
    } catch (err) {
      console.error('Serial disconnect error:', err);
    }
  },

  async send(command) {
    if (!this.writer) {
      console.warn('Serial not connected');
      return;
    }
    const data = command + '\n';
    try {
      await this.writer.write(new TextEncoder().encode(data));
    } catch (err) {
      console.error('Serial send error:', err);
      if (this.onError) this.onError(err);
    }
  },

  async _readLoop() {
    try {
      while (this.reader) {
        const { value, done } = await this.reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        console.log('Arduino:', text.trim());
      }
    } catch (err) {
      if (err.name !== 'CancelError') {
        console.error('Serial read error:', err);
      }
    }
  }
};
