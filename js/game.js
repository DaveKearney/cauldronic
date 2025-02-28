import { TerrainGenerator } from './terrainGenerator.js';
import { Player } from './player.js';
import { MonsterManager } from './monsterManager.js';
import { Renderer } from './renderer.js';
import { Combat } from './combat.js';
import { Pathfinder } from './pathfinder.js';
import { HUD } from './hud.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas to window size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize game after all modules are loaded
        this.init();
    }

    async init() {
        try {
            await this.setupGame();
            this.setupEventListeners();
            // Start the game loop
            requestAnimationFrame(() => this.gameLoop());
        } catch (error) {
            console.error('Game initialization error:', error);
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    async setupGame() {
        this.terrainGenerator = new TerrainGenerator(100, 100); // Larger map
        this.terrain = this.terrainGenerator.generate();
        
        // Place player in middle of map
        const midX = Math.floor(this.terrain[0].length / 2);
        const midY = Math.floor(this.terrain.length / 2);
        
        // Find nearest passable tile to middle
        const startPos = this.findNearestPassableTile(midX, midY);
        this.player = new Player(startPos.x, startPos.y);
        
        this.renderer = new Renderer(this.ctx, this.terrain);
        this.monsterManager = new MonsterManager(this.terrain, this.terrainGenerator.terrainTypes);
        this.combat = new Combat(this.player, this.monsterManager, this.renderer);
        this.pathfinder = new Pathfinder(this.terrain);
        this.hud = new HUD(this.player);
        
        // Movement state
        this.movement = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        // Pathfinding state
        this.currentPath = null;
        this.pathIndex = 0;
    }

    setupEventListeners() {
        // Add click handlers
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent context menu
            this.handleMovementClick(e);
        });
        
        // Left click only for combat
        this.canvas.addEventListener('click', (e) => {
            // If in combat, let the combat system handle it
            if (this.combat.inCombat) return;
            
            // Otherwise, check if clicked on a monster to start combat
            const coords = this.getWorldCoordinates(e);
            if (!coords) return;
            
            const monster = this.monsterManager.getMonsterAt(coords.worldX, coords.worldY);
            if (monster) {
                // Find path to adjacent tile next to monster
                const adjacentTile = this.findAdjacentTile(coords.worldX, coords.worldY);
                if (adjacentTile) {
                    this.currentPath = this.pathfinder.findPath(
                        Math.floor(this.player.x),
                        Math.floor(this.player.y),
                        adjacentTile.x,
                        adjacentTile.y
                    );
                    this.pathIndex = 0;
                    this.targetMonster = monster;
                }
            }
        });

        // Keyboard handlers
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    getWorldCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        // Account for camera offset
        const viewportCenterX = this.canvas.width / 2;
        const viewportCenterY = this.canvas.height / 2;
        const tileSize = this.renderer.tileSize;

        const worldX = Math.floor((screenX - viewportCenterX + this.player.x * tileSize) / tileSize);
        const worldY = Math.floor((screenY - viewportCenterY + this.player.y * tileSize) / tileSize);

        if (!this.isValidPosition(worldX, worldY)) {
            return null;
        }

        return { worldX, worldY };
    }

    handleMovementClick(e) {
        const coords = this.getWorldCoordinates(e);
        if (!coords) return;

        const { worldX, worldY } = coords;
        
        console.log('Movement click at:', { worldX, worldY });

        // Only move if terrain is passable
        if (this.terrain[worldY][worldX].passable) {
            console.log('Finding path to:', { worldX, worldY });
            this.currentPath = this.pathfinder.findPath(
                Math.floor(this.player.x),
                Math.floor(this.player.y),
                worldX,
                worldY
            );
            console.log('Path found:', this.currentPath);
            this.pathIndex = 0;
            this.targetMonster = null;
        }
    }

    handleKeyDown(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                this.movement.up = true;
                break;
            case 'ArrowDown':
            case 's':
                this.movement.down = true;
                break;
            case 'ArrowLeft':
            case 'a':
                this.movement.left = true;
                break;
            case 'ArrowRight':
            case 'd':
                this.movement.right = true;
                break;
        }
    }

    handleKeyUp(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                this.movement.up = false;
                break;
            case 'ArrowDown':
            case 's':
                this.movement.down = false;
                break;
            case 'ArrowLeft':
            case 'a':
                this.movement.left = false;
                break;
            case 'ArrowRight':
            case 'd':
                this.movement.right = false;
                break;
        }
    }

    update() {
        // Don't allow movement if in combat
        if (!this.combat.inCombat) {
            // Handle keyboard movement
            const dx = (this.movement.right ? 1 : 0) - (this.movement.left ? 1 : 0);
            const dy = (this.movement.down ? 1 : 0) - (this.movement.up ? 1 : 0);
            
            if (dx !== 0 || dy !== 0) {
                // Cancel any pathfinding if using keyboard
                this.currentPath = null;
                this.pathIndex = 0;
                
                // Use player's move method
                this.player.move(dx, dy, this.terrain);
            }

            // Handle pathfinding movement
            if (this.currentPath && this.currentPath.length > 0) {
                console.log('Following path:', { 
                    currentPath: this.currentPath,
                    pathIndex: this.pathIndex,
                    playerPos: { x: this.player.x, y: this.player.y }
                });
                
                if (this.pathIndex < this.currentPath.length) {
                    const [targetX, targetY] = this.currentPath[this.pathIndex];
                    const dx = targetX - this.player.x;
                    const dy = targetY - this.player.y;

                    console.log('Moving towards:', { targetX, targetY, dx, dy });

                    // Use player's move method with normalized direction
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0.1) {
                        this.player.move(dx / dist, dy / dist, this.terrain);
                    } else {
                        // Snap to target position if very close
                        this.player.x = targetX;
                        this.player.y = targetY;
                        this.pathIndex++;
                        console.log('Reached waypoint, new pathIndex:', this.pathIndex);

                        // If we've reached the end of the path
                        if (this.pathIndex >= this.currentPath.length) {
                            console.log('Reached end of path');
                            this.currentPath = null;
                            // If we were moving to attack a monster
                            if (this.targetMonster) {
                                console.log('Starting combat with:', this.targetMonster);
                                this.combat.startCombat(this.targetMonster);
                                this.targetMonster = null;
                            }
                        }
                    }
                }
            }
        }

        // Update combat and monsters
        this.combat.update();
        this.monsterManager.update(this.player);
        this.hud.updateStats();
    }

    findNearestPassableTile(targetX, targetY) {
        let checkRadius = 0;
        const maxRadius = Math.max(this.terrain.length, this.terrain[0].length);
        
        while (checkRadius < maxRadius) {
            // Check in expanding square pattern
            for (let dy = -checkRadius; dy <= checkRadius; dy++) {
                for (let dx = -checkRadius; dx <= checkRadius; dx++) {
                    // Only check tiles at current radius
                    if (Math.abs(dx) === checkRadius || Math.abs(dy) === checkRadius) {
                        const x = targetX + dx;
                        const y = targetY + dy;
                        
                        if (this.isValidPosition(x, y) && this.terrain[y][x].passable) {
                            return { x, y };
                        }
                    }
                }
            }
            checkRadius++;
        }
        
        // Fallback to first passable tile
        return this.findSafeStartingPosition();
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.terrain[0].length && y >= 0 && y < this.terrain.length;
    }

    findSafeStartingPosition() {
        for (let y = 0; y < this.terrain.length; y++) {
            for (let x = 0; x < this.terrain[0].length; x++) {
                if (this.terrain[y][x].passable) {
                    return { x, y };
                }
            }
        }
        return { x: 0, y: 0 };
    }

    findAdjacentTile(monsterX, monsterY) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dx, dy] of directions) {
            const x = monsterX + dx;
            const y = monsterY + dy;
            
            if (this.isValidPosition(x, y) && this.terrain[y][x].passable) {
                return { x, y };
            }
        }
        
        return null;
    }

    gameLoop() {
        // Update game state
        this.update();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render
        this.renderer.render(this.player, this.monsterManager.monsters);
        
        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }
}
