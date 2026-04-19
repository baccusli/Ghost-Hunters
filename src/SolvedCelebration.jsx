export default function SolvedCelebration({ finishTimeLabel, moveCount, onResetGame }) {
  return (
    <section className="solved-banner" aria-live="polite">
      <div className="solved-copy">
        <span className="solved-kicker">Puzzle Solved</span>
        <h2 className="solved-title">Every ghost was lit.</h2>
        <p className="solved-text">
          You completed the board in <strong>{finishTimeLabel}</strong> using{" "}
          <strong>{moveCount}</strong> moves. Press <strong>R</strong> or start a fresh round below.
        </p>
      </div>

      <div className="solved-stats">
        <div className="solved-stat-card">
          <span className="status-label">Finish Time</span>
          <strong className="status-value">{finishTimeLabel}</strong>
        </div>
        <div className="solved-stat-card">
          <span className="status-label">Moves</span>
          <strong className="status-value">{moveCount}</strong>
        </div>
      </div>

      <button
        type="button"
        className="control-button control-button-primary solved-button"
        onClick={onResetGame}
      >
        Play Again
      </button>
    </section>
  );
}
