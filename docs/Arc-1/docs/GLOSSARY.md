# Glossary — Istilah dalam Proyek Angklungine & AngklungineX

## A

**Angklung**
Alat musik tradisional Indonesia dari bambu yang berbunyi ketika digoyangkan.
Diakui UNESCO sebagai Warisan Budaya Takbenda pada 2010.

**Angklungine (v1)**
Generasi pertama robot angklung dengan 8 nada, DC motor, dan Firmata.
Sudah discontinued.

**AngklungineX (v2)**
Generasi kedua robot angklung dengan 14 nada (hardware), Central Lock,
dan integrasi AI/Deep Learning. Hand tracking: 8 nada (dapat dikembangkan ke 14).

**Arduino Mega**
Mikrokontroler berbasis ATmega2560 dengan 54 pin digital I/O, 16 analog input,
digunakan sebagai controller utama aktuator angklung.

## C

**Central Lock**
Aktuator solenoid (push-pull) dari sistem keamanan mobil. Pada AngklungineX
dialihfungsikan sebagai pemukul tabung angklung. Lebih kuat dari DC vibration motor
yang digunakan di v1.

**CNN — Convolutional Neural Network**
Arsitektur Deep Learning untuk pemrosesan data grid (seperti gambar).
Direncanakan untuk penelitian selanjutnya (saat ini masih menggunakan SVM).

**Computer Vision**
Cabang AI yang memungkinkan komputer "melihat" dan memahami gambar/video.

**CREPE — Convolutional Representation for Pitch Estimation**
Model Deep Learning berbasis CNN untuk estimasi nada (pitch) dari sinyal audio.
State-of-the-art dengan akurasi >96%. **Belum diimplementasikan — rencana masa depan.**

## D

**Deep Learning**
Subset Machine Learning menggunakan neural network bertingkat (deep) untuk
belajar dari data dalam jumlah besar.

## E

**ESP32**
Mikrokontroler dengan WiFi + Bluetooth built-in. Pada sistem ini digunakan untuk:
1. Membaca sensor INA219 (daya) via I2C
2. ESP-NOW untuk komunikasi peer-to-peer nirkabel
3. MQTT untuk publish data sensor ke cloud (opsional)

**Catatan:** MQTT untuk kontrol nada **tidak dipakai** di proyek utama.

**ESP-NOW**
Protokol komunikasi nirkabel dari Espressif yang memungkinkan perangkat ESP
bertukar data secara langsung tanpa WiFi/router. Digunakan untuk komunikasi
sensor data di AngklungineX.

## F

**Firmata**
Protokol komunikasi serial untuk mengontrol Arduino dari PC/Laptop.
StandardFirmata.ino adalah firmware yang diupload ke Arduino.

**FFT — Fast Fourier Transform**
Algoritma untuk mengubah sinyal dari domain waktu ke domain frekuensi.
Digunakan dalam deteksi nada.

## G

**GPIO — General Purpose Input Output**
Pin pada mikrokontroler yang bisa diprogram sebagai input atau output digital.

**Gesture Recognition**
Teknologi untuk mengenali gerakan tangan/tubuh manusia menggunakan kamera
dan AI.

## H

**H-Bridge**
Rangkaian driver motor yang memungkinkan motor DC berputar dua arah
(forward/reverse). Contoh: L293D.

**HGR — Hand Gesture Recognition**
Sub-bidang Computer Vision untuk mengenali gestur tangan.

**HiveMQ**
MQTT broker publik/komerisial yang digunakan untuk percobaan komunikasi
wireless. Address: broker.hivemq.com:1883 (public) / HiveMQ Cloud (enterprise).

**Catatan:** Penggunaan MQTT untuk kontrol nada bersifat **eksperimental**.
Sistem utama menggunakan USB Serial (PyFirmata) untuk kontrol real-time.

## I

**IoT — Internet of Things**
Jaringan perangkat fisik yang terhubung ke internet dan dapat saling bertukar data.

**INA219**
Sensor arus dan tegangan dengan antarmuka I2C. Digunakan untuk memonitor
konsumsi daya sistem (tegangan & arus pada jalur 12V).

## K

**Kodaly Hand Sign**
Metode pendidikan musik yang menggunakan isyarat tangan untuk
merepresentasikan nada-nada (Do, Re, Mi, Fa, Sol, La, Si). Dikembangkan
oleh Zoltán Kodály. Pada AngklungineX digunakan sebagai input gestur utama.

**Catatan:** Sistem Kodály juga mencakup isyarat untuk nada kromatis (kres/mol)
dan pembedaan oktaf berdasarkan posisi vertikal tangan.

