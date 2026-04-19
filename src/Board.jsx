import { buildBoard } from "./boardState";

export default function Board({
  ghosts,
  placedPieces,
  previewPiece,
  selectedPiecePlacement,
  isDragActive,
  dragPreviewPlacement,
  onPlacedPieceDragStart,
  onPlacedPieceDragEnd,
  onBoardDragOver,
  onBoardDrop,
  onCellDragOver,
  onCellDrop,
}) {
  const board = buildBoard(ghosts, placedPieces, previewPiece);
  const selectedCells = new Set();
  const selectedLightCells = new Set();
  const selectedFootprintCells = new Set();
  const dragPreviewCells = new Set();
  const placedPieceCells = new Map();

  if (selectedPiecePlacement?.piece?.onBoard(selectedPiecePlacement.y, selectedPiecePlacement.x)) {
    const { piece, y, x } = selectedPiecePlacement;
    const pieceCells = piece.pieceCell(y, x);
    const lightCells = piece.lightsAt(y, x);
    const allCells = [...pieceCells, ...lightCells];
    const minY = Math.min(...allCells.map((cell) => cell.y));
    const maxY = Math.max(...allCells.map((cell) => cell.y));
    const minX = Math.min(...allCells.map((cell) => cell.x));
    const maxX = Math.max(...allCells.map((cell) => cell.x));

    pieceCells.forEach((cell) => {
      selectedCells.add(`${cell.y},${cell.x}`);
    });

    lightCells.forEach((cell) => {
      const key = `${cell.y},${cell.x}`;
      selectedCells.add(key);
      selectedLightCells.add(key);
    });

    for (let row = minY; row <= maxY; row += 1) {
      for (let col = minX; col <= maxX; col += 1) {
        const key = `${row},${col}`;

        if (!selectedCells.has(key)) {
          selectedFootprintCells.add(key);
        }
      }
    }
  }

  if (dragPreviewPlacement?.piece?.onBoard(dragPreviewPlacement.y, dragPreviewPlacement.x)) {
    dragPreviewPlacement.piece
      .pieceCell(dragPreviewPlacement.y, dragPreviewPlacement.x)
      .forEach((cell) => {
        dragPreviewCells.add(`${cell.y},${cell.x}`);
      });

    dragPreviewPlacement.piece
      .lightsAt(dragPreviewPlacement.y, dragPreviewPlacement.x)
      .forEach((cell) => {
        dragPreviewCells.add(`${cell.y},${cell.x}`);
      });
  }

  placedPieces.forEach(({ index, piece, y, x }) => {
    piece.pieceCell(y, x).forEach((cell) => {
      placedPieceCells.set(`${cell.y},${cell.x}`, index);
    });

    piece.lightsAt(y, x).forEach((cell) => {
      placedPieceCells.set(`${cell.y},${cell.x}`, index);
    });
  });

  return (
    <div
      className={["board", isDragActive ? "board-drag-active" : ""].filter(Boolean).join(" ")}
      onDragOver={onBoardDragOver}
      onDrop={onBoardDrop}
    >
      {board.map((row, i) => (
        <div key={i} className="board-row">
          {row.map((cell, j) => {
            const placedPieceIndex = placedPieceCells.get(`${i},${j}`);

            return (
              <span
                key={j}
                draggable={placedPieceIndex !== undefined}
                onDragStart={(event) => {
                  if (placedPieceIndex !== undefined) {
                    onPlacedPieceDragStart?.(event, placedPieceIndex);
                  }
                }}
                onDragEnd={() => onPlacedPieceDragEnd?.()}
                onDragOver={(event) => onCellDragOver?.(event, i, j)}
                onDrop={(event) => onCellDrop?.(event, i, j)}
                className={[
                  "board-cell",
                  isDragActive ? "board-cell-droppable" : "",
                  placedPieceIndex !== undefined ? "board-cell-placed-piece" : "",
                  dragPreviewCells.has(`${i},${j}`) ? "board-cell-drag-hover" : "",
                  cell.covered ? "covered-ghost" : "",
                  cell.lit ? "lit-ghost" : "",
                  selectedFootprintCells.has(`${i},${j}`) ? "selected-piece-footprint" : "",
                  selectedCells.has(`${i},${j}`) ? "selected-piece-cell" : "",
                  selectedCells.has(`${i},${j}`) && !selectedLightCells.has(`${i},${j}`)
                    ? "selected-piece-body"
                    : "",
                  selectedLightCells.has(`${i},${j}`) ? "selected-piece-light" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {cell.icon}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
