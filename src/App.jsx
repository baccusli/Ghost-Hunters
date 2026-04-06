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
  const [placedPieces, setPlacedPieces] = useState(pieces.map(() => false));

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
    setSelectedIndex(
      (currentIndex) => (currentIndex + delta + pieces.length) % pieces.length
    );
  }

  function placeSelectedPiece() {
    setPlacedPieces((prev) => {
      if (prev[selectedIndex]) {
        return prev;
      }

      const nextPlacedPieces = prev.map((placed, index) =>
        index === selectedIndex ? true : placed
      );

      const nextIndex = nextPlacedPieces.findIndex(
        (placed, index) => !placed && index > selectedIndex
      );
      const fallbackIndex = nextPlacedPieces.findIndex((placed) => !placed);

      if (nextIndex !== -1) {
        setSelectedIndex(nextIndex);
      } else if (fallbackIndex !== -1) {
        setSelectedIndex(fallbackIndex);
      }

      return nextPlacedPieces;
    });
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
          moveY(-1);
          break;
        case "ArrowDown":
        case "s":
          moveY(1);
          break;
        case "ArrowLeft":
        case "a":
          moveX(-1);
          break;
        case "ArrowRight":
        case "d":
          moveX(1);
          break;
        case "q":
        case "PageUp":
          switchPiece(-1);
          break;
        case "e":
        case "PageDown":
          switchPiece(1);
          break;
        case "Enter":
          placeSelectedPiece();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [bounds, selectedIndex, placedPieces]);

  const placedPieceData = pieces
    .map((piece, index) => ({
      piece,
      ...piecePositions[index],
      placed: placedPieces[index],
    }))
    .filter((pieceData) => pieceData.placed);

  const previewPiece = placedPieces[selectedIndex]
    ? null
    : {
        piece: selectedPiece,
        y,
        x,
      };

  return (
    <div className="app">
      <h1 className="title">Monkey Hunters</h1>
      <Board
        ghosts={ghosts}
        placedPieces={placedPieceData}
        previewPiece={previewPiece}
      />
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
          <b>Switch to next piece</b>
        </button>

        <button type="button" className="piece-switch" onClick={() => switchPiece(-1)}>
          <b>Switch to previous piece</b>
        </button>

        <button type="button" className="piece-switch" onClick={placeSelectedPiece}>
          <b>Place piece</b>
        </button>
      </div>
      <Tray piece={selectedPiece} />
    </div>
  );
}
