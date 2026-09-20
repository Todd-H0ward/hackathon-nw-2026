import type { VoiceCommand } from './types';

/**
 * Список голосовых команд. Добавляй сюда свои команды.
 *
 * Каждая команда — это объект:
 * - `triggers` — массив фраз-триггеров (строчные, без знаков препинания)
 * - `response` — что скажет и напишет программа в ответ
 * - `action` — функция, которая выполнит нужное действие
 *
 * В `action` доступны:
 * - `transcript` — полный текст пользователя
 * - `matches` — результат RegExp-совпадения (если использовался)
 */
export const voiceCommands: VoiceCommand[] = [
  // Навигация
  {
    triggers: ['перейди на главную', 'открой главную', 'домой', 'на главную'],
    response: 'Перехожу на главную страницу',
    action: () => {
      window.location.href = '/';
    },
  },
  {
    triggers: [
      'справочник',
      'открой справочник',
      'о проекте',
      'документация',
      'faq',
    ],
    response: 'Открываю справочник',
    action: () => {
      window.location.href = '/faq';
    },
  },

  // Примеры

  // {
  //   triggers: ['увеличь счётчик', 'прибавь'],
  //   response: ({ transcript }) => {
  //     const match = transcript.match(/на (\d+)/);
  //     const n = match ? match[1] : '1';
  //     return `Хорошо, увеличиваю счётчик на ${n}`;
  //   },
  //   action: ({ transcript }) => {
  //     const match = transcript.match(/на (\d+)/);
  //     const value = match ? parseInt(match[1]) : 1;
  //     // dispatch({ type: 'INCREMENT', payload: value });
  //   },
  // },
];
