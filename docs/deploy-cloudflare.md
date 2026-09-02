# Deploy — Cloudflare Pages + Cloudflare Tunnel

Panduan men-deploy **AngklungineX** agar bisa diakses publik:

- **Frontend (React Router SPA)** → **Cloudflare Pages** di `https://angklunginex.farelfirdaus.site`
- **Backend inference (WebSocket)** → **Cloudflare Tunnel** dari home server di `wss://ws-angklunginex.farelfirdaus.site`

```
[Pengunjung di internet]
   ├─ https://angklunginex.farelfirdaus.site   → Cloudflare Pages (statis)
   └─ wss://ws-angklunginex.farelfirdaus.site  → Cloudflare Tunnel
                                                   → home server
                                                      → container service :8765
                                                         (MediaPipe + SVM inference)
```

Arduino/serial tetap **lokal** di home server — tidak diekspos ke internet.

---

## 0. Prasyarat

- Akun Cloudflare dengan domain **farelfirdaus.site** (nameserver sudah diarahkan ke Cloudflare).
- Home server (**`farel-server`**, Linux) dengan Docker + Docker Compose, dan akses internet keluar.
- Akses dashboard Cloudflare **Zero Trust** (untuk kelola tunnel remote-managed).

> Komunikasi frontend↔backend **hanya lewat WebSocket** (frame kamera base64 dikirim browser → inference → label). Tidak ada endpoint HTTP lain yang perlu diekspos.

---

## 1. Siapkan akses token di service (backend)

Protection: koneksi WebSocket wajib membawa `?token=` yang benar **bila** env `WS_TOKEN` di-set.

1. `.env` ada di **repo root** (`/home/farel/.../angklunginex-docs/.env`) — isinya **jangan commit** (sudah di-`.gitignore`).
   ```bash
   WS_TOKEN=<token-panjang-acak>       # dipakai frontend saat connect
   TUNNEL_TOKEN=<dari langkah 3d>
   ```
2. Generate token acak bila belum ada:
   ```bash
   openssl rand -hex 24
   ```

> Kalau `WS_TOKEN` dikosongkan, auth nonaktif (mode dev/lokal). Template: `.env.example` (tanpa nilai rahasia).

---

## 2. Cloudflare Pages — frontend

1. Dashboard Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pilih repo **AngklungineX**.
3. Setelan build (**jangan pilih preset React** — isi manual):
   | Field | Nilai |
   |-------|-------|
   | **Production branch** | `development` |
   | **Root directory** | `angklunginex-app` |
   | **Build command** | `npm ci && npm run build` |
   | **Build output directory** | `build/client` |
4. **Save & Deploy.** Build pertama sukses memberi URL `*.pages.dev`.

### WS URL (env build) — lewat `.env.production`

`VITE_WS_URL` dipakai frontend untuk connect ke service. Nilai sudah di-commit di `angklunginex-app/.env.production`:
```
VITE_WS_URL=wss://ws-angklunginex.farelfirdaus.site
```
Vite otomatis membacanya saat `npm run build` (mode production). **Tidak wajib** set di dashboard, tapi kalau mau override, pastikan type **Text** (bukan Secret) & scope **Production**.

> ⚠️ **Jangan set sebagai Secret** — env Vite harus plain-text saat build time; Secret cuma bisa diakses runtime Workers, bukan proses build.

### Routing SPA

Cloudflare Pages **otomatis** menyajikan `index.html` untuk path tak dikenal (SPA fallback) selama tidak ada `404.html` top-level. **Jangan tambahkan `public/_redirects`** dengan `/* /index.html 200` — di engine static-assets modern itu memicu error *"Infinite loop detected"* (kode 100324). Biarkan Pages menangani sendiri.

### Custom domain

1. Buka project → tab **Custom domains** → **Set up a custom domain**.
2. Ketik `angklunginex.farelfirdaus.site` → **Continue** → **Activate domain**.
3. Cloudflare auto-buat CNAME + sertifikat TLS (biasanya < 1 menit).

---

## 3. Cloudflare Tunnel — WebSocket service

> **Setup yang dipakai di `farel-server`:** cloudflared **remote-managed** (via dashboard **Zero Trust** + `--token`), **bukan** config lokal. Jadi hostname & routing dikelola dari dashboard, bukan file di server.

### 3a. Buat tunnel baru (remote-managed) di dashboard

1. Dashboard Cloudflare → **Zero Trust** → **Networks** → **Tunnels** → **Create a tunnel**.
2. Pilih **Cloudflared** → beri nama, mis. `angklunginex`.
3. Setelah tunnel dibuat, Cloudflare kasih **token** (format `eyJ...`) + perintah install. **Salin token-nya.**

> ⚠️ Kalau ada cloudflared lama yang sudah dihapus tunnel-nya, container-nya akan muter-muter `ERR ... Tunnel not found` (lihat §6 untuk ganti).

### 3b. Jalankan cloudflared (ganti yang lama) di `farel-server`

1. **Hentikan & hapus container cloudflared lama** yang error:
   ```bash
   docker stop cloudflared
   docker rm cloudflared
   ```
2. **Jalankan container cloudflared baru** dengan token tunnel baru:
   ```bash
   docker run -d --name cloudflared --restart unless-stopped \
     cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <TOKEN_BARU>
   ```
3. Cek log sampai **tidak ada error**:
   ```bash
   docker logs cloudflared --tail 20
   ```
   Yang bagus: `Registered tunnel connection` / tidak ada `Tunnel not found`.

