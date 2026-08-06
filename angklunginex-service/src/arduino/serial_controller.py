"""Serial controller: kirim not gesture ke Arduino Mega 2560.

Hanover mapping label model -> command Arduino. Models klasifikasi pakai label
short (do', mi', ti_bawah), Arduino pakai nama produk (do_atas, mi_atas, si_bawah).
"""
import os
import time

import serial

# Map label model -> command yang dipahami Arduino (lihat arduino/*.ino)
LABEL_MAP = {
    "do":         "do",
    "do'":        "do_atas",
    "re":         "re",
    "re'":        "re_atas",
    "mi":         "mi",
    "mi'":        "mi_atas",
    "fa":         "fa",
    "fa#":        "fa#",
    "sol":        "sol",
    "sol_bawah":  "sol_bawah",
    "la":         "la",
    "la_bawah":   "la_bawah",
    "ti":         "ti",
    "ti_bawah":   "ti_bawah",
}

NOTE_ORDER = ["do", "re", "mi", "fa", "sol", "la", "ti", "do_atas",
              "re_atas", "mi_atas", "fa#", "sol_bawah", "la_bawah", "ti_bawah"]


def find_port():
    """Deteksi port Arduino/Mega secara otomatis."""
    if os.path.exists("com_port.txt"):
        with open("com_port.txt") as f:
            p = f.read().strip()
            if p:
                return p
    try:
        import serial.tools.list_ports
        for port in serial.tools.list_ports.comports():
            if "Arduino" in port.description or "Mega" in port.description:
                return port.device
    except ImportError:
        pass
    return None


class ArduinoSender:
    """Bungkus koneksi serial + debounce kirim notasi ke Arduino."""

    def __init__(self, port=None, baud=9600, debounce_ms=300):
        self.port = port or find_port()
        self.ser = None
        self.debounce_ms = debounce_ms
        self.last_note = ""
        self.last_time = 0
        self._connect()

    def _connect(self):
        if not self.port:
            print("Port serial tidak ditemukan (baris) skip Arduino.")
            return
        try:
            self.ser = serial.Serial(self.port, baud, timeout=1)
            time.sleep(2)
            self.ser.reset_input_buffer()
            print(f"Serial terhubung: {self.port}")
        except Exception as e:
            print(f"Gagal buka serial {self.port}: {e}")
            self.ser = None

    @property
    def connected(self):
        return self.ser is not None and self.ser.is_open

    def map_label(self, label):
        """Terjemahkan label model -> command Arduino. None kalau tak dikenal."""
        if label in ("Tidak ada tangan", ""):
            return None
        if label in ("none",):
            return label  # perintah stop langsung
        return LABEL_MAP.get(label)

    def send(self, label):
        """Kirim nota kalo label baru atau lewat debounce. Skip bila Arduino mati."""
        if not self.connected:
            return False
        cmd = self.map_label(label)
        if cmd is None:
            return False

        now = int(time.time() * 1000)
        if cmd == self.last_note and (now - self.last_time) < self.debounce_ms:
            return False

        try:
            self.ser.write((cmd + "\n").encode())
            self.ser.flush()
            self.last_note = cmd
            self.last_time = now
            print(f"Kirim-> Arduino: {cmd}")
            return True
        except Exception as e:
            print(f"Gagal kirim serial: {e}")
            return False

    def close(self):
        if self.ser and self.ser.is_open:
            self.ser.close()