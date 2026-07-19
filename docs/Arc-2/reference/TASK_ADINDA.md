# Task: Adinda Candra Putri (Arduino / Firmware)

Dari jurusan SI dan baru belajar C di kampus — **ini perfect untuk tugas kamu!**
Kodingan Arduino pake bahasa C dasar, kok. Gak perlu web, gak perlu OOP.

Kamu bakal bikin **firmware serial untuk Arduino Mega**.
Nanti dikerjakan bareng Yuddha.

---

## 🔴 PRIORITAS 1 — Pelajari Kode Arduino yang Ada (Minggu 1)

### Buka file ini:
`C:\Itenas\IWill\AngklungineX\Arc-1\Arduino\Lagu_AngklungineX\Lagu_AngklungineX.ino`

### Yang perlu dipahami:
1. **Pin mapping** (baris 1-30) — lihat cara setiap motor didefinisikan sebagai array 3 pin: `[PWM, IN1, IN2]`
2. **Fungsi `mainkanNada()`** (baris 59-79) — logika mengaktifkan motor: HIGH 70ms → LOW 70ms → mati
3. **Fungsi `setup()`** (baris 37-56) — `pinMode()` untuk semua pin motor
4. **Fungsi `check_sound()`** (baris 400-415) — tes semua nada satu per satu

### Catatan waktu belajar:
- Jangan pusing sama semua lagu (abaikan dulu fungsi `baitsatu()` dkk)
- Fokus ke 3 fungsi di atas aja: `mainkanNada()`, `setup()`, dan struktur pin

### Kalau ada istilah asing, tanya Yuddha:
- `digitalWrite(pin, HIGH)` — ngirim sinyal ON
- `pinMode(pin, OUTPUT)` — set pin sebagai output
- `millis()` — timer internal Arduino
- `Serial.read()` — baca data dari USB

---

## 🔴 PRIORITAS 2 — Buat Firmware Arc-2 (Minggu 1-2)

### Apa itu Firmware Arc-2?

Biasanya (di Arc-1) Arduino pake **PyFirmata**: Python ngirim perintah → Firmata protocol → Arduino gerakin motor.
Sekarang (Arc-2) kita mau bikin firmware custom yang lebih sederhana dan cepat:

```
Browser (Web Serial API) → "SOL1_ON\n" → Arduino → Parse → Aktifkan motor
```

**Konsep:** Arduino dengerin serial USB, kalau dapet command `"SOL1_ON"` dia aktifin motor Sol Rendah.
Kalau dapet `"DO2_OFF"` dia matiin motor Do.

### Cara kerja firmware:
```
void loop() {
    if (Serial.available() > 0) {
        String cmd = Serial.readStringUntil('\n');
        if (cmd == "SOL1_ON")  aktifkanMotor(solRendah);
        if (cmd == "SOL1_OFF") matikanMotor(solRendah);
        // ... untuk semua 14 nada
    }
}
```

### Yang harus kamu buat:
1. Baca template yang sudah disiapkan di `Arc-2\reference\arduino_firmware_arc2\angklunginex_serial.ino`
2. Ketik ulang di Arduino IDE (biar sambil belajar) atau langsung edit file template
3. Tanya Yuddha kalau ada yang gak dimengerti
4. Upload ke Arduino, test via Serial Monitor

### Testing:
1. Upload firmware ke Arduino
2. Buka Serial Monitor (baud: 115200)
3. Ketik: `SOL1_ON` lalu Enter → motor Sol harus bergerak
4. Ketik: `SOL1_OFF` lalu Enter → motor Sol berhenti
5. Test semua 14 nada

---

## 🟡 PRIORITAS 3 — Test Firmware (Minggu 2)

Pasang Arduino ke rangka asli (bareng Yuddha).
Kirim command satu per satu, pastikan semua central lock ON/OFF sesuai perintah.

Kalau ada yang error, debug bareng Yuddha.

---

## Glosarium Singkat

| Istilah | Arti |
|---------|------|
| `Serial.begin(115200)` | Mulai komunikasi USB dengan kecepatan 115200 baud |
| `Serial.available()` | Cek apakah ada data masuk |
| `Serial.readStringUntil('\n')` | Baca perintah sampai tanda enter |
| `pinMode(pin, OUTPUT)` | Set pin sebagai output |
| `digitalWrite(pin, HIGH)` | Keluarkan tegangan 5V di pin |
| `digitalWrite(pin, LOW)` | Matikan tegangan di pin |
| `delay(ms)` | Jeda dalam milidetik |
| Array `motor[3]` | Tiga pin: [PWM, IN1, IN2] untuk satu motor |

---

Jangan khawatir kalau masih bingung. Yuddha bakal jelasin pelan-pelan.
Goal kamu: **bisa upload firmware dan ngeliat motornya gerak.** Kalau udah sampe situ, berarti sukses! 🎉
