import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button } from '@/shared/ui';

interface CodeSnippetCardProps {
  language: string;
  code: string;
  description?: string;
}

export function CodeSnippetCard({
  language,
  code,
  description,
}: CodeSnippetCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="relative rounded-lg border border-border bg-[#0a0c10] overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/70 px-3.5 py-1.5 bg-secondary/30 text-[10px] font-mono text-muted-foreground">
          <span>{language}</span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleCopy}
            className="h-auto p-1 font-mono text-[10px] text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            {copied ? (
              <>
                <Check size={11} className="text-xeno-green" />
                <span>Скопировано</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Копировать</span>
              </>
            )}
          </Button>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-400/90 overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
