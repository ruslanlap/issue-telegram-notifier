const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const SECRET = process.env.WEBHOOK_SECRET;
const URL = 'https://issue-telegram-notifier.onrender.com/webhook';

if (!SECRET) {
    console.error('❌ Помилка: WEBHOOK_SECRET не знайдено в .env');
    process.exit(1);
}

const payload = {
    action: 'opened',
    issue: {
        number: 777,
        title: 'Тест повідомлення з Render CLI 🚀',
        html_url: 'https://github.com/ruslanlap/issue-telegram-notifier/issues/777',
        labels: [{ name: 'testing' }, { name: 'senior-dev' }]
    },
    repository: {
        full_name: 'ruslanlap/issue-telegram-notifier',
        html_url: 'https://github.com/ruslanlap/issue-telegram-notifier',
        stargazers_count: 5
    },
    sender: {
        login: 'SeniorDevCLI',
        html_url: 'https://github.com/ruslanlap'
    }
};

const body = JSON.stringify(payload);
const signature = 'sha256=' + crypto.createHmac('sha256', SECRET).update(body).digest('hex');

async function runTest() {
    console.log(`📡 Відправка тесту на: ${URL}...`);
    try {
        const response = await axios.post(URL, payload, {
            headers: {
                'x-github-event': 'issues',
                'x-hub-signature-256': signature,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Статус:', response.status);
        console.log('✅ Повідомлення від сервера:', response.data);
        console.log('\n📱 Перевірте Telegram! Ви мали отримати професійне сповіщення.');
    } catch (error) {
        console.error('❌ Помилка:', error.response ? error.response.data : error.message);
        if (error.response?.status === 401) {
            console.log('💡 Підказка: Перевірте, чи WEBHOOK_SECRET на Render такий самий, як у вашому .env');
        }
    }
}

runTest();
