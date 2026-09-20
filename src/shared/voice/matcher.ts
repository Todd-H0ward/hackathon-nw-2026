/** Match voice command from transcript and resolve response. */

import { voiceCommands } from './commands';
import type { VoiceCommand, VoiceCommandArgs } from './types';

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════

/**
 * Normalize text: lowercase, trim extra spaces and punctuation.
 */
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .trim();
};

// ═══════════════════════════════════════════
// MATCHER
// ═══════════════════════════════════════════

/**
 * Find voice command from transcript.
 * Returns matched command and args, or null.
 */
export const findCommand = (
  transcript: string,
  commands: VoiceCommand[] = voiceCommands,
): { command: VoiceCommand; args: VoiceCommandArgs } | null => {
  const normalized = normalize(transcript);

  for (const command of commands) {
    for (const trigger of command.triggers) {
      const normalizedTrigger = normalize(trigger);
      if (normalized.includes(normalizedTrigger)) {
        // Try to capture numbers or words from transcript
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
};

/**
 * Resolve response: call if function, return string as-is.
 */
export const resolveResponse = (
  command: VoiceCommand,
  args: VoiceCommandArgs,
): string => {
  if (typeof command.response === 'function') {
    return command.response(args);
  }
  return command.response;
};
