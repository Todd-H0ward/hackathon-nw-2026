// ═══════════════════════════════════════════
// VOICE COMMAND TYPES
// ═══════════════════════════════════════════

export interface VoiceCommandArgs {
  /** Полный распознанный текст пользователя */
  transcript: string;
  /** Захваченные группы из регулярного выражения (если используется) */
  matches: RegExpMatchArray | null;
}

export interface VoiceCommand {
  /** Ключевые слова/фразы-триггеры (строчные) */
  triggers: string[];
  /** Текстовый ответ программы (строка или функция) */
  response: string | ((args: VoiceCommandArgs) => string);
  /** Действие, которое выполняется при совпадении */
  action: (args: VoiceCommandArgs) => void;
}

// ═══════════════════════════════════════════
// VOICE CONTEXT TYPES
// ═══════════════════════════════════════════

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export interface VoiceHistoryEntry {
  id: string;
  type: 'user' | 'program';
  text: string;
  timestamp: number;
}

export interface VoiceContextValue {
  status: VoiceStatus;
  history: VoiceHistoryEntry[];
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  clearHistory: () => void;
}
