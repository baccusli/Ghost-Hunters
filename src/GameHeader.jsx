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
      <div className="hero-copy">
        <p className="brand-kicker">Puzzle Lab Edition</p>
        <div className="title-stack">
          <h1 className="title">Ghost Hunters</h1>
          <span className="title-chip">Spatial Logic Game</span>
        </div>
        <p className="subtitle">
          A compact deduction puzzle with tactile controls, clean feedback, and
          a single objective: illuminate every ghost without overlapping any gadget pieces.
        </p>
      </div>

      <div className="status-strip">
        <div className="status-card status-card-primary">
          <span className="status-label">Lit Ghosts</span>
          <strong className="status-value">
            {litGhostCount} / {ghostCount}
          </strong>
          <span className="status-note">Target coverage</span>
        </div>

        <div className="status-card">
          <span className="status-label">Placed Pieces</span>
          <strong className="status-value">
            {placedCount} / {pieceCount}
          </strong>
          <span className="status-note">Board progress</span>
        </div>

        <div className="status-card">
          <span className="status-label">Selected Piece</span>
          <strong className="status-value">#{selectedPieceNumber}</strong>
          <span className="status-note">Current focus</span>
        </div>

        <div className="status-card">
          <span className="status-label">Moves</span>
          <strong className="status-value">{moveCount}</strong>
          <span className="status-note">Efficiency</span>
        </div>

        <div className="status-card">
          <span className="status-label">Timer</span>
          <strong className="status-value">{timerLabel}</strong>
          <span className="status-note">Live run</span>
        </div>
      </div>
    </header>
  );
}
