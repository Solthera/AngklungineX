import { useCallback, useEffect, useRef, useState } from "react";
import { CAPTURE_INTERVAL_MS } from "~/constants";
import { buildWsUrl, getWsToken, saveWsToken } from "~/lib/wsAccess";

export type GestureResult = {
  label: string | null;
  confidence: number;
};

export type WsStatus = "connecting" | "connected" | "disconnected";

export function useGestureWs(videoRef: React.RefObject<HTMLVideoElement | null>, enabled: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gesture, setGesture] = useState<GestureResult>({ label: null, confidence: 0 });
  const [wsStatus, setWsStatus] = useState<WsStatus>("disconnected");
  const [authDenied, setAuthDenied] = useState(false);
  const [isError, setIsError] = useState(false);
  const [attempt, setAttempt] = useState(0); // naikkan untuk reconnect dengan token baru

  useEffect(() => {
    if (!enabled) {
      setGesture({ label: null, confidence: 0 });
      setWsStatus("disconnected");
      setAuthDenied(false);
      setIsError(false);
      return;
    }

    setWsStatus("connecting");

    const ws = new WebSocket(buildWsUrl(getWsToken()));
    const interval = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0, 320, 240);

      const b64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
      ws.send(b64);
    }, CAPTURE_INTERVAL_MS);

    ws.onopen = () => {
      setWsStatus("connected");
      setAuthDenied(false);
      setIsError(false);
    };

    ws.onclose = (e) => {
      if (e.code === 1008) {
        setAuthDenied(true); // token salah / tidak ada
        if (attempt > 0) setIsError(true);
      }
      setWsStatus("disconnected");
    };
    ws.onerror = () => {
      /* onclose menyusul; jangan set status dua kali */
    };

    ws.onmessage = (e) => {
      try {
        setGesture(JSON.parse(e.data));
      } catch {
        // abaikan frame rusak
      }
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [enabled, attempt]);

  /** Simpan access code lalu reconnect. Kosong = hapus token & coba tanpa token. */
  const submitAccessCode = useCallback((code: string) => {
    saveWsToken(code.trim());
    setIsError(false);
    setAttempt((n) => n + 1);
  }, []);

  return { gesture, wsStatus, authDenied, isError, canvasRef, submitAccessCode };
}
