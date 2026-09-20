import { AlertCircle, Info, Sparkles } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

/** Highlighted callout block inside an article. */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface ArticleCalloutProps {
  content: string;
  variant?: 'info' | 'success' | 'warning';
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function ArticleCallout({
  content,
  variant = 'info',
}: ArticleCalloutProps) {
  const isSuccess = variant === 'success';
  const isWarning = variant === 'warning';

  return (
    <aside
      aria-label="Важное примечание"
      className={cn(
        'rounded-lg border p-4 text-xs sm:text-sm leading-relaxed space-y-1.5',
        isSuccess && 'border-xeno-green/30 bg-xeno-green/5 text-xeno-green',
        isWarning && 'border-amber-500/30 bg-amber-500/5 text-amber-200',
        !isSuccess &&
          !isWarning &&
          'border-primary/30 bg-primary/5 text-foreground',
      )}
    >
      <div className="flex items-center gap-2 font-medium">
        {isSuccess ? (
          <Sparkles size={16} className="text-xeno-green shrink-0" />
        ) : isWarning ? (
          <AlertCircle size={16} className="text-amber-400 shrink-0" />
        ) : (
          <Info size={16} className="text-primary shrink-0" />
        )}
        <span>Важное замечание</span>
      </div>
      <div className="whitespace-pre-line pl-6 text-foreground/90">
        {content}
      </div>
    </aside>
  );
}