## L

**L293D**
Motor driver IC yang dapat mengontrol 2 motor DC per chip (4 channel per chip).
Pada AngklungineX menggunakan 4 chip L293D untuk 14 aktuator.

**Laravel**
Framework PHP untuk pengembangan web. Digunakan untuk membuat web app
AngklungineX.

**LM2596**
Module step-down (buck converter) untuk menurunkan tegangan.
Dalam sistem: 12V → 5V untuk Arduino Mega.

## M

**MediaPipe Hands**
Framework Google untuk deteksi landmark tangan real-time. Menghasilkan
21 titik landmark per tangan dalam ruang 3D (x, y, z).

**MongoDB**
Database NoSQL berbasis dokumen (BSON). Digunakan untuk menyimpan data
sesi permainan, riwayat sensor daya, dan log aktivitas.

**MQTT — Message Queuing Telemetry Transport**
Protokol messaging ringan untuk IoT. Menggunakan model publish/subscribe.

**Catatan:** Pada proyek ini MQTT bersifat **eksperimental** — hanya digunakan
untuk publish data sensor ke cloud dashboard. Kontrol nada via MQTT **tidak
digunakan** karena tidak reliable.

**MVC — Model-View-Controller**
Pola arsitektur software yang memisahkan data (model), tampilan (view),
dan logika kontrol (controller). Digunakan oleh Laravel.

## N

**Nada**
Dalam konteks ini: notasi musik solfege (Do, Re, Mi, Fa, Sol, La, Si).

## O

**OpenCV — Open Source Computer Vision Library**
Library pemrograman untuk computer vision dan image processing.

## P

**PWM — Pulse Width Modulation**
Teknik untuk mengontrol kecepatan motor atau kecerahan LED dengan
mengubah duty cycle sinyal.

**PyFirmata**
Library Python untuk berkomunikasi dengan Arduino yang menjalankan
firmware Firmata. **Primary communication method** untuk hand tracking.

**PyQt5**
Binding Python untuk framework Qt5. Digunakan untuk membuat GUI desktop.

**PKM-KC — Program Kreativitas Mahasiswa Karsa Cipta**
Program dari Belmawa Kemendikbudristek untuk mendanai proyek kreatif dan
inovatif mahasiswa Indonesia.

## S

**SVM — Support Vector Machine**
Algoritma Machine Learning untuk klasifikasi. Pada AngklungineX digunakan
dengan kernel RBF untuk mengklasifikasikan gestur tangan menjadi nada.
Akurasi: ~95%.

**Solenoid**
Aktuator elektromagnetik yang bergerak linear (push/pull). Central Lock adalah
jenis solenoid.

**Spleeter / Demucs**
Library untuk source separation — memisahkan suara instrumen/vokal dari
rekaman audio. **Belum diimplementasikan.**

## T

**Tailwind CSS**
Framework CSS utility-first untuk styling frontend. Digunakan di web app
AngklungineX.

## U

**UNESCO**
United Nations Educational, Scientific and Cultural Organization.
Mengakui angklung sebagai warisan budaya takbenda pada 2010.

## V

**Vite**
Build tool modern untuk frontend. Digunakan oleh Laravel 12 untuk
mengelola asset (CSS, JS).

## W

**Web Serial API**
API browser yang memungkinkan website berkomunikasi dengan perangkat
serial (seperti Arduino) langsung dari halaman web.

## Y

**YIN**
Algoritma estimasi pitch (nada) berbasis autokorelasi yang diperkenalkan oleh
de Cheveigné & Kawahara (2002). Standar emas untuk deteksi nada, meskipun
memiliki kelemahan pada oktaf error. **Belum diimplementasikan.**

## Angka & Simbol

**8 Nada (v1)**
Do, Re, Mi, Fa, Sol, La, Si, Do' (1 oktaf penuh)

**8 Nada (v2 Hand Tracking)**
Do, Re, Mi, Fa, Sol, La, Si, Do' (sementara, rencana diperluas ke 14)

**14 Nada (v2 Hardware)**
Sol rendah, La rendah, Ti rendah, Do, Re, Mi, Fa, Feast (Fis), Sol, La, Ti,
Do tinggi, Re tinggi, Mi tinggi (hampir 2 oktaf)

**21 Landmarks**
Jumlah titik landmark tangan yang dideteksi oleh MediaPipe Hands per tangan.

**67.5 ms**
Latensi rata-rata sistem dari gestur tangan hingga angklung berbunyi.

**<200ms**
Target latensi maksimal sistem (dari gestur → suara). **Telah terlampaui** (67.5 ms).
