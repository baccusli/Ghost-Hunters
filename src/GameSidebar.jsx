export default function GameSidebar({
  pieceCount,
  keyboardEnabled,
  settingsOpen,
  controlMode,
  onToggleSettings,
  onSetControlMode,
  onResetGame,
}) {
  return (
    <aside className="sidebar sidebar-bottom">
      <section className="shortcut-panel">
        <div className="panel-header">
          <div>
            <p className="panel-label">Workflow</p>
            <h2 className="panel-title">Recommended Flow</h2>
          </div>
        </div>

        <div className="tutorial-list">
          <article className="tutorial-step">
            <span className="tutorial-step-number">01</span>
            <p className="tutorial-item">
              Choose any available piece from the gallery. The same piece appears in the active
              tray under the board for quick actions.
            </p>
          </article>
          <article className="tutorial-step">
            <span className="tutorial-step-number">02</span>
            <p className="tutorial-item">
              Rotate first, then test fit. In drag mode, double-click or right-click a piece to
              rotate it before you commit space on the board.
            </p>
          </article>
          <article className="tutorial-step">
            <span className="tutorial-step-number">03</span>
            <p className="tutorial-item">
              Drag pieces directly onto the grid, or switch to keyboard mode and move with WASD
              or the arrow keys before pressing Enter to place.
            </p>
          </article>
          <article className="tutorial-step">
            <span className="tutorial-step-number">04</span>
            <p className="tutorial-item">
              If the layout starts to collapse, reposition a placed piece and keep refining until
              every ghost lands under a light.
            </p>
          </article>
        </div>
      </section>

      <section className="shortcut-panel">
        <div className="panel-header">
          <div>
            <p className="panel-label">Puzzle Rules</p>
            <h2 className="panel-title">Constraints</h2>
          </div>
        </div>

        <div className="rules-list">
          <p className="rule-item">Every ghost must be covered by a yellow light bulb.</p>
          <p className="rule-item">
            All {pieceCount} pieces must end up on the board to finish the run.
          </p>
          <p className="rule-item">Blue squares can cover empty board cells, but pieces cannot overlap.</p>
          <p className="rule-item">Rotation is always allowed, so orientation matters as much as position.</p>
          <p className="rule-item">Legend: `👻` ghost, `💡` light, `🟦` body square.</p>
        </div>
      </section>

      <section className="shortcut-panel">
        <div className="action-list compact-action-list">
          <button
            type="button"
            className="control-button control-button-ghost control-button-icon"
            onClick={onToggleSettings}
            aria-expanded={settingsOpen}
          >
            ⚙ Settings
          </button>

          {settingsOpen ? (
            <>
              <div className="settings-block">
                <span className="meta-label">Controls</span>
                <div className="mode-toggle" role="radiogroup" aria-label="Control mode">
                  <button
                    type="button"
                    className={[
                      "mode-toggle-button",
                      controlMode === "drag" ? "mode-toggle-button-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    role="radio"
                    aria-checked={controlMode === "drag"}
                    onClick={() => onSetControlMode("drag")}
                  >
                    Drag & Drop
                  </button>
                  <button
                    type="button"
                    className={[
                      "mode-toggle-button",
                      controlMode === "keyboard" ? "mode-toggle-button-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    role="radio"
                    aria-checked={controlMode === "keyboard"}
                    onClick={() => onSetControlMode("keyboard")}
                  >
                    Keyboard
                  </button>
                </div>
                <p className="settings-help">
                  Drag mode lets you drop pieces directly onto the board and rotate them with a
                  double-click or right-click. Keyboard mode lets you move the selected piece with
                  the keys listed below.
                </p>
              </div>

              <button
                type="button"
                className="control-button control-button-ghost"
                onClick={onResetGame}
              >
                Reset Game
              </button>
            </>
          ) : null}
        </div>
      </section>

      <section className="shortcut-panel">
        <div className="panel-header">
          <div>
            <p className="panel-label">Keyboard</p>
            <h2 className="panel-title">Command Palette</h2>
          </div>
          <span className="panel-badge">
            {keyboardEnabled ? "Enabled" : "Turn on in Settings"}
          </span>
        </div>
        <div className="shortcut-list">
          <span className="shortcut-pill">WASD / Arrows move</span>
          <span className="shortcut-pill">Z rotate right</span>
          <span className="shortcut-pill">Q / E switch</span>
          <span className="shortcut-pill">Enter place</span>
          <span className="shortcut-pill">R reset</span>
        </div>
      </section>
    </aside>
  );
}
