import { useLocation } from "react-router";

export default function Splat() {
  const location = useLocation();
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404</h1>
      <p>Halaman <code>{location.pathname}</code> nggak ditemukan.</p>
      <a href="/">Kembali ke Menu</a>
    </div>
  );
}
