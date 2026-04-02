import { checkPiecePlacement } from "./Pieces";

export default function Board({ ghosts, piece, y, x }) {
  const board = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => ({ icon: "⬛", lit: false, covered: false }))
  );

  ghosts.forEach((ghost) => {
    board[ghost.y][ghost.x] = { icon: "👹", lit: false, covered: false };
  });

  if (piece?.onBoard(y, x)) {
    checkPiecePlacement(board, piece, ghosts, y, x);
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
