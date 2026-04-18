export default function Tray({ piece, className = "" }) {
  const cells = piece ? [...piece.cells, ...piece.lights] : [];
  const maxY = Math.max(0, ...cells.map((cell) => cell.y));
  const maxX = Math.max(0, ...cells.map((cell) => cell.x));
  const trayBoard = Array.from({ length: maxY + 1 }, () =>
    Array.from({ length: maxX + 1 }, () => null)
  );

  if (piece) {
    piece.cells.forEach((cell) => {
      trayBoard[cell.y][cell.x] = "🟦";
    });

    piece.lights.forEach((cell) => {
      trayBoard[cell.y][cell.x] = "💡";
    });
  }

  return (
    <div className={["tray", className].filter(Boolean).join(" ")}>
      {trayBoard.map((row, i) => (
        <div key={i} className="tray-row">
          {row.map((cell, j) => (
            <span
              key={j}
              className={["tray-cell", !cell ? "tray-cell-empty" : ""].filter(Boolean).join(" ")}
              aria-hidden={!cell}
            >
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
