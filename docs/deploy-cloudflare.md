# Deploy — Cloudflare Pages + Cloudflare Tunnel

Panduan men-deploy **AngklungineX** agar bisa diakses publik:

- **Frontend (React Router SPA)** → **Cloudflare Pages** di `https://angklunginex.farelfirdaus.site`
- **Backend inference (WebSocket)** → **Cloudflare Tunnel** dari home server di `wss://ws.angklunginex.farelfirdaus.site`

```
[Pengunjung di internet]
   ├─ https://angklunginex.farelfirdaus.site   → Cloudflare Pages (statis)
   └─ wss://ws.angklunginex.farelfirdaus.site  → Cloudflare Tunnel
                                                   → home server
                                                      → container service :8765
                                                         (MediaPipe + SVM inference)
```

Arduino/serial tetap **lokal** di home server — tidak diekspos ke internet.

---

## 0. Prasyarat

- Akun Cloudflare dengan domain **farelfirdaus.site** (nameserver sudah diarahkan ke Cloudflare).
- Home server (Linux) dengan Docker + Docker Compose, dan akses internet keluar.
- `cloudflared` (CLI) di home server — dipakai sekali untuk *login* & *create tunnel*.

> Komunikasi frontend↔backend **hanya lewat WebSocket** (frame kamera base64 dikirim browser → inference → label). Tidak ada endpoint HTTP lain yang perlu diekspos.

---

## 1. Siapkan akses token di service (backend)

Protection: koneksi WebSocket wajib membawa `?token=` yang benar **bila** env `WS_TOKEN` di-set.

1. Buat `.env` di **repo root** (`/home/farel/.../angklunginex-docs/.env`):
   ```bash
   WS_TOKEN=<token-panjang-acak>       # dipakai frontend saat connect
   TUNNEL_TOKEN=<dari langkah 3>
   ```
2. Generate token acak, mis.:
   ```bash
   openssl rand -hex 24
   ```

> `.env` sudah masuk `.gitignore` — jangan commit. Kalau `WS_TOKEN` dikosongkan, auth nonaktif (mode dev/lokal).

---

## 2. Cloudflare Pages — frontend

1. Dashboard Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pilih repo **AngklungineX**.
3. Setelan build:
   | Field | Nilai |
   |-------|-------|
   | **Production branch** | `development` |
   | **Root directory** | `/angklunginex-app` |
   | **Build command** | `npm ci && npm run build` |
   | **Build output directory** | `build/client` |
4. **Environment variables (Production):**
   ```bash
   VITE_WS_URL = wss://ws.angklunginex.farelfirdaus.site
   ```
   (Tambahkan juga di Preview bila perlu.)
5. **Custom domain** → `angklunginex.farelfirdaus.site` (Cloudflare auto-CNAME + TLS).
6. **Save & Deploy.**

> Routing SPA sudah dijamin oleh `angklunginex-app/public/_redirects` (`/* /index.html 200`) yang otomatis ikut ter-copy ke output build. Tanpa ini, refresh di `/free-play` akan 404.

---

## 3. Cloudflare Tunnel — WebSocket service

Semua perintah `docker run ... cloudflared` sekali pakai (CLI cloudflared). Bisa juga pakai `cloudflared` binary lokal.

### 3a. Login (sekali)
```bash
docker run --rm -it -v ~/.cloudflared:/home/nonroot/.cloudflared cloudflare/cloudflared tunnel login
```
Ini membuka browser, pilih domain `farelfirdaus.site`, lalu menyimpan `cert.pem` ke `~/.cloudflared/`.

### 3b. Buat named tunnel (sekali)
```bash
docker run --rm -it -v ~/.cloudflared:/home/nonroot/.cloudflared cloudflare/cloudflared tunnel create angklunginex-ws
```
Catat **Tunnel ID / credentials file** (`.json`) yang dihasilkan di `~/.cloudflared/`.

### 3c. Route DNS (sekali) — otomatis buat CNAME
```bash
docker run --rm -it -v ~/.cloudflared:/home/nonroot/.cloudflared cloudflare/cloudflared tunnel route dns angklunginex-ws ws.angklunginex.farelfirdaus.site
```

### 3d. Isi token ke `.env`
Di **root repo**, isi `TUNNEL_TOKEN` dari file credentials:
```bash
cat ~/.cloudflared/<UUID>.json   # ambil field "AccountTag","TunnelID","TunnelSecret"
```
Lalu token perintah untuk `run`:
```bash
docker run --rm -it cloudflare/cloudflared tunnel token angklunginex-ws
# → tempel hasilnya ke .env: TUNNEL_TOKEN=eyJhbGciOi...
```
(atau tempel credentials file ke folder + set `TUNNEL_ID` — lihat Catatan).

### 3e. Jalankan stack
```bash
cd /home/farel/.../angklunginex-docs
docker compose up -d --build
```
- `service` mendengar di container :8765 (MediaPipe dijalankan **di dalam** docker image).
- `cloudflared` terhubung keluar ke edge Cloudflare, memetakan `ws.angklunginex...` → `http://service:8765`.

Cek log:
```bash
docker compose logs -f service cloudflared
```

### Catatan alternatif config (bukan `--token`)
Kalau lebih suka pakai file credentials (bukan token), bisa:
- mount folder `~/.cloudflared:/etc/cloudflared` di service cloudflared,
- set env `TUNNEL_ID=<UUID>`,
- dan pasang file `config.yml` dengan ingress. Pendekatan di atas (`--token`) lebih ringkas — nama tunnel & route DNS tetap di sisi Cloudflare.

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
node -e 'const w=new WebSocket("wss://ws.angklunginex.farelfirdaus.site/?token=<WS_TOKEN>");w.onopen=()=>{console.log("OPEN OK");process.exit(0)};w.onerror=e=>{console.log("ERR",e.message);process.exit(1)};setTimeout(()=>process.exit(2),5000)'
```

**Di browser:** buka `https://angklunginex.farelfirdaus.site` → masuk mode gestur/kamera → kalau koneksi ditolak, muncul overlay minta **Access Code** (token yang sama). Setelah benar, status service jadi "Terhubung".

---

## 5. Catatan performa & bandwidth

- Browser mengirim ±10 frame/s × ~10–15 KB (JPEG 320×240) ≈ **1–2 Mbps upload** dari koneksi pengunjung menuju home server.
- Kalau banyak pengunjung bersamaan, home server perlu upload bandwidth memadai; MediaPipe/SVM CPU jadi bottleneck → pertimbangkan naikkan `CAPTURE_INTERVAL_MS` / turunkan kualitas JPEG bila perlu.
- WebSocket di Cloudflare Tunnel mendukung koneksi panjang; idle timeout aman untuk use case streaming kamera interaktif.

---

## 6. Rollback / pemeliharaan

- **Hentikan tunnel** (tanpa mengubah Pages): `docker compose stop cloudflared`.
- **Ganti token**: ubah `WS_TOKEN` di `.env` → `docker compose up -d service`. User perlu access code baru.
- **Deploy ulang frontend**: push ke `development` → Pages auto-build, atau Deploy manual di dashboard.
- Hapus tunnel: `docker run --rm -it -v ~/.cloudflared:/home/nonroot/.cloudflared cloudflare/cloudflared tunnel delete angklunginex-ws` (juga hapus CNAME DNS bila manual).
