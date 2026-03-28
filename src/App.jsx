export default function App() {

  const ghosts = new Map();
  ghosts
    .set('g1', {y: 0, x: 0})
    .set('g2', {y: 0, x: 1})
    .set('g3', {y: 0, x: 3})
    .set('g4', {y: 2, x: 0})
    .set('g5', {y: 2, x: 3})
    .set('g6', {y: 3, x: 2});

  const board = Array.from({ length: 4 }, () => Array(4).fill('⬛'));

  ghosts.forEach((pos, key) => {
    board[pos.y][pos.x] = '👻';
  });

  return (
    <div className="app">
      <h1 className="title">Ghost Hunters</h1>
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
    </div>
  )
}
