import type { RefObject } from "react";
import { AngklungOverlay } from "./AngklungOverlay";

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cameraError: string | null;
  gestureLabel: string | null;
  gestureConfidence: number;
  activeNotes: Set<string>;
}

export function CameraView({ videoRef, canvasRef, cameraError, gestureLabel, gestureConfidence, activeNotes }: CameraViewProps) {
  return (
    <>
      {cameraError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500">
          <span className="text-5xl">📷</span>
          <span className="text-sm font-mono">{cameraError}</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
      )}

      {/* Gesture overlay di tengah bawah */}
      {gestureLabel && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-black/60 backdrop-blur border border-amber-500/40">
          <span className="text-amber-400 font-bold text-lg">{gestureLabel}</span>
          <span className="text-gray-400 text-sm ml-2">{(gestureConfidence * 100).toFixed(0)}%</span>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <AngklungOverlay activeNotes={activeNotes} />
    </>
  );
}
