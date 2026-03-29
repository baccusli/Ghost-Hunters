import { pieces } from "./gamedata";

export default function Tray() {
  const trayBoard = Array.from({ length: 2 }, () => Array(2).fill("⬛"));

  pieces.forEach((piece) => {
    piece.cells.forEach((cell) => {
      trayBoard[cell.y][cell.x] = "⬜";
    });

    piece.lights.forEach((cell) => {
      trayBoard[cell.y][cell.x] = "💡";
    });
  });

  return (
    <div className="tray">
      {trayBoard.map((row, i) => (
        <div key={i} className="tray-row">
          {row.map((cell, j) => (
            <span key={j} className="tray-cell">
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
