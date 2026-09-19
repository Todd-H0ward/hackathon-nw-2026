import { Loader2, PlugZap, TriangleAlert } from 'lucide-react';

import type { StreamStatus } from '@/shared/api/xenochoice';
import { cn } from '@/shared/lib/utils';

type LabStatusProps = {
  booting: boolean;
  streamStatus: StreamStatus;
  worldsLoading: boolean;
  worldsError: boolean;
};

type Notice = {
  tone: 'info' | 'warn' | 'error';
  icon: typeof Loader2;
  spin?: boolean;
  text: string;
};

const TONES: Record<Notice['tone'], string> = {
  info: 'border-border bg-card/95 text-muted-foreground',
  warn: 'border-primary/40 bg-primary/15 text-primary',
  error: 'border-destructive/40 bg-destructive/15 text-destructive',
};

const resolveNotice = ({
  booting,
  streamStatus,
  worldsLoading,
  worldsError,
}: LabStatusProps): Notice | null => {
  if (worldsError) {
    return {
      tone: 'error',
      icon: TriangleAlert,
      text: 'Сервер симуляции недоступен: эксперимент не создан, параметры планет показаны офлайн',
    };
  }
  if (worldsLoading) {
    return {
      tone: 'info',
      icon: Loader2,
      spin: true,
      text: 'Загружаем справочные данные планет…',
    };
  }
  if (booting) {
    return {
      tone: 'info',
      icon: Loader2,
      spin: true,
      text: 'Создаём эксперимент на сервере…',
    };
  }
  if (streamStatus === 'failed') {
    return {
      tone: 'error',
      icon: PlugZap,
      text: 'Нет связи с сервером. Обновите страницу или сбросьте эксперимент',
    };
  }
  if (streamStatus === 'reconnecting') {
    return {
      tone: 'warn',
      icon: PlugZap,
      text: 'Поток состояния прерван — переподключаемся, данные обновляются реже',
    };
  }
  if (streamStatus === 'connecting') {
    return {
      tone: 'info',
      icon: Loader2,
      spin: true,
      text: 'Подключаемся к потоку состояния…',
    };
  }
  return null;
};

/**
 * Floating notice that explains why the lab is empty or lagging behind. Taken
 * out of the flow on purpose: it appears and disappears on its own schedule,
 * and in-flow it would shift the whole lab layout every time.
 */
export const LabStatus = (props: LabStatusProps) => {
  const notice = resolveNotice(props);
  if (!notice) return null;

  const Icon = notice.icon;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-2 z-30 flex justify-center px-3"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[9px] tracking-[0.08em] shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm',
          TONES[notice.tone],
        )}
      >
        <Icon
          size={12}
          className={cn('shrink-0', notice.spin && 'animate-spin')}
        />
        <span className="truncate">{notice.text}</span>
      </div>
    </div>
  );
};
