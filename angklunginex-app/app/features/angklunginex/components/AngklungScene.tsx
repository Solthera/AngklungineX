import { Canvas } from "@react-three/fiber";
import { Environment, Bounds } from "@react-three/drei";
import { AngklungModel } from "~/components/3D/AngklungModel";

interface AngklungSceneProps {
  activeNotes: Set<string>;
}

export function AngklungScene({ activeNotes }: AngklungSceneProps) {
  return (
    <div className="pointer-events-none absolute bottom-7 left-0 z-[5] h-[550px] w-[550px]">
      <Canvas
        camera={{ position: [20, 0, 9], fov: 40 }}
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 5, 5]} intensity={2} />
        <Environment preset="city" />
        <Bounds fit clip observe margin={0.9}>
          <AngklungModel activeNotes={activeNotes} />
        </Bounds>
      </Canvas>
    </div>
  );
}
