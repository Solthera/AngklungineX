# Rangkuman Komprehensif AngklungineX: Arc-1 (PKM-KC 2025)

**Tanggal:** 19 Juli 2026  
**Status Fase:** Selesai (Completed)  
**Fokus Utama:** Pengenalan Isyarat Tangan (Hand Gesture Recognition) & Hardware Dasar 14 Nada.

---

## 1. Executive Summary
**Arc-1** adalah fase iterasi kedua dari proyek robotik angklung ITENAS (melanjutkan v1). Fokus utama pada fase ini adalah mengendalikan pukulan angklung fisik menggunakan isyarat tangan *Kodály* (Do-Re-Mi) yang dideteksi melalui webcam laptop. Sistem ini dibangun untuk kompetisi PKM-KC 2025.

Pencapaian utama Arc-1 adalah **berhasil membuktikan konsep (Proof of Concept)** bahwa AI berbasis visi komputer dapat mengendalikan instrumen fisik dengan latensi yang dapat diterima (<70ms), meskipun implementasi *software*-nya baru difinalisasi untuk 8 nada.

---

## 2. Tech Stack (Teknologi yang Digunakan)

### 🖥️ Software (PC)
*   **Bahasa Utama:** Python 3
*   **GUI Framework:** PyQt5 (dibangun dengan Qt Designer `GUI.ui`)
*   **Computer Vision:** OpenCV (untuk tangkapan webcam & manipulasi frame)
*   **Hand Tracking AI:** Google MediaPipe Hands (ekstraksi 21 *landmarks* tangan)
*   **Machine Learning (Klasifikasi):** Scikit-learn (Support Vector Machine / SVM dengan RBF Kernel + GridSearchCV)
*   **Komunikasi Serial:** PyFirmata (untuk mengontrol Arduino dari Python)
*   **Stand-alone Build:** cx_Freeze (untuk membuat `MainGUI.exe` Windows)

### ⚙️ Hardware & Aktuator
*   **Mikrokontroler:** Arduino Mega 2560
*   **Aktuator:** 14x Central Lock Mobil (Solenoid)
*   **Motor Driver:** 4x IC L293D (H-Bridge)
*   **Power Supply:** PSU 12V 30A + Step-down LM2596 (12V ke 5V untuk logic)
*   **Sensor Ekstra:** INA219 (Sensor Arus & Tegangan)
*   **Komunikasi Nirkabel (Monitoring):** ESP32 dengan protokol ESP-NOW

### 🌐 Eksperimental (Dihentikan/Ditinggalkan di Arc-1)
*   **Web Dashboard:** Laravel (PHP)
*   **IoT/Cloud:** MQTT via ESP32. **Status: Ditinggalkan** karena tidak stabil dan latensinya terlalu tinggi (50ms - 500ms).

---

## 3. Data Flow & Alur Logika (Pipeline)

Proses dari tangan manusia berpose hingga angklung berbunyi memakan waktu rata-rata **67.5 milidetik**. Berikut adalah alur pastinya:

### A. Pipeline AI & Visi Komputer (`MainGUI.py`)
1.  **Capture:** Webcam menangkap frame video pada 30fps resolusi 640x480.
2.  **Pre-processing:** OpenCV melakukan konversi BGR ke RGB dan *horizontal flip* (efek cermin agar user nyaman).
3.  **Landmark Extraction:** Frame diumpankan ke MediaPipe Hands (`min_confidence=0.5`). MediaPipe mengekstrak 21 titik koordinat (x, y, z).
4.  **Filtering:** Sistem hanya memproses data jika tangan yang terdeteksi adalah **Tangan Kanan** (`handedness == "Right"`).
5.  **Normalisasi:** 
    *   Koordinat diubah dari piksel ke koordinat absolut.
    *   Semua titik dikurangi dengan koordinat Pergelangan Tangan (Wrist) sehingga menjadi *relative coordinates*.
    *   Data di- *flatten* menjadi array 1D berisi 42 fitur (Sumbu Z dibuang).
    *   Dibagi dengan nilai absolut maksimum untuk normalisasi rentang [-1, 1].
6.  **Klasifikasi:** Array 42 fitur diproses oleh model SVM (`Model_SVM_GridSearch.pickle`).
7.  **Output AI:** SVM memprediksi 1 dari 8 kelas (*do, re, mi, fa, sol, la, si, do_*).

