import { checkPiecePlacement } from "./Pieces";

const BOARD_SIZE = 4;

export function buildBoard(ghosts, placedPieces, previewPiece) {
  const board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ icon: "⬛", lit: false, covered: false }))
  );

  ghosts.forEach((ghost) => {
    board[ghost.y][ghost.x] = { icon: "👻", lit: false, covered: false };
  });

  placedPieces.forEach(({ piece, y, x }) => {
    if (piece?.onBoard(y, x)) {
      checkPiecePlacement(board, piece, ghosts, y, x);
    }
  });

  if (previewPiece?.piece?.onBoard(previewPiece.y, previewPiece.x)) {
    checkPiecePlacement(
      board,
      previewPiece.piece,
      ghosts,
      previewPiece.y,
      previewPiece.x
    );
  }

  return board;
}

export function countLitGhosts(ghosts, placedPieces, previewPiece = null) {
  return buildBoard(ghosts, placedPieces, previewPiece)
    .flat()
    .filter((cell) => cell.lit).length;
}
