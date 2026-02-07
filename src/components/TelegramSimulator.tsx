import { useState, useRef, useEffect, useCallback } from 'react';
import BotInfo from './BotInfo';
import ChatMessage from './ChatMessage';
import type { Message } from './ChatMessage';
import questionsData from '../bot/questions.json';

const WELCOME_TEXT = ` Привет! Этот бот поможет определить твой биологический возраст — показатель реального состояния твоего организма. Он показывает, насколько быстро идёт процесс старения.

 Данный опросник составлен на основе анализа рекомендаций по здоровому долголетию от таких авторитетных источников как:

• Всемирная организация здравоохранения (ВОЗ)
• Национальный институт здоровья (NIH, USA)

 Расчёт биологического возраста проводится по методу интегральной оценки факторов образа жизни.

Ответь честно на 20 ключевых вопросов, относящихся к образу жизни и здоровью, и мы рассчитаем, насколько ты моложе или старше твоего паспортного возраста.

 Ваши персональные данные (возраст, ответы) мы не сохраняем.`;

const AGE_PROMPT = ` Для начала введи свой паспортный возраст (число от 16 до 99):`;

const HELP_TEXT = `ℹ️ Справка по использованию бота:

/start — начать работу с ботом
/test — начать тест заново
/help — показать эту справку

Бот задаст 20 вопросов о вашем образе жизни и рассчитает биологический возраст.`;

type BotState = 'idle' | 'awaiting_age' | 'quiz' | 'finished';

function getTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

let msgId = 0;
function createMsg(text: string, sender: 'bot' | 'user', buttons?: string[]): Message {
  return { id: ++msgId, text, sender, time: getTime(), buttons };
}

