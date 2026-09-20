import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

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
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
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
          </button>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-400/90 overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
