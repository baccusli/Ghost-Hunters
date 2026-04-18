export class Piece {
    constructor(id, cells, lights, y = 0, x = 0) {
        this.id = id;
        this.cells = cells;
        this.lights = lights;
        this.y = y;
        this.x = x;
    }

    rotated(turns = 1) {
        const normalizedTurns = ((turns % 4) + 4) % 4;
        let cells = this.cells.map((cell) => ({ ...cell }));
        let lights = this.lights.map((light) => ({ ...light }));

        for (let turn = 0; turn < normalizedTurns; turn += 1) {
            cells = cells.map((cell) => ({ y: cell.x, x: -cell.y }));
            lights = lights.map((light) => ({ y: light.x, x: -light.y }));

            const allPoints = [...cells, ...lights];
            const minY = Math.min(...allPoints.map((point) => point.y));
            const minX = Math.min(...allPoints.map((point) => point.x));

            cells = cells.map((cell) => ({ y: cell.y - minY, x: cell.x - minX }));
            lights = lights.map((light) => ({ y: light.y - minY, x: light.x - minX }));
        }

        return new Piece(this.id, cells, lights, this.y, this.x);
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

    checkOverlap(currentIndex, originY, originX) {
        const currentCells = pieces[currentIndex].pieceCell(originY, originX);
        for (let index = 0; index < 6; index++) {
            if (index === currentIndex) {
                continue;
            }
            let otherCells = pieces[index].pieceCell(pieces[index].y, pieces[index].x);
            if (otherCells.some((otherCell) => currentCells.some((currentCell) => otherCell.y === currentCell.y && otherCell.x === currentCell.x))) {
                return true;
            }
        }
        return false;
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
        board[ghost.y][ghost.x] = { icon: "👻", lit: false, covered: true };
    });

    lights.forEach((light) => {
        board[light.y][light.x] = { icon: "💡", lit: false, covered: false };
    });

    matches.forEach((match) => {
        board[match.y][match.x] = { icon: "👻", lit: true, covered: false };
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
