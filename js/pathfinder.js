export class Pathfinder {
    constructor(terrain) {
        this.terrain = terrain;
    }

    findPath(startX, startY, targetX, targetY) {
        const openSet = new Set();
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        const start = `${startX},${startY}`;
        const goal = `${targetX},${targetY}`;

        openSet.add(start);
        gScore.set(start, 0);
        fScore.set(start, this.heuristic(startX, startY, targetX, targetY));

        while (openSet.size > 0) {
            let current = this.getLowestFScore(openSet, fScore);
            if (current === goal) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.delete(current);
            closedSet.add(current);

            const [x, y] = current.split(',').map(Number);
            const neighbors = this.getNeighbors(x, y);

            for (const neighbor of neighbors) {
                const [nx, ny] = neighbor;
                const neighborKey = `${nx},${ny}`;

                if (closedSet.has(neighborKey)) continue;

                const tentativeGScore = gScore.get(current) + 1;

                if (!openSet.has(neighborKey)) {
                    openSet.add(neighborKey);
                } else if (tentativeGScore >= gScore.get(neighborKey)) {
                    continue;
                }

                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + this.heuristic(nx, ny, targetX, targetY));
            }
        }

        return null; // No path found
    }

    getNeighbors(x, y) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        const neighbors = [];

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;

            if (this.isValidPosition(newX, newY) && this.terrain[newY][newX].passable) {
                neighbors.push([newX, newY]);
            }
        }

        return neighbors;
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.terrain[0].length && y >= 0 && y < this.terrain.length;
    }

    heuristic(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2); // Manhattan distance
    }

    getLowestFScore(openSet, fScore) {
        let lowest = null;
        let lowestScore = Infinity;

        for (const pos of openSet) {
            const score = fScore.get(pos);
            if (score < lowestScore) {
                lowest = pos;
                lowestScore = score;
            }
        }

        return lowest;
    }

    reconstructPath(cameFrom, current) {
        const path = [];
        while (cameFrom.has(current)) {
            const [x, y] = current.split(',').map(Number);
            path.unshift([x, y]);
            current = cameFrom.get(current);
        }
        return path;
    }
}
