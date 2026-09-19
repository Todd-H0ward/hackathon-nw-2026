import type { VoiceCommand, VoiceCommandArgs } from './types';
import { voiceCommands } from './commands';

// ═══════════════════════════════════════════
// COMMAND MATCHER
// ═══════════════════════════════════════════

/**
 * Нормализует текст: строчные буквы, убирает лишние пробелы и пунктуацию.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .trim();
}

/**
 * Ищет голосовую команду по транскрипту.
 * Возвращает найденную команду и аргументы, или null.
 */
export function findCommand(
  transcript: string,
  commands: VoiceCommand[] = voiceCommands,
): { command: VoiceCommand; args: VoiceCommandArgs } | null {
  const normalized = normalize(transcript);

  for (const command of commands) {
    for (const trigger of command.triggers) {
      const normalizedTrigger = normalize(trigger);
      if (normalized.includes(normalizedTrigger)) {
        // Попробуем захватить числа или слова из транскрипта
        const matches = normalized.match(
          new RegExp(`${normalizedTrigger}\\s*(.*)`, 'i'),
        );
        return {
          command,
          args: { transcript: normalized, matches },
        };
      }
    }
  }

  return null;
}

/**
 * Разворачивает response: если это функция — вызывает её, если строка — возвращает как есть.
 */
export function resolveResponse(
  command: VoiceCommand,
  args: VoiceCommandArgs,
): string {
  if (typeof command.response === 'function') {
    return command.response(args);
  }
  return command.response;
}
