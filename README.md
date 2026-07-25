# AngklungineX 3D & Camera Tracking Project

Ini adalah project pengembangan virtual angklung 3D untuk AngklungineX Arc-2. Terdapat 14 angklung yang dapat digerakkan melalui input keyboard dan camera tracking dengan Kodaly handsign + beberapa sign custom.

## Lokasi File
- 3D model: `/angklunginex-app/public/models` (angklung.glb)
- Frontend: `/angklunginex-app/` (Vite, React, TypeScript, Three.js)
- Backend: `/angklunginex-service/` (Python, MediaPipe)

## Tech Stack
- **Camera Tracking**: Python, MediaPipe
- **Backend**: Python (mengirim data tracking ke frontend)
- **Frontend**: Vite, React Router, TypeScript, Three.js (menampilkan 14 angklung 3D)

## Pemetaan 14 Nada (Sesuai Arc-1)
Sistem ini menggunakan 14 nada diatonis sesuai dengan hardware AngklungineX Arc-1:
1. Sol Rendah (5.)
2. La Rendah (6.)
3. Ti Rendah (7.)
4. Do (1)
5. Re (2)
6. Mi (3)
7. Fa (4)
8. Feast/Fis (4#)
9. Sol (5)
10. La (6)
11. Ti (7)
12. Do Tinggi (1')
13. Re Tinggi (2')
14. Mi Tinggi (3')

---

## Roadmap Development

### Phase 1: Virtual Angklung 3D (Keyboard Input)
Fokus pada simulasi 3D model agar bisa dijalankan sesuai dengan inputan keyboard tanpa memerlukan backend/hardware.
- Setup environment Three.js di Vite (Camera, Scene, WebGLRenderer, Lighting)
- Load model 14 angklung (`angklung.glb`) ke dalam browser
- Buat logic pemetaan 14 tombol keyboard (`1-9` dan `Q,W,E,R,T`) ke 14 angklung
- Buat animasi pukulan (goyang maju-mundur/rotasi) pada mesh angklung 3D ketika tombol ditekan

### Phase 2: Integrasi Camera Tracking (Backend Python)
Membuat feature baru agar 3D angklung bisa menerima inputan dari camera tracking secara *real-time*.
**Requirement:**
- Camera tracking dengan MediaPipe sudah berjalan baik di backend (mendeteksi Kodaly handsign)
- Backend sudah bisa mengirimkan data klasifikasi nada (misal via WebSocket) ke frontend
- Frontend mendengarkan event dari backend dan men-trigger animasi angklung 3D yang sesuai

### Phase 3: Hardware Integration (Web Serial API)
Implementasi dengan angklung sungguhan (AngklungineX Arc-2), menghubungkan web frontend langsung ke Arduino Mega tanpa perantara.
- Menambahkan Web Serial API (`navigator.serial`) ke frontend
- Mengirimkan *byte command* dari frontend ke Arduino setiap kali angklung 3D berbunyi/digerakkan
- Memastikan latensi < 50ms antara gesture/keyboard -> web -> hardware

