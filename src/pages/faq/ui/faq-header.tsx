import { useEffect, useRef, useState } from 'react';

import { Check, ChevronRight, Menu, Search, Share2, X } from 'lucide-react';

import { Button, Input } from '@/shared/ui';

import type { FaqArticle, FaqCategory } from '../types';

interface FaqHeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  activeCategory?: FaqCategory;
  activeArticle?: FaqArticle;
  onToggleMobileSidebar: () => void;
}

export function FaqHeader({
  searchQuery,
  onSearchChange,
  activeCategory,
  activeArticle,
  onToggleMobileSidebar,
}: FaqHeaderProps) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(0);

  useEffect(
    () => () => {
      window.clearTimeout(copyTimerRef.current);
    },
    [],
  );

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="flex h-22.5 flex-col justify-between border-b border-border bg-card/60 backdrop-blur-md px-4 py-3 shrink-0">
      {/* Верхний ряд: кнопка мобильного меню, поиск и действия */}
      <div className="flex items-center justify-between gap-3">
        {/* Мобильная кнопка меню */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Открыть меню документации"
          aria-expanded={false}
          aria-controls="faq-mobile-drawer"
          className="md:hidden flex size-8 items-center justify-center rounded-md border border-border bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer shrink-0"
        >
          <Menu size={18} />
        </button>

        {/* Поисковая строка */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по документации, формулам и API..."
            aria-label="Поиск по документации"
            type="search"
            className="h-8.5 pl-9 pr-8 text-xs bg-background/60 border-border"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Очистить поиск"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Правые кнопки действий */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-1.5 text-[11px] h-8 cursor-pointer"
            title="Скопировать ссылку на статью"
          >
            {copied ? (
              <>
                <Check size={13} className="text-xeno-green" />
                <span className="hidden sm:inline">Скопировано</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span className="hidden sm:inline">Поделиться</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Нижний ряд: хлебные крошки */}
      <nav
        aria-label="Хлебные крошки"
        className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-muted-foreground"
      >
        <span className="rounded bg-secondary/70 px-2 py-0.5 text-foreground font-medium">
          Справочник
        </span>

        {activeCategory && (
          <>
            <ChevronRight
              size={12}
              className="text-muted-foreground/60 shrink-0"
            />
            <span className="rounded bg-secondary/40 px-2 py-0.5 truncate max-w-35 sm:max-w-none">
              {activeCategory.title}
            </span>
          </>
        )}

        {activeArticle && (
          <>
            <ChevronRight
              size={12}
              className="text-muted-foreground/60 shrink-0"
            />
            <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary border border-primary/20 truncate max-w-45 sm:max-w-none">
              {activeArticle.title}
            </span>
          </>
        )}
      </nav>
    </header>
  );
}
