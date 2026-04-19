import Tray from "./Tray";

export default function ActivePiecePanel({
  dragEnabled,
  hasWon,
  selectedPiecePlaced,
  selectedPieceNumber,
  selectedPiece,
  selectedIndex,
  allPiecesPlaced,
  feedback,
  onRotateLeft,
  onRotateRight,
  onPreviousPiece,
  onNextPiece,
  onPieceDragStart,
  onPieceDragEnd,
  onPlacePiece,
}) {
  return (
    <>
      <div className="board-tray-panel">
        <div className="panel-header board-tray-header">
          <div>
            <p className="panel-label">Active Piece</p>
            <h2 className="panel-title">Ready For Placement</h2>
          </div>
          <span
            className={`selection-chip ${selectedPiecePlaced ? "selection-chip-placed" : ""}`}
          >
            {selectedPiecePlaced
              ? "Locked In"
              : dragEnabled
                ? "Ready To Drag"
                : "Ready For Keys"}
          </span>
        </div>

        <div className="piece-meta">
          <div className="meta-card">
            <span className="meta-label">Piece</span>
            <strong className="meta-value">#{selectedPieceNumber}</strong>
          </div>
        </div>

        <div className="piece-preview-layout board-piece-preview-layout">
          <div className="preview-actions">
            <button
              type="button"
              className="control-button control-button-secondary"
              onClick={onRotateLeft}
              disabled={hasWon || selectedPiecePlaced}
            >
              Rotate Left
            </button>

            <button
              type="button"
              className="control-button control-button-secondary"
              onClick={onRotateRight}
              disabled={hasWon || selectedPiecePlaced}
            >
              Rotate Right
            </button>

            <button
              type="button"
              className="control-button control-button-secondary"
              onClick={onPreviousPiece}
              disabled={hasWon || allPiecesPlaced}
            >
              Previous Piece
            </button>

            <button
              type="button"
              className="control-button control-button-secondary"
              onClick={onNextPiece}
              disabled={hasWon || allPiecesPlaced}
            >
              Next Piece
            </button>
          </div>

          <div
            className={[
              "tray-drag-shell",
              "tray-board-preview",
              !dragEnabled || hasWon || selectedPiecePlaced ? "tray-drag-shell-disabled" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            draggable={dragEnabled && !hasWon && !selectedPiecePlaced}
            onDragStart={(event) => onPieceDragStart(event, selectedIndex)}
            onDragEnd={onPieceDragEnd}
          >
            <Tray piece={selectedPiece} className="tray-preview" />
          </div>
        </div>
      </div>

      <div className="board-focus-bar">
        <div className="board-focus-copy">
          <span className="focus-label">Current Action</span>
          <strong className="focus-title">
            {selectedPiecePlaced
              ? `Piece #${selectedPieceNumber} is locked in`
              : `Place piece #${selectedPieceNumber}`}
          </strong>
          <p className={`feedback-text feedback-text-${feedback.tone}`} aria-live="polite">
            {feedback.message}
          </p>
        </div>

        <button
          type="button"
          className="control-button control-button-primary control-button-hero"
          onClick={onPlacePiece}
          disabled={hasWon || selectedPiecePlaced}
        >
          Place Piece
        </button>
      </div>
    </>
  );
}
