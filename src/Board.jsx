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
}) {
  const board = buildBoard(ghosts, placedPieces, previewPiece);
  const selectedCells = new Set();

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

  return (
    <div className="board">
      {board.map((row, i) => (
        <div key={i} className="board-row">
          {row.map((cell, j) => (
            <span
              key={j}
              className={[
                "board-cell",
                cell.covered ? "covered-ghost" : "",
                cell.lit ? "lit-ghost" : "",
                selectedCells.has(`${i},${j}`) ? "selected-piece-cell" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {cell.icon}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
