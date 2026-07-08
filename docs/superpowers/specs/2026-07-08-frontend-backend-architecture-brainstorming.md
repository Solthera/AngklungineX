# Brainstorming Arsitektur Backend & Frontend AngklungineX

**Tanggal:** 8 Juli 2026
**Status:** Dalam Diskusi (Belum Final)

## Konteks Proyek
Upgrade sistem AngklungineX (angklung digital interaktif via kamera & Arduino) menjadi 14 nada dengan 3 mode:
1. **Free Play**: Bermain bebas (kamera + visual guide).
2. **Challenge Mode**: Rhythm game ala Guitar Hero (falling notes).
3. **Learn Mode**: Tutorial interaktif animasi hand sign.
Kebutuhan visual: Menampilkan feed kamera, animasi pergerakan 14 angklung secara real-time, dan falling notes.

## Keputusan Backend (Disetujui)
*   **Bahasa:** Python (melanjutkan basis sistem ARC-01 dan ekosistem Machine Learning).
*   **Framework:** Beralih dari Flask ke **FastAPI**.
*   **Alasan:** FastAPI menawarkan performa tinggi, native async (sangat cocok untuk WebSockets/TCP Server), dan desain API yang lebih modern/bersih dibandingkan rendering HTML bawaan Flask.

## Tantangan Frontend
Frontend membutuhkan:
1. UI/UX yang modern dan cantik (biasanya mudah dicapai dengan Web/React/HTML/CSS).
2. Performa latensi rendah dan presisi rendering 60fps untuk Challenge Mode (Game Ritme).
3. Efisiensi penanganan aliran video (camera feed) real-time tanpa membebani sistem.

*Trade-off* klasik: Aplikasi Web murni memberikan UI cantik tetapi rentan masalah latensi/performa game loop. Aplikasi Desktop Python (PyQt/OpenCV) memberikan performa/akses hardware bagus tetapi sulit membuat UI yang estetik.

## Rekomendasi Pendekatan (Opsi Arsitektur Frontend)
Untuk menjembatani kebutuhan UI yang estetis dan performa game yang presisi, terdapat 2 rekomendasi arsitektur "Hybrid":

### Opsi A: "The Game Dev Route" (Rekomendasi Utama)
*   **Backend:** Python (FastAPI + OpenCV untuk deteksi hand sign headless).
*   **Frontend:** **Godot Engine**.
*   **Cara Kerja:** Godot bertugas penuh merender UI, animasi angklung, dan logika Challenge Mode. Kamera diakses secara native untuk visual, sementara Python OpenCV mengekstrak koordinat tangan dan mengirimkannya via TCP/WebSocket ke Godot.
*   **Kelebihan:** 
    * Game engine (Godot) dirancang khusus untuk rendering 60fps, game loop presisi (sangat butuh untuk Challenge Mode), dan animasi yang mulus.
    * Godot memiliki sistem UI yang sangat *capable* untuk desain cantik.
    * Menggunakan GDScript yang sintaksnya sangat mirip Python (ramah untuk tim).

### Opsi B: "The Modern Desktop Route"
*   **Backend:** Python (FastAPI + OpenCV).
*   **Frontend:** **Tauri / Electron + Web UI (React/Vue/HTML)**.
*   **Cara Kerja:** Mempertahankan keahlian Web Development tim. UI dibungkus menjadi aplikasi desktop. Untuk memastikan performa animasi Challenge Mode tidak laggy, area permainan tidak menggunakan elemen DOM biasa, melainkan digambar menggunakan HTML5 `<canvas>` (misal dengan PixiJS).
*   **Kelebihan:**
    * Tim tetap berada di ekosistem Web (CSS/JS) yang sudah mereka kuasai.
    * Karena berupa Desktop App (Tauri/Electron), frontend bisa mengakses *webcam stream* secara native (`getUserMedia`) tanpa perlu backend melakukan *video streaming* yang berat.

## Tindakan Selanjutnya
1. Tim perlu mengevaluasi kapabilitas dan kesediaan belajar (terutama jika mempertimbangkan Opsi A / Godot).
2. Memilih salah satu opsi arsitektur final sebelum memulai desain rinci (Mockup/UI flow).
