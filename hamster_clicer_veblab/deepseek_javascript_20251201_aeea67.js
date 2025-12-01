class HamsterClicker {
    constructor() {
        this.seeds = 0;
        this.totalSeeds = 0;
        this.cps = 0; // Семян в секунду
        this.level = 1;
        this.exp = 0;
        this.clickPower = 1;
        this.upgrades = [];
        this.costumes = [];
        this.stats = {
            totalClicks: 0,
            timePlayed: 0,
            upgradesBought: 0
        };
        
        this.init();
    }
    
    init() {
        this.loadGame();
        this.setupTelegram();
        this.render();
        this.setupEventListeners();
        this.startGameLoop();
        
        // Инициализация улучшений
        this.initUpgrades();
        this.initCostumes();
    }
    
    setupTelegram() {
        if (window.Telegram?.WebApp) {
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            
            const user = this.tg.initDataUnsafe?.user;
            if (user) {
                document.getElementById('username').textContent = 
                    user.first_name || 'Игрок';
            }
            
            // Кнопка назад
            this.tg.BackButton.show();
            this.tg.BackButton.onClick(() => {
                this.saveGame();
                this.tg.close();
            });
        }
    }
    
    initUpgrades() {
        this.upgrades = [
            {
                id: 'wheel',
                name: 'Беговое колесо',
                description: 'Хомяк бегает и собирает семена',
                cost: 10,
                cps: 0.1,
                bought: false,
                icon: 'fa-running'
            },
            {
                id: 'friend',
                name: 'Друг-хомяк',
                description: 'Второй хомяк помогает собирать',
                cost: 50,
                cps: 0.5,
                bought: false,
                icon: 'fa-users'
            },
            {
                id: 'farm',
                name: 'Семенная ферма',
                description: 'Автоматическая ферма семян',
                cost: 200,
                cps: 2,
                bought: false,
                icon: 'fa-tractor'
            },
            {
                id: 'lab',
                name: 'Хомячья лаборатория',
                description: 'Ученые хомяки создают семена',
                cost: 1000,
                cps: 10,
                bought: false,
                icon: 'fa-flask'
            },
            {
                id: 'spaceship',
                name: 'Космический корабль',
                description: 'Хомяки ищут семена в космосе',
                cost: 5000,
                cps: 50,
                bought: false,
                icon: 'fa-rocket'
            }
        ];
    }
    
    initCostumes() {
        this.costumes = [
            { id: 'hat', name: 'Шляпа', cost: 100, bought: false, icon: 'fa-hat-cowboy', multiplier: 1.1 },
            { id: 'glasses', name: 'Очки', cost: 500, bought: false, icon: 'fa-glasses', multiplier: 1.2 },
            { id: 'cape', name: 'Плащ', cost: 2000, bought: false, icon: 'fa-user-ninja', multiplier: 1.5 },
            { id: 'crown', name: 'Корона', cost: 10000, bought: false, icon: 'fa-crown', multiplier: 2.0 }
        ];
    }
    
    click() {
        // Анимация клика
        const effect = document.querySelector('.click-effect');
        effect.style.animation = 'none';
        void effect.offsetWidth; // Сброс анимации
        effect.style.animation = 'click 0.5s forwards';
        
        // Добавление семян
        let clickAmount = this.clickPower;
        
        // Применяем множители от костюмов
        this.costumes.forEach(costume => {
            if (costume.bought) {
                clickAmount *= costume.multiplier;
            }
        });
        
        this.seeds += clickAmount;
        this.totalSeeds += clickAmount;
        this.stats.totalClicks++;
        this.addExp(1);
        
        this.updateUI();
        this.checkAchievements();
    }
    
    addExp(amount) {
        this.exp += amount;
        const neededExp = this.level * 100;
        
        if (this.exp >= neededExp) {
            this.level++;
            this.exp = this.exp - neededExp;
            this.clickPower += 0.5;
            this.showLevelUp();
        }
    }
    
    showLevelUp() {
        const achievement = document.getElementById('achievement');
        achievement.querySelector('span').textContent = `Уровень ${this.level}!`;
        achievement.style.display = 'block';
        
        setTimeout(() => {
            achievement.style.display = 'none';
        }, 3000);
    }
    
    buyUpgrade(upgradeId) {
        const upgrade = this.upgrades.find(u => u.id === upgradeId);
        
        if (!upgrade || upgrade.bought || this.seeds < upgrade.cost) {
            return;
        }
        
        this.seeds -= upgrade.cost;
        upgrade.bought = true;
        this.cps += upgrade.cps;
        this.stats.upgradesBought++;
        
        this.updateUI();
        this.saveGame();
    }
    
    buyCostume(costumeId) {
        const costume = this.costumes.find(c => c.id === costumeId);
        
        if (!costume || costume.bought || this.seeds < costume.cost) {
            return;
        }
        
        this.seeds -= costume.cost;
        costume.bought = true;
        
        // Визуальное применение костюма
        this.applyCostume(costumeId);
        
        this.updateUI();
        this.saveGame();
    }
    
    applyCostume(costumeId) {
        const hamster = document.querySelector('.hamster');
        
        // Добавляем элементы костюма в DOM
        switch(costumeId) {
            case 'hat':
                hamster.innerHTML += '<div class="costume-hat">🎩</div>';
                break;
            case 'glasses':
                hamster.innerHTML += '<div class="costume-glasses">👓</div>';
                break;
            case 'cape':
                hamster.innerHTML += '<div class="costume-cape">🧥</div>';
                break;
            case 'crown':
                hamster.innerHTML += '<div class="costume-crown">👑</div>';
                break;
        }
    }
    
    updateUI() {
        // Обновление счетчиков
        document.getElementById('seeds').textContent = Math.floor(this.seeds);
        document.getElementById('cps').textContent = this.cps.toFixed(1);
        document.getElementById('level').textContent = this.level;
        
        // Прогресс уровня
        const expPercent = (this.exp / (this.level * 100)) * 100;
        
        // Обновление магазина
        this.renderUpgrades();
        this.renderCostumes();
    }
    
    renderUpgrades() {
        const container = document.querySelector('.upgrades');
        container.innerHTML = '';
        
        this.upgrades.forEach(upgrade => {
            const canBuy = this.seeds >= upgrade.cost && !upgrade.bought;
            const item = document.createElement('div');
            item.className = `upgrade-item ${upgrade.bought ? 'bought' : ''}`;
            item.onclick = () => this.buyUpgrade(upgrade.id);
            
            item.innerHTML = `
                <i class="fas ${upgrade.icon}"></i>
                <h3>${upgrade.name}</h3>
                <p>${upgrade.description}</p>
                <div class="upgrade-cost">${Math.floor(upgrade.cost)} семян</div>
                <div class="upgrade-cps">+${upgrade.cps} семян/сек</div>
                ${upgrade.bought ? '<div class="bought-label">Куплено</div>' : 
                  canBuy ? '<div class="buy-btn">Купить</div>' : 
                  '<div class="locked">Недостаточно семян</div>'}
            `;
            
            container.appendChild(item);
        });
    }
    
    renderCostumes() {
        const container = document.querySelector('.costumes');
        container.innerHTML = '';
        
        this.costumes.forEach(costume => {
            const canBuy = this.seeds >= costume.cost && !costume.bought;
            const item = document.createElement('div');
            item.className = `costume-item ${costume.bought ? 'bought' : ''}`;
            item.onclick = () => this.buyCostume(costume.id);
            
            item.innerHTML = `
                <i class="fas ${costume.icon}"></i>
                <h3>${costume.name}</h3>
                <p>Множитель: x${costume.multiplier}</p>
                <div class="upgrade-cost">${Math.floor(costume.cost)} семян</div>
                ${costume.bought ? '<div class="bought-label">Надето</div>' : 
                  canBuy ? '<div class="buy-btn">Купить</div>' : 
                  '<div class="locked">Недостаточно семян</div>'}
            `;
            
            container.appendChild(item);
        });
    }
    
    startGameLoop() {
        setInterval(() => {
            // Пассивный доход
            if (this.cps > 0) {
                this.seeds += this.cps;
                this.totalSeeds += this.cps;
                this.stats.timePlayed++;
                this.updateUI();
            }
        }, 1000);
        
        // Автосохранение каждые 30 секунд
        setInterval(() => {
            this.saveGame();
        }, 30000);
    }
    
    setupEventListeners() {
        // Клик по хомяку
        document.getElementById('hamster').addEventListener('click', () => this.click());
        document.getElementById('clickBtn').addEventListener('click', () => this.click());
        
        // Кнопки в футере
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveGame();
            this.showMessage('Игра сохранена!');
        });
        
        document.getElementById('statsBtn').addEventListener('click', () => this.showStats());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareGame());
        
        // Модальные окна
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });
    }
    
    showStats() {
        const modal = document.getElementById('statsModal');
        const content = document.getElementById('statsContent');
        
        content.innerHTML = `
            <div class="stat-item">
                <i class="fas fa-mouse-pointer"></i>
                <span>Всего кликов: ${this.stats.totalClicks}</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-seedling"></i>
                <span>Всего собрано семян: ${Math.floor(this.totalSeeds)}</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-clock"></i>
                <span>Время игры: ${Math.floor(this.stats.timePlayed / 60)} мин</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-shopping-cart"></i>
                <span>Куплено улучшений: ${this.stats.upgradesBought}</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-bolt"></i>
                <span>Пассивный доход: ${this.cps.toFixed(1)}/сек</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-calculator"></i>
                <span>Сила клика: x${this.clickPower.toFixed(1)}</span>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
    
    shareGame() {
        if (this.tg) {
            this.tg.shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Я уже собрал ${Math.floor(this.totalSeeds)} семян в Хомяк Кликере! Присоединяйся!`;
        } else {
            this.showMessage('Скопируйте ссылку на игру и отправьте друзьям!');
        }
    }
    
    checkAchievements() {
        const achievements = [
            { seeds: 100, message: '100 семян собрано!' },
            { seeds: 1000, message: '1000 семян!' },
            { clicks: 50, message: '50 кликов!' },
            { level: 5, message: '5 уровень!' }
        ];
        
        achievements.forEach(ach => {
            if ((ach.seeds && this.totalSeeds >= ach.seeds) ||
                (ach.clicks && this.stats.totalClicks >= ach.clicks) ||
                (ach.level && this.level >= ach.level)) {
                // Можно добавить систему достижений
            }
        });
    }
    
    showMessage(text) {
        if (this.tg) {
            this.tg.showAlert(text);
        } else {
            alert(text);
        }
    }
    
    saveGame() {
        const saveData = {
            seeds: this.seeds,
            totalSeeds: this.totalSeeds,
            cps: this.cps,
            level: this.level,
            exp: this.exp,
            clickPower: this.clickPower,
            upgrades: this.upgrades,
            costumes: this.costumes,
            stats: this.stats,
            timestamp: Date.now()
        };
        
        localStorage.setItem('hamsterClickerSave', JSON.stringify(saveData));
        
        // Отправляем статистику в бота, если есть Telegram
        if (this.tg) {
            this.tg.sendData(JSON.stringify({
                action: 'save',
                data: {
                    seeds: this.totalSeeds,
                    level: this.level
                }
            }));
        }
    }
    
    loadGame() {
        const save = localStorage.getItem('hamsterClickerSave');
        if (save) {
            try {
                const data = JSON.parse(save);
                
                // Проверяем, не устарело ли сохранение (больше 30 дней)
                const daysOld = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
                if (daysOld > 30) {
                    return; // Слишком старое сохранение
                }
                
                Object.assign(this, data);
                
                // Восстанавливаем UI
                this.updateUI();
                this.renderUpgrades();
                this.renderCostumes();
                
                // Применяем купленные костюмы
                this.costumes.forEach(costume => {
                    if (costume.bought) {
                        this.applyCostume(costume.id);
                    }
                });
                
            } catch (e) {
                console.error('Ошибка загрузки сохранения:', e);
            }
        }
    }
    
    render() {
        this.updateUI();
    }
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.game = new HamsterClicker();
});