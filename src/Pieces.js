export class Piece {
    constructor(id, cells, lights, y = 0, x = 0) {
        this.id = id;
        this.cells = cells;
        this.lights = lights;
        this.y = y;
        this.x = x;
    }
    
    pieceCell(originY, originX) {
        let results = [];
        this.cells.forEach((cell) => {
            const cellY = originY + cell.y;
            const cellX = originX + cell.x;
            results.push({ y: cellY, x: cellX });
        });
        return results;
    }

    lightsAt(originY, originX) {
        let results = [];
        this.lights.forEach((light) => {
            const lightY = originY + light.y;
            const lightX = originX + light.x;
            results.push({ y: lightY, x: lightX });
        });
        return results;
    }

    lightsGhost(ghosts, originY, originX) {
        let results = [];
        this.lights.forEach((light) => {
            const lightY = originY + light.y;
            const lightX = originX + light.x;
            ghosts.forEach((ghost) => {
                if (ghost.y == lightY && ghost.x == lightX) {
                    results.push(ghost);
                }
            });
        });
        return results;
    }

    pieceOnGhost(ghosts, originY, originX) {
        let results = [];
        this.cells.forEach((cell) => {
            const cellY = originY + cell.y;
            const cellX = originX + cell.x;
            ghosts.forEach((ghost) => {
                if (ghost.y == cellY && ghost.x == cellX) {
                    results.push(ghost);
                }
            });
        });
        return results;
    }

    onBoard(originY, originX) {
        return this.cells.every((cell) => {
            const cellY = originY + cell.y;
            const cellX = originX + cell.x;
            return !(cellY < 0 || cellY > 3 || cellX < 0 || cellX > 3);
        });
    }
}

export function checkPiecePlacement(board, piece, ghosts, originY, originX) {
    const matches = piece.lightsGhost(ghosts, originY, originX);
    const pieceCells = piece.pieceCell(originY, originX);
    const lights = piece.lightsAt(originY, originX);
    const ghostPiece = piece.pieceOnGhost(ghosts, originY, originX);

    pieceCells.forEach((cell) => {
        board[cell.y][cell.x] = { icon: "🟦", lit: false, covered: false };
    });

    ghostPiece.forEach((ghost) => {
        board[ghost.y][ghost.x] = { icon: "🙉", lit: false, covered: true };
    });

    lights.forEach((light) => {
        board[light.y][light.x] = { icon: "💡", lit: false, covered: false };
    });

    matches.forEach((match) => {
        board[match.y][match.x] = { icon: "🙈", lit: true, covered: false };
    });
}

export function getPlacementBounds(piece, boardSize = 4) {
    const cells = piece.cells;
    const minY = Math.min(...cells.map((cell) => cell.y));
    const maxY = Math.max(...cells.map((cell) => cell.y));
    const minX = Math.min(...cells.map((cell) => cell.x));
    const maxX = Math.max(...cells.map((cell) => cell.x));

    return {
        minY: -minY,
        maxY: boardSize - 1 - maxY,
        minX: -minX,
        maxX: boardSize - 1 - maxX,
    };
}

export const pieces = [
    new Piece(
        'p1',
        [
            { y: 0, x: 0 },
            { y: 1, x: 0 },
        ],
        [
            { y: 0, x: 0 },
        ],
    ),

    new Piece(
        'p2',
        [
            { y: 0, x: 0 },
            { y: 0, x: 1 },
            { y: 1, x: 0 },
        ],
        [
            { y: 0, x: 0 },
        ],
    ),

    new Piece(
        'p3',
        [
            { y: 0, x: 1 },
            { y: 1, x: 0 },
            { y: 1, x: 1 },
        ],
        [
            { y: 0, x: 1 },
        ],
    ),

    new Piece(
        'p4',
        [
            { y: 0, x: 0 },
            { y: 1, x: 0 },
            { y: 1, x: 1 },
        ],
        [
            { y: 0, x: 0 },
        ],
    ),

    new Piece(
        'p5',
        [
            { y: 0, x: 0 },
            { y: 0, x: 1 },
        ],
        [],
    ),

    new Piece(
        'p6',
        [
            { y: 0, x: 1 },
            { y: 1, x: 0 },
            { y: 1, x: 1 },
        ],
        [
            { y: 0, x: 1 },
            { y: 1, x: 0 },
        ],
    ),
];
