const axios = require('axios');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = 'https://issue-telegram-notifier-88ze.onrender.com/telegram-webhook';

if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN не знайдено в .env');
    process.exit(1);
}

async function setupWebhook() {
    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
            { url: WEBHOOK_URL }
        );
        
        if (response.data.ok) {
            console.log('✅ Telegram webhook налаштовано успішно!');
            console.log(`📡 URL: ${WEBHOOK_URL}`);
            
            // Перевірка поточного webhook
            const info = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
            console.log('\n📋 Поточний webhook info:');
            console.log(JSON.stringify(info.data.result, null, 2));
        } else {
            console.error('❌ Помилка:', response.data.description);
        }
    } catch (error) {
        console.error('❌ Помилка:', error.response?.data || error.message);
    }
}

setupWebhook();

