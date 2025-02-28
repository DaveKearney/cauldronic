export class TerrainGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.terrainTypes = {
            PLAIN: { color: '#90EE90', passable: true, speedMultiplier: 1.0 },    // Light green
            HILL: { color: '#4C9A4C', passable: true, speedMultiplier: 0.8 },     // Darker green
            MOUNTAIN: { color: '#808080', passable: true, speedMultiplier: 0.2 },  // Gray
            WATER: { color: '#4169E1', passable: false, speedMultiplier: 0 },     // Royal blue
            SAND: { color: '#DEB887', passable: true, speedMultiplier: 0.9 }      // Sandy brown
        };
    }

    generate() {
        // Initialize map with plains
        let terrain = Array(this.height).fill().map(() => 
            Array(this.width).fill().map(() => ({...this.terrainTypes.PLAIN}))
        );

        // Generate water bodies (2.5% of map)
        const waterPoints = Math.floor(this.width * this.height * 0.025);
        for (let i = 0; i < waterPoints; i++) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            if (Math.random() < 0.7) { // 70% chance to create a small water body
                this.createWaterBody(terrain, x, y, 2); 
            }
        }

        // Add sand around water
        terrain = this.addSandAroundWater(terrain);

        // Generate mountains (2.5% of map)
        const mountainPoints = Math.floor(this.width * this.height * 0.025);
        for (let i = 0; i < mountainPoints; i++) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            if (Math.random() < 0.6) { // 60% chance to create a mountain range
                this.createMountainRange(terrain, x, y);
            }
        }

        return terrain;
    }

    createWaterBody(terrain, centerX, centerY, size) {
        for (let y = -size; y <= size; y++) {
            for (let x = -size; x <= size; x++) {
                const currentX = centerX + x;
                const currentY = centerY + y;
                
                // Check if within bounds
                if (currentX >= 0 && currentX < this.width && 
                    currentY >= 0 && currentY < this.height) {
                    
                    // Create more compact water bodies
                    const distance = Math.sqrt(x*x + y*y);
                    if (distance <= size * (0.5 + Math.random() * 0.3)) { 
                        terrain[currentY][currentX] = {...this.terrainTypes.WATER};
                    }
                }
            }
        }
    }

    addSandAroundWater(terrain) {
        const newTerrain = JSON.parse(JSON.stringify(terrain)); // Deep copy

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (terrain[y][x].color === this.terrainTypes.WATER.color) {
                    // Check all adjacent tiles (including diagonals)
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const newX = x + dx;
                            const newY = y + dy;
                            
                            // Skip if out of bounds or center tile
                            if (newX < 0 || newX >= this.width || 
                                newY < 0 || newY >= this.height || 
                                (dx === 0 && dy === 0)) {
                                continue;
                            }
                            
                            // Add sand if the tile is not water
                            if (terrain[newY][newX].color !== this.terrainTypes.WATER.color) {
                                newTerrain[newY][newX] = {...this.terrainTypes.SAND};
                            }
                        }
                    }
                }
            }
        }

        return newTerrain;
    }

    createMountainRange(terrain, centerX, centerY) {
        const size = 2 + Math.floor(Math.random() * 3); // Range size 2-4
        
        for (let y = -size; y <= size; y++) {
            for (let x = -size; x <= size; x++) {
                const currentX = centerX + x;
                const currentY = centerY + y;
                
                // Check if within bounds
                if (currentX >= 0 && currentX < this.width && 
                    currentY >= 0 && currentY < this.height) {
                    
                    const distance = Math.sqrt(x*x + y*y);
                    if (distance <= size) {
                        if (distance <= size * 0.5) {
                            // Center of range is mountains
                            terrain[currentY][currentX] = {...this.terrainTypes.MOUNTAIN};
                        } else if (terrain[currentY][currentX].color === this.terrainTypes.PLAIN.color) {
                            // Outer part is hills (only if it's currently plains)
                            terrain[currentY][currentX] = {...this.terrainTypes.HILL};
                        }
                    }
                }
            }
        }
    }
}
