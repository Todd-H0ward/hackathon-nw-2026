import { FileText, Search } from 'lucide-react';

import { Button } from '@/shared/ui';

import type { FaqArticle } from '../types';

/** Full-text search results list for the reference. */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface SearchResultsViewProps {
  searchQuery: string;
  searchResults: FaqArticle[];
  onSelectArticle: (id: string) => void;
  onResetSearch: () => void;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function SearchResultsView({
  searchQuery,
  searchResults,
  onSelectArticle,
  onResetSearch,
}: SearchResultsViewProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Результаты поиска по запросу &laquo;{searchQuery}&raquo;
          </h2>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          Найдено: {searchResults.length}
        </span>
      </div>

      {searchResults.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground space-y-2">
          <p className="text-sm">
            Ничего не найдено. Попробуйте изменить формулировку запроса.
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={onResetSearch}
            className="text-xs h-auto p-0"
          >
            Сбросить поиск
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {searchResults.map((art) => (
            <button
              key={art.id}
              type="button"
              onClick={() => onSelectArticle(art.id)}
              className="group flex flex-col items-start gap-1.5 rounded-xl border border-border bg-card/60 p-4 text-left transition-all hover:bg-secondary/40 hover:border-primary/40 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                <FileText size={14} />
                <span>{art.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {art.shortDescription}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
