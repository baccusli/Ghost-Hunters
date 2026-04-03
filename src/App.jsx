import { useEffect } from "react";
import { useState } from "react";
import Board from "./Board";
import Tray from "./Tray";
import { ghosts } from "./Ghosts";
import { getPlacementBounds, pieces } from "./Pieces";

export default function App() {
  const [y, setY] = useState(0);
  const [x, setX] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedPiece = pieces[selectedIndex];
  const bounds = getPlacementBounds(selectedPiece);

  function clampPosition(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function moveY(delta) {
    setY((currentY) => clampPosition(currentY + delta, bounds.minY, bounds.maxY));
  }

  function moveX(delta) {
    setX((currentX) => clampPosition(currentX + delta, bounds.minX, bounds.maxX));
  }

  function switchPiece(delta) {
    setSelectedIndex((currentIndex) => (currentIndex + delta + pieces.length) % pieces.length);
  }

  useEffect(() => {
    setY((currentY) => clampPosition(currentY, bounds.minY, bounds.maxY));
    setX((currentX) => clampPosition(currentX, bounds.minX, bounds.maxX));
  }, [bounds]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowUp":
          moveY(-1);
          break;
        case "ArrowDown":
          moveY(1);
          break;
        case "ArrowLeft":
          moveX(-1);
          break;
        case "ArrowRight":
          moveX(1);
          break;
        case "w":
          moveY(-1);
          break;
        case "s":
          moveY(1);
          break;
        case "a":
          moveX(-1);
          break;
        case "d":
          moveX(1);
          break;
        case "q":
          switchPiece(-1);
          break;
        case "e":
          switchPiece(1);
          break;
        default:
          break;
        case "PageUp":
          switchPiece(-1);
          break;
        case "PageDown":
          switchPiece(1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [bounds]);

  return (
    <div className="app">
      <h1 className="title">Ghost Hunters</h1>
      <Board ghosts={ghosts} piece={selectedPiece} y={y} x={x} />
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

        <button type="button" className="piece-switch" onClick={() => switchPiece(1)}>
          Switch to next piece
        </button>

        <button type="button" className="piece-switch" onClick={() => switchPiece(-1)}>
          Switch to previous piece
        </button>
      </div>
      <Tray piece={selectedPiece} />
    </div>
  );
}
