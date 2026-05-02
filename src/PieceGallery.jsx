import Tray from "./Tray";

export default function PieceGallery({
  pieces,
  placedPieces,
  selectedIndex,
  dragEnabled,
  hasWon,
  onSelectPiece,
  onRotatePiece,
  onPieceDragStart,
  onPieceDragEnd,
}) {
  const remainingCount = placedPieces.filter((placed) => !placed).length;

  return (
    <section className="piece-gallery-panel piece-gallery-sidebar">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Pieces</h2>
        </div>
        <span className="panel-badge">
          {remainingCount} left
        </span>
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
                title={
                  dragEnabled && !hasWon && !isPlaced
                    ? "Drag to place. Double-click or right-click to rotate."
                    : undefined
                }
                onDragStart={(event) => onPieceDragStart(event, index)}
                onDragEnd={onPieceDragEnd}
                onDoubleClick={(event) => {
                  if (!dragEnabled || hasWon || isPlaced) {
                    return;
                  }

                  event.stopPropagation();
                  onRotatePiece?.(index);
                }}
                onContextMenu={(event) => {
                  if (!dragEnabled || hasWon || isPlaced) {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  onRotatePiece?.(index);
                }}
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
