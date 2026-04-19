import Tray from "./Tray";

export default function PieceGallery({
  pieces,
  placedPieces,
  selectedIndex,
  dragEnabled,
  hasWon,
  onSelectPiece,
  onPieceDragStart,
  onPieceDragEnd,
}) {
  return (
    <section className="piece-gallery-panel piece-gallery-sidebar">
      <div className="panel-header">
        <div>
          <p className="panel-label">Pieces</p>
          <h2 className="panel-title">All Pieces</h2>
        </div>
        <span className="panel-badge">{pieces.length} total pieces</span>
      </div>

      <div className="piece-gallery-grid">
        {pieces.map((piece, index) => {
          const isSelected = index === selectedIndex;
          const isPlaced = placedPieces[index];

          return (
            <button
              key={piece.id}
              type="button"
              className={[
                "piece-gallery-card",
                isSelected ? "piece-gallery-card-selected" : "",
                isPlaced ? "piece-gallery-card-placed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectPiece(index, isPlaced)}
              disabled={hasWon || isPlaced}
            >
              <div className="piece-gallery-card-header">
                <span className="piece-gallery-title">Piece #{index + 1}</span>
                <span className="piece-gallery-state">
                  {isPlaced ? "Placed" : isSelected ? "Selected" : "Available"}
                </span>
              </div>

              <div
                className={[
                  "tray-drag-shell",
                  "tray-gallery-drag-shell",
                  !dragEnabled || isPlaced ? "tray-drag-shell-disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                draggable={dragEnabled && !hasWon && !isPlaced}
                onDragStart={(event) => onPieceDragStart(event, index)}
                onDragEnd={onPieceDragEnd}
              >
                <Tray piece={piece} className="tray-gallery" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
