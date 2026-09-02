import { useEffect, useRef, useState } from "react";

export type CameraDevice = { deviceId: string; label: string };

export function useCamera(enabled: boolean, deviceId?: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);

  useEffect(() => {
    if (!enabled) {
      // hentikan semua track dari stream yang tersimpan
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraError(null);
      setDevices([]);
      return;
    }

    let cancelled = false;

    const getConstraints = (id?: string): MediaStreamConstraints => ({
      video: id ? { deviceId: { exact: id } } : true,
      audio: false,
    });

    navigator.mediaDevices
      .enumerateDevices()
      .then((allDevices) => {
        if (cancelled) return [];
        const cams = allDevices
          .filter((d) => d.kind === "videoinput")
          .map((d) => ({ deviceId: d.deviceId, label: d.label || "Kamera" }));
        setDevices(cams);
        return cams;
      })
      .then((cams) => {
        // default = device pertama kalau user belum pilih
        const chosenId = deviceId ?? cams[0]?.deviceId;
        return navigator.mediaDevices.getUserMedia(getConstraints(chosenId));
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => setCameraError(err.message));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [enabled, deviceId]);

  return { videoRef, cameraError, devices };
}
