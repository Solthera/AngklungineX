import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FreePlay from "./pages/FreePlay";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/free-play" element={<FreePlay />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
