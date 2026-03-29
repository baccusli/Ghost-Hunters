export default function Board({ ghosts }) {
    const board = Array.from({ length: 4 }, () => Array(4).fill('⬛'));

    ghosts.forEach((pos, key) => {
        board[pos.y][pos.x] = '👻';
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