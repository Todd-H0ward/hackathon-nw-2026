import { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Compass,
  CornerDownRight,
  Cpu,
  Globe,
  Server,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import type { FaqCategory } from '../types';

/** Sidebar navigation for reference sections. */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface FaqSidebarProps {
  categories: FaqCategory[];
  activeArticleId: string;
  onSelectArticle: (articleId: string) => void;
  onCloseMobile?: () => void;
}

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

const CATEGORY_ICONS: Record<string, typeof Compass> = {
  Compass,
  Cpu,
  Globe,
  Server,
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function FaqSidebar({
  categories,
  activeArticleId,
  onSelectArticle,
  onCloseMobile,
}: FaqSidebarProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-card/95 text-card-foreground">
      {/* Sidebar header */}
      <div className="flex h-[90px] flex-col justify-between border-b border-border bg-card/60 backdrop-blur-md px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <BookOpen size={15} />
            </div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Справочник
            </h2>
          </div>
          <span className="rounded bg-secondary/80 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
            WIKI
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
          <span className="size-1.5 rounded-full bg-primary" />
          <span>База знаний XenoChoice</span>
        </div>
      </div>

      {/* Section list and article accordion */}
      <nav
        aria-label="Разделы документации"
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        {categories.map((category) => {
          const isCollapsed = collapsedCategories[category.id];
          const IconComponent = CATEGORY_ICONS[category.icon] || Compass;

          return (
            <div key={category.id} className="space-y-1">
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="group flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconComponent size={15} className="text-primary shrink-0" />
                  <span className="truncate font-medium text-[12px] text-foreground">
                    {category.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                    {category.articles.length}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight size={13} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={13} className="text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Articles in category */}
              {!isCollapsed && (
                <div className="space-y-0.5 pl-3 pt-0.5 border-l border-border/40 ml-4">
                  {category.articles.map((article) => {
                    const isActive = activeArticleId === article.id;

                    return (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => {
                          onSelectArticle(article.id);
                          onCloseMobile?.();
                        }}
                        className={cn(
                          'group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-all cursor-pointer',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary shadow-xs'
                            : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                        )}
                      >
                        <CornerDownRight
                          size={12}
                          className={cn(
                            'shrink-0 transition-transform',
                            isActive
                              ? 'text-primary translate-x-0.5'
                              : 'text-muted-foreground/60 group-hover:text-muted-foreground',
                          )}
                        />
                        <span className="truncate leading-snug">
                          {article.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
