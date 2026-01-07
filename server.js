const express = require('express');
require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const { App } = require('octokit');

const app = express();
const PORT = process.env.PORT || 3000;

// Ініціалізація GitHub App
let octokitApp;
if (process.env.GITHUB_APP_ID && process.env.GITHUB_PRIVATE_KEY) {
    try {
        octokitApp = new App({
            appId: process.env.GITHUB_APP_ID,
            privateKey: process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
        console.log('🤖 GitHub App initialized successfully');
    } catch (e) {
        console.error('❌ Failed to initialize GitHub App:', e.message);
    }
}

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'GitHub Telegram Bot (App Mode) is running' });
});

// Верифікація GitHub webhook signature
function verifyGitHubSignature(req) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) return false;

    const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    try {
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    } catch (e) {
        return false;
    }
}

// Markdown escape for Telegram
function escapeMarkdown(text) {
    if (!text) return '';
    return text.toString().replace(/[_*\[\]()~`>#+=|{}.!-]/g, '\\$&');
}

// Покращена функція відправки повідомлень
async function sendTelegramMessage(message) {
    try {
        await axios.post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'MarkdownV2',
                disable_web_page_preview: true
            }
        );
        console.log('✅ Response sent to Telegram');
    } catch (error) {
        console.error('❌ Telegram error:', error.response?.data?.description || error.message);
    }
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// 1. GitHub Webhook Handler
app.post('/webhook', async (req, res) => {
    if (!verifyGitHubSignature(req)) return res.status(401).send('Invalid signature');

    const event = req.headers['x-github-event'];
    const { action } = req.body;
    console.log(`📨 GitHub: ${event} -> ${action}`);

    try {
        switch (event) {
            case 'issues': await handleIssuesEvent(req.body); break;
            case 'issue_comment': await handleIssueCommentEvent(req.body); break;
            case 'pull_request': await handlePullRequestEvent(req.body); break;
            case 'push': await handlePushEvent(req.body); break;
            case 'star': await handleStarEvent(req.body); break;
        }
    } catch (err) {
        console.error('❌ Event handler error:', err.message);
    }
    res.status(200).send('OK');
});

// 2. Telegram Webhook Handler (Для відповідей)
app.post('/telegram-webhook', async (req, res) => {
    const { message } = req.body;
    if (!message || !message.reply_to_message || !message.text) return res.sendStatus(200);

    console.log('💬 Processing Telegram reply...');

    const replyToText = message.reply_to_message.text;
    const repoMatch = replyToText.match(/📁 ([\w\-./]+)/);
    const issueMatch = replyToText.match(/#(\d+)/);

    if (repoMatch && issueMatch && octokitApp) {
        const [owner, repo] = repoMatch[1].trim().split('/');
        const issueNumber = parseInt(issueMatch[1]);
        const commentBody = message.text;

        try {
            // Шукаємо інсталяцію додатка для цього репозиторію
            for await (const { installation } of octokitApp.eachInstallation.iterator()) {
                const octokit = await octokitApp.getInstallationOctokit(installation.id);

                await octokit.rest.issues.createComment({
                    owner, repo, issue_number: issueNumber,
                    body: `💬 **Reply from Telegram:**\n\n${commentBody}`
                });

                await sendTelegramMessage(escapeMarkdown(`✅ Коментар додано до ${owner}/${repo}#${issueNumber}`));
                return res.sendStatus(200);
            }
        } catch (err) {
            console.error('❌ GitHub API Error:', err.message);
            await sendTelegramMessage(escapeMarkdown(`❌ Помилка GitHub API: ${err.message}`));
        }
    }
    res.sendStatus(200);
});

// ═══════════════════════════════════════════════════════════════
// HANDLERS (Professional Style)
// ═══════════════════════════════════════════════════════════════

const DIVIDER = '━━━━━━━━━━━━━━━━━━━━━━';
const formatTime = () => new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

const getHeader = (badge, repo) => `*${badge}*\n${escapeMarkdown(DIVIDER)}\n\n📁 ${escapeMarkdown(repo)}`;
const getFooter = (url, label) => `\n${escapeMarkdown(DIVIDER)}\n🔗 [${escapeMarkdown(label)}](${url})  •  🕐 ${escapeMarkdown(formatTime())}`;

function formatBody(text) {
    if (!text || text.trim().length === 0) return '\n\n📖 _"No description provided"_';
    let clean = text.trim();
    if (clean.length > 300) clean = clean.substring(0, 297) + '...';
    return `\n\n📖 _"${escapeMarkdown(clean)}"_`;
}

