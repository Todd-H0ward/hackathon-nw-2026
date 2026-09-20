import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import { FAQ_CATEGORIES } from './faq-data';

/** Reference navigation: URL, search, and mobile sidebar. */

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useFaqNavigation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const articleParam = searchParams.get('article');

  // Flat list of all articles across categories
  const allArticles = useMemo(
    () => FAQ_CATEGORIES.flatMap((c) => c.articles),
    [],
  );

  // Active article id from URL or fallback to first article
  const activeArticleId = useMemo(() => {
    if (articleParam && allArticles.some((a) => a.id === articleParam)) {
      return articleParam;
    }
    return allArticles[0]?.id || 'overview';
  }, [articleParam, allArticles]);

  // Currently selected article
  const activeArticle = useMemo(
    () => allArticles.find((a) => a.id === activeArticleId),
    [allArticles, activeArticleId],
  );

  // Category containing the active article
  const activeCategory = useMemo(
    () =>
      FAQ_CATEGORIES.find((c) =>
        c.articles.some((a) => a.id === activeArticleId),
      ),
    [activeArticleId],
  );

  // Real-time search query filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return allArticles.filter((article) => {
      const matchTitle = article.title.toLowerCase().includes(q);
      const matchDesc = article.shortDescription.toLowerCase().includes(q);
      const matchTags = article.tags.some((t) => t.toLowerCase().includes(q));
      const matchSections = article.sections.some(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q),
      );
      return matchTitle || matchDesc || matchTags || matchSections;
    });
  }, [searchQuery, allArticles]);

  const selectArticle = (id: string) => {
    setSearchParams({ article: id });
    setSearchQuery('');
    setMobileSidebarOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    categories: FAQ_CATEGORIES,
    allArticles,
    activeArticleId,
    activeArticle,
    activeCategory,
    searchQuery,
    setSearchQuery,
    searchResults,
    selectArticle,
    clearSearch,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  };
}
