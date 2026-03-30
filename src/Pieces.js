export class Piece {
    constructor(id, cells, lights) {
        this.id = id;
        this.cells = cells;
        this.lights = lights;
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
            ghosts.forEach((ghosts) => {
                if (ghosts.y == lightY && ghosts.x == lightX) {
                    results.push(ghosts);
                }
            })
        });
        return results;
    }

    onBoard(originY, originX) {
        return this.cells.every((cell) => {
            const cellY = originY + cell.y;
            const cellX = originX + cell.x;
            return !(cellY < 0 || cellY > 4 || cellX < 0 || cellX > 4);
        });
    }
}

export const pieces = [
    new Piece(
        'p1',
        [
            { y: 0, x: 0 },
            { y: 0, x: 1 },
            { y: 1, x: 0 },
        ],
        [
            { y: 0, x: 0 },
        ],
    ),
];