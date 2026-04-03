import { useEffect } from "react";
import { useState } from "react";
import Board from "./Board";
import Tray from "./Tray";
import { ghosts } from "./Ghosts";
import { getPlacementBounds, pieces } from "./Pieces";

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [piecePositions, setPiecePositions] = useState(
    pieces.map(() => ({ y: 0, x: 0 }))
  );

  const selectedPiece = pieces[selectedIndex];
  const bounds = getPlacementBounds(selectedPiece);
  const currentPosition = piecePositions[selectedIndex];
  const y = currentPosition.y;
  const x = currentPosition.x;


  function clampPosition(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function moveY(delta) {
    setPiecePositions((prev) =>
      prev.map((pos, index) =>
        index === selectedIndex
          ? { ...pos, y: clampPosition(pos.y + delta, bounds.minY, bounds.maxY) }
          : pos
      )
    );
  }

  function moveX(delta) {
    setPiecePositions((prev) =>
      prev.map((pos, index) =>
        index === selectedIndex
          ? { ...pos, x: clampPosition(pos.x + delta, bounds.minX, bounds.maxX) }
          : pos
      )
    );
  }


  function switchPiece(delta) {
    setSelectedIndex((currentIndex) => (currentIndex + delta + pieces.length) % pieces.length);
  }

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
      <h1 className="title">Monkey Hunters</h1>
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
