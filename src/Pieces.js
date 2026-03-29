export class Piece {
    constructor(id, cells, lights) {
        this.id = id;
        this.cells = cells;
        this.lights = lights;
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

/*
function findCoords(matrix, target) {
  let results = [];
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === target) {
        results.push([r, c]);
      }
    }
  }
  return results;
}
*/