import { useEffect, useRef, useState } from "react";
import Board, { buildBoard } from "./Board";
import Tray from "./Tray";
import { ghosts } from "./Ghosts";
import { getPlacementBounds, pieces } from "./Pieces";

export default function App() {
  const dragImageRef = useRef(null);
  const dragMetaRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [piecePositions, setPiecePositions] = useState(
    pieces.map(() => ({ y: 0, x: 0 }))
  );
  const [pieceRotations, setPieceRotations] = useState(pieces.map(() => 0));
  const [placedPieces, setPlacedPieces] = useState(pieces.map(() => false));
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlMode, setControlMode] = useState("drag");
  const [dragState, setDragState] = useState(null);
  const [dragHoverCell, setDragHoverCell] = useState(null);
  const [feedback, setFeedback] = useState({
    tone: "info",
    message:
      "Goal: place every gadget on the 4 x 4 board so each ghost is lit by at least one light bulb.",
  });

  const rotatedPieces = pieces.map((piece, index) =>
    piece.rotated(pieceRotations[index])
  );

  function resetGame() {
    setSelectedIndex(0);
    setPiecePositions(pieces.map(() => ({ y: 0, x: 0 })));
    setPieceRotations(pieces.map(() => 0));
    setPlacedPieces(pieces.map(() => false));
    startTimeRef.current = Date.now();
    setElapsedMilliseconds(0);
    setTimerStarted(false);
    setSettingsOpen(false);
    clearDragInteraction();
    setFeedback({
      tone: "info",
      message:
        "Fresh board. Pick a piece, rotate it if needed, then place it so the light bulbs reach the ghosts.",
    });
  }

  const selectedPiece = rotatedPieces[selectedIndex];
  const bounds = getPlacementBounds(selectedPiece);
  const currentPosition = piecePositions[selectedIndex];
  const y = currentPosition.y;
  const x = currentPosition.x;
  const dragEnabled = controlMode === "drag";
  const keyboardEnabled = controlMode === "keyboard";

  const placedPieceData = rotatedPieces
    .map((piece, index) => ({
      index,
      piece,
      ...piecePositions[index],
      placed: placedPieces[index],
    }))
    .filter((pieceData) => pieceData.placed && dragState?.pieceIndex !== pieceData.index);

  const previewPiece = dragEnabled || placedPieces[selectedIndex] || dragState?.pieceIndex === selectedIndex
    ? null
    : {
        piece: selectedPiece,
        y,
        x,
      };
  const dragPreviewPlacement =
    dragState && dragHoverCell
      ? {
          piece: rotatedPieces[dragState.pieceIndex],
          ...resolveDropPosition(dragState.pieceIndex, dragHoverCell.y, dragHoverCell.x, dragState.anchor),
        }
      : null;
  const selectedPiecePlacement = dragEnabled
    ? null
    : {
        piece: selectedPiece,
        y,
        x,
      };
  const litGhostCount = buildBoard(ghosts, placedPieceData, null)
    .flat()
    .filter((cell) => cell.lit).length;
  const totalSeconds = Math.floor(elapsedMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = elapsedMilliseconds % 1000;
  const timerLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const finishTimeLabel = `${timerLabel}.${String(milliseconds).padStart(3, "0")}`;
  const selectedPieceNumber = selectedIndex + 1;
  const placedCount = placedPieces.filter(Boolean).length;
  const hasWon = litGhostCount >= ghosts.length && placedCount === pieces.length;
  const selectedPiecePlaced = placedPieces[selectedIndex];
  const allPiecesPlaced = placedCount === pieces.length;

  function updateFeedback(message, tone = "info") {
    setFeedback({ message, tone });
  }

  function clearDragInteraction() {
    dragImageRef.current?.remove();
    dragImageRef.current = null;
    dragMetaRef.current = null;
    setDragState(null);
    setDragHoverCell(null);
  }

  function startTimer() {
    if (timerStarted || hasWon) {
      return;
    }

    startTimeRef.current = Date.now() - elapsedMilliseconds;
    setTimerStarted(true);
  }

  function clampPosition(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getPieceDragAnchor(piece) {
    return [...piece.cells, ...piece.lights].sort((a, b) =>
      a.y === b.y ? a.x - b.x : a.y - b.y
    )[0] ?? { y: 0, x: 0 };
  }

  function buildDragPreviewElement(pieceIndex) {
    const piece = rotatedPieces[pieceIndex];
    const cells = [...piece.cells, ...piece.lights];
    const maxY = Math.max(0, ...cells.map((cell) => cell.y));
    const maxX = Math.max(0, ...cells.map((cell) => cell.x));
    const boardCell = document.querySelector(".board-cell");
    const boardRow = document.querySelector(".board-row");
    const boardCellStyles = boardCell ? window.getComputedStyle(boardCell) : null;
    const boardRowStyles = boardRow ? window.getComputedStyle(boardRow) : null;

    const dragPreview = document.createElement("div");
    dragPreview.className = "tray tray-drag-preview";

    if (boardCell && boardCellStyles) {
      dragPreview.style.setProperty("--tray-cell-size", `${boardCell.getBoundingClientRect().width}px`);
      dragPreview.style.setProperty("--tray-font-size", boardCellStyles.fontSize);
      dragPreview.style.setProperty("--tray-cell-radius", boardCellStyles.borderRadius);
    }

    if (boardRowStyles) {
      dragPreview.style.setProperty("--tray-gap", boardRowStyles.gap);
    }

    const iconMap = new Map();
    piece.cells.forEach((cell) => {
      iconMap.set(`${cell.y},${cell.x}`, "🟦");
    });
    piece.lights.forEach((cell) => {
      iconMap.set(`${cell.y},${cell.x}`, "💡");
    });

    for (let rowIndex = 0; rowIndex <= maxY; rowIndex += 1) {
      const row = document.createElement("div");
      row.className = "tray-row";

      for (let colIndex = 0; colIndex <= maxX; colIndex += 1) {
        const cell = document.createElement("span");
        const icon = iconMap.get(`${rowIndex},${colIndex}`) ?? "";
        cell.className = ["tray-cell", icon ? "" : "tray-cell-empty"]
          .filter(Boolean)
          .join(" ");
        cell.textContent = icon;
        row.appendChild(cell);
      }

      dragPreview.appendChild(row);
    }

    dragPreview.style.position = "fixed";
    dragPreview.style.top = "-1000px";
    dragPreview.style.left = "-1000px";
    dragPreview.style.pointerEvents = "none";
    dragPreview.style.zIndex = "9999";
    dragPreview.style.width = "max-content";
    dragPreview.style.maxWidth = "none";
    dragPreview.style.opacity = "0.98";

    document.body.appendChild(dragPreview);

    return dragPreview;
  }

  function setPiecePosition(pieceIndex, nextY, nextX) {
    const nextBounds = getPlacementBounds(rotatedPieces[pieceIndex]);

    setPiecePositions((prev) =>
      prev.map((pos, index) =>
        index === pieceIndex
          ? {
              ...pos,
              y: clampPosition(nextY, nextBounds.minY, nextBounds.maxY),
              x: clampPosition(nextX, nextBounds.minX, nextBounds.maxX),
            }
          : pos
      )
    );
  }

  function resolveDropPosition(pieceIndex, cellY, cellX, anchor = getPieceDragAnchor(rotatedPieces[pieceIndex])) {
    const nextBounds = getPlacementBounds(rotatedPieces[pieceIndex]);

    return {
      y: clampPosition(cellY - anchor.y, nextBounds.minY, nextBounds.maxY),
      x: clampPosition(cellX - anchor.x, nextBounds.minX, nextBounds.maxX),
    };
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

  function getNextUnplacedIndex(startIndex, delta, placedState = placedPieces) {
    for (let step = 1; step <= pieces.length; step += 1) {
      const nextIndex = (startIndex + delta * step + pieces.length) % pieces.length;

      if (!placedState[nextIndex]) {
        return nextIndex;
      }
    }

    return startIndex;
  }

  function switchPiece(delta) {
    if (hasWon) {
      return;
    }

    setSelectedIndex((currentIndex) => {
      const nextIndex = getNextUnplacedIndex(currentIndex, delta);

      if (nextIndex !== currentIndex) {
        updateFeedback(`Selected piece #${nextIndex + 1}.`, "info");
      }

      return nextIndex;
    });
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

    updateFeedback(
      `Piece #${selectedPieceNumber} rotated to ${nextRotation * 90}deg.`,
      "info"
    );
  }

  function checkOverlap(pieceIndex, originY, originX, positions = piecePositions) {
    const selectedPieceCells = rotatedPieces[pieceIndex].pieceCell(originY, originX);
    const occupiedCells = new Set();

    placedPieces.forEach((placed, index) => {
      if (!placed || index === pieceIndex) {
        return;
      }

      rotatedPieces[index]
        .pieceCell(positions[index].y, positions[index].x)
        .forEach((cell) => {
          occupiedCells.add(`${cell.y},${cell.x}`);
        });
    });

    return selectedPieceCells.some((cell) =>
      occupiedCells.has(`${cell.y},${cell.x}`)
    );
  }

  function handlePieceDragStart(event, pieceIndex) {
    if (!dragEnabled || hasWon || placedPieces[pieceIndex]) {
      event.preventDefault();
      return;
    }
    startTimer();
    startPieceDrag(event, pieceIndex, "tray");
  }

  function startPieceDrag(event, pieceIndex, source) {
    if (!dragEnabled || hasWon) {
      event.preventDefault();
      return;
    }

    const anchor = getPieceDragAnchor(rotatedPieces[pieceIndex]);
    const dragPreview = buildDragPreviewElement(pieceIndex);
    dragImageRef.current = dragPreview;
    dragMetaRef.current = {
      pieceIndex,
      source,
      droppedOnBoard: false,
      invalidBoardDrop: false,
    };
    const dragPreviewRect = dragPreview.getBoundingClientRect();

    setDragState({ pieceIndex, anchor });
    setDragHoverCell(null);
    updateFeedback(
      source === "board"
        ? `Dragging placed piece #${pieceIndex + 1}. Drop it on the board to move it, or away from the board to remove it.`
        : `Dragging piece #${pieceIndex + 1}. Drop it on the board.`,
      "info"
    );
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", pieces[pieceIndex].id);
    event.dataTransfer.setDragImage(
      dragPreview,
      dragPreviewRect.width / 2,
      dragPreviewRect.height / 2
    );
  }

  function handleBoardPieceDragStart(event, pieceIndex) {
    if (!dragEnabled || hasWon || !placedPieces[pieceIndex]) {
      event.preventDefault();
      return;
    }

    startTimer();
    setSelectedIndex(pieceIndex);
    startPieceDrag(event, pieceIndex, "board");
  }

  function setPiecePlaced(pieceIndex, nextPlaced) {
    setPlacedPieces((prev) =>
      prev.map((placed, index) => (index === pieceIndex ? nextPlaced : placed))
    );
  }

  function lockPieceInPlace(pieceIndex) {
    setPlacedPieces((prev) => {
      if (prev[pieceIndex]) {
        return prev;
      }

      const nextPlacedPieces = prev.map((placed, index) =>
        index === pieceIndex ? true : placed
      );
      const nextIndex = getNextUnplacedIndex(pieceIndex, 1, nextPlacedPieces);

      if (!nextPlacedPieces[nextIndex]) {
        setSelectedIndex(nextIndex);
      } else {
        setSelectedIndex(pieceIndex);
      }

      updateFeedback(
        !nextPlacedPieces[nextIndex]
          ? `Piece #${pieceIndex + 1} placed. Piece #${nextIndex + 1} is ready.`
          : `Piece #${pieceIndex + 1} placed. All pieces are on the board.`,
        "success"
      );

      return nextPlacedPieces;
    });
  }

  function handlePieceDragEnd() {
    dragImageRef.current?.remove();
    dragImageRef.current = null;
    if (
      dragMetaRef.current?.source === "board" &&
      !dragMetaRef.current.droppedOnBoard &&
      !dragMetaRef.current.invalidBoardDrop
    ) {
      setPiecePlaced(dragMetaRef.current.pieceIndex, false);
      setSelectedIndex(dragMetaRef.current.pieceIndex);
      updateFeedback(
        `Piece #${dragMetaRef.current.pieceIndex + 1} removed from the board.`,
        "info"
      );
    }

    dragMetaRef.current = null;
    setDragState(null);
    setDragHoverCell(null);
  }

  function handleBoardCellDragOver(event, cellY, cellX) {
    if (!dragEnabled || !dragState) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragHoverCell((current) =>
      current?.y === cellY && current?.x === cellX ? current : { y: cellY, x: cellX }
    );
  }

  function handleBoardCellDrop(event, cellY, cellX) {
    if (!dragEnabled || !dragState) {
      return;
    }

    event.preventDefault();
    const { pieceIndex, anchor } = dragState;
    const dragSource = dragMetaRef.current?.source;
    const nextPosition = resolveDropPosition(pieceIndex, cellY, cellX, anchor);

    if (checkOverlap(pieceIndex, nextPosition.y, nextPosition.x)) {
      dragMetaRef.current = {
        ...dragMetaRef.current,
        droppedOnBoard: false,
        invalidBoardDrop: true,
      };
      updateFeedback("That placement overlaps another piece. Try a different spot.", "error");
      return;
    }

    dragMetaRef.current = {
      ...dragMetaRef.current,
      droppedOnBoard: true,
      invalidBoardDrop: false,
    };
    setSelectedIndex(pieceIndex);
    setPiecePosition(pieceIndex, nextPosition.y, nextPosition.x);

    if (dragSource === "board") {
      updateFeedback(`Piece #${pieceIndex + 1} moved to a new spot.`, "success");
    } else {
      lockPieceInPlace(pieceIndex);
    }

    setDragState(null);
    setDragHoverCell(null);
  }

  function placeSelectedPiece() {
    startTimer();
    lockPieceInPlace(selectedIndex);
  }

  function tryPlaceSelectedPiece(showAlert = false) {
    if (hasWon || placedPieces[selectedIndex]) {
      return;
    }

    if (checkOverlap(selectedIndex, y, x)) {
      if (showAlert) {
        alert("Piece overlaps with another piece!");
      }

      updateFeedback("That placement overlaps another piece. Try a different spot.", "error");
      return;
    }

    placeSelectedPiece();
  }

  useEffect(() => {
    return () => {
      clearDragInteraction();
    };
  }, []);

  useEffect(() => {
    if (hasWon) {
      updateFeedback("Every ghost is lit. Puzzle solved!", "success");
      return undefined;
    }

    if (!timerStarted) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setElapsedMilliseconds(Date.now() - startTimeRef.current);
    }, 16);

    return () => {
      window.clearInterval(timerId);
    };
  }, [hasWon, timerStarted]);

  useEffect(() => {
    if (!hasWon && (feedback.tone === "error" || feedback.tone === "success")) {
      const timeoutId = window.setTimeout(() => {
        setFeedback((current) =>
          current.tone === "error" || current.tone === "success"
            ? {
                tone: "info",
                message: selectedPiecePlaced
                  ? `Piece #${selectedPieceNumber} is locked in. Choose another available piece.`
                  : `Piece #${selectedPieceNumber} is active. Position it and place it on the board.`
              }
            : current
        );
      }, 2200);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    return undefined;
  }, [feedback.tone, hasWon, selectedPieceNumber, selectedPiecePlaced]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!keyboardEnabled) {
        if (["r", "R"].includes(e.key)) {
          e.preventDefault();
          resetGame();
        }

        return;
      }

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
          startTimer();
          rotateSelectedPiece();
          break;
        case "ArrowUp":
        case "w":
          startTimer();
          moveY(-1);
          break;
        case "ArrowDown":
        case "s":
          startTimer();
          moveY(1);
          break;
        case "ArrowLeft":
        case "a":
          startTimer();
          moveX(-1);
          break;
        case "ArrowRight":
        case "d":
          startTimer();
          moveX(1);
          break;
        case "q":
        case "PageUp":
          startTimer();
          switchPiece(-1);
          break;
        case "e":
        case "PageDown":
          startTimer();
          switchPiece(1);
          break;
        case "Enter":
          startTimer();
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
    keyboardEnabled,
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
            <h1 className="title">Ghost Hunters</h1>
            <p className="subtitle">
              Place all six gadget pieces on the 4 x 4 board. Each ghost must end
              up on a square with a light bulb, and pieces are not allowed to overlap.
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
          <p className="win-message">
            You win in {finishTimeLabel}! Press R or use Reset to play again.
          </p>
        ) : null}

        <main className="game-layout">
          <section className="piece-gallery-panel piece-gallery-sidebar">
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
                      if (!hasWon && !isPlaced) {
                        if (index !== selectedIndex) {
                          startTimer();
                        }
                        setSelectedIndex(index);
                        updateFeedback(`Selected piece #${index + 1}.`, "info");
                      }
                    }}
                    disabled={hasWon || isPlaced}
                  >
                    <div className="piece-gallery-card-header">
                      <span className="piece-gallery-title">Piece #{index + 1}</span>
                      <span className="piece-gallery-state">
                        {isPlaced ? "Placed" : isSelected ? "Selected" : "Available"}
                      </span>
                    </div>
                    <div
                      className={[
                        "tray-drag-shell",
                        "tray-gallery-drag-shell",
                        !dragEnabled || isPlaced ? "tray-drag-shell-disabled" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      draggable={dragEnabled && !hasWon && !isPlaced}
                      onDragStart={(event) => handlePieceDragStart(event, index)}
                      onDragEnd={handlePieceDragEnd}
                    >
                      <Tray piece={piece} className="tray-gallery" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="board-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">Board</p>
                <h2 className="panel-title">Light Every Ghost</h2>
              </div>
              <span className="panel-badge">4 x 4 puzzle</span>
            </div>
            <Board
              ghosts={ghosts}
              placedPieces={placedPieceData}
              previewPiece={previewPiece}
              selectedPiecePlacement={selectedPiecePlacement}
              isDragActive={dragEnabled && Boolean(dragState)}
              dragPreviewPlacement={dragPreviewPlacement}
              onPlacedPieceDragStart={dragEnabled ? handleBoardPieceDragStart : undefined}
              onPlacedPieceDragEnd={dragEnabled ? handlePieceDragEnd : undefined}
              onCellDragOver={handleBoardCellDragOver}
              onCellDrop={handleBoardCellDrop}
            />

            <div className="board-tray-panel">
              <div className="panel-header board-tray-header">
                <div>
                  <p className="panel-label">Active Piece</p>
                  <h2 className="panel-title">Ready For Placement</h2>
                </div>
                <span
                  className={`selection-chip ${selectedPiecePlaced ? "selection-chip-placed" : ""}`}
                >
                  {selectedPiecePlaced
                    ? "Locked In"
                    : dragEnabled
                      ? "Ready To Drag"
                      : "Ready For Keys"}
                </span>
              </div>

              <div className="piece-meta">
                <div className="meta-card">
                  <span className="meta-label">Piece</span>
                  <strong className="meta-value">#{selectedPieceNumber}</strong>
                </div>
              </div>

              <div className="piece-preview-layout board-piece-preview-layout">
                <div className="preview-actions">
                  <button
                    type="button"
                    className="control-button control-button-secondary"
                    onClick={() => rotateSelectedPiece(-1)}
                    disabled={hasWon || selectedPiecePlaced}
                  >
                    Rotate Left
                  </button>

                  <button
                    type="button"
                    className="control-button control-button-secondary"
                    onClick={() => rotateSelectedPiece()}
                    disabled={hasWon || selectedPiecePlaced}
                  >
                    Rotate Right
                  </button>

                  <button
                    type="button"
                    className="control-button control-button-secondary"
                    onClick={() => switchPiece(-1)}
                    disabled={hasWon || allPiecesPlaced}
                  >
                    Previous Piece
                  </button>

                  <button
                    type="button"
                    className="control-button control-button-secondary"
                    onClick={() => switchPiece(1)}
                    disabled={hasWon || allPiecesPlaced}
                  >
                    Next Piece
                  </button>
                </div>

                <div
                  className={[
                    "tray-drag-shell",
                    "tray-board-preview",
                    !dragEnabled || hasWon || selectedPiecePlaced ? "tray-drag-shell-disabled" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  draggable={dragEnabled && !hasWon && !selectedPiecePlaced}
                  onDragStart={(event) => handlePieceDragStart(event, selectedIndex)}
                  onDragEnd={handlePieceDragEnd}
                >
                  <Tray piece={selectedPiece} className="tray-preview" />
                </div>
              </div>
            </div>

            <div className="board-focus-bar">
              <div className="board-focus-copy">
                <span className="focus-label">Current Action</span>
                <strong className="focus-title">
                  {selectedPiecePlaced
                    ? `Piece #${selectedPieceNumber} is locked in`
                    : `Place piece #${selectedPieceNumber}`}
                </strong>
                <p
                  className={`feedback-text feedback-text-${feedback.tone}`}
                  aria-live="polite"
                >
                  {feedback.message}
                </p>
              </div>

              <button
                type="button"
                className="control-button control-button-primary control-button-hero"
                onClick={() => {
                  tryPlaceSelectedPiece(true);
                }}
                disabled={hasWon || selectedPiecePlaced}
              >
                Place Piece
              </button>
            </div>
          </section>
        </main>

        <aside className="sidebar sidebar-bottom">
          <section className="shortcut-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">How To Play</p>
                <h2 className="panel-title">Rules</h2>
              </div>
              <span className="panel-badge">New players</span>
            </div>

            <div className="rules-list">
              <p className="rule-item">
                <strong>1.</strong> The goal is to light every ghost with a yellow light bulb.
              </p>
              <p className="rule-item">
                <strong>2.</strong> You need to place every piece on the board to finish the game.
              </p>
              <p className="rule-item">
                <strong>3.</strong> Blue squares may cover empty spaces, pieces cannot overlap.
              </p>
              <p className="rule-item">
                <strong>4.</strong> You can rotate pieces.
              </p>
              <p className="rule-item">
                <strong>Symbols:</strong> `👻` ghost, `💡` light, `🟦` empty square.
              </p>
            </div>
          </section>

          <section className="shortcut-panel">
            <div className="action-list compact-action-list">
              <button
                type="button"
                className="control-button control-button-ghost control-button-icon"
                onClick={() => setSettingsOpen((open) => !open)}
                aria-expanded={settingsOpen}
                >
                  ⚙ Settings
                </button>

              {settingsOpen ? (
                <>
                  <div className="settings-block">
                    <span className="meta-label">Controls</span>
                    <div className="mode-toggle" role="radiogroup" aria-label="Control mode">
                      <button
                        type="button"
                        className={[
                          "mode-toggle-button",
                          controlMode === "drag" ? "mode-toggle-button-active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        role="radio"
                        aria-checked={controlMode === "drag"}
                        onClick={() => {
                          setControlMode("drag");
                          clearDragInteraction();
                          updateFeedback("Drag and drop controls enabled.", "info");
                        }}
                      >
                        Drag & Drop
                      </button>
                      <button
                        type="button"
                        className={[
                          "mode-toggle-button",
                          controlMode === "keyboard" ? "mode-toggle-button-active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        role="radio"
                        aria-checked={controlMode === "keyboard"}
                        onClick={() => {
                          setControlMode("keyboard");
                          clearDragInteraction();
                          updateFeedback("Keyboard controls enabled.", "info");
                        }}
                      >
                        Keyboard
                      </button>
                    </div>
                    <p className="settings-help">
                      Drag mode lets you drop pieces directly onto the board. Keyboard mode lets you move the selected piece with the keys listed below.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="control-button control-button-ghost"
                    onClick={resetGame}
                  >
                    Reset Game
                  </button>
                </>
              ) : null}
            </div>
          </section>

          <section className="shortcut-panel">
            <div className="panel-header">
              <div>
                <p className="panel-label">Keyboard</p>
                <h2 className="panel-title">Quick Commands</h2>
              </div>
              <span className="panel-badge">
                {keyboardEnabled ? "Enabled" : "Turn on in Settings"}
              </span>
            </div>
            <div className="shortcut-list">
              <span className="shortcut-pill">WASD / Arrows move</span>
              <span className="shortcut-pill">Z rotate right</span>
              <span className="shortcut-pill">Q / E switch</span>
              <span className="shortcut-pill">Enter place</span>
              <span className="shortcut-pill">R reset</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
