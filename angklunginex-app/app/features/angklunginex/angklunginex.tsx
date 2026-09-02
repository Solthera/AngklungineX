import { useMemo, useState } from "react"
import { useCamera } from "~/hooks/useCamera"
import { useGestureWs } from "~/hooks/useGestureWs"
import { useAngklungAudio } from "~/hooks/useAngklungAudio"
import { LABEL_TO_NODE, NODE_TO_LABEL } from "~/lib/angklung"
import { MenuButton } from "./components/popup"
import { CameraOff } from 'lucide-react';
import { BadgeInfoPanel } from "./components/badge"
import { GestureInfo } from "./components/gesture-info";
import { AngklungScene } from "./components/AngklungScene";
import { AccessCodeGate } from "~/components/AccessCodeGate";

export default function angklung() {
  const [showGesture, setShowGesture] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>()
  const { videoRef, cameraError, devices } = useCamera(cameraOn, selectedDeviceId)
  const { gesture, authDenied, canvasRef, submitAccessCode } = useGestureWs(videoRef, cameraOn)

  const activeNotes = useMemo(() => {
    const node = gesture.label ? LABEL_TO_NODE[gesture.label] : undefined
    return new Set(node ? [node] : [])
  }, [gesture.label])

  useAngklungAudio(activeNotes)

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-[#EBEBEB]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 z-0 h-full w-full object-cover scale-x-[-1] ${cameraOn ? "opacity-100" : "opacity-0"}`}
      />
      <canvas ref={canvasRef} className="hidden" />
      {!cameraOn && (
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <CameraOff
          className="size-[130px] text-[#C2C2C2]"
          strokeWidth={1}
          />
        </div>
      )}
      {cameraOn && cameraError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm font-mono text-red-500">
          {cameraError}
        </div>
      )}
      {cameraOn && authDenied && (
        <AccessCodeGate onSubmit={submitAccessCode} />
      )}
      {showGesture && (
        <div className="absolute top-4 right-4 z-10">
          <GestureInfo />
        </div>
      )}
      <AngklungScene activeNotes={activeNotes} />
      <div className="relative z-10 mt-auto flex gap-4 px-4 my-4 items-center">
        <div>
          <MenuButton
            showGesture={showGesture}
            onShowGestureChange={setShowGesture}
            cameraOn={cameraOn}
            onCameraChange={setCameraOn}
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onDeviceChange={setSelectedDeviceId}
          />
        </div>
        <div className="relative flex flex-1 items-center bg-white p-3 rounded-full h-[60px] shadow-[0_0_2px_rgba(0,0,0,0.12)]">
          <BadgeInfoPanel>Badge for mode</BadgeInfoPanel>
          <BadgeInfoPanel className="absolute left-1/2 -translate-x-1/2" labelClassName="text-[#545454]">
            {!cameraOn
              ? "Nada"
              : activeNotes.size > 0
                ? Array.from(activeNotes).map((nodeId) => NODE_TO_LABEL[nodeId] ?? nodeId).join(", ")
                : "Nada not detected"}
          </BadgeInfoPanel>
          <BadgeInfoPanel className="absolute right-3" labelClassName="text-[#545454]">
            {cameraOn ? `${(gesture.confidence * 100).toFixed(0)}%` : "Confidence"}
          </BadgeInfoPanel>
        </div>
      </div>
    </div>
  )
}