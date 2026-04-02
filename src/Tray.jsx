export default function Tray({ piece }) {
  const cells = piece ? [...piece.cells, ...piece.lights] : [];
  const maxY = Math.max(0, ...cells.map((cell) => cell.y));
  const maxX = Math.max(0, ...cells.map((cell) => cell.x));
  const trayBoard = Array.from({ length: maxY + 1 }, () => Array(maxX + 1).fill("⬛"));

  if (piece) {
    piece.cells.forEach((cell) => {
      trayBoard[cell.y][cell.x] = "🟦";
    });

    piece.lights.forEach((cell) => {
      trayBoard[cell.y][cell.x] = "💡";
    });
  }

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
