/** Barrel export for voice module. */

// ═══════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════

export { voiceCommands } from './commands';
export { findCommand, resolveResponse } from './matcher';
export type {
  VoiceCommand,
  VoiceCommandArgs,
  VoiceHistoryEntry,
  VoiceStatus,
} from './types';
export { useSpeechRecognition } from './use-speech-recognition';
export { useSpeechSynthesis } from './use-speech-synthesis';
