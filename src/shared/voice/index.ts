// Barrel export для voice-модуля

export { voiceCommands } from './commands';
export { findCommand, resolveResponse } from './matcher';
export type {
  VoiceCommand,
  VoiceCommandArgs,
  VoiceContextValue,
  VoiceHistoryEntry,
  VoiceStatus,
} from './types';
export { useSpeechRecognition } from './useSpeechRecognition';
export { useSpeechSynthesis } from './useSpeechSynthesis';
