// Barrel export для voice-модуля
export { useSpeechRecognition } from './useSpeechRecognition';
export { useSpeechSynthesis } from './useSpeechSynthesis';
export { findCommand, resolveResponse } from './matcher';
export { voiceCommands } from './commands';
export type {
  VoiceCommand,
  VoiceCommandArgs,
  VoiceStatus,
  VoiceHistoryEntry,
  VoiceContextValue,
} from './types';