### B. Pipeline Hardware & Kontrol (`controller.py` & `StandardFirmata.ino`)
8.  **Serial Comm:** Hasil string dari AI (contoh: `"do"`) dikirim ke `controller.nada("do")`.
9.  **Exclusive Activation:** Python mengirim perintah via PyFirmata (baud rate 57600) untuk mematikan semua pin aktuator lain terlebih dahulu.
10. **Strike (Pukulan):** Arduino mengeksekusi siklus *push-pull* solenoid:
    *   Pin IN1 HIGH, IN2 LOW (70ms) ➔ Solenoid menonjok tabung bambu.
    *   Pin IN1 LOW, IN2 HIGH (70ms) ➔ Solenoid kembali ke posisi awal.
    *   PWM aktif pada 70/255 agar aktuator tidak cepat panas/rusak.

---

## 4. Pemetaan Hardware (Pin Mapping) Arduino Mega

Hardware Arc-1 sudah mendukung **14 nada** (meskipun GUI Python baru memakai 8). Pin PWM dikelompokkan ke A0, A1, dan A2.

| Index | Nada | PWM Pin | IN1 | IN2 |
| :---: | :--- | :---: | :---: | :---: |
| 1 | Sol Rendah (SOL1) | A0 | 46 | 48 |
| 2 | La Rendah (LA1) | A0 | 42 | 44 |
| 3 | Ti Rendah (TI1) | A0 | 38 | 40 |
| 4 | Do (DO2) | A0 | 34 | 36 |
| 5 | Re (RE2) | A0 | 30 | 32 |
| 6 | Mi (MI2) | A1 | 26 | 28 |
| 7 | Fa (FA2) | A1 | 22 | 24 |
| 8 | Fis (FIS2) | A1 | 47 | 49 |
| 9 | Sol (SOL2) | A1 | 43 | 45 |
| 10 | La (LA2) | A1 | 39 | 41 |
| 11 | Ti (TI2) | A2 | 35 | 37 |
| 12 | Do Tinggi (DO3) | A2 | 31 | 33 |
| 13 | Re Tinggi (RE3) | A2 | 27 | 29 |
| 14 | Mi Tinggi (MI3) | A2 | 23 | 25 |

---

## 5. Performa & Metrik

*   **Akurasi Pengenalan Isyarat:** **95%** (rata-rata pada kondisi cahaya ideal).
*   **Latensi End-to-End:** **~67.5 ms** (dari pose tangan hingga suara angklung terdengar).
*   **Baud Rate Serial:** 57600 bps (Firmata) / 9600 bps (Lagu Standalone).

---

## 6. Known Issues (Masalah yang Ditinggalkan untuk Arc-2)

Arc-1 meninggalkan pondasi hardware yang kuat, namun memiliki beberapa utang teknis (*technical debt*) dan masalah yang menjadi PR (Pekerjaan Rumah) untuk fase selanjutnya (Arc-2):

1.  **AI Misclassification (DO vs FA):** Model SVM sering keliru membedakan nada "Do" (kepalan tangan) dan "Fa" (jempol ke bawah) karena kemiripan bentuk (*bounding box*). Membutuhkan *dataset* baru yang lebih banyak variasinya.
2.  **Ketidakcocokan Jumlah Nada (Hardware 14 vs Software 8):** Hardware Arduino Mega sudah di- *wiring* untuk 14 nada, tetapi skrip Python GUI (`controller.py`) dan model SVM hanya dilatih untuk 8 nada dasar.
3.  **Label Kelas "Fa'" (Fa Tinggi):** Terdapat anomali pada dataset lama (`gestur_baru.names`) di mana terdapat kelas `fa'`, padahal nada tersebut tidak ada di angklung fisiknya.
4.  **Aktuator Rusak:** Saat serah terima ke Arc-2, terdapat **3 aktuator sentral lock yang rusak/macet** (butuh perbaikan mekanis).
5.  **Ketergantungan PyFirmata:** Penggunaan PyFirmata mengunci logika sistem di PC (Python). Hal ini membuat pengembangan antarmuka web murni menjadi sulit (alasan Arc-2 beralih ke Web Serial API).
6.  **Kebutuhan GridSearchCV:** Model AI belum di- *retrain* ulang dengan parameter hyper-tuning terbaik untuk keperluan laporan LIDM 2026 (script `train_model.py` masih berstatus *pending run*).

