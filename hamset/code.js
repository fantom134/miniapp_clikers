
       // Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Разворачиваем на весь экран
tg.ready(); // Говорим Telegram, что приложение готово

       
       let score = 0;
        let perClick = 1;
        let totalClicks = 0;
        
        const scoreElement = document.getElementById('score');
        const perClickElement = document.getElementById('per-click');
        const totalClicksElement = document.getElementById('total-clicks');
        const clickButton = document.getElementById('click-btn');
        
        const upgrades = [
            { id: 1, name: "+1 за клик", price: 100, effect: 1, owned: 0, type: "add" },
            { id: 2, name: "+5 за клик", price: 500, effect: 5, owned: 0, type: "add" },
            { id: 3, name: "+10 за клик", price: 1000, effect: 10, owned: 0, type: "add" },
            { id: 4, name: "x2 Множитель", price: 5000, effect: 2, owned: 0, type: "multiply" }
        ];
        
        function handleClick() {
            score += perClick;
            totalClicks++;
            
            updateDisplay();
            updateButtons();
            
            clickButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                clickButton.style.transform = 'scale(1)';
            }, 100);
        }
        
        function buyUpgrade(id) {
            const upgrade = upgrades[id - 1];
            
            if (score >= upgrade.price) {
                score -= upgrade.price;
                upgrade.owned++;
                
                if (upgrade.type === "add") {
                    perClick += upgrade.effect;
                } else if (upgrade.type === "multiply") {
                    perClick *= upgrade.effect;
                }
                
                upgrade.price = Math.floor(upgrade.price * 2);
                
                updateDisplay();
                updateButtons();
                
                document.getElementById(`price${id}`).textContent = upgrade.price;
                
                const buyButton = document.querySelector(`button[onclick="buyUpgrade(${id})"]`);
                buyButton.style.background = '#45a049';
                setTimeout(() => {
                    buyButton.style.background = '#4CAF50';
                }, 200);
            }
        }
        
        function updateDisplay() {
            scoreElement.textContent = score;
            perClickElement.textContent = perClick;
            totalClicksElement.textContent = totalClicks;
        }
        
        function updateButtons() {
            for (let i = 1; i <= 4; i++) {
                const upgrade = upgrades[i - 1];
                const button = document.querySelector(`button[onclick="buyUpgrade(${i})"]`);
                if (button) {
                    button.disabled = score < upgrade.price;
                }
            }
        }
        
        function startGame() {
            clickButton.addEventListener('click', handleClick);
            updateDisplay();
            updateButtons();
        }
        
        window.onload = startGame;