async function handleIssuesEvent(p) {
    const badge = { opened: '🔵 ISSUE OPENED', closed: '🟢 ISSUE CLOSED', reopened: '🟡 ISSUE REOPENED' }[p.action];
    if (!badge) return;

    const desc = (p.action === 'opened' || p.action === 'reopened') ? formatBody(p.issue.body) : '';

    const msg = `${getHeader(badge, p.repository.full_name)}\n*\\#${p.issue.number}* — ${escapeMarkdown(p.issue.title)}\n👤 *Author:* [@${escapeMarkdown(p.sender.login)}](https://github.com/${p.sender.login})${desc}${getFooter(p.issue.html_url, 'Open Issue')}`;
    await sendTelegramMessage(msg);
}

async function handleIssueCommentEvent(p) {
    if (p.action !== 'created') return;

    const msg = `${getHeader('💬 NEW COMMENT', p.repository.full_name)}\n*\\#${p.issue.number}* — ${escapeMarkdown(p.issue.title)}\n👤 *From:* [@${escapeMarkdown(p.sender.login)}](https://github.com/${p.sender.login})${formatBody(p.comment.body)}${getFooter(p.comment.html_url, 'View Comment')}`;
    await sendTelegramMessage(msg);
}

async function handlePullRequestEvent(p) {
    const badge = { opened: '🔀 PR OPENED', closed: p.pull_request.merged ? '🟣 PR MERGED' : '🔴 PR CLOSED', reopened: '🟡 PR REOPENED' }[p.action];
    if (!badge) return;

    const desc = p.action === 'opened' ? formatBody(p.pull_request.body) : '';

    const msg = `${getHeader(badge, p.repository.full_name)}\n*\\#${p.pull_request.number}* — ${escapeMarkdown(p.pull_request.title)}\n👤 *Author:* [@${escapeMarkdown(p.sender.login)}](https://github.com/${p.sender.login})${desc}${getFooter(p.pull_request.html_url, 'Open PR')}`;
    await sendTelegramMessage(msg);
}

async function handlePushEvent(p) {
    if (!p.commits.length) return;
    const list = p.commits.slice(0, 3).map(c => `  \`${c.id.substring(0, 7)}\` ${escapeMarkdown(c.message.split('\n')[0])}`).join('\n');
    const msg = `${getHeader('📦 PUSH', p.repository.full_name)}\n🌿 *Branch:* \`${escapeMarkdown(p.ref.replace('refs/heads/', ''))}\`\n👤 *Pusher:* ${escapeMarkdown(p.pusher.name)}\n📝 *Commits:* ${p.commits.length}\n\n${list}${getFooter(p.compare, 'View Diff')}`;
    await sendTelegramMessage(msg);
}

async function handleStarEvent(p) {
    if (p.action !== 'created') return;
    const msg = `${getHeader('⭐ NEW STAR', p.repository.full_name)}\n👤 *From:* [@${escapeMarkdown(p.sender.login)}](https://github.com/${p.sender.login})\n🌟 *Total Stars:* ${p.repository.stargazers_count}${getFooter(p.repository.html_url, 'View Repo')}`;
    await sendTelegramMessage(msg);
}

app.listen(PORT, () => console.log(`🚀 App Server running on port ${PORT}`));

// ═══════════════════════════════════════════════════════════════
// Render keep-alive (self-ping) to prevent cold starts
// ═══════════════════════════════════════════════════════════════
//
// Render automatically exposes your public URL via RENDER_EXTERNAL_URL.
// We hit the root health-check endpoint ("/") on a fixed interval.
//
// You can tune / disable via env:
//   - KEEPALIVE_ENABLED      (default: "true")
//   - KEEPALIVE_INTERVAL_MS  (default: 300000 = 5 minutes)
//
const KEEPALIVE_ENABLED = (process.env.KEEPALIVE_ENABLED ?? 'true').toLowerCase() === 'true';
const KEEPALIVE_URL = process.env.RENDER_EXTERNAL_URL || null;
const KEEPALIVE_INTERVAL_MS = Number(process.env.KEEPALIVE_INTERVAL_MS || 300000);

if (KEEPALIVE_ENABLED && KEEPALIVE_URL && Number.isFinite(KEEPALIVE_INTERVAL_MS) && KEEPALIVE_INTERVAL_MS > 0) {
    const targetUrl = `${KEEPALIVE_URL}/`;

    const pingSelf = async () => {
        try {
            const res = await axios.get(targetUrl, { timeout: 5000 });
            console.log(`🟢 Keep-alive ping @ ${new Date().toISOString()} -> ${res.status}`);
        } catch (err) {
            console.error(`🔴 Keep-alive failed @ ${new Date().toISOString()}:`, err.message);
        }
    };

    // Fire and forget – don't await it here
    setInterval(pingSelf, KEEPALIVE_INTERVAL_MS);
    console.log(`⏱  Render keep-alive enabled -> ${targetUrl} every ${KEEPALIVE_INTERVAL_MS}ms`);
} else {
    console.log('⏹  Render keep-alive disabled (missing RENDER_EXTERNAL_URL or KEEPALIVE_ENABLED=false)');
}