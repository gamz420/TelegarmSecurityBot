require('dotenv').config(); // подключили NPM dotenv
const { Telegraf } = require('telegraf'); // подключили API Telegram
const fetch = require('node-fetch'); // подключили NPM для реализации fetch в Node.js
const express = require('express');

const app = express();
const PORT = 3003;

app.listen(PORT, () => {
  console.log('Server started on port ', PORT);
});

const bot = new Telegraf(process.env.BOT_TOKEN); // указал токен моего бота
bot.start((ctx) => {
  ctx.reply(`👮‍♂️Приветствую ${ctx.from.first_name}, \nотправь URL в формате http://какойтосайт.com`),
    ctx.replyWithVideo({
      url: 'https://i.pinimg.com/originals/78/08/12/7808128339ecb0fca5ecf8aed56cdb0f.gif',
    });
}); // приветствие

// Логика ответа на сообщение
bot.on('message', async (ctx) => {
  let url = ctx.message.text; // переменая с текстом сообщения
  console.log(url);

  try {
    let ftch = await fetch(`http://htmlweb.ru/analiz/api.php?bl&url=${url}&json`);
    let result = await ftch.json();
    console.log(result);

    // функция анализа угроз
    async function check() {
      if (result.comment) {
        let res = result.comment;
        ctx.reply('⛔ПЛОХОЙ РЕЙТИНГ⛔');
        ctx.reply(`${res}`);
        ctx.replyWithVideo({
          url:
            'https://media1.tenor.com/images/eddd0f4ceaf26a1ceaf537a114ae6b90/tenor.gif?itemid=11732713',
        });
      } else {
        ctx.reply('✅РЕЙТИНГ ХОРОШИЙ✅');
        ctx.replyWithVideo({
          url:
            'https://images6.fanpop.com/image/photos/39100000/The-Simpsons-gifs-the-simpsons-39124943-320-240.gif',
        });
      }
    }
    check();

    let ftch2 = await fetch(
      `https://sba.yandex.net/v4/threatMatches:find?key=${process.env.API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            clientId: `${ctx.from.first_name}`,
            clientVersion: '{1.1.1}',
          },
          threatInfo: {
            threatTypes: [
              // типы угроз
              'THREAT_TYPE_UNSPECIFIED',
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ALL_PLATFORMS'], // платформа проверки
            threatEntryTypes: ['THREAT_ENTRY_TYPE_UNSPECIFIED', 'URL', 'EXECUTABLE'], // тип объекта, который представляет угрозу
            threatEntries: [{ url: `${url}` }], // URL который проверяем
          },
        }),
      }
    );

    // функция анализа угроз
    async function check2() {
      try {
        let site = await ftch2.json();
        let result = Object.values(site).flat(2)[0].threatType;
        ctx.reply('🔴☣️НА САЙТЕ ЕСТЬ КИБУРУГРОЗА☣️🔴');
      } catch {
        ctx.reply('🟢НА СТРАНИЦЕ НЕТ КИБЕРУГРОЗ🟢');
      }
    }
    check2();
  } catch {
    ctx.reply('НЕ МАРАСИ БРАТАН, \n Где протокол HTTP?');
    ctx.replyWithVideo({
      url: 'https://i.gifer.com/origin/8c/8c6d49a83f7d2d9b7eef336178c6bad2_w200.gif',
    });
  }
});

bot.launch();
console.log('Бот запущен');
