import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { AngklungModel } from "~/components/3D/AngklungModel";

interface AngklungOverlayProps {
  activeNotes: Set<string>;
}

export function AngklungOverlay({ activeNotes }: AngklungOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-end">
      <Canvas
        camera={{ position: [2.2, 0, 1.2], fov: 45 }}
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <AngklungModel activeNotes={activeNotes} position={[-0.5, -1.5, 0]} />
      </Canvas>
    </div>
  );
}
