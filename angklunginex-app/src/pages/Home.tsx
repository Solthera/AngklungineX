import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>AngklungineX Arc-2</h1>
      <nav>
        <ul>
          <li><Link to="/free-play">Mode Free Play</Link></li>
        </ul>
      </nav>
    </div>
  );
}
