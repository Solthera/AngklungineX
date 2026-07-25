import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { AngklungModel } from "../components/3d/AngklungModel";
import { useKeyboardAngklung } from "../hooks/useKeyboardAngklung";

export default function FreePlay() {
  const activeNotes = useKeyboardAngklung();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* UI Overlay */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(255,255,255,0.8)', padding: '1rem', borderRadius: '8px' }}>
        <h2>Mode Free Play</h2>
        <p>Gunakan keyboard untuk bermain:</p>
        <p><b>Q, W, E, R, T, 1, 2, 3, 4, 5, 6, 7, 8, 9</b></p>
        <Link to="/">Kembali ke Menu</Link>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [2, 1, -2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />

        <AngklungModel activeNotes={activeNotes} />

        <OrbitControls target={[0, 0.5, 0.5]} />
      </Canvas>
    </div>
  );
}
