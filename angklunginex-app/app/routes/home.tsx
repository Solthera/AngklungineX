import { Link } from "react-router";

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>AngklungineX Arc-2</h1>
      <nav>
        <ul>
          <li className="text-blue-500"><Link to="/free-play">Mode Free Play</Link></li>
        </ul>
      </nav>
    </div>
  );
}
