import { Telegraf, Markup } from 'telegraf';
import { MESSAGES, BOT_CONFIG } from './config';
import questions from './questions.json';

interface UserSession {
  age: number;
  currentQuestion: number;
  answers: number[];
  state: 'awaiting_age' | 'quiz' | 'finished';
}

const sessions = new Map<number, UserSession>();

export function createBot(token: string) {
  const bot = new Telegraf(token);

  function getBlockLabel(qIndex: number): string {
    if (qIndex === 0) return ' Блок I. Физическая активность и упражнения\n\n';
    if (qIndex === 6) return ' Блок II. Образ жизни и повседневные привычки\n\n';
    if (qIndex === 16) return ' Блок III. Здоровье и профилактика\n\n';
    return '';
  }

  function sendQuestion(ctx: any, session: UserSession) {
    const q = questions[session.currentQuestion];
    if (!q) return;

    const prefix = getBlockLabel(session.currentQuestion);
    const questionText = `${prefix}❓ Вопрос ${session.currentQuestion + 1}/${BOT_CONFIG.totalQuestions}\n\n${q.text}`;

    const keyboard = q.options.map((o: { text: string; value: number }) => [o.text]);

    ctx.reply(questionText, Markup.keyboard(keyboard).resize().oneTime());
  }

  function sendResult(ctx: any, session: UserSession) {
    const totalPoints = session.answers.reduce((sum, v) => sum + v, 0);
    const bioAge = session.age + totalPoints;

    let conclusion = '';
    if (bioAge < session.age) {
      conclusion = MESSAGES.resultYounger;
    } else if (bioAge > session.age) {
      conclusion = MESSAGES.resultOlder;
    } else {
      conclusion = MESSAGES.resultEqual;
    }

    const sign = totalPoints >= 0 ? '+' : '';
    const resultText = ` Результаты теста:\n\n Ваш паспортный возраст: ${session.age} лет\n Сумма набранных баллов: ${sign}${totalPoints}\n──────────────────────────\n Ваш биологический возраст: ${bioAge} лет\n\n${conclusion}\n\nЧтобы пройти тест заново, отправьте /test`;

    ctx.reply(resultText, Markup.removeKeyboard());
    session.state = 'finished';
  }

  function startTest(ctx: any, userId: number) {
    sessions.set(userId, {
      age: 0,
      currentQuestion: 0,
      answers: [],
      state: 'awaiting_age',
    });

    ctx.reply(MESSAGES.welcome, Markup.removeKeyboard());
    setTimeout(() => {
      ctx.reply(MESSAGES.agePrompt);
    }, 500);
  }

  // /start command
  bot.start((ctx) => {
    startTest(ctx, ctx.from.id);
  });

  // /test command
  bot.command('test', (ctx) => {
    startTest(ctx, ctx.from.id);
  });

  // /help command
  bot.command('help', (ctx) => {
    ctx.reply(MESSAGES.help);
  });

  // Handle text messages
  bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();
    let session = sessions.get(userId);

    if (!session) {
      startTest(ctx, userId);
      return;
    }

    // Awaiting age input
    if (session.state === 'awaiting_age') {
      const age = parseInt(text, 10);
      if (isNaN(age) || age < BOT_CONFIG.minAge || age > BOT_CONFIG.maxAge) {
        ctx.reply(MESSAGES.invalidAge);
        return;
      }
      session.age = age;
      session.state = 'quiz';
      session.currentQuestion = 0;
      session.answers = [];

      ctx.reply(`✅ Ваш возраст: ${age} лет. Отлично, начинаем тест!\n\nВам будет предложено 20 вопросов. Выбирайте наиболее подходящий вариант ответа.`);
      setTimeout(() => sendQuestion(ctx, session!), 500);
      return;
    }

    // Quiz state — match answer
    if (session.state === 'quiz') {
      const q = questions[session.currentQuestion];
      const option = q.options.find((o: { text: string; value: number }) => o.text === text);

      if (!option) {
        ctx.reply(MESSAGES.selectOption);
        return;
      }

      session.answers.push(option.value);
      session.currentQuestion++;

      if (session.currentQuestion >= questions.length) {
        sendResult(ctx, session);
      } else {
        sendQuestion(ctx, session);
      }
      return;
    }

    // Finished state
    if (session.state === 'finished') {
      ctx.reply('Тест завершён! Чтобы пройти заново, отправьте /test');
    }
  });

  return bot;
}