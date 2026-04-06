import { checkPiecePlacement } from "./Pieces";

export default function Board({ ghosts, placedPieces, previewPiece }) {
  const board = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => ({ icon: "⬛", lit: false, covered: false }))
  );

  ghosts.forEach((ghost) => {
    board[ghost.y][ghost.x] = { icon: "🐒", lit: false, covered: false };
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

  return (
    <div className="board">
      {board.map((row, i) => (
        <div key={i} className="board-row">
          {row.map((cell, j) => (
            <span
              key={j}
              className={`board-cell ${cell.covered ? "covered-ghost" : ""} ${cell.lit ? "lit-ghost" : ""}`.trim()}
            >
              {cell.icon}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
