import { Link } from "react-router";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { AngklungModel } from "../components/3D/AngklungModel";
import { useKeyboardAngklung } from "../hooks/useKeyboardAngklung";
import { useAngklungAudio } from "../hooks/useAngklungAudio";

const NODE_TO_NOTE_MAP: Record<string, string> = {
  'G-Object009': 'Sol Rendah (5.)',
  'G-Object018': 'La Rendah (6.)',
  'G-Object001': 'Ti Rendah (7.)',
  'G-Object002': 'Do (1)',
  'G-Object003': 'Re (2)',
  'G-Object004': 'Mi (3)',
  'G-Object005': 'Fa (4)',
  'G-Object006': 'Fis (4#)',
  'G-Object007': 'Sol (5)',
  'G-Object008': 'La (6)',
  'G-Object010': 'Ti (7)',
  'G-Object011': 'Do Tinggi (1\')',
  'G-Object013': 'Re Tinggi (2\')',
  'G-Object012': 'Mi Tinggi (3\')'
}

export default function FreePlay() {
  const activeNotes = useKeyboardAngklung();
  useAngklungAudio(activeNotes)

  const activeNoteNames = Array.from(activeNotes).map(
    (nodeId) => NODE_TO_NOTE_MAP[nodeId] || nodeId
  );

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* UI Overlay */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(255,255,255,0.8)', padding: '1rem', borderRadius: '8px' }}>
        <h2>Mode Free Play</h2>
        <p>Gunakan keyboard untuk bermain:</p>
        <p><b>Q, W, E, R, T, 1, 2, 3, 4, 5, 6, 7, 8, 9</b></p>
        <Link to="/">Kembali ke Menu</Link>
        <br />
        <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#eee', borderRadius: '4px', minHeight: '3rem' }}>
          <strong>Nada Aktif: </strong>
          <span style={{ color: '#d97706', fontWeight: 'bold' }}>
            {activeNoteNames.length > 0 ? activeNoteNames.join(' + ') : 'Kosong'}
          </span>
        </div>
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
