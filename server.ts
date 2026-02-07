import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBot } from './src/bot/commands';

const __filename = fileURLToPath(.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from built React app
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    bot: 'БиоВозраст Бот',
    timestamp: new Date().toISOString(),
  });
});

// Serve React app for all other routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Express server
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

// Start Telegram bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'your_bot_token_here') {
  const bot = createBot(TELEGRAM_BOT_TOKEN);
  bot.launch()
    .then(() => {
      console.log(' Telegram bot started successfully!');
    })
    .catch((err) => {
      console.error('❌ Failed to start Telegram bot:', err.message);
    });

  // Graceful shutdown
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
} else {
  console.log('⚠️ TELEGRAM_BOT_TOKEN not set — bot not started. Set it in environment variables.');
}