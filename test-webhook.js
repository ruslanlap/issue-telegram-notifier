const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const SECRET = process.env.WEBHOOK_SECRET || 'test_secret';
const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}/webhook`;

const payload = {
    action: 'opened',
    issue: {
        number: 1,
        title: 'Тестове Issue',
        html_url: 'https://github.com/test/repo/issues/1'
    },
    repository: {
        full_name: 'test/repo',
        html_url: 'https://github.com/test/repo',
        stargazers_count: 10
    },
    sender: {
        login: 'tester',
        html_url: 'https://github.com/tester'
    }
};

const body = JSON.stringify(payload);
const signature = 'sha256=' + crypto.createHmac('sha256', SECRET).update(body).digest('hex');

async function test() {
    try {
        const response = await axios.post(URL, payload, {
            headers: {
                'x-github-event': 'issues',
                'x-hub-signature-256': signature,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Status:', response.status);
        console.log('✅ Response:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
}

test();
