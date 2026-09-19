import { Mic, MicOff, Volume2 } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import { useVoiceError, useVoiceStatus } from '@/store';

type VoiceMicButtonProps = {
  /** Controls come from `useVoiceBridge`, which the page mounts once. */
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  className?: string;
};

export const VoiceMicButton = ({
  isSupported,
  startListening,
  stopListening,
  className,
}: VoiceMicButtonProps) => {
  const status = useVoiceStatus();
  const error = useVoiceError();

  if (!isSupported) return null;

  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isProcessing = status === 'processing';

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else if (status === 'idle') {
      startListening();
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Кнопка */}
      <div className="relative">
        {/* Пульс при прослушивании */}
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
        )}

        <button
          type="button"
          onClick={handleClick}
          disabled={isSpeaking || isProcessing}
          title={
            isListening ? 'Нажмите чтобы остановить' : 'Нажмите чтобы говорить'
          }
          className={cn(
            'relative z-10 size-12 rounded-full border flex items-center justify-center transition-all',
            'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            isListening
              ? 'border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : isSpeaking
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground',
          )}
        >
          {isSpeaking ? (
            <Volume2 className="size-5" />
          ) : isListening ? (
            <MicOff className="size-5" />
          ) : (
            <Mic className="size-5" />
          )}
        </button>
      </div>

      {/* Статус-текст */}
      <span className="text-[11px] text-muted-foreground select-none">
        {isListening
          ? 'Слушаю...'
          : isSpeaking
            ? 'Говорю...'
            : isProcessing
              ? 'Обрабатываю...'
              : 'Голос'}
      </span>

      {/* Ошибка */}
      {error && (
        <p className="text-[11px] text-destructive max-w-[180px] text-center">
          {error}
        </p>
      )}
    </div>
  );
};
