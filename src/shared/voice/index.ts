// Barrel export для voice-модуля

export { voiceCommands } from './commands';
export { findCommand, resolveResponse } from './matcher';
export type {
  VoiceCommand,
  VoiceCommandArgs,
  VoiceHistoryEntry,
  VoiceStatus,
} from './types';
export {
  damerauLevenshtein,
  normalizeFuzzy,
  parseResearchIntent,
  parseResearchVoiceCommand,
} from './intents';
export type {
  FieldSetting,
  ResearchIntent,
  VoiceCommandResult,
} from './intents';
export { useSpeechRecognition } from './useSpeechRecognition';
export { useSpeechSynthesis } from './useSpeechSynthesis';

