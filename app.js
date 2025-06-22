// Конфигурация
const CONFIG = {
    botToken: "7201744365:AAGmXicLrg8ZOIkxWu-vPV2O5qlF2aoUKu0",
    paymentToken: "1744374395:TEST:b7b8d4c48eecf7fe6c92",
    chatId: "7201744365",
    apiUrl: "https://api.telegram.org/bot7201744365:AAGmXicLrg8ZOIkxWu-vPV2O5qlF2aoUKu0"
};

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Состояние приложения
let state = {
    balance: 0,
    gifts: [],
    starPackages: [
        { stars: 100, price: 1.99, currency: "USD" },
        { stars: 550, price: 9.99, currency: "USD" },
        { stars: 1200, price: 19.99, currency: "USD" },
        { stars: 2500, price: 39.99, currency: "USD" },
        { stars: 5300, price: 79.99, currency: "USD" },
        { stars: 11000, price: 159.99, currency: "USD" }
    ],
    autoPurchase: {
        enabled: false,
        lastCheck: null
    }
};

// Инициализация приложения
async function initApp() {
    if (!tg.initDataUnsafe?.user) {
        showAlert("Ошибка: приложение должно быть запущено через Telegram");
        return;
    }

    // Загрузка данных
    await loadBalance();
    await loadGifts();
    renderStarPackages();
    setupEventListeners();

    // Проверка новых подарков каждые 10 минут
    setInterval(checkNewGifts, 600000);
}

// Загрузка баланса
async function loadBalance() {
    try {
        // В реальном приложении здесь должен быть запрос к вашему серверу
        // Для демо используем localStorage
        const savedBalance = localStorage.getItem('stars_balance');
        state.balance = savedBalance ? parseInt(savedBalance) : 0;
        updateBalanceDisplay();
    } catch (error) {
        console.error("Ошибка загрузки баланса:", error);
    }
}

// Загрузка списка подарков
async function loadGifts() {
    try {
        // Эмуляция запроса к payments.getStarGifts
        state.gifts = [
            {
                id: "gift1",
                title: "Золотая корона",
                stars: 500,
                photo_url: "https://via.placeholder.com/150/FFD700/000000?text=Crown"
            },
            {
                id: "gift2",
                title: "Алмаз",
                stars: 1000,
                photo_url: "https://via.placeholder.com/150/00BFFF/000000?text=Diamond"
            },
            {
                id: "gift3",
                title: "Ракета",
                stars: 2500,
                photo_url: "https://via.placeholder.com/150/FF6347/000000?text=Rocket"
            }
        ];
        renderGifts();
    } catch (error) {
        console.error("Ошибка загрузки подарков:", error);
    }
}

// Проверка новых подарков
async function checkNewGifts() {
    if (!state.autoPurchase.enabled) return;

    const oldGiftIds = state.gifts.map(g => g.id);
    await loadGifts();
    
    const newGifts = state.gifts.filter(g => !oldGiftIds.includes(g.id));
    if (newGifts.length > 0) {
        newGifts.forEach(gift => {
            purchaseGiftAutomatically(gift);
        });
    }
}

// Автоматическая покупка подарка
async function purchaseGiftAutomatically(gift) {
    if (state.balance >= gift.stars) {
        await sendGift(gift);
    } else {
        const neededStars = gift.stars - state.balance;
        await buyStars(neededStars);
        await sendGift(gift);
    }
}

// Отправка подарка
async function sendGift(gift) {
    try {
        // Эмуляция отправки подарка
        state.balance -= gift.stars;
        localStorage.setItem('stars_balance', state.balance.toString());
        updateBalanceDisplay();
        
        tg.showAlert(`Подарок "${gift.title}" успешно отправлен!`);
        logTransaction('gift_purchase', gift.stars, gift.id);
    } catch (error) {
        console.error("Ошибка отправки подарка:", error);
        tg.showAlert("Ошибка при отправке подарка");
    }
}

// Покупка звёзд
async function buyStars(amount) {
    const packageToBuy = state.starPackages.find(pkg => pkg.stars >= amount) || state.starPackages[state.starPackages.length - 1];
    
    tg.openInvoice({
        title: `Покупка ${packageToBuy.stars} Telegram Stars`,
        description: `Пополнение баланса на ${packageToBuy.stars} XTR`,
        currency: packageToBuy.currency,
        prices: [{ label: "Stars", amount: packageToBuy.price * 100 }],
        payload: JSON.stringify({
            type: "stars_purchase",
            user_id: tg.initDataUnsafe.user.id,
            amount: packageToBuy.stars
        }),
        provider_token: CONFIG.paymentToken
    }, (status) => {
        if (status === 'paid') {
            state.balance += packageToBuy.stars;
            localStorage.setItem('stars_balance', state.balance.toString());
            updateBalanceDisplay();
            logTransaction('stars_purchase', packageToBuy.stars);
        }
    });
}

// Рендер подарков
function renderGifts() {
    const container = document.getElementById('gifts-container');
    container.innerHTML = '';
    
    state.gifts.forEach(gift => {
        const giftElement = document.createElement('div');
        giftElement.className = 'gift-item';
        giftElement.innerHTML = `
            <img src="${gift.photo_url}" alt="${gift.title}">
            <div class="gift-info">
                <div class="gift-title">${gift.title}</div>
                <div class="gift-stars">${gift.stars} ★</div>
            </div>
            <button class="buy-btn" data-id="${gift.id}">Купить</button>
        `;
        container.appendChild(giftElement);
    });
}

// Рендер пакетов звёзд
function renderStarPackages() {
    const container = document.getElementById('stars-packages');
    container.innerHTML = '';
    
    state.starPackages.forEach((pkg, index) => {
        const packageElement = document.createElement('div');
        packageElement.className = 'gift-item';
        packageElement.innerHTML = `
            <div class="gift-info">
                <div class="gift-title">${pkg.stars} Telegram Stars</div>
                <div class="gift-stars">${pkg.price} ${pkg.currency}</div>
            </div>
            <button class="buy-btn" data-package="${index}">Купить</button>
        `;
        container.appendChild(packageElement);
    });
}

// Обновление отображения баланса
function updateBalanceDisplay() {
    document.getElementById('balance').textContent = `Ваш баланс: ${state.balance} ★`;
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        });
    });
    
    // Кнопки покупки подарков
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-btn')) {
            if (e.target.dataset.id) {
                const gift = state.gifts.find(g => g.id === e.target.dataset.id);
                if (gift) {
                    if (state.balance >= gift.stars) {
                        sendGift(gift);
                    } else {
                        tg.showAlert(`Недостаточно звёзд. Нужно ещё ${gift.stars - state.balance} ★`);
                    }
                }
            } else if (e.target.dataset.package) {
                const pkgIndex = parseInt(e.target.dataset.package);
                buyStars(state.starPackages[pkgIndex].stars);
            }
        }
    });
    
    // Переключатель автопокупки
    document.getElementById('auto-purchase-toggle').addEventListener('change', (e) => {
        state.autoPurchase.enabled = e.target.checked;
        document.getElementById('auto-purchase-status').textContent = 
            `Статус: ${state.autoPurchase.enabled ? 'активен' : 'неактивен'}`;
    });
}

// Логирование операций (в реальном приложении отправляется на сервер)
function logTransaction(type, amount, details = null) {
    const tx = {
        date: new Date().toISOString(),
        type,
        amount,
        details,
        user: tg.initDataUnsafe.user
    };
    console.log('Transaction:', tx);
}

// Показ уведомления
function showAlert(message) {
    tg.showAlert(message);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
