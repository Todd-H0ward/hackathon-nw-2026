/** Registry of navigation and action voice commands. */

import type { VoiceCommand } from './types';

// ═══════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════

/**
 * Voice command list. Add your commands here.
 *
 * Each command is an object:
 * - `triggers` — trigger phrase array (lowercase, no punctuation)
 * - `response` — program spoken/written reply
 * - `action` — function that runs the action
 *
 * In `action`:
 * - `transcript` — full user text
 * - `matches` — RegExp match result (if used)
 */
export const voiceCommands: VoiceCommand[] = [
  // Navigation
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

  // Examples

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
