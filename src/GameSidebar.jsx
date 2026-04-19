export default function GameSidebar({
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
            <p className="panel-label">Tutorial</p>
            <h2 className="panel-title">How To Start</h2>
          </div>
          <span className="panel-badge">Quick guide</span>
        </div>

        <div className="tutorial-list">
          <p className="tutorial-item">
            <strong>1.</strong> Pick any open piece from the left column. The active piece is also
            shown below the board.
          </p>
          <p className="tutorial-item">
            <strong>2.</strong> Rotate it until the light bulbs line up with likely ghost squares.
          </p>
          <p className="tutorial-item">
            <strong>3.</strong> In drag mode, drop the piece on the board. In keyboard mode, move
            it with WASD or the arrow keys and press Enter to place it.
          </p>
          <p className="tutorial-item">
            <strong>4.</strong> If a piece blocks a better answer, move it or pull it back off the
            board and try another arrangement.
          </p>
        </div>
      </section>

      <section className="shortcut-panel">
        <div className="panel-header">
          <div>
            <p className="panel-label">How To Play</p>
            <h2 className="panel-title">Rules</h2>
          </div>
          <span className="panel-badge">New players</span>
        </div>

        <div className="rules-list">
          <p className="rule-item">
            <strong>1.</strong> The goal is to light every ghost with a yellow light bulb.
          </p>
          <p className="rule-item">
            <strong>2.</strong> You need to place every piece on the board to finish the game.
          </p>
          <p className="rule-item">
            <strong>3.</strong> Blue squares may cover empty spaces, pieces cannot overlap.
          </p>
          <p className="rule-item">
            <strong>4.</strong> You can rotate pieces.
          </p>
          <p className="rule-item">
            <strong>Symbols:</strong> `👻` ghost, `💡` light, `🟦` empty square.
          </p>
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
                  Drag mode lets you drop pieces directly onto the board. Keyboard mode lets you
                  move the selected piece with the keys listed below.
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
            <h2 className="panel-title">Quick Commands</h2>
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
