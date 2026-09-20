import { useEffect, useRef } from 'react';

import { Bot, Trash2, User } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { useClearVoiceHistory, useVoiceHistory } from '@/store';

/** User dialog history with the voice assistant. */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface VoiceDialogProps {
  className?: string;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export const VoiceDialog = ({ className }: VoiceDialogProps) => {
  const history = useVoiceHistory();
  const clearHistory = useClearVoiceHistory();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (history.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  if (history.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-border p-8 text-center',
          className,
        )}
      >
        <Bot className="size-8 text-muted-foreground/40" />
        <p className="text-[13px] text-muted-foreground">
          История диалога пуста.
          <br />
          Нажмите на микрофон и скажите команду.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">
          История диалога
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={clearHistory}
          title="Очистить историю"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
        {history.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              'flex items-start gap-2 max-w-[85%]',
              entry.type === 'user'
                ? 'self-end flex-row-reverse'
                : 'self-start',
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px]',
                entry.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground',
              )}
            >
              {entry.type === 'user' ? (
                <User className="size-3.5" />
              ) : (
                <Bot className="size-3.5" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                'rounded-[10px] px-3 py-2 text-[13px] leading-[1.6]',
                entry.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground',
              )}
            >
              {entry.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
