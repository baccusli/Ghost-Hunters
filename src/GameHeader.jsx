export default function GameHeader({
  litGhostCount,
  ghostCount,
  placedCount,
  pieceCount,
  moveCount,
  selectedPieceNumber,
  timerLabel,
}) {
  return (
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
            {litGhostCount} / {ghostCount}
          </strong>
        </div>

        <div className="status-card">
          <span className="status-label">Placed Pieces</span>
          <strong className="status-value">
            {placedCount} / {pieceCount}
          </strong>
        </div>

        <div className="status-card">
          <span className="status-label">Selected Piece</span>
          <strong className="status-value">#{selectedPieceNumber}</strong>
        </div>

        <div className="status-card">
          <span className="status-label">Moves</span>
          <strong className="status-value">{moveCount}</strong>
        </div>

        <div className="status-card">
          <span className="status-label">Timer</span>
          <strong className="status-value">{timerLabel}</strong>
        </div>
      </div>
    </header>
  );
}
