import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { AngklungModel } from "~/components/3D/AngklungModel";

interface AngklungStageProps {
  activeNotes: Set<string>;
}

export function AngklungStage({ activeNotes }: AngklungStageProps) {
  return (
    <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #431407 0%, #1c1917 40%, #111827 100%)" }}>
      <Canvas camera={{ position: [2, 1, -2], fov: 45 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <AngklungModel activeNotes={activeNotes} />
        <OrbitControls target={[0, 0.5, 0.5]} />
      </Canvas>
    </div>
  );
}
