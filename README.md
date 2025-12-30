# 📬 GitHub → Telegram Notifier

Real-time GitHub webhook notifications sent directly to your Telegram chat. Stay updated on issues, pull requests, comments, pushes, and stars without constantly checking GitHub.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat&logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat)

---

## 🎯 Проблема

Розробники часто пропускають важливі події у своїх GitHub репозиторіях:
- Нові issues, які потребують уваги
- Pull requests, що чекають на review
- Коментарі від колег
- Зміни в коді (push)

**Постійно перевіряти GitHub — втомлює та відволікає від роботи.**

---

## ✅ Рішення

Цей сервіс автоматично надсилає сповіщення в Telegram при:

| Подія | Опис |
|-------|------|
| 🔵 **Issues** | Створення, закриття, повторне відкриття |
| 💬 **Comments** | Нові коментарі до issues |
| 🔀 **Pull Requests** | Створення, merge, закриття |
| 📦 **Push** | Нові коміти з переліком змін |
| ⭐ **Stars** | Коли хтось ставить зірку репозиторію |

---

## 📸 Скріншоти

<div align="center">
  <p align="center">
    <img src="data/issue.png" width="400" alt="GitHub Issue Notification">
    <br>
    <em>Приклад сповіщення про нове Issue та коментар</em>
  </p>
  <p align="center">
    <img src="data/star.png" width="400" alt="GitHub Star Notification">
    <br>
    <em>Сповіщення про нову зірку ⭐</em>
  </p>
</div>

---

## 🚀 Швидкий старт

### 1. Клонування та встановлення

```bash
git clone https://github.com/yourusername/issue-telegram-notifier.git
cd issue-telegram-notifier
npm install
```

### 2. Створення Telegram бота

1. Напишіть [@BotFather](https://t.me/BotFather) в Telegram
2. Надішліть `/newbot` та дотримуйтесь інструкцій
3. Збережіть отриманий **Bot Token**

### 3. Отримання Chat ID

1. Додайте бота в чат/групу
2. Напишіть боту будь-яке повідомлення
3. Відкрийте: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Знайдіть `"chat":{"id": XXXXXXXX}` — це ваш **Chat ID**

### 4. Налаштування змінних оточення

Створіть файл `.env`:

```env
# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890

# GitHub Webhook
WEBHOOK_SECRET=your_secure_random_string

# Server
PORT=3000
```

### 5. Запуск сервера

```bash
node server.js
```

Повідомлення в консолі:
```
🚀 Server running on port 3000
📡 Webhook endpoint: http://localhost:3000/webhook
```

---

## 🔗 Налаштування GitHub Webhook

### В налаштуваннях репозиторію

1. Перейдіть у **Settings** → **Webhooks** → **Add webhook**
2. Заповніть поля:

| Поле | Значення |
|------|----------|
| **Payload URL** | `https://your-domain.com/webhook` |
| **Content type** | `application/json` |
| **Secret** | Той самий, що в `.env` (`WEBHOOK_SECRET`) |
| **Events** | Виберіть: `Issues`, `Issue comments`, `Pull requests`, `Pushes`, `Stars` |

3. Натисніть **Add webhook**

---

## 🌐 Деплой

### Render (рекомендовано) — безкоштовно

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Автоматичний деплой:**

1. Перейдіть на [render.com](https://render.com)
2. Натисніть **"New"** → **"Web Service"**
3. Підключіть GitHub репозиторій `ruslanlap/issue-telegram-notifier`
4. Render автоматично виявить `render.yaml` та налаштує сервіс
5. Додайте змінні оточення:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `WEBHOOK_SECRET`
6. Натисніть **"Create Web Service"**

**Або вручну:**

1. **Build Command**: `npm install`
2. **Start Command**: `npm start`
3. **Environment**: Node

Render надає:
- ✅ Безкоштовний SSL сертифікат
- ✅ Автоматичні деплої з GitHub
- ✅ 750 годин/місяць безкоштовно

### Railway

⚠️ **Увага:** Railway має обмеження на безкоштовному плані.

Якщо у вас є платний план:
1. `railway init`
2. `railway service`
3. Встановіть змінні: `railway variables --set "KEY=value"`
4. Підключіть GitHub репозиторій через веб-інтерфейс

### Інші варіанти

- **VPS/Ubuntu**: Використовуйте PM2 (`pm2 start server.js`)
- **Docker**: Створіть Dockerfile
- **Fly.io**, **Cyclic**, **Koyeb**

---

## 🧪 Тестування

Запустіть тестовий webhook локально:

```bash
# В першому терміналі
node server.js

# В другому терміналі
node test-webhook.js
```

Якщо все налаштовано правильно, ви отримаєте сповіщення в Telegram.

---

## 📁 Структура проекту

```
issue-telegram-notifier/
├── server.js           # Основний сервер з обробкою webhooks
├── test-webhook.js     # Скрипт для тестування
├── package.json        # Залежності
├── .env                # Змінні оточення (не комітити!)
├── .gitignore          
└── README.md
```

---

## 🔒 Безпека

- ✅ Верифікація підпису GitHub webhook (`x-hub-signature-256`)
- ✅ Секрет зберігається в змінних оточення
- ✅ Використовуйте HTTPS у production

---

## 📝 Ліцензія

ISC © 2024

---

## 🤝 Contributing

Pull requests вітаються! Для великих змін спершу відкрийте issue для обговорення.

---

<div align="center">

**Зроблено з ❤️ для продуктивності розробників**

</div>
