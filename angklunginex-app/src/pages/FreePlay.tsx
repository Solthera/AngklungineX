import { Link } from "react-router-dom";

export default function FreePlay() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Mode Free Play</h2>
      <p>3D Canvas akan berada di sini.</p>
      <Link to="/">Kembali ke Menu</Link>
    </div>
  );
}
