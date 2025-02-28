export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.speed = 5;
        this.size = 32;
        this.health = 100;
        this.maxHealth = 100;
        this.mana = 100;
        this.maxMana = 100;
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.isMoving = false;
        this.path = [];
        this.symbol = '🧙';
        this.baseSpeed = 0.1; // Base movement speed in tiles per frame
        this.power = 10;
    }

    move(dx, dy, terrain) {
        const newX = this.x + dx * this.baseSpeed;
        const newY = this.y + dy * this.baseSpeed;
        
        // Get grid coordinates
        const gridX = Math.floor(newX);
        const gridY = Math.floor(newY);
        
        // Check if the new position is within bounds
        if (gridX >= 0 && gridX < terrain[0].length && 
            gridY >= 0 && gridY < terrain.length) {
            
            // Get terrain at new position
            const terrainTile = terrain[gridY][gridX];
            
            // Only move if terrain is passable
            if (terrainTile.passable) {
                // Apply terrain speed multiplier
                const speedMultiplier = terrainTile.speedMultiplier;
                this.x += dx * this.baseSpeed * speedMultiplier;
                this.y += dy * this.baseSpeed * speedMultiplier;
            }
        }
    }

    gainXP(amount) {
        this.xp = Number(this.xp) + Number(amount);
        
        while (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xp = Math.max(0, this.xp - this.xpToNextLevel);
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
        this.maxHealth = Math.floor(this.maxHealth * 1.2);
        this.health = this.maxHealth;
        this.power = Math.floor(this.power * 1.2);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        return this.health > 0;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    logMessage(message) {
        const logContent = document.querySelector('.log-content');
        const p = document.createElement('p');
        p.textContent = message;
        logContent.appendChild(p);
        logContent.scrollTop = logContent.scrollHeight;
    }
}
