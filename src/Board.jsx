import { checkPiecePlacement } from "./Pieces";

export function buildBoard(ghosts, placedPieces, previewPiece) {
  const board = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => ({ icon: "⬛", lit: false, covered: false }))
  );

  ghosts.forEach((ghost) => {
    board[ghost.y][ghost.x] = { icon: "👻", lit: false, covered: false };
  });

  placedPieces.forEach(({ piece, y, x }) => {
    if (piece?.onBoard(y, x)) {
      checkPiecePlacement(board, piece, ghosts, y, x);
    }
  });

  if (previewPiece?.piece?.onBoard(previewPiece.y, previewPiece.x)) {
    checkPiecePlacement(
      board,
      previewPiece.piece,
      ghosts,
      previewPiece.y,
      previewPiece.x
    );
  }

  return board;
}

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
  const dragPreviewCells = new Set();
  const placedPieceCells = new Map();

  if (selectedPiecePlacement?.piece?.onBoard(selectedPiecePlacement.y, selectedPiecePlacement.x)) {
    selectedPiecePlacement.piece
      .pieceCell(selectedPiecePlacement.y, selectedPiecePlacement.x)
      .forEach((cell) => {
        selectedCells.add(`${cell.y},${cell.x}`);
      });

    selectedPiecePlacement.piece
      .lightsAt(selectedPiecePlacement.y, selectedPiecePlacement.x)
      .forEach((cell) => {
        selectedCells.add(`${cell.y},${cell.x}`);
      });
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
                  selectedCells.has(`${i},${j}`) ? "selected-piece-cell" : "",
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
