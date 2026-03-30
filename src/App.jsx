import { useState } from "react";
import Board from "./Board";
import Tray from "./Tray";
import { ghosts } from "./Ghosts";

export default function App() {
  const [y, setY] = useState(0);

  return (
    <div className="app">
      <h1 className="title">Ghost Hunters</h1>
      <Board ghosts={ghosts} y={y} />
      <button type="button" className="arrows" onClick={() => setY((currentY) => currentY - 1)}>
        ▲
      </button>
      <Tray />
    </div>
  );
}
