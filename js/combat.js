export class Combat {
    constructor(player, monsterManager, renderer) {
        this.player = player;
        this.monsterManager = monsterManager;
        this.renderer = renderer;
        this.inCombat = false;
        this.currentMonster = null;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // 1 second between attacks

        // Add combat controls
        document.addEventListener('keydown', (e) => this.handleCombatInput(e));
        
        // Left click for combat
        document.addEventListener('click', (e) => {
            if (this.inCombat && this.currentMonster) {
                const now = Date.now();
                if (now - this.lastAttackTime >= this.attackCooldown) {
                    this.lastAttackTime = now;
                    this.initiateCombat(this.currentMonster);
                }
            }
        });
    }

    handleCombatInput(e) {
        if (!this.inCombat || !this.currentMonster) return;

        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldown) return;

        // Only spacebar triggers combat now
        if (e.code === 'Space') {
            this.lastAttackTime = now;
            this.initiateCombat(this.currentMonster);
        }
    }

    update() {
        // Nothing to update if not in combat
        if (!this.inCombat || !this.currentMonster) return;

        // Show combat prompt
        this.renderer.addCombatMessage('Left click or press SPACE to attack!');
    }

    startCombat(monster) {
        this.inCombat = true;
        this.currentMonster = monster;
        this.lastAttackTime = Date.now();
        this.initiateCombat(monster);
        this.renderer.addCombatMessage(`Combat started with ${monster.name}! Left click or press SPACE to attack!`);
    }

    initiateCombat(monster) {
        // Calculate damage
        const playerDamage = Math.floor(Math.random() * this.player.power) + Math.floor(this.player.power / 2);
        monster.currentHealth -= playerDamage;

        // Update combat log
        this.renderer.addCombatMessage(`You hit the ${monster.name} for ${playerDamage} damage!`);
        this.renderer.addCombatMessage(`${monster.name}'s health: ${monster.currentHealth}/${monster.health}`);

        if (monster.currentHealth <= 0) {
            // Monster defeated
            const xpGained = monster.xp;
            this.player.gainXP(xpGained);
            this.monsterManager.removeMonster(monster);
            this.renderer.addCombatMessage(`${monster.name} defeated! Gained ${xpGained} XP.`);
            this.inCombat = false;
            this.currentMonster = null;
        } else {
            // Monster counterattack
            const monsterDamage = Math.floor(Math.random() * monster.power) + Math.floor(monster.power / 3);
            this.player.health = Math.max(0, this.player.health - monsterDamage);
            this.renderer.addCombatMessage(`${monster.name} hits you for ${monsterDamage} damage!`);
            this.renderer.addCombatMessage(`Your health: ${this.player.health}/${this.player.maxHealth}`);

            if (this.player.health <= 0) {
                this.renderer.addCombatMessage('Game Over! You were defeated.');
                this.inCombat = false;
                this.currentMonster = null;
            }
        }

        // Update the stats display
        //this.renderer.updateStats(this.player);
    }
}
