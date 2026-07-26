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
1. Sol Rendah (5.) -> Node: `G-Object009`
2. La Rendah (6.) -> Node: `G-Object018`
3. Ti Rendah (7.) -> Node: `G-Object001`
4. Do (1) -> Node: `G-Object002`
5. Re (2) -> Node: `G-Object003`
6. Mi (3) -> Node: `G-Object004`
7. Fa (4) -> Node: `G-Object005`
8. Feast/Fis (4#) -> Node: `G-Object006`
9. Sol (5) -> Node: `G-Object007`
10. La (6) -> Node: `G-Object008`
11. Ti (7) -> Node: `G-Object010`
12. Do Tinggi (1') -> Node: `G-Object011`
13. Re Tinggi (2') -> Node: `G-Object013`
14. Mi Tinggi (3') -> Node: `G-Object012`

---

## Roadmap Development

### Phase 1: Virtual Angklung 3D (Keyboard Input)
Fokus pada simulasi 3D model agar bisa dijalankan sesuai dengan inputan keyboard tanpa memerlukan backend/hardware.
- Setup environment Three.js di Vite (Camera, Scene, WebGLRenderer, Lighting)
- Load model 14 angklung (`angklung.glb`) ke dalam browser
- Buat logic pemetaan 14 tombol keyboard (`1-9` dan `Q,W,E,R,T`) ke 14 angklung
- Buat animasi pukulan (goyang maju-mundur/rotasi) pada mesh angklung 3D ketika tombol ditekan
- Integrasi audio (14 file `.wav`) yang dimainkan secara sinkron saat angklung 3D bergerak

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

