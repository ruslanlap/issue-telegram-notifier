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

### ⚡ Чеклист для продакшену (Render + GitHub App)

- [ ] Створено Telegram бота через @BotFather
- [ ] Отримано `TELEGRAM_BOT_TOKEN` та `TELEGRAM_CHAT_ID`
- [ ] Створено GitHub App з правильним **Webhook URL** (`https://your-app.onrender.com/webhook` ⚠️ з `/webhook`!)
- [ ] Згенеровано `WEBHOOK_SECRET` та додано в GitHub App та Render
- [ ] Отримано `GITHUB_APP_ID` та `GITHUB_PRIVATE_KEY` з GitHub App
- [ ] Задеплоєно на Render з усіма змінними оточення
- [ ] Встановлено GitHub App на потрібний репозиторій
- [ ] Налаштовано Telegram webhook через `setup-telegram-webhook.js`
- [ ] Протестовано: створив issue → отримав повідомлення в Telegram ✅

---

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

# GitHub App (опціонально, якщо використовуєш GitHub App)
GITHUB_APP_ID=2564133
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"

# Render keep-alive (для локального тестування)
RENDER_EXTERNAL_URL=http://localhost:3000
KEEPALIVE_ENABLED=true
KEEPALIVE_INTERVAL_MS=300000

# Server
PORT=3000
```

**Примітки:**
- `WEBHOOK_SECRET` — згенеруй через `openssl rand -hex 32`
- `GITHUB_PRIVATE_KEY` — має бути в лапках, переноси рядків як `\n`
- `RENDER_EXTERNAL_URL` — на Render встановлюється автоматично, локально вкажи `http://localhost:3000`

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

## 🔗 Налаштування GitHub App (рекомендовано)

GitHub App дозволяє боту відповідати на коментарі з Telegram та писати їх у GitHub issues.

### 1. Створення GitHub App