export default function TelegramSimulator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [botState, setBotState] = useState<BotState>('idle');
  const [userAge, setUserAge] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, []);

  const addBotMessage = useCallback((text: string, buttons?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, createMsg(text, 'bot', buttons)]);
      scrollToBottom();
    }, 600 + Math.random() * 400);
  }, [scrollToBottom]);

  const addUserMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, createMsg(text, 'user')]);
    scrollToBottom();
  }, [scrollToBottom]);

  // Auto-start
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      handleStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStart() {
    msgId = 0;
    setMessages([]);
    setUserAge(0);
    setCurrentQuestion(0);
    setAnswers([]);
    setBotState('awaiting_age');

    setTimeout(() => {
      addBotMessage(WELCOME_TEXT);
      setTimeout(() => {
        addBotMessage(AGE_PROMPT);
      }, 1200);
    }, 300);
  }

  function askQuestion(qIndex: number) {
    const q = questionsData[qIndex];
    if (!q) return;

    const blockLabels: Record<string, string> = {
      'physical': ' Блок I. Физическая активность и упражнения',
      'lifestyle': ' Блок II. Образ жизни и повседневные привычки',
      'health': ' Блок III. Здоровье и профилактика',
    };

    let prefix = '';
    if (qIndex === 0) prefix = blockLabels['physical'] + '\n\n';
    else if (qIndex === 6) prefix = blockLabels['lifestyle'] + '\n\n';
    else if (qIndex === 16) prefix = blockLabels['health'] + '\n\n';

    const questionText = `${prefix}❓ Вопрос ${qIndex + 1}/20\n\n${q.text}`;
    const optionTexts = q.options.map((o: { text: string; value: number }) => o.text);

    addBotMessage(questionText, optionTexts);
  }

  function handleOptionClick(text: string) {
    if (botState !== 'quiz') return;

    addUserMessage(text);

    const q = questionsData[currentQuestion];
    const option = q.options.find((o: { text: string; value: number }) => o.text === text);
    if (!option) return;

    const newAnswers = [...answers, option.value];
    setAnswers(newAnswers);

    const nextQ = currentQuestion + 1;
    setCurrentQuestion(nextQ);

    if (nextQ >= questionsData.length) {
      // Use newAnswers directly for calculation since state may not update yet
      setTimeout(() => {
        const totalPoints = newAnswers.reduce((sum, v) => sum + v, 0);
        const bioAge = userAge + totalPoints;

        let conclusion = '';
        if (bioAge < userAge) {
          conclusion = ' Поздравляем! Ваш биологический возраст ниже паспортного. Это значит, вы ведёте здоровый образ жизни и замедляете процессы старения. Так держать!';
        } else if (bioAge > userAge) {
          conclusion = '⚠️ Ваш биологический возраст выше паспортного. Это повод задуматься о внесении положительных изменений в свой образ жизни! Возможно, стоит пересмотреть режим дня, питание или уровень физической активности.';
        } else {
          conclusion = '✅ Ваш биологический возраст соответствует паспортному. Ваш образ жизни является стандартным. Есть куда стремиться!';
        }

        const sign = totalPoints >= 0 ? '+' : '';
        const resultText = ` Результаты теста:\n\n Ваш паспортный возраст: ${userAge} лет\n Сумма набранных баллов: ${sign}${totalPoints}\n──────────────────────────\n Ваш биологический возраст: ${bioAge} лет\n\n${conclusion}\n\nЧтобы пройти тест заново, отправьте /test`;

        addBotMessage(resultText);
        setBotState('finished');
      }, 500);
    } else {
      setTimeout(() => askQuestion(nextQ), 500);
    }
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    // Commands
    if (text === '/start') {
      addUserMessage(text);
      handleStart();
      return;
    }
    if (text === '/test') {
      addUserMessage(text);
      handleStart();
      return;
    }
    if (text === '/help') {
      addUserMessage(text);
      addBotMessage(HELP_TEXT);
      return;
    }

    if (botState === 'awaiting_age') {
      addUserMessage(text);
      const age = parseInt(text, 10);
      if (isNaN(age) || age < 16 || age > 99) {
        addBotMessage('❌ Пожалуйста, введите корректный возраст — число от 16 до 99.');
        return;
      }
      setUserAge(age);
      setBotState('quiz');
      setCurrentQuestion(0);
      setAnswers([]);

      addBotMessage(`✅ Ваш возраст: ${age} лет. Отлично, начинаем тест!\n\nВам будет предложено 20 вопросов. Выбирайте наиболее подходящий вариант ответа.`);
      setTimeout(() => askQuestion(0), 1400);
      return;
    }

    if (botState === 'quiz') {
      addUserMessage(text);
      addBotMessage(' Пожалуйста, выберите один из предложенных вариантов ответа, нажав на кнопку.');
      return;
    }

    if (botState === 'finished') {
      addUserMessage(text);
      if (text.toLowerCase().includes('заново') || text.toLowerCase().includes('ещё') || text.toLowerCase().includes('еще')) {
        handleStart();
      } else {
        addBotMessage('Тест завершён! Чтобы пройти заново, отправьте /test');
      }
      return;
    }

    addUserMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSend();
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  return (
    <div className="w-full max-w-md h-full max-h-[700px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-telegram-border/50 bg-telegram-chat">
      {/* Header */}
      <BotInfo name="БиоВозраст Бот" status="online" emoji="" />

      {/* Chat area */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#0e1621',
        }}
      >
        {messages.map(msg => (
          <ChatMessage
            message={msg}
            onButtonClick={handleOptionClick}
          />
        ))}
        {isTyping && (
          <div className="flex justify-start mb-1.5 animate-fadeIn">
            <div className="bg-telegram-bubble px-4 py-2.5 rounded-lg rounded-tl-sm">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-telegram-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-telegram-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-telegram-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-2 py-2 bg-telegram-input border-t border-telegram-border/50">
        <div className="flex items-center gap-1">
          <button className="text-telegram-secondary hover:text-telegram-accent transition-colors p-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              botState === 'awaiting_age'
                ? 'Введите ваш возраст...'
                : botState === 'quiz'
                ? 'Выберите вариант выше ☝️'
                : 'Напишите сообщение...'
            }
            className="flex-1 bg-transparent text-telegram-text text-[15px] placeholder:text-telegram-secondary/60 outline-none px-2 py-1.5"
          />
          <button className="text-telegram-secondary hover:text-telegram-accent transition-colors p-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </button>
          {inputText.trim() ? (
            <button
              onClick={handleSend}
              className="text-telegram-accent hover:text-white transition-all p-2 active:scale-90"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          ) : (
            <button className="text-telegram-secondary hover:text-telegram-accent transition-colors p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}