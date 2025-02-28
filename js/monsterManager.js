export class MonsterManager {
    constructor(terrain, terrainTypes) {
        this.terrain = terrain;
        this.terrainTypes = terrainTypes;
        this.monsters = [];
        this.monsterTypes = [
            { name: 'Rat', symbol: '🐀', power: 5, health: 20, xp: 25 },
            { name: 'Cow', symbol: '🐮', power: 8, health: 40, xp: 35 },
            { name: 'Skeleton', symbol: '💀', power: 12, health: 30, xp: 50 },
            { name: 'Imp', symbol: '👿', power: 15, health: 45, xp: 75 },
            { name: 'Ghost', symbol: '👻', power: 18, health: 50, xp: 100 },
            { name: 'Demon', symbol: '👹', power: 22, health: 70, xp: 150 },
            { name: 'Wizard', symbol: '🧙‍♂️', power: 25, health: 60, xp: 200 },
            { name: 'Phoenix', symbol: '🦅', power: 30, health: 80, xp: 300 },
            { name: 'Dragon (Small)', symbol: '🐲', power: 35, health: 100, xp: 400 },
            { name: 'Dragon (Large)', symbol: '🐉', power: 50, health: 150, xp: 1000 }
        ];
        
        this.spawnMonsters();
    }

    spawnMonsters() {
        const numMonsters = 20; // Adjust based on map size
        
        for (let i = 0; i < numMonsters; i++) {
            const pos = this.getRandomPassablePosition();
            const type = this.getMonsterTypeForPosition(pos);
            
            this.monsters.push({
                ...type,
                x: pos.x,
                y: pos.y,
                currentHealth: type.health
            });
        }
    }

    getMonsterTypeForPosition(pos) {
        // Higher level monsters are more likely to spawn in mountains and hills
        const terrain = this.terrain[pos.y][pos.x];
        
        let maxLevel;
        if (terrain === this.terrainTypes.MOUNTAIN || this.isNearTerrainType(pos, 'MOUNTAIN')) {
            maxLevel = 10;
        } else if (terrain === this.terrainTypes.HILL || this.isNearTerrainType(pos, 'HILL')) {
            maxLevel = 7;
        } else if (terrain === this.terrainTypes.SWAMP) {
            maxLevel = 5;
        } else {
            maxLevel = 3;
        }
        
        const level = Math.floor(Math.random() * maxLevel);
        return this.monsterTypes[level];
    }

    isNearTerrainType(pos, terrainType) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const newY = pos.y + dy;
                const newX = pos.x + dx;
                if (newY >= 0 && newY < this.terrain.length &&
                    newX >= 0 && newX < this.terrain[0].length &&
                    this.terrain[newY][newX] === this.terrainTypes[terrainType]) {
                    return true;
                }
            }
        }
        return false;
    }

    getRandomPassablePosition() {
        while (true) {
            const x = Math.floor(Math.random() * (this.terrain[0].length - 2)) + 1;
            const y = Math.floor(Math.random() * (this.terrain.length - 2)) + 1;
            
            if (this.terrain[y][x].passable && !this.isPositionOccupied(x, y)) {
                return { x, y };
            }
        }
    }

    isPositionOccupied(x, y) {
        return this.monsters.some(m => m.x === x && m.y === y);
    }

    getMonsterAt(x, y) {
        return this.monsters.find(monster => 
            Math.floor(monster.x) === x && Math.floor(monster.y) === y
        );
    }

    checkForMonster(x, y) {
        return this.monsters.find(m => 
            Math.floor(m.x) === Math.floor(x) && 
            Math.floor(m.y) === Math.floor(y)
        );
    }

    update(player) {
        // Update each monster
        for (const monster of this.monsters) {
            // For now, monsters don't move or take actions outside of combat
            // This method exists for future AI behavior and animations
        }
    }

    removeMonster(monster) {
        const index = this.monsters.findIndex(m => m === monster);
        if (index !== -1) {
            this.monsters.splice(index, 1);
            
            // Spawn a new monster somewhere else on the map
            const pos = this.getRandomPassablePosition();
            const type = this.getMonsterTypeForPosition(pos);
            
            this.monsters.push({
                ...type,
                x: pos.x,
                y: pos.y,
                currentHealth: type.health
            });
        }
    }
}