1. Перейдіть на [GitHub Settings → Developer settings → GitHub Apps](https://github.com/settings/apps)
2. Натисніть **"New GitHub App"**
3. Заповніть обов'язкові поля:

| Поле | Значення |
|------|----------|
| **GitHub App name** | `issue-telegram-notifier` (або будь-яке ім'я) |
| **Homepage URL** | `https://your-app.onrender.com/` |
| **Webhook URL** | `https://your-app.onrender.com/webhook` ⚠️ **ВАЖЛИВО: має бути `/webhook` в кінці!** |
| **Webhook secret** | Той самий, що в `.env` (`WEBHOOK_SECRET`) |

4. **Permissions** (обов'язково налаштуйте):

| Permission | Access |
|------------|--------|
| **Issues** | Read & write (для відповідей з Telegram) |
| **Pull requests** | Read |
| **Metadata** | Read-only |

5. **Subscribe to events** (включити):
   - ✅ Issues
   - ✅ Issue comment
   - ✅ Pull request
   - ✅ Push
   - ✅ Star

6. Натисніть **"Create GitHub App"**

### 2. Отримання App ID та Private Key

1. На сторінці App знайди **App ID** (наприклад, `2564133`)
2. Натисни **"Generate a new private key"** → завантажиться `.pem` файл
3. Відкрий `.pem` файл та скопіюй весь вміст (включно з `-----BEGIN RSA PRIVATE KEY-----` та `-----END RSA PRIVATE KEY-----`)

### 3. Додавання змінних оточення

Додай до `.env`:

```env
GITHUB_APP_ID=2564133
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
```

**Важливо:** `GITHUB_PRIVATE_KEY` має бути в лапках, а переноси рядків заміни на `\n`.

### 4. Встановлення App на репозиторій

1. На сторінці App натисни **"Install App"**
2. Вибери репозиторій (або всі репозиторії)
3. Натисни **"Install"**

---

## 📱 Налаштування Telegram Webhook

Для того, щоб бот міг отримувати відповіді з Telegram та писати їх у GitHub:

```bash
# Варіант 1: через curl (підстав свій токен)
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-app.onrender.com/telegram-webhook"

# Варіант 2: через Node.js скрипт
node setup-telegram-webhook.js
```

Перевірка налаштування:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Має повернути `"url": "https://your-app.onrender.com/telegram-webhook"`.

---

## ⚠️ Типові проблеми та вирішення

### Проблема 1: Webhook не спрацьовує

**Симптоми:**
- Події з GitHub не надходять в Telegram
- В логах Render немає записів `📨 GitHub: issues -> opened`

**Рішення:**

1. **Перевір Webhook URL в GitHub App:**
   - ❌ Неправильно: `https://your-app.onrender.com`
   - ✅ Правильно: `https://your-app.onrender.com/webhook`
   
   **ВАЖЛИВО:** URL має закінчуватися на `/webhook`!

2. **Перевір Webhook Secret:**
   - `WEBHOOK_SECRET` на Render має **точно співпадати** з secret у GitHub App
   - Якщо не співпадає → зміни в GitHub App → "Change secret" → онови на Render

3. **Перевір, чи App встановлений:**
   - GitHub → Settings → Integrations → GitHub Apps
   - Знайди свій App → перевір, чи він встановлений на потрібний репозиторій

### Проблема 2: "Invalid signature" в логах

**Причина:** `WEBHOOK_SECRET` не співпадає між GitHub App та Render.

**Рішення:**
1. Згенеруй новий secret (наприклад, через `openssl rand -hex 32`)
2. Онови в GitHub App → Webhook → "Change secret"
3. Онови на Render → Environment → `WEBHOOK_SECRET`
4. Перезапусти сервіс на Render

### Проблема 3: Render instance "спить" (cold start)

**Симптоми:** Перший запит після неактивності займає 30+ секунд.

**Рішення:** Keep-alive вже налаштований в `render.yaml`:
- `KEEPALIVE_ENABLED=true`
- `KEEPALIVE_INTERVAL_MS=300000` (5 хвилин)

Якщо хочеш частіше (наприклад, кожні 30 секунд), зміни на Render:
- `KEEPALIVE_INTERVAL_MS=30000`

### Проблема 4: Telegram webhook не працює

**Симптоми:** Відповіді з Telegram не потрапляють у GitHub issues.

**Рішення:**
1. Перевір, чи налаштований webhook:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```
2. Переконайся, що URL правильний: `https://your-app.onrender.com/telegram-webhook`
3. Перевір логи Render на помилки типу `❌ Telegram error` або `❌ GitHub API Error`

### Проблема 5: "GitHub App initialized successfully" не з'являється

**Причина:** Неправильний формат `GITHUB_PRIVATE_KEY`.

**Рішення:**
- Private key має бути в лапках
- Переноси рядків мають бути як `\n`:
  ```env
  GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
  ```

---

## 🔗 Альтернатива: Звичайний GitHub Webhook (без App)

Якщо не потрібна функція відповідей з Telegram:

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
5. Додайте змінні оточення в **Settings → Environment**:

   **Обов'язкові:**
   - `TELEGRAM_BOT_TOKEN` — токен від @BotFather
   - `TELEGRAM_CHAT_ID` — ID чату/групи
   - `WEBHOOK_SECRET` — випадковий рядок (наприклад, через `openssl rand -hex 32`)
   
   **Для GitHub App (якщо використовуєш App замість звичайного webhook):**
   - `GITHUB_APP_ID` — ID з GitHub App settings
   - `GITHUB_PRIVATE_KEY` — вміст `.pem` файлу (з переносами як `\n`)
   
   **Опціональні:**
   - `KEEPALIVE_ENABLED` — `true` (за замовчуванням, для запобігання cold start)
   - `KEEPALIVE_INTERVAL_MS` — `300000` (5 хв, за замовчуванням)

6. Натисніть **"Create Web Service"**

**Важливо після деплою:**

1. Скопіюй URL сервісу (наприклад, `https://github-telegram-notifier.onrender.com`)
2. Онови **Webhook URL** в GitHub App: `https://your-app.onrender.com/webhook` ⚠️ **Не забудь `/webhook` в кінці!**
3. Налаштуй Telegram webhook (див. секцію вище)

**Або вручну (якщо не використовуєш `render.yaml`):**

1. **Build Command**: `npm install`
2. **Start Command**: `npm start`
3. **Environment**: Node
4. Додай всі змінні оточення вручну

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
├── server.js                    # Основний сервер з обробкою webhooks
├── test-webhook.js              # Скрипт для тестування локального webhook
├── test-render.js               # Скрипт для тестування Render instance
├── setup-telegram-webhook.js    # Налаштування Telegram webhook
├── render.yaml                  # Конфігурація для Render
├── package.json                 # Залежності
├── .env                         # Змінні оточення (не комітити!)
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
