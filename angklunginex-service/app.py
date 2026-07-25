"""
CONTOH server WebSocket sederhana buat kirim trigger ke frontend Three.js.

Ini BUKAN pengganti sistem MediaPipe kamu yang udah jadi — ini cuma contoh
"jembatan" WebSocket-nya aja, biar kamu tinggal panggil `kirim_trigger()`
dari dalam pipeline tracking kamu yang sudah ada.

Install dulu:
    pip install websockets

Jalankan:
    python server_contoh.py

Lalu buka frontend (npm run dev) dan lihat status berubah jadi "Terhubung".
Server ini otomatis kirim trigger acak tiap 2 detik sebagai simulasi,
tinggal ganti bagian simulasi itu dengan pemanggilan asli dari kode
MediaPipe kamu.
"""

import asyncio
import json
import random

import websockets

CONNECTED_CLIENTS = set()


async def handler(websocket):
    CONNECTED_CLIENTS.add(websocket)
    print(f"Client terhubung. Total client: {len(CONNECTED_CLIENTS)}")
    try:
        async for _ in websocket:
            pass  # server ini cuma kirim data satu arah (Python -> browser)
    finally:
        CONNECTED_CLIENTS.remove(websocket)
        print(f"Client terputus. Total client: {len(CONNECTED_CLIENTS)}")


async def kirim_trigger(angklung_id: int, intensity: float = 1.0):
    """Panggil fungsi ini dari pipeline MediaPipe kamu tiap kali
    gesture terdeteksi mengenai salah satu angklung.

    Contoh pemakaian di dalam loop deteksi tanganmu:
        if gesture_kena_angklung(landmark, angklung_id=5):
            await kirim_trigger(5, intensity=0.9)
    """
    if not CONNECTED_CLIENTS:
        return
    payload = json.dumps(
        {"angklung_id": angklung_id, "action": "shake", "intensity": intensity}
    )
    await asyncio.gather(*(client.send(payload) for client in CONNECTED_CLIENTS))


async def simulasi_trigger_acak():
    """Simulasi doang, buat testing tanpa perlu jalanin kamera dulu.
    Hapus/ganti bagian ini setelah kamu sambungkan ke MediaPipe asli."""
    while True:
        await asyncio.sleep(2)
        angklung_id = random.randint(1, 14)
        intensity = round(random.uniform(0.5, 1.0), 2)
        await kirim_trigger(angklung_id, intensity)
        print(f"[simulasi] kirim trigger -> angklung #{angklung_id} ({intensity})")


async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server jalan di ws://localhost:8765")
        print("Backend siap menerima trigger. Simulasi otomatis telah dimatikan.")
        # Biarkan server tetap hidup berjalan selamanya
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())