import { PerlinNoise } from './perlinNoise.js';

export class Renderer {
    constructor(ctx, terrain) {
        this.ctx = ctx;
        this.terrain = terrain;
        this.tileSize = 40;
        //this.statsBox = this.createStatsBox();
        //this.combatLog = this.createCombatLog();
        
        // Initialize terrain colors
        this.terrainColors = {
            water: '#4169E1',
            sand: '#DEB887',
            plain: '#90EE90',
            hill: '#4C9A4C',
            mountain: '#808080'
        };
    }

    getAdjacentTerrainColors(x, y) {
        const colors = [];
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];
        
        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            
            if (newX >= 0 && newX < this.terrain[0].length &&
                newY >= 0 && newY < this.terrain.length) {
                const tile = this.terrain[newY][newX];
                if (tile.color !== this.terrainColors.water && 
                    tile.color !== this.terrainColors.sand) {
                    colors.push(tile.color);
                }
            }
        }
        
        return [...new Set(colors)];
    }

    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.min(255, Math.max(0, r + amount));
        const newG = Math.min(255, Math.max(0, g + amount));
        const newB = Math.min(255, Math.max(0, b + amount));
        
        return '#' + 
            newR.toString(16).padStart(2, '0') +
            newG.toString(16).padStart(2, '0') +
            newB.toString(16).padStart(2, '0');
    }

    /*
    createStatsBox() {
        const statsBox = document.createElement('div');
        statsBox.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            z-index: 1000;
            min-width: 150px;
        `;
        document.body.appendChild(statsBox);
        return statsBox;
    }

    createCombatLog() {
        const logContainer = document.createElement('div');
        logContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            height: 200px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            overflow-y: auto;
            z-index: 1000;
        `;
        document.body.appendChild(logContainer);
        return logContainer;
    }
        */

    render(player, monsters) {
        const canvas = this.ctx.canvas;
        const viewportCenterX = canvas.width / 2;
        const viewportCenterY = canvas.height / 2;
        const offsetX = Math.round(viewportCenterX - player.x * this.tileSize);
        const offsetY = Math.round(viewportCenterY - player.y * this.tileSize);

        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw terrain
        for(let y = 0; y < this.terrain.length; y++) {
            for(let x = 0; x < this.terrain[y].length; x++) {
                const screenX = Math.round(x * this.tileSize + offsetX);
                const screenY = Math.round(y * this.tileSize + offsetY);
                
                if (screenX > -this.tileSize && screenX < canvas.width + this.tileSize &&
                    screenY > -this.tileSize && screenY < canvas.height + this.tileSize) {
                    
                    const tile = this.terrain[y][x];
                    
                    this.ctx.fillStyle = tile.color;
                    this.ctx.fillRect(screenX - 1, screenY - 1, this.tileSize + 2, this.tileSize + 2);
                }
            }
        }

        // Draw monsters and player
        monsters.forEach(monster => {
            const screenX = Math.round(monster.x * this.tileSize + offsetX);
            const screenY = Math.round(monster.y * this.tileSize + offsetY);
            
            if (screenX > -this.tileSize && screenX < canvas.width + this.tileSize &&
                screenY > -this.tileSize && screenY < canvas.height + this.tileSize) {
                const gradient = this.ctx.createRadialGradient(
                    screenX + this.tileSize/2, screenY + this.tileSize/2, 0,
                    screenX + this.tileSize/2, screenY + this.tileSize/2, this.tileSize/2
                );
                gradient.addColorStop(0, '#FF4444');
                gradient.addColorStop(1, '#AA2222');
                
                // Draw monster as circle
                this.ctx.beginPath();
                this.ctx.arc(screenX + this.tileSize / 2, screenY + this.tileSize / 2, this.tileSize / 2, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
                this.ctx.closePath();
                
                // Draw monster icon
                this.ctx.fillStyle = 'white';
                this.ctx.font = '24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('👾', screenX + this.tileSize / 2, screenY + this.tileSize / 2);
                
                // Set shadow for monster
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowOffsetX = 2;
                this.ctx.shadowOffsetY = 2;
            }
        });

        // Draw player as a circle
        const playerX = viewportCenterX - this.tileSize/2;
        const playerY = viewportCenterY - this.tileSize/2;
        
        const playerGradient = this.ctx.createRadialGradient(
            playerX + this.tileSize/2, playerY + this.tileSize/2, 0,
            playerX + this.tileSize/2, playerY + this.tileSize/2, this.tileSize/2
        );
        playerGradient.addColorStop(0, '#4444FF');
        playerGradient.addColorStop(1, '#2222AA');
        
        this.ctx.beginPath();
        this.ctx.arc(playerX + this.tileSize / 2, playerY + this.tileSize / 2, this.tileSize / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = playerGradient;
        this.ctx.fill();
        this.ctx.closePath();
        
        // Set shadow for player
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🧙', playerX + this.tileSize / 2, playerY + this.tileSize / 2);
        
        //this.updateStats(player);
    }

    /*
    updateStats(player) {
        if (!player) return;
        
        this.statsBox.innerHTML = `
            Level: ${player.level}<br>
            XP: ${player.xp} / ${player.xpToNextLevel}<br>
            HP: ${player.health} / ${player.maxHealth}
        `;
    }
        */

    addCombatMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.marginBottom = '5px';
        //this.combatLog.appendChild(messageElement);
        //this.combatLog.scrollTop = this.combatLog.scrollHeight;
        
        // Keep only the last 50 messages
       // while (this.combatLog.children.length > 50) {
        //    this.combatLog.removeChild(this.combatLog.firstChild);
        //}
    }
}