### 3c. Route hostname `ws-angklunginex...` → service

Di dashboard, pada tunnel `angklunginex` → tab **Public Hostname** → **Add a public hostname**:
| Field | Nilai |
|-------|-------|
| **Subdomain** | `ws` |
| **Domain** | `angklunginex.farelfirdaus.site` |
| **Type** | `HTTP` |
| **URL** | `localhost:8765` |

> Cloudflare Tunnel menangani WebSocket lewat Type **HTTP** — cukup arahkan ke port service. `localhost:8765` merujuk **server yang sama** tempat cloudflared & service jalan.

### 3d. Isi token ke `.env` (repo)

Di **root repo** (`angklunginex-docs/.env`), isi:
```
TUNNEL_TOKEN=<TOKEN_BARU>
```
(`WS_TOKEN` untuk proteksi service juga ada di sini.)

### 3e. Jalankan service Python (Docker)

Di `farel-server`, pastikan folder `angklunginex-service/` + `docker-compose.yml` ada (clone repo atau copy folder), lalu:
```bash
cd /home/farel/.../angklunginex-docs   # atau folder tempat file service
docker compose up -d --build service   # jalanin service aja (bukan cloudflared via compose)
```
- `service` mendengar di port **8765** (host) — bisa diakses `localhost:8765` oleh cloudflared.

> Catatan: `cloudflared` di compose **tidak dipakai** di setup remote-managed ini — cloudflared jalan sebagai container terpisah (3b) dengan token dari dashboard. Bisa di-comment/hapus dari compose bila mengganggu.

Cek service:
```bash
docker compose logs -f service
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8765   # WS: akan 426/400, itu normal (bukan HTTP)
```

---

## 4. Uji end-to-end

**Lokal (pastikan service jalan):**
```bash
# dari home server — harus menolak tanpa token, menerima dengan token benar
node -e 'const w=new WebSocket("ws://localhost:8765");w.onopen=()=>{console.log("OPEN (tanpa token) — TIDAK boleh");process.exit(1)};w.onclose=e=>{console.log("close",e.code,"— benar ditolak");process.exit(0)};setTimeout(()=>process.exit(2),3000)'
```

**Publik (lewat tunnel):**
```bash
# pakai token
node -e 'const w=new WebSocket("wss://ws-angklunginex.farelfirdaus.site/?token=<WS_TOKEN>");w.onopen=()=>{console.log("OPEN OK");process.exit(0)};w.onerror=e=>{console.log("ERR",e.message);process.exit(1)};setTimeout(()=>process.exit(2),5000)'
```

**Di browser:** buka `https://angklunginex.farelfirdaus.site` → masuk mode gestur/kamera → kalau koneksi ditolak, muncul overlay minta **Access Code** (token yang sama). Setelah benar, status service jadi "Terhubung".

---

## 5. Catatan performa & bandwidth

- Browser mengirim ±10 frame/s × ~10–15 KB (JPEG 320×240) ≈ **1–2 Mbps upload** dari koneksi pengunjung menuju home server.
- Kalau banyak pengunjung bersamaan, home server perlu upload bandwidth memadai; MediaPipe/SVM CPU jadi bottleneck → pertimbangkan naikkan `CAPTURE_INTERVAL_MS` / turunkan kualitas JPEG bila perlu.
- WebSocket di Cloudflare Tunnel mendukung koneksi panjang; idle timeout aman untuk use case streaming kamera interaktif.

---

## 6. Rollback / pemeliharaan

- **Hentikan cloudflared** (tanpa mengubah Pages): `docker stop cloudflared`.
- **Ganti `WS_TOKEN`**: ubah di `.env` → `docker compose up -d service`. User perlu access code baru.
- **Deploy ulang frontend**: push ke `development` → Pages auto-build, atau Deploy manual di dashboard.
- **Ganti/update tunnel**: buat tunnel baru di Zero Trust → ganti `--token` container (lihat §3b).
- **Hapus tunnel**: di dashboard Zero Trust → tunnel → **Delete** (hapus juga public hostname-nya).

---

## 7. Troubleshooting khusus `farel-server`

### Cloudflared lama muter-muter `ERR ... Tunnel not found`

Gejala: `docker logs cloudflared` berulang:
```
ERR Register tunnel error ... "Unauthorized: Tunnel not found"
```
Penyebab: tunnel yang dipakai token itu **sudah dihapus** di Cloudflare (mis. pernah terhapus), tapi containernya masih jalan.

Solusi: buat tunnel baru di Zero Trust (§3a) lalu ganti container (§3b). Kalau tunnel itu tadinya dipakai layanan lain (uptime-kuma, esp32, dll), service-service itu kehilangan akses publik — tambahkan lagi public hostname-nya di tunnel baru kalau mau dipulihkan.

### Node version warning di build Pages

Log build Pages kadang:
```
⚠️ Oops, Node v22.16.0 detected. react-router requires > 22.22.0
```
Build tetap sukses, tapi kalau ada anomali, set `NODE_VERSION` env Pages (mis. `22.22.0`) agar versi Node sesuai.

### `VITE_WS_URL` tidak ke-inject (bundle masih `ws://localhost`)

Pastikan `angklunginex-app/.env.production` ada & berisi `VITE_WS_URL=...`, lalu **Retry deployment** / push commit baru (build lama bisa ke-cache). Kalau set via dashboard, pastikan type **Text** & scope **Production**.
