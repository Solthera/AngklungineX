# Task: Reisya Putri Ramadhani (Wiring / Hardware)

Kamu bilang suka Wiring tapi masih perlu arahan.
Tenang, task-task ini sudah didesain bertahap (easy → medium).
Yuddha bakal damping.

---

## 🔴 PRIORITAS 1 — Diagnosa 3 Central Lock Rusak (Minggu 1)

Cari tahu kenapa 3 central lock tidak bergerak.

### Langkah 1: Visual Check
- Buka rangka angklung
- Cek secara visual: ada kabel putus? ada solder lepas? ada solenoid macet?
- Catat nomor channel/nada yang rusak

### Langkah 2: Test dengan check_sound() [bareng Yuddha]
1. Buka `Lagu_AngklungineX.ino` di Arduino IDE
2. Cari fungsi `check_sound()` (baris 400-415)
3. Di `loop()`, ganti jadi cuma `check_sound();` doang
4. Upload ke Arduino Mega
5. Dengarkan: nada mana yang bunyi, mana yang tidak
6. Catat hasilnya di kertas: | Nada | Bunyi? | Keterangan |

### Langkah 3: Test dengan Multimeter (Yuddha ajarin)
- Ukur resistansi kumparan solenoid yang rusak
  - Normal: 10-30 ohm
  - Tak terhingga (OL) = kumparan putus → ganti solenoid
- Ukur output L293D:
  - Pin enable (PWM): harus ada tegangan pas diaktifkan
  - Pin IN1/IN2: harus logic HIGH/LOW sesuai arah

### Langkah 4: Tukar Channel
- Pindah solenoid yang rusak ke channel L293D lain yang berfungsi
- Kalau pindah channel tiba-tiba jalan = L293D yang rusak
- Kalau tetep gak jalan = solenoid yang rusak

### Yang perlu dicatat:
| Nada | No Motor | Solenoid | L293D | Kabel | Kesimpulan |
|------|----------|----------|-------|-------|------------|
| ... | motorX | OK/Rusak | OK/Rusak | OK/Rusak | Ganti ... |

---

## 🟡 PRIORITAS 2 — Test Semua 14 Aktuator (Minggu 1)

Gunakan `check_sound()` atau `setup_motors()` di `controller.py` via PyFirmata.
Test satu per satu, pastikan semua 14 central lock bergerak responsif.

Buat tabel:
| Nada | Status | Catatan |
|------|--------|---------|
| Sol Rendah | ✅/❌ | |
| La Rendah | ✅/❌ | |
| ... | ... | ... |

---

## 🟢 PRIORITAS 3 — Dokumentasi Wiring Diagram (Minggu 2)

Buat dokumentasi yang bisa dipahami anggota lain:
1. Foto kondisi terkini (rapihkan dulu)
2. Buat diagram sederhana:
   - Arduino Mega pin X → L293D #1 pin Y
   - L293D #1 output → Central Lock nada Z
   - Power supply 12V → L293D VCC
   - Power supply → LM2596 → Arduino VIN
3. Simpan di folder `Arc-2\reference\wiring_diagram\`

Gunakan aplikasi: draw.io (gratis), PowerPoint, atau foto pake HP terus dikasih label di Canva.

---

## Tips & Arahan

- **Jangan takut salah.** Wiring paling bahaya itu korslet, jadi pastikan matikan power sebelum pegang-pegang kabel.
- **Tanya Yuddha** kalau nemu hal aneh.
- **Prioritas:** yang penting 3 rusak itu ketemu penyebabnya. Dokumentasi bisa nanti.