---
*Dokumen ini digenerate berdasarkan snapshot codebase AngklungineX Arc-1.*
---

## 7. Analisis Kesenjangan: Rencana Upgrade (Docs 1 & 2) vs Realita Arc-1

Dokumen spesifikasi arsitektur (Doc 1: 18 Juni 2026 dan Doc 2: 8 Juli 2026) disusun sebagai rencana *upgrade* sistem. Jika rencana di dokumen tersebut dibandingkan dengan **realita sistem yang benar-benar dibangun pada Arc-1**, terlihat jelas mengapa perombakan (upgrade) sangat dibutuhkan. Berikut adalah hal-hal "salah" atau usang pada dokumen rencana tersebut jika dikomparasi dengan codebase Arc-1:

### A. Konsep "Backend Server" vs Monolith Arc-1
*   **Di Dokumen (Doc 1 & 2):** Mengusulkan adanya sebuah *Backend Server* terpusat (Flask/FastAPI) yang melayani *client* (Web/PyQt) dan menerima data kamera via Socket/TCP.
*   **Realita Arc-1:** Arc-1 sama sekali **tidak memiliki arsitektur client-server** untuk fungsi utamanya. Sistem utamanya adalah aplikasi desktop raksasa (*monolithic*) bernama `MainGUI.py`. Modul kamera (MediaPipe), klasifikasi AI (SVM), dan pengontrol Arduino (PyFirmata) semuanya menyatu dan berjalan berdesakan di dalam satu proses lokal tersebut tanpa ada *backend API*.

### B. Mitos 14 Nada di Software
*   **Di Dokumen (Doc 1):** Sistem diasumsikan sudah atau akan langsung mengontrol 14 nada dengan *event* seperti `{"note": "C4"}`.
*   **Realita Arc-1:** Meskipun hardware Arduino sudah di- *wiring* untuk 14 aktuator, **software Python Arc-1 (GUI dan AI) hanya mendukung 8 nada dasar**. File `controller.py` hanya mendefinisikan 8 motor (do hingga do'), dan model AI lama hanya dilatih untuk 8 kelas. Rencana di dokumen melompati fakta bahwa dataset dan *controller* harus ditulis ulang secara fundamental untuk mendukung 14 nada.

### C. Komunikasi Jaringan (TCP/WebSockets) vs Kabel Langsung
*   **Di Dokumen (Doc 1 & 2):** Direncanakan menggunakan komunikasi *real-time* via WebSockets (Socket.IO) dan koneksi *Raw TCP* antar proses.
*   **Realita Arc-1:** Komunikasi Arc-1 murni menggunakan **kabel USB serial lokal** via *library* PyFirmata (baud rate 57600). Tidak ada TCP *socket* yang digunakan untuk AI kamera. Upaya menggunakan jaringan (seperti MQTT via ESP32 di folder `ArduinoWeb`) terbukti **gagal/ditinggalkan** karena latensinya mencapai 500ms, yang sangat fatal untuk instrumen musik.

### D. Kesalahpahaman Pendekatan Web (Dual Client)
*   **Di Dokumen (Doc 1):** Mengusulkan konsep "Dual Client" (Web UI + PyQt Desktop) yang berfungsi identik.
*   **Realita Arc-1:** Implementasi web di Arc-1 (`angklunginex` / Laravel) terpisah sama sekali dari GUI utama. Web di Arc-1 hanyalah prototipe *dashboard* terpisah yang tidak bisa mendeteksi isyarat tangan secara langsung, karena logika MediaPipe terkunci di dalam *environment* Python desktop.

### Kesimpulan
Spesifikasi pada Doc 1 dan Doc 2 pada dasarnya berusaha "membongkar" sistem Arc-1 yang kaku, *monolithic*, dan terbatas pada 8 nada. Dokumen-dokumen tersebut bukanlah refleksi dari apa yang sudah ada di Arc-1, melainkan **daftar keinginan (wishlist) arsitektur ideal** untuk memisahkan antara AI kamera, logika permainan, dan antarmuka pengguna yang sebelumnya tercampur aduk di satu file `MainGUI.py`.
