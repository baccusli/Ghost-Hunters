import { useEffect, useRef, useState } from "react";
import Board from "./Board";
import ActivePiecePanel from "./ActivePiecePanel";
import GameHeader from "./GameHeader";
import GameSidebar from "./GameSidebar";
import { countLitGhosts } from "./boardState";
import { ghosts } from "./Ghosts";
import PieceGallery from "./PieceGallery";
import SolvedCelebration from "./SolvedCelebration";
import {
  createInitialMoveCount,
  createInitialPiecePositions,
  createInitialPieceRotations,
  createInitialPlacedPieces,
  createIntroFeedback,
  createResetFeedback,
  formatElapsedTime,
} from "./gameState";
import { getPlacementBounds, pieces } from "./Pieces";

export default function App() {
  const dragImageRef = useRef(null);
  const dragMetaRef = useRef(null);
  const dragStateRef = useRef(null);
  const dragHoverCellRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [piecePositions, setPiecePositions] = useState(() =>
    createInitialPiecePositions(pieces)
  );
  const [pieceRotations, setPieceRotations] = useState(() =>
    createInitialPieceRotations(pieces)
  );
  const [placedPieces, setPlacedPieces] = useState(() =>
    createInitialPlacedPieces(pieces)
  );
  const [moveCount, setMoveCount] = useState(createInitialMoveCount);
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlMode, setControlMode] = useState("drag");
  const [dragState, setDragState] = useState(null);
  const [dragHoverCell, setDragHoverCell] = useState(null);
  const [feedback, setFeedback] = useState(createIntroFeedback);

  const rotatedPieces = pieces.map((piece, index) =>
    piece.rotated(pieceRotations[index])
  );

  function resetGame() {
    setSelectedIndex(0);
    setPiecePositions(createInitialPiecePositions(pieces));
    setPieceRotations(createInitialPieceRotations(pieces));
    setPlacedPieces(createInitialPlacedPieces(pieces));
    setMoveCount(createInitialMoveCount());
    startTimeRef.current = Date.now();
    setElapsedMilliseconds(0);
    setTimerStarted(false);
    setSettingsOpen(false);
    clearDragInteraction();
    setFeedback(createResetFeedback());
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
  const litGhostCount = countLitGhosts(ghosts, placedPieceData);
  const { timerLabel, finishTimeLabel } = formatElapsedTime(elapsedMilliseconds);
  const selectedPieceNumber = selectedIndex + 1;
  const placedCount = placedPieces.filter(Boolean).length;
  const hasWon = litGhostCount >= ghosts.length && placedCount === pieces.length;
  const selectedPiecePlaced = placedPieces[selectedIndex];
  const allPiecesPlaced = placedCount === pieces.length;

  function updateFeedback(message, tone = "info") {
    setFeedback({ message, tone });
  }

  function recordMove() {
    setMoveCount((current) => current + 1);
  }

  function handleSelectPiece(index, isPlaced) {
    if (hasWon || isPlaced) {
      return;
    }

    if (index !== selectedIndex) {
      startTimer();
    }

    setSelectedIndex(index);
    updateFeedback(`Selected piece #${index + 1}.`, "info");
  }

  function handleControlModeChange(mode) {
    setControlMode(mode);
    clearDragInteraction();
    updateFeedback(
      mode === "drag" ? "Drag and drop controls enabled." : "Keyboard controls enabled.",
      "info"
    );
  }

  function clearDragInteraction() {
    dragImageRef.current?.remove();
    dragImageRef.current = null;
    dragMetaRef.current = null;
    dragStateRef.current = null;
    dragHoverCellRef.current = null;
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

    const nextY = clampPosition(currentPosition.y + delta, bounds.minY, bounds.maxY);

    if (nextY === currentPosition.y) {
      return;
    }

    recordMove();
    setPiecePositions((prev) =>
      prev.map((pos, index) =>
        index === selectedIndex
          ? { ...pos, y: nextY }
          : pos
      )
    );
  }

  function moveX(delta) {
    if (hasWon || placedPieces[selectedIndex]) {
      return;
    }

    const nextX = clampPosition(currentPosition.x + delta, bounds.minX, bounds.maxX);

    if (nextX === currentPosition.x) {
      return;
    }

    recordMove();
    setPiecePositions((prev) =>
      prev.map((pos, index) =>
        index === selectedIndex
          ? { ...pos, x: nextX }
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

  function rotatePiece(pieceIndex, delta = 1) {
    if (hasWon || placedPieces[pieceIndex]) {
      return;
    }

    startTimer();
    recordMove();
    const nextRotation = (pieceRotations[pieceIndex] + delta + 4) % 4;
    const nextPiece = pieces[pieceIndex].rotated(nextRotation);
    const nextBounds = getPlacementBounds(nextPiece);

    setPieceRotations((prev) =>
      prev.map((rotation, index) =>
        index === pieceIndex ? nextRotation : rotation
      )
    );

    setPiecePositions((prev) =>
      prev.map((pos, index) =>
        index === pieceIndex
          ? {
              ...pos,
              y: clampPosition(pos.y, nextBounds.minY, nextBounds.maxY),
              x: clampPosition(pos.x, nextBounds.minX, nextBounds.maxX),
            }
          : pos
      )
    );

    if (pieceIndex !== selectedIndex) {
      setSelectedIndex(pieceIndex);
    }
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
    dragStateRef.current = { pieceIndex, anchor };
    const dragPreviewRect = dragPreview.getBoundingClientRect();

    setDragState({ pieceIndex, anchor });
    dragHoverCellRef.current = null;
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

    window.setTimeout(() => {
      if (
        dragMetaRef.current?.source === "board" &&
        !dragMetaRef.current.droppedOnBoard &&
        !dragMetaRef.current.invalidBoardDrop
      ) {
        recordMove();
        setPlacedPieces((prev) =>
          prev.map((placed, index) =>
            index === dragMetaRef.current.pieceIndex ? false : placed
          )
        );
        setSelectedIndex(dragMetaRef.current.pieceIndex);
        updateFeedback(
          `Piece #${dragMetaRef.current.pieceIndex + 1} removed from the board.`,
          "info"
        );
      }

      dragMetaRef.current = null;
      dragStateRef.current = null;
      dragHoverCellRef.current = null;
      setDragState(null);
      setDragHoverCell(null);
    }, 0);
  }

  function handleBoardCellDragOver(event, cellY, cellX) {
    if (!dragEnabled || !(dragStateRef.current ?? dragState)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const nextHoverCell = { y: cellY, x: cellX };
    dragHoverCellRef.current = nextHoverCell;
    setDragHoverCell((current) =>
      current?.y === cellY && current?.x === cellX ? current : nextHoverCell
    );
  }

  function commitBoardDrop(event, cellY, cellX) {
    const activeDragState = dragStateRef.current ?? dragState;

    if (!dragEnabled || !activeDragState) {
      return;
    }

    event.preventDefault();
    const { pieceIndex, anchor } = activeDragState;
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

    const currentDraggedPosition = piecePositions[pieceIndex];

    if (
      dragSource !== "board" ||
      currentDraggedPosition.y !== nextPosition.y ||
      currentDraggedPosition.x !== nextPosition.x
    ) {
      recordMove();
    }

    if (dragSource === "board") {
      updateFeedback(`Piece #${pieceIndex + 1} moved to a new spot.`, "success");
    } else {
      lockPieceInPlace(pieceIndex);
    }

    setDragState(null);
    dragStateRef.current = null;
    dragHoverCellRef.current = null;
    setDragHoverCell(null);
  }

  function handleBoardDragOver(event) {
    if (!dragEnabled || !(dragStateRef.current ?? dragState)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleBoardDrop(event) {
    const dropTarget = event.target;

    if (dropTarget instanceof Element && dropTarget.closest(".board-cell")) {
      return;
    }

    const fallbackCell = dragHoverCellRef.current ?? dragHoverCell;

    if (!fallbackCell) {
      return;
    }

    commitBoardDrop(event, fallbackCell.y, fallbackCell.x);
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

    startTimer();
    recordMove();
    lockPieceInPlace(selectedIndex);
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
          rotatePiece(selectedIndex);
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
        <GameHeader
          litGhostCount={litGhostCount}
          ghostCount={ghosts.length}
          placedCount={placedCount}
          pieceCount={pieces.length}
          moveCount={moveCount}
          selectedPieceNumber={selectedPieceNumber}
          timerLabel={timerLabel}
        />

        {hasWon ? (
          <SolvedCelebration
            finishTimeLabel={finishTimeLabel}
            moveCount={moveCount}
            onResetGame={resetGame}
          />
        ) : null}

        <main className="game-layout mission-grid">
          <PieceGallery
            pieces={rotatedPieces}
            placedPieces={placedPieces}
            selectedIndex={selectedIndex}
            dragEnabled={dragEnabled}
            hasWon={hasWon}
            onSelectPiece={handleSelectPiece}
            onRotatePiece={rotatePiece}
            onPieceDragStart={handlePieceDragStart}
            onPieceDragEnd={handlePieceDragEnd}
          />

          <section className="board-panel board-stage">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Board</h2>
              </div>
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
              onBoardDragOver={handleBoardDragOver}
              onBoardDrop={handleBoardDrop}
              onCellDragOver={handleBoardCellDragOver}
              onCellDrop={commitBoardDrop}
            />
          </section>

          <div className="board-workbench">
            <ActivePiecePanel
              dragEnabled={dragEnabled}
              hasWon={hasWon}
              selectedPiecePlaced={selectedPiecePlaced}
              selectedPieceNumber={selectedPieceNumber}
              selectedPiece={selectedPiece}
              selectedIndex={selectedIndex}
              allPiecesPlaced={allPiecesPlaced}
              feedback={feedback}
              onRotateLeft={() => rotatePiece(selectedIndex, -1)}
              onRotateRight={() => rotatePiece(selectedIndex)}
              onRotatePreview={() => rotatePiece(selectedIndex)}
              onPreviousPiece={() => switchPiece(-1)}
              onNextPiece={() => switchPiece(1)}
              onPieceDragStart={handlePieceDragStart}
              onPieceDragEnd={handlePieceDragEnd}
              onPlacePiece={() => tryPlaceSelectedPiece(true)}
            />
          </div>

          <GameSidebar
            pieceCount={pieces.length}
            keyboardEnabled={keyboardEnabled}
            settingsOpen={settingsOpen}
            controlMode={controlMode}
            onToggleSettings={() => setSettingsOpen((open) => !open)}
            onSetControlMode={handleControlModeChange}
            onResetGame={resetGame}
          />
        </main>
      </div>
    </div>
  );
}
