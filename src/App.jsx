import { useEffect } from "react";
import { useState } from "react";
import Board, { buildBoard } from "./Board";
import Tray from "./Tray";
import { ghosts } from "./Ghosts";
import { getPlacementBounds, pieces } from "./Pieces";

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [piecePositions, setPiecePositions] = useState(
    pieces.map(() => ({ y: 0, x: 0 }))
  );
  const [pieceRotations, setPieceRotations] = useState(pieces.map(() => 0));
  const [placedPieces, setPlacedPieces] = useState(pieces.map(() => false));

  const rotatedPieces = pieces.map((piece, index) =>
    piece.rotated(pieceRotations[index])
  );

  function resetGame() {
    setSelectedIndex(0);
    setPiecePositions(pieces.map(() => ({ y: 0, x: 0 })));
    setPieceRotations(pieces.map(() => 0));
    setPlacedPieces(pieces.map(() => false));
  }

  const selectedPiece = rotatedPieces[selectedIndex];
  const bounds = getPlacementBounds(selectedPiece);
  const currentPosition = piecePositions[selectedIndex];
  const y = currentPosition.y;
  const x = currentPosition.x;

  const placedPieceData = rotatedPieces
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
  const litGhostCount = buildBoard(ghosts, placedPieceData, previewPiece)
    .flat()
    .filter((cell) => cell.lit).length;
  const hasWon = litGhostCount >= ghosts.length;

  function clampPosition(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function moveY(delta) {
    if (hasWon) {
      return;
    }

    setPiecePositions((prev) =>
      prev.map((pos, index) =>
        index === selectedIndex
          ? { ...pos, y: clampPosition(pos.y + delta, bounds.minY, bounds.maxY) }
          : pos
      )
    );
  }

  function moveX(delta) {
    if (hasWon) {
      return;
    }

    setPiecePositions((prev) =>
      prev.map((pos, index) =>
        index === selectedIndex
          ? { ...pos, x: clampPosition(pos.x + delta, bounds.minX, bounds.maxX) }
          : pos
      )
    );
  }

  function switchPiece(delta) {
    if (hasWon) {
      return;
    }

    setSelectedIndex(
      (currentIndex) => (currentIndex + delta + pieces.length) % pieces.length
    );
  }

  function rotateSelectedPiece(delta = 1) {
    if (hasWon || placedPieces[selectedIndex]) {
      return;
    }

    const nextRotation = (pieceRotations[selectedIndex] + delta + 4) % 4;
    const nextPiece = pieces[selectedIndex].rotated(nextRotation);
    const nextBounds = getPlacementBounds(nextPiece);

    setPieceRotations((prev) =>
      prev.map((rotation, index) =>
        index === selectedIndex ? nextRotation : rotation
      )
    );

    setPiecePositions((prev) =>
      prev.map((pos, index) =>
        index === selectedIndex
          ? {
              ...pos,
              y: clampPosition(pos.y, nextBounds.minY, nextBounds.maxY),
              x: clampPosition(pos.x, nextBounds.minX, nextBounds.maxX),
            }
          : pos
      )
    );
  }

  function checkOverlap(pieceIndex, originY, originX) {
    const selectedPieceCells = rotatedPieces[pieceIndex].pieceCell(originY, originX);
    const occupiedCells = new Set();

    placedPieces.forEach((placed, index) => {
      if (!placed || index === pieceIndex) {
        return;
      }

      rotatedPieces[index]
        .pieceCell(piecePositions[index].y, piecePositions[index].x)
        .forEach((cell) => {
          occupiedCells.add(`${cell.y},${cell.x}`);
        });
    });

    return selectedPieceCells.some((cell) =>
      occupiedCells.has(`${cell.y},${cell.x}`)
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

  function tryPlaceSelectedPiece(showAlert = false) {
    if (hasWon) {
      return;
    }

    if (checkOverlap(selectedIndex, y, x)) {
      if (showAlert) {
        alert("Piece overlaps with another piece!");
      }

      return;
    }

    placeSelectedPiece();
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "r":
        case "R":
          resetGame();
          break;
        case "z":
        case "Z":
          rotateSelectedPiece();
          break;
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
          tryPlaceSelectedPiece();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    bounds,
    hasWon,
    piecePositions,
    pieceRotations,
    placedPieces,
    selectedIndex,
    x,
    y,
  ]);

  return (
    <div className="app">
      <h1 className="title">Monkey Hunters</h1>
      <p className="light-counter">
        Lit ghost lights: {litGhostCount} / {ghosts.length}
      </p>
      {hasWon ? (
        <p className="win-message">You win! Press R or use Reset to play again.</p>
      ) : null}
      <Board
        ghosts={ghosts}
        placedPieces={placedPieceData}
        previewPiece={previewPiece}
      />
      <div className="controls">
        <button
          type="button"
          className="arrow-button"
          onClick={() => moveY(-1)}
          disabled={hasWon}
        >
          ▲
        </button>

        <div className="controls-row">
          <button
            type="button"
            className="arrow-button"
            onClick={() => moveX(-1)}
            disabled={hasWon}
          >
            ◀
          </button>

          <button
            type="button"
            className="arrow-button"
            onClick={() => moveX(1)}
            disabled={hasWon}
          >
            ▶
          </button>
        </div>

        <button
          type="button"
          className="arrow-button"
          onClick={() => moveY(1)}
          disabled={hasWon}
        >
          ▼
        </button>

        <button
          type="button"
          className="piece-switch"
          onClick={() => rotateSelectedPiece()}
          disabled={hasWon || placedPieces[selectedIndex]}
        >
          <b>Rotate piece</b>
        </button>

        <button
          type="button"
          className="piece-switch"
          onClick={() => switchPiece(1)}
          disabled={hasWon}
        >
          <b>Switch to next piece</b>
        </button>

        <button
          type="button"
          className="piece-switch"
          onClick={() => switchPiece(-1)}
          disabled={hasWon}
        >
          <b>Switch to previous piece</b>
        </button>

        <button
          type="button"
          className="piece-switch"
          onClick={() => {
            tryPlaceSelectedPiece(true);
          }}
          disabled={hasWon}
        >
          <b>Place piece</b>
        </button>

        <button type="button" className="piece-switch" onClick={resetGame}>
          <b>Reset game</b>
        </button>
      </div>
      <Tray piece={selectedPiece} />
    </div>
  );
}
