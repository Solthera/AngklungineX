# AngklungineX Keyboard Integration Design

**Goal:** Mengimplementasikan simulasi 3D Angklung di mana 14 model angklung bereaksi (goyang) secara real-time terhadap input keyboard pengguna.

## Architecture & Components

Akan ada dua bagian utama dalam integrasi ini: Manajemen State (Custom Hook) dan Komponen Visual (Model 3D).

### 1. Custom Hook: `useKeyboardAngklung`
Bertanggung jawab menangkap event dari browser dan memetakannya menjadi *state* yang bisa dikonsumsi oleh komponen 3D.
- **Data Structure:** Menggunakan `Set<string>` (atau array) untuk menyimpan ID node (`G-Object...`) yang tombolnya sedang ditekan. Ini memungkinkan lebih dari satu angklung berbunyi bersamaan (polifoni).
- **Event Listeners:** Memasang `window.addEventListener` untuk `keydown` dan `keyup`.
- **Note Mapping:** 
  - `Q` -> `G-Object009` (Sol Rendah / 5.)
  - `W` -> `G-Object018` (La Rendah / 6.)
  - `E` -> `G-Object001` (Ti Rendah / 7.)
  - `R` -> `G-Object002` (Do / 1)
  - `T` -> `G-Object003` (Re / 2)
  - `1` -> `G-Object004` (Mi / 3)
  - `2` -> `G-Object005` (Fa / 4)
  - `3` -> `G-Object006` (Fis / 4#)
  - `4` -> `G-Object007` (Sol / 5)
  - `5` -> `G-Object008` (La / 6)
  - `6` -> `G-Object010` (Ti / 7)
  - `7` -> `G-Object011` (Do Tinggi / 1')
  - `8` -> `G-Object013` (Re Tinggi / 2')
  - `9` -> `G-Object012` (Mi Tinggi / 3')

### 2. Komponen 3D: `AngklungModel.tsx`
Komponen ini adalah hasil *auto-generate* dari `gltfjsx` yang kita modifikasi untuk menerima *props* dan menjalankan animasi.
- **Props:** Menerima `activeNotes: Set<string>` dari parent.
- **References (`useRef`):** Harus membuat *ref* ke-14 grup angklung (`<group name="G-Object...">`) agar Three.js bisa memanipulasi rotasi mereka secara langsung tanpa men-trigger *re-render* React secara penuh (untuk performa).
- **Game Loop (`useFrame`):** Di dalam game loop (60fps), kita melakukan iterasi ke-14 *ref* angklung tersebut.
  - Jika node name ada di dalam `activeNotes`, rotasi Z-nya dimodifikasi dengan fungsi sinusoidal: `Math.sin(state.clock.elapsedTime * SPEED) * INTENSITY`.
  - Jika tidak ada, fungsi Math.lerp digunakan untuk mengembalikan rotasi Z ke `0` (diam) secara perlahan/halus.

### 3. Page Integration: `FreePlay.tsx`
Halaman ini bertindak sebagai *Controller*.
- Memanggil `const activeNotes = useKeyboardAngklung()`.
- Merender `<Canvas>` dari `@react-three/fiber`.
- Memasukkan `<AngklungModel activeNotes={activeNotes} />` ke dalam Canvas.
- Menyediakan UI sederhana (panduan tombol) di atas kanvas 3D.

## Error Handling
- Jika tombol selain 14 tombol di atas ditekan, abaikan saja.
- Pastikan mematikan (remove) event listener saat komponen *unmount* agar tidak *memory leak*.

## Global Constraints
- Tidak ada `git commit` otomatis oleh AI agen.
- Menggunakan TypeScript (`.ts` / `.tsx`).
- Modifikasi animasi harus dilakukan di dalam `useFrame` secara mutatif (mengubah properti `.current.rotation`), BUKAN dengan React State yang me-re-render seluruh komponen 3D (demi menjaga 60fps).
