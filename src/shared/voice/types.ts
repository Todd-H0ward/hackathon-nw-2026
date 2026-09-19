// Voice command types

export type VoiceCommandArgs = {
  /** Полный распознанный текст пользователя */
  transcript: string;
  /** Захваченные группы из регулярного выражения (если используется) */
  matches: RegExpMatchArray | null;
};

export type VoiceCommand = {
  /** Ключевые слова/фразы-триггеры (строчные) */
  triggers: string[];
  /** Текстовый ответ программы (строка или функция) */
  response: string | ((args: VoiceCommandArgs) => string);
  /** Действие, которое выполняется при совпадении */
  action: (args: VoiceCommandArgs) => void;
};

// Voice context types

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export type VoiceHistoryEntry = {
  id: string;
  type: 'user' | 'program';
  text: string;
  timestamp: number;
};

export type VoiceContextValue = {
  status: VoiceStatus;
  history: VoiceHistoryEntry[];
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  clearHistory: () => void;
};
