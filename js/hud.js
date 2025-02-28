export class HUD {
    constructor(player) {
        this.player = player;
        this.abilities = [
            { id: 'fireball', name: 'Fireball', icon: '🔥', type: 'attack', damage: 20, manaCost: 15 },
            { id: 'icebolt', name: 'Ice Bolt', icon: '❄️', type: 'attack', damage: 15, manaCost: 10 },
            { id: 'heal', name: 'Heal', icon: '💚', type: 'heal', amount: 30, manaCost: 20 },
            { id: 'staff', name: 'Staff Strike', icon: '🪄', type: 'attack', damage: 10, manaCost: 0 },
            { id: 'sword', name: 'Sword Slash', icon: '⚔️', type: 'attack', damage: 15, manaCost: 0 },
            { id: 'shield', name: 'Magic Shield', icon: '🛡️', type: 'defense', amount: 20, manaCost: 25 },
            { id: 'lightning', name: 'Lightning', icon: '⚡', type: 'attack', damage: 25, manaCost: 30 },
            { id: 'poison', name: 'Poison Cloud', icon: '☠️', type: 'attack', damage: 12, manaCost: 20 }
        ];
        
        this.shortcuts = new Array(4).fill(null);
        this.setupHUD();
    }

    setupHUD() {
        // Create HUD container
        const hudContainer = document.createElement('div');
        hudContainer.className = 'hud-container';
        
        // Add player avatar section
        hudContainer.appendChild(this.createAvatarSection());
        
        // Add stats section
        hudContainer.appendChild(this.createStatsSection());
        
        // Add menu button
        hudContainer.appendChild(this.createMenuButton());
        
        // Add menu dropdown
        document.body.appendChild(this.createMenuDropdown());
        
        // Add shortcuts container
        document.body.appendChild(this.createShortcutsContainer());
        
        document.body.appendChild(hudContainer);
    }

    createAvatarSection() {
        const section = document.createElement('div');
        section.className = 'player-avatar-section';
        
        const avatar = document.createElement('div');
        avatar.className = 'player-avatar';
        avatar.innerHTML = '🧙‍♂️';
        
        const levelIndicator = document.createElement('div');
        levelIndicator.className = 'level-indicator';
        levelIndicator.id = 'player-level';
        levelIndicator.textContent = this.player.level;
        
        // Create XP progress circle
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'xp-progress');
        svg.setAttribute('viewBox', '0 0 36 36');
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '18');
        circle.setAttribute('cy', '18');
        circle.setAttribute('r', '16');
        circle.setAttribute('id', 'xp-circle');
        
        svg.appendChild(circle);
        
        section.appendChild(avatar);
        section.appendChild(levelIndicator);
        section.appendChild(svg);
        
        return section;
    }

    createStatsSection() {
        const section = document.createElement('div');
        section.className = 'stats-section';
        

        // Health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'progress-bar';
        healthBar.innerHTML = `
            <div class="progress-fill health" id="health-fill"></div>
            <span class="progress-text" id="health-text"></span>
        `;
        
        // Mana bar
        const manaBar = document.createElement('div');
        manaBar.className = 'progress-bar';
        manaBar.innerHTML = `
            <div class="progress-fill mana" id="mana-fill"></div>
            <span class="progress-text" id="mana-text"></span>
        `;
        
        
        section.appendChild(healthBar);
        section.appendChild(manaBar);
        
        return section;
    }

    createMenuButton() {
        const button = document.createElement('button');
        button.className = 'menu-button';
        button.innerHTML = '📖';
        button.onclick = () => this.toggleMenu();
        return button;
    }

    createMenuDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'menu-dropdown';
        
        const grid = document.createElement('div');
        grid.className = 'ability-grid';
        
        this.abilities.forEach(ability => {
            const item = document.createElement('div');
            item.className = 'ability-item';
            item.innerHTML = `
                <div class="ability-icon">${ability.icon}</div>
                <div class="ability-name">${ability.name}</div>
                <div class="ability-cost">Mana: ${ability.manaCost}</div>
            `;
            item.onclick = () => this.assignToEmptyShortcut(ability);
            grid.appendChild(item);
        });
        
        dropdown.appendChild(grid);
        return dropdown;
    }

    createShortcutsContainer() {
        const container = document.createElement('div');
        container.className = 'shortcuts-container';
        
        for (let i = 0; i < 4; i++) {
            const button = document.createElement('button');
            button.className = 'shortcut-button empty';
            button.id = `shortcut-${i}`;
            button.innerHTML = '➕';
            container.appendChild(button);
        }
        
        return container;
    }

    toggleMenu() {
        const menu = document.querySelector('.menu-dropdown');
        menu.classList.toggle('active');
    }

    assignToEmptyShortcut(ability) {
        const emptyIndex = this.shortcuts.findIndex(slot => slot === null);
        if (emptyIndex !== -1) {
            this.shortcuts[emptyIndex] = ability;
            const button = document.getElementById(`shortcut-${emptyIndex}`);
            button.innerHTML = ability.icon;
            button.classList.remove('empty');
            button.onclick = () => this.useAbility(ability);
        }
        this.toggleMenu();
    }

    useAbility(ability) {
        if (this.player.mana >= ability.manaCost) {
            console.log(`Using ${ability.name}!`);
            // Implement ability effects here
            this.player.mana -= ability.manaCost;
            //this.updateStats();
        } else {
            console.log('Not enough mana!');
        }
    }

    updateStats() {
        // Update health bar
        const healthFill = document.getElementById('health-fill');
        const healthText = document.getElementById('health-text');
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        healthFill.style.width = `${healthPercent}%`;
        healthText.textContent = `${this.player.health}/${this.player.maxHealth}`;
        
        // Update mana bar
        const manaFill = document.getElementById('mana-fill');
        const manaText = document.getElementById('mana-text');
        const manaPercent = (this.player.mana / this.player.maxMana) * 100;
        manaFill.style.width = `${manaPercent}%`;
        manaText.textContent = `${this.player.mana}/${this.player.maxMana}`;
        
        // Update level and XP
        const levelIndicator = document.getElementById('player-level');
        levelIndicator.textContent = this.player.level;
        
        const xpCircle = document.getElementById('xp-circle');
        const xpProgress = (this.player.xp / this.player.xpToNextLevel) * 100;
        const circumference = 2 * Math.PI * 16;
        const offset = circumference - (xpProgress / 100) * circumference;
        xpCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        xpCircle.style.strokeDashoffset = offset;
    }
}
