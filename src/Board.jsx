import { pieces } from "./Pieces";

export default function Board({ ghosts }) {
    const board = Array.from({ length: 4 }, () => Array(4).fill('⬛'));

    ghosts.forEach((pos, key) => {
        board[pos.y][pos.x] = '👻';
    });

    pieces.forEach((piece) => {
        let y = 0;
        let x = 1;
        const matches = piece.lightsGhost(ghosts, y, x);
        const pieceCells = piece.pieceCell(y, x);
        const lights = piece.lightsAt(y, x);

        pieceCells.forEach((cell) => {
            board[cell.y][cell.x] = '🟦';
        });

        lights.forEach((light) => {
            board[light.y][light.x] = '💡';
        });


        matches.forEach((match) => {
            board[match.y][match.x] = "👹";
        });
    });

    return (
        <div className="board">
            {board.map((row, i) => (
                <div key={i} className="board-row">
                    {row.map((cell, j) => (
                        <span key={j} className="board-cell">
                            {cell}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
}