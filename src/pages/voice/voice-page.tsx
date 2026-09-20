import { voiceCommands } from '@/shared/voice';

import { VoiceDialog, VoiceMicButton } from './ui';
import { useVoiceBridge } from './use-voice-bridge';

/** Voice control page: microphone, dialog, and command list. */

// ═══════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════

export const VoicePage = () => {
  const { isSupported, startListening, stopListening } = useVoiceBridge();

  return (
    <div className="flex h-full min-h-svh flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Голосовое управление
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Нажмите на микрофон и скажите одну из команд. Работает в Chrome и
          Edge.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Left column: button + dialog */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Microphone button */}
          <div className="flex justify-center py-4">
            <VoiceMicButton
              isSupported={isSupported}
              startListening={startListening}
              stopListening={stopListening}
            />
          </div>

          {/* Dialog history */}
          <VoiceDialog />
        </div>

        {/* Right column: available command list */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="rounded-[14px] border border-border p-5 flex flex-col gap-4">
            <h2 className="text-[13px] font-medium text-foreground">
              Доступные команды
            </h2>
            <ul className="flex flex-col gap-3">
              {voiceCommands.map((cmd) => (
                <li
                  key={cmd.triggers.join('-')}
                  className="flex flex-col gap-1"
                >
                  <div className="flex flex-wrap gap-1">
                    {cmd.triggers.map((trigger) => (
                      <span
                        key={trigger}
                        className="rounded-[5px] bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground font-mono"
                      >
                        &ldquo;{trigger}&rdquo;
                      </span>
                    ))}
                  </div>
                  <p className="text-[12px] text-muted-foreground pl-1">
                    →{' '}
                    {typeof cmd.response === 'string'
                      ? cmd.response
                      : 'Ответ зависит от команды'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};
