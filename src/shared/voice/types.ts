/** Voice module types — commands, args, and session state. */

// ═══════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════

export type VoiceCommandArgs = {
  /** Full recognized user transcript */
  transcript: string;
  /** Captured regex groups (when used) */
  matches: RegExpMatchArray | null;
};

export type VoiceCommand = {
  /** Trigger keywords/phrases (lowercase) */
  triggers: string[];
  /** Program text response (string or function) */
  response: string | ((args: VoiceCommandArgs) => string);
  /** Action executed on match */
  action: (args: VoiceCommandArgs) => void;
};

// ═══════════════════════════════════════════
// SESSION
// Voice session types — the live state itself lives in `store/voice`.
// ═══════════════════════════════════════════

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export type VoiceHistoryEntry = {
  id: string;
  type: 'user' | 'program';
  text: string;
  timestamp: number;
};
