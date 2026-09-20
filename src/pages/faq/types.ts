/** Reference data model types. */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type FaqCategoryGroup = 'all' | 'model' | 'worlds' | 'backend' | 'faq';

export interface FaqParameterRow {
  name: string;
  symbol?: string;
  value: string;
  unit: string;
  description: string;
}

export interface FaqQuestionItem {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
}

export interface FaqArticleSection {
  title: string;
  content: string;
  type?: 'text' | 'callout' | 'table' | 'code' | 'questions';
  calloutVariant?: 'info' | 'warning' | 'success';
  tableHeaders?: string[];
  tableRows?: string[][];
  codeSnippet?: {
    language: string;
    code: string;
  };
  questions?: FaqQuestionItem[];
}

export interface FaqArticle {
  id: string;
  categoryId: string;
  title: string;
  shortDescription: string;
  readTimeMin: number;
  lastUpdated: string;
  tags: string[];
  sections: FaqArticleSection[];
}

export interface FaqCategory {
  id: string;
  title: string;
  group: FaqCategoryGroup;
  icon: string; // Lucide icon name
  badge?: string;
  articles: FaqArticle[];
}
