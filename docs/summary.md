# Ringkasan Proyek AngklungineX

AngklungineX adalah proyek robot angklung cerdas yang bertujuan melestarikan alat musik tradisional bambu Indonesia (Angklung) dengan memadukannya dengan teknologi modern seperti AI, Computer Vision, dan Web Technologies. Proyek ini dikembangkan oleh tim mahasiswa dari Institut Teknologi Nasional Bandung (ITENAS) di bawah program I-Will.

Proyek ini memiliki tiga fase/generasi pengembangan:

## 1. Angklungine (v1) - *Dihentikan*
- **Sistem Dasar**: 8 nada (Do - Do').
- **Mekanik**: Menggunakan motor DC bergetar (*vibration motor*).
- **Kontrol**: Menggunakan Firmata yang dikontrol lewat *keyboard* komputer.
- **Tujuan**: Membuktikan konsep bahwa angklung dapat digerakkan secara otomatis dengan motor.

## 2. AngklungineX Arc-1 (v2) - *Selesai (PKM-KC 2025)*
Ini adalah lompatan besar dari v1 yang berhasil mendapatkan pendanaan PKM-KC Kemendikbudristek pada tahun 2025.
- **Perangkat Keras**: Menggunakan 14 angklung (Sol rendah hingga Mi tinggi). Motor penggerak diganti dengan aktuator *Central Lock* pintu mobil (solenoid *push-pull*) karena lebih kuat dan presisi. Dikendalikan oleh Arduino Mega 2560 dan 4 modul *driver* motor L293D. Menggunakan *Power Supply* 12V 30A.
- **Sistem AI (Hand Tracking)**: Pengguna dapat memainkan angklung hanya dengan isyarat tangan (metode *Kodály Hand Sign*). Menggunakan kamera *webcam*, Python, *MediaPipe Hands* (deteksi 21 titik tangan), dan algoritma *Machine Learning Support Vector Machine* (SVM) untuk klasifikasi gestur.
- **Performa**: Akurasi deteksi mencapai **95%** dengan latensi sistem sangat rendah yaitu **67.5 ms**.
- **Fitur Lainnya**:
  - **Auto Play**: Menyimpan 7 lagu nasional di memori Arduino untuk diputar secara otomatis.
  - **IoT Monitoring**: Dilengkapi sensor INA219 dan ESP32 untuk memonitor konsumsi daya listrik. 
  - *Catatan Penting*: Sempat mencoba kontrol nada via MQTT (internet), tetapi ditinggalkan karena lambat dan tidak stabil. Komunikasi utama menggunakan kabel USB (PyFirmata).
- **Tim Arc-1**: Rainova (Ketua), Shandy, Melvina, Yuddha, dibimbing oleh Bpk. Muhammad Ichwan, Ir., M.T.

## 3. AngklungineX Arc-2 (v3) - *Fase Aktif (Pengembangan Berjalan)*
Fase ini merupakan regenerasi dari Arc-1. Tim Arc-2 mengambil perangkat keras (14 aktuator & Arduino Mega) yang sudah sukses dibuat pada Arc-1, namun mengubah total cara memainkannya dari *PC-based desktop app* menjadi **Platform Game Berbasis Web (*Web-Based Rhythm Game*)**.

- **Arsitektur Baru**: Komputer/PC diganti dengan antarmuka berbasis Web (Browser Chrome/Edge). Berkomunikasi langsung ke Arduino melalui teknologi modern **Web Serial API**. Latensi ditargetkan turun drastis menjadi **< 50ms**. Tidak ada perantara *server*, tidak ada jeda internet.
- **3 Mode Game Utama**:
  1. **Free Play**: Layaknya *Virtual Piano*, pengguna menekan tombol nada di layar web, dan angklung fisik langsung berbunyi.
  2. **Rhythm Mode**: Mirip game *Guitar Hero*. Notasi akan jatuh dari atas layar, pemain harus menekan tombol tepat pada waktunya. Sistem skoring didasarkan pada ketepatan waktu (*Perfect, Great, Good, Miss*). Chart lagu berformat JSON.
  3. **Learning Mode**: Mode pembelajaran metode *Kodály* langkah demi langkah (dari pengenalan nada hingga membaca partitur musik) dengan panduan visual (benar/salah).
- **Visi Lanjutan**: Aplikasi web ini akan dibangun sebagai *Progressive Web App* (PWA) yang dapat diinstal layaknya aplikasi native dan dapat bekerja secara offline.
- **Tim Arc-2 (2026)**: Yuddha (Ketua - dipromosikan dari anggota junior di Arc-1), Farel, Reisya, Adinda, Fauzan.

## Konteks Lomba LIDM 2026
Proyek ini juga sedang diajukan untuk Lomba Inovasi Digital Mahasiswa (LIDM) 2026, Divisi Inovasi Teknologi Digital Pendidikan (ITDP). Terdapat dokumen draf proposal (BACKUP) yang mengangkat tema penggunaan AngklungineX sebagai solusi dari minimnya instruktur angklung dan menurunnya minat generasi digital, serta memaparkan metodologi pengembangan sistem hingga rancangan arsitektur *high-level*-nya.

## Ringkasan Fitur dan Panduan Teknis (Dalam Dokumen)
Repositori ini dirapikan dengan sangat baik. Terdapat berbagai dokumen instruksional yang dibagi per fungsi/audiens:
1. **Untuk Tim Internal (Developer)**: Ada *Deep Dive Teknis* untuk memahami kenapa SVM dipilih dibanding CNN (dataset kecil), cara motor memukul (mekanisme *push-pull* 70ms), protokol serial web, dan buku panduan memecahkan masalah sistem (*troubleshooting* dari kelistrikan hingga bug software).
2. **Untuk Pameran / Eksibisi (Public / English)**: Panduan *public speaking* dan materi presentasi singkat (termasuk *FAQ*) agar tim dapat menjelaskan cara kerja robot angklung ini secara sederhana kepada pengunjung awam dan orang asing tanpa istilah teknis yang rumit.
3. **Untuk Mentorship**: Terdapat panduan khusus untuk ketua baru (Yuddha) tentang cara memimpin anggota tim yang baru (Farel, dkk), membagi tugas sesuai keahlian, dan kurikulum *mentorship* bertahap untuk transisi dari posisi *junior* menjadi seorang *Project in Charge* (PIC).