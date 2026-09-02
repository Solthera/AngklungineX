import { useState } from "react";
import { Link } from "react-router";
import { useAngklungAudio } from "~/hooks/useAngklungAudio";
import { useKeyboardAngklung } from "~/hooks/useKeyboardAngklung";
import { LABEL_TO_NODE } from "~/lib/angklung";
import { WS_URL } from "~/constants";
import { AccessCodeGate } from "~/components/AccessCodeGate";
import { useCamera } from "../../hooks/useCamera";
import { useGestureWs } from "../../hooks/useGestureWs";
import { CameraView } from "./components/CameraView";
import { AngklungStage } from "./components/AngklungStage";
import { InputModeToggle } from "./components/InputModeToggle";
import { ServiceStatus } from "./components/ServiceStatus";
import { KeyboardGuide } from "./components/KeyboardGuide";
import { ActiveNoteDisplay } from "./components/ActiveNoteDisplay";

type InputMode = "camera" | "keyboard";

export default function FreePlayPage() {
  const [inputMode, setInputMode] = useState<InputMode>("keyboard");
  const isCameraMode = inputMode === "camera";

  const { videoRef, cameraError } = useCamera(isCameraMode);
  const { gesture, wsStatus, authDenied, canvasRef, submitAccessCode } = useGestureWs(
    videoRef,
    isCameraMode
  );
  const cameraActiveNotes = new Set<string>(
    gesture.label && LABEL_TO_NODE[gesture.label] ? [LABEL_TO_NODE[gesture.label]] : []
  );

  const keyboardActiveNotes = useKeyboardAngklung();
  const activeNotes = isCameraMode ? cameraActiveNotes : keyboardActiveNotes;
  useAngklungAudio(activeNotes);

  return (
    <div className="flex w-screen h-screen bg-gray-950 overflow-hidden">

      {/* ── 75% kiri: area utama ── */}
      <div className="relative flex-[3] bg-black">
        {isCameraMode ? (
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            cameraError={cameraError}
            gestureLabel={gesture.label}
            gestureConfidence={gesture.confidence}
            activeNotes={cameraActiveNotes}
          />
        ) : (
          <AngklungStage activeNotes={keyboardActiveNotes} />
        )}
        {authDenied && (
          <AccessCodeGate onSubmit={submitAccessCode} />
        )}
      </div>

      {/* ── 25% kanan: panel ── */}
      <div className="flex-[1] flex flex-col bg-gray-950 border-l border-gray-800 p-6 gap-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Mode</p>
          <h1 className="text-xl font-black text-white">Free Play</h1>
        </div>

        <InputModeToggle value={inputMode} onChange={setInputMode} />

        {isCameraMode
          ? <ServiceStatus status={wsStatus} url={WS_URL} />
          : <KeyboardGuide />
        }

        <ActiveNoteDisplay
          mode={inputMode}
          gestureLabel={gesture.label}
          gestureConfidence={gesture.confidence}
          keyboardNotes={keyboardActiveNotes}
        />

        <div className="flex-1" />

        <Link
          to="/"
          className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 text-sm font-semibold text-center hover:bg-gray-900 hover:text-white transition-colors"
        >
          ← Kembali ke Menu
        </Link>
      </div>

    </div>
  );
}
