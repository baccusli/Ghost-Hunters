import { useState } from "react";
import Board from "./Board";
import Tray from "./Tray";
import { ghosts } from "./Ghosts";
import { getPlacementBounds } from "./Pieces";

export default function App() {
  const [y, setY] = useState(0);
  const [x, setX] = useState(0);
  const bounds = getPlacementBounds();

  function moveY(delta) {
    setY((currentY) => Math.max(bounds.minY, Math.min(bounds.maxY, currentY + delta)));
  }

  function moveX(delta) {
    setX((currentX) => Math.max(bounds.minX, Math.min(bounds.maxX, currentX + delta)));
  }

  return (
    <div className="app">
      <h1 className="title">Ghost Hunters</h1>
      <Board ghosts={ghosts} y={y} x={x} />
      <div className="controls">
        <button type="button" className="arrow-button" onClick={() => moveY(-1)}>
          ▲
        </button>

        <div className="controls-row">
          <button type="button" className="arrow-button" onClick={() => moveX(-1)}>
            ◀
          </button>

          <button type="button" className="arrow-button" onClick={() => moveX(1)}>
            ▶
          </button>
        </div>

        <button type="button" className="arrow-button" onClick={() => moveY(1)}>
          ▼
        </button>
      </div>
      <Tray />
    </div>
  );
}
