import { Calendar, Clock, Tag } from 'lucide-react';

import { Badge } from '@/shared/ui';

import type { FaqArticle } from '../types';
import { ArticleCallout } from './article-callout';
import { CodeSnippetCard } from './code-snippet-card';
import { ParameterTable } from './parameter-table';

/** Renders a single reference article with content sections. */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface FaqArticleViewProps {
  article: FaqArticle;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function FaqArticleView({ article }: FaqArticleViewProps) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-8 space-y-8">
      {/* 1. Article title and metadata */}
      <header className="space-y-3 border-b border-border/80 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-primary" />
            {article.readTimeMin} мин чтения
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {article.lastUpdated}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
          {article.shortDescription}
        </p>

        {/* Article tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <Tag size={12} className="text-muted-foreground/60 mr-0.5" />
          {article.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      {/* 2. Article content sections */}
      <div className="space-y-8">
        {article.sections.map((section, idx) => (
          <section key={section.title || `sec-${idx}`} className="space-y-3">
            {section.title && (
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                {section.title}
              </h2>
            )}

            {/* Plain text */}
            {(!section.type || section.type === 'text') && (
              <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line space-y-2.5">
                {section.content}
              </div>
            )}

            {/* Callout */}
            {section.type === 'callout' && (
              <ArticleCallout
                content={section.content}
                variant={section.calloutVariant}
              />
            )}

            {/* Parameter table */}
            {section.type === 'table' && (
              <ParameterTable
                headers={section.tableHeaders}
                rows={section.tableRows}
                description={section.content}
              />
            )}

            {/* Code block */}
            {section.type === 'code' && section.codeSnippet && (
              <CodeSnippetCard
                language={section.codeSnippet.language}
                code={section.codeSnippet.code}
                description={section.content}
              />
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
