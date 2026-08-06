import { useEffect, useRef, useState } from "react";
import { WS_URL, CAPTURE_INTERVAL_MS } from "~/constants";

export type GestureResult = {
  label: string | null;
  confidence: number;
};

export type WsStatus = "connecting" | "connected" | "disconnected";

export function useGestureWs(videoRef: React.RefObject<HTMLVideoElement | null>, enabled: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gesture, setGesture] = useState<GestureResult>({ label: null, confidence: 0 });
  const [wsStatus, setWsStatus] = useState<WsStatus>("disconnected");

  useEffect(() => {
    if (!enabled) {
      setGesture({ label: null, confidence: 0 });
      setWsStatus("disconnected");
      return;
    }

    const ws = new WebSocket(WS_URL);
    setWsStatus("connecting");

    ws.onopen = () => setWsStatus("connected");
    ws.onclose = () => setWsStatus("disconnected");
    ws.onerror = () => setWsStatus("disconnected");

    ws.onmessage = (e) => {
      try {
        setGesture(JSON.parse(e.data));
      } catch {
        // abaikan frame rusak
      }
    };

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

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [enabled]);

  return { gesture, wsStatus, canvasRef };
}

