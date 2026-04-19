export function createInitialPiecePositions(pieces) {
  return pieces.map(() => ({ y: 0, x: 0 }));
}

export function createInitialPieceRotations(pieces) {
  return pieces.map(() => 0);
}

export function createInitialPlacedPieces(pieces) {
  return pieces.map(() => false);
}

export function createIntroFeedback() {
  return {
    tone: "info",
    message:
      "Goal: place every gadget on the 4 x 4 board so each ghost is lit by at least one light bulb.",
  };
}

export function createResetFeedback() {
  return {
    tone: "info",
    message:
      "Fresh board. Pick a piece, rotate it if needed, then place it so the light bulbs reach the ghosts.",
  };
}

export function formatElapsedTime(elapsedMilliseconds) {
  const totalSeconds = Math.floor(elapsedMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = elapsedMilliseconds % 1000;
  const timerLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const finishTimeLabel = `${timerLabel}.${String(milliseconds).padStart(3, "0")}`;

  return {
    timerLabel,
    finishTimeLabel,
  };
}
