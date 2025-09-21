
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace with your Telegram bot token
const token = '8032592630:AAH7keLTs68x1wfED1nQqDIjlW9tt6gBff4';
const bot = new TelegramBot(token, { polling: true });

// Set your password here
const PASSWORD = 'eth158';

// In-memory storage for user states
const userState = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState[chatId] = { authenticated: false };
  bot.sendMessage(chatId, 'Please enter the password:');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore /start command as it's handled separately
  if (text === '/start') {
    return;
  }

  // If user is not authenticated, check for password
  if (!userState[chatId] || !userState[chatId].authenticated) {
    if (text === PASSWORD) {
      userState[chatId] = { authenticated: true };
      bot.sendMessage(chatId, 'Authentication successful. Please enter a phone number (without country code):');
    } else {
      bot.sendMessage(chatId, 'Incorrect password. Please try again or type /start to begin.');
    }
    return;
  }

  // If user is authenticated, expect a phone number
  if (userState[chatId].authenticated) {
    const phoneRegex = /^\d{10}$/;
    if (phoneRegex.test(text)) {
      const phoneNumber = text;
      const apiUrl = `https://privateaadhar.anshppt19.workers.dev/?query=91${phoneNumber}`;

      bot.sendMessage(chatId, 'Fetching data...');

      axios.get(apiUrl)
        .then(response => {
          const data = response.data;

          function formatJson(obj, indent = '') {
            let message = '';
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                if (key === 'Buy Api') {
                  message += `${indent}Buy Api from : @itsmekali_1\n`;
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                  message += `${indent}${key}:\n`;
                  message += formatJson(obj[key], indent + '  ');
                } else {
                  message += `${indent}${key}: ${obj[key]}\n`;
                }
              }
            }
            return message;
          }

          const message = formatJson(data);
          bot.sendMessage(chatId, message);
        })
        .catch(error => {
          bot.sendMessage(chatId, 'Error fetching data. Please try again later.');
          console.error(error);
        });
    } else {
      bot.sendMessage(chatId, 'Invalid phone number. Please enter a 10-digit phone number without the country code.');
    }
  }
});

console.log('Bot started...');
