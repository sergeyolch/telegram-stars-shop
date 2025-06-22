// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Данные о звёздах
const starPackages = [
    { amount: 100, price: 1.99, currency: "USD" },
    { amount: 550, price: 9.99, currency: "USD" },
    { amount: 1200, price: 19.99, currency: "USD" },
    { amount: 2500, price: 39.99, currency: "USD" },
    { amount: 5300, price: 79.99, currency: "USD" },
    { amount: 11000, price: 159.99, currency: "USD" }
];

// Данные о подарках
const gifts = [
    { id: "gift1", name: "Воздушный шар", price: 50, icon: "🎈" },
    { id: "gift2", name: "Кекс", price: 100, icon: "🧁" },
    { id: "gift3", name: "Корона", price: 500, icon: "👑" },
    { id: "gift4", name: "Огненное сердце", price: 1000, icon: "❤️‍🔥" },
    { id: "gift5", name: "Ракета", price: 2500, icon: "🚀" },
    { id: "gift6", name: "Алмаз", price: 5000, icon: "💎" }
];

// Состояние приложения
let state = {
    selectedStarPackage: null,
    autoBuyEnabled: false,
    balance: 0
};

// Инициализация приложения
function initApp() {
    renderStarPackages();
    renderGifts();
    setupEventListeners();
    updateBalance();
}

// Рендер пакетов звёзд
function renderStarPackages() {
    const starsGrid = document.getElementById('stars-grid');
    starsGrid.innerHTML = '';

    starPackages.forEach((pkg, index) => {
        const starItem = document.createElement('div');
        starItem.className = `star-item ${state.selectedStarPackage === index ? 'selected' : ''}`;
        starItem.innerHTML = `
            <div class="star-amount">${pkg.amount} ⭐</div>
            <div class="star-price">$${pkg.price}</div>
        `;
        starItem.addEventListener('click', () => selectStarPackage(index));
        starsGrid.appendChild(starItem);
    });
}

// Рендер подарков
function renderGifts() {
    const giftsList = document.getElementById('gifts-list');
    giftsList.innerHTML = '';

    gifts.forEach(gift => {
        const giftItem = document.createElement('div');
        giftItem.className = 'gift-item';
        giftItem.innerHTML = `
            <div class="gift-icon">${gift.icon}</div>
            <div class="gift-info">
                <div class="gift-name">${gift.name}</div>
                <div class="gift-price">${gift.price} звёзд</div>
            </div>
        `;
        giftItem.addEventListener('click', () => sendGift(gift));
        giftsList.appendChild(giftItem);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопка покупки звёзд
    document.getElementById('buy-stars-btn').addEventListener('click', buyStars);

    // Переключение вкладок
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Переключатель авто-покупки
    document.getElementById('auto-buy-toggle').addEventListener('change', (e) => {
        state.autoBuyEnabled = e.target.checked;
    });
}

// Выбор пакета звёзд
function selectStarPackage(index) {
    state.selectedStarPackage = index;
    renderStarPackages();
}

// Покупка звёзд
function buyStars() {
    if (state.selectedStarPackage === null) {
        showAlert('Пожалуйста, выберите пакет звёзд');
        return;
    }

    const selectedPackage = starPackages[state.selectedStarPackage];

    // В реальном приложении здесь будет вызов Telegram API для покупки
    showAlert(`Покупка ${selectedPackage.amount} звёзд за $${selectedPackage.price}`);

    // В демо-режиме просто увеличиваем баланс
    state.balance += selectedPackage.amount;
    updateBalance();
}

// Отправка подарка
function sendGift(gift) {
    if (state.balance < gift.price && !state.autoBuyEnabled) {
        showAlert(`Недостаточно звёзд. Ваш баланс: ${state.balance}, требуется: ${gift.price}`);
        return;
    }

    if (state.autoBuyEnabled && state.balance < gift.price) {
        // В реальном приложении здесь будет вызов API для покупки звёзд
        const neededStars = gift.price - state.balance;
        const smallestPackage = starPackages.find(pkg => pkg.amount >= neededStars) || starPackages[starPackages.length - 1];

        showAlert(`Автоматическая покупка ${smallestPackage.amount} звёзд за $${smallestPackage.price}`);
        state.balance += smallestPackage.amount;
    }

    state.balance -= gift.price;
    updateBalance();

    showAlert(`Подарок "${gift.name}" отправлен!`);
}

// Переключение вкладок
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// Обновление баланса
function updateBalance() {
    document.getElementById('balance').textContent = `${state.balance} звёзд`;
}

// Показ уведомления
function showAlert(message) {
    tg.showAlert(message);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);