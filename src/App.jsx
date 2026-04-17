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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const rotatedPieces = pieces.map((piece, index) =>
    piece.rotated(pieceRotations[index])
  );

  function resetGame() {
    setSelectedIndex(0);
    setPiecePositions(pieces.map(() => ({ y: 0, x: 0 })));
    setPieceRotations(pieces.map(() => 0));
    setPlacedPieces(pieces.map(() => false));
    setElapsedSeconds(0);
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
  const selectedPiecePlacement = {
    piece: selectedPiece,
    y,
    x,
  };
  const litGhostCount = buildBoard(ghosts, placedPieceData, null)
    .flat()
    .filter((cell) => cell.lit).length;
  const hasWon = litGhostCount >= ghosts.length;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timerLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const selectedPieceNumber = selectedIndex + 1;
  const placedCount = placedPieces.filter(Boolean).length;
  const selectedPiecePlaced = placedPieces[selectedIndex];

  function clampPosition(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function moveY(delta) {
    if (hasWon || placedPieces[selectedIndex]) {
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
    if (hasWon || placedPieces[selectedIndex]) {
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
    if (hasWon || placedPieces[selectedIndex]) {
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
    if (hasWon) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [hasWon]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ([
        "r",
        "R",
        "z",
        "Z",
        "ArrowUp",
        "w",
        "ArrowDown",
        "s",
        "ArrowLeft",
        "a",
        "ArrowRight",
        "d",
        "q",
        "PageUp",
        "e",
        "PageDown",
        "Enter",
      ].includes(e.key)) {
        e.preventDefault();
      }

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
      <div className="app-shell">
        <header className="hero">
          <div>
            <h1 className="title">Monkey Hunters</h1>
            <p className="subtitle">
              Position each gadget, rotate it into place, and light up every ghost
              on the board.
            </p>
          </div>

          <div className="status-strip">
            <div className="status-card status-card-primary">
              <span className="status-label">Lit Ghosts</span>
              <strong className="status-value">
                {litGhostCount} / {ghosts.length}
              </strong>
            </div>

            <div className="status-card">
              <span className="status-label">Placed Pieces</span>
              <strong className="status-value">
                {placedCount} / {pieces.length}
              </strong>
            </div>

            <div className="status-card">
              <span className="status-label">Selected Piece</span>
              <strong className="status-value">#{selectedPieceNumber}</strong>
            </div>

            <div className="status-card">
              <span className="status-label">Timer</span>
              <strong className="status-value">{timerLabel}</strong>
            </div>
          </div>
        </header>

        {hasWon ? (
          <p className="win-message">You win! Press R or use Reset to play again.</p>
        ) : null}

        <main className="game-layout">
          <section className="board-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">Board</p>
              </div>
              <span className="panel-badge">4 x 4 puzzle</span>
            </div>
            <Board
              ghosts={ghosts}
              placedPieces={placedPieceData}
              previewPiece={previewPiece}
              selectedPiecePlacement={selectedPiecePlacement}
            />
          </section>

          <aside className="sidebar">
            <section className="control-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-label">Controls</p>
                  <h2 className="panel-title">Move The Selected Piece</h2>
                </div>
                <span
                  className={`selection-chip ${selectedPiecePlaced ? "selection-chip-placed" : ""}`}
                >
                  {selectedPiecePlaced ? "Locked In" : "Ready To Move"}
                </span>
              </div>

              <div className="piece-meta">
                <div className="meta-card">
                  <span className="meta-label">Position</span>
                  <strong className="meta-value">{x}, {y}</strong>
                </div>
                <div className="meta-card">
                  <span className="meta-label">Rotation</span>
                  <strong className="meta-value">{pieceRotations[selectedIndex] * 90}deg</strong>
                </div>
              </div>

              <div className="controls-grid">
                <button
                  type="button"
                  className="control-button control-button-arrow"
                  onClick={() => moveY(-1)}
                  disabled={hasWon || selectedPiecePlaced}
                >
                  ▲
                </button>

                <div className="controls-row">
                  <button
                    type="button"
                    className="control-button control-button-arrow"
                    onClick={() => moveX(-1)}
                    disabled={hasWon || selectedPiecePlaced}
                  >
                    ◀
                  </button>

                  <button
                    type="button"
                    className="control-button control-button-arrow"
                    onClick={() => moveX(1)}
                    disabled={hasWon || selectedPiecePlaced}
                  >
                    ▶
                  </button>
                </div>

                <button
                  type="button"
                  className="control-button control-button-arrow"
                  onClick={() => moveY(1)}
                  disabled={hasWon || selectedPiecePlaced}
                >
                  ▼
                </button>
              </div>

              <div className="action-list">
                <button
                  type="button"
                  className="control-button control-button-secondary"
                  onClick={() => rotateSelectedPiece()}
                  disabled={hasWon || placedPieces[selectedIndex]}
                >
                  Rotate Piece
                </button>

                <button
                  type="button"
                  className="control-button control-button-secondary"
                  onClick={() => switchPiece(1)}
                  disabled={hasWon}
                >
                  Next Piece
                </button>

                <button
                  type="button"
                  className="control-button control-button-secondary"
                  onClick={() => switchPiece(-1)}
                  disabled={hasWon}
                >
                  Previous Piece
                </button>

                <button
                  type="button"
                  className="control-button control-button-primary"
                  onClick={() => {
                    tryPlaceSelectedPiece(true);
                  }}
                  disabled={hasWon || selectedPiecePlaced}
                >
                  Place Piece
                </button>

                <button
                  type="button"
                  className="control-button control-button-ghost"
                  onClick={resetGame}
                >
                  Reset Game
                </button>
              </div>
            </section>

            <section className="piece-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-label">Preview</p>
                  <h2 className="panel-title">Selected Shape</h2>
                </div>
                <span className="panel-badge">Piece #{selectedPieceNumber}</span>
              </div>
              <Tray piece={selectedPiece} />
            </section>

            <section className="shortcut-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-label">Keyboard</p>
                  <h2 className="panel-title">Quick Commands</h2>
                </div>
              </div>
              <div className="shortcut-list">
                <span className="shortcut-pill">WASD / Arrows move</span>
                <span className="shortcut-pill">Z rotate</span>
                <span className="shortcut-pill">Q / E switch</span>
                <span className="shortcut-pill">Enter place</span>
                <span className="shortcut-pill">R reset</span>
              </div>
            </section>
          </aside>
        </main>

        <section className="piece-gallery-panel">
          <div className="panel-header">
            <div>
              <p className="panel-label">Pieces</p>
              <h2 className="panel-title">All Pieces</h2>
            </div>
            <span className="panel-badge">{pieces.length} total pieces</span>
          </div>

          <div className="piece-gallery-grid">
            {rotatedPieces.map((piece, index) => {
              const isSelected = index === selectedIndex;
              const isPlaced = placedPieces[index];

              return (
                <button
                  key={piece.id}
                  type="button"
                  className={[
                    "piece-gallery-card",
                    isSelected ? "piece-gallery-card-selected" : "",
                    isPlaced ? "piece-gallery-card-placed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    if (!hasWon) {
                      setSelectedIndex(index);
                    }
                  }}
                  disabled={hasWon}
                >
                  <div className="piece-gallery-card-header">
                    <span className="piece-gallery-title">Piece #{index + 1}</span>
                    <span className="piece-gallery-state">
                      {isPlaced ? "Placed" : isSelected ? "Selected" : "Available"}
                    </span>
                  </div>
                  <Tray piece={piece} />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
