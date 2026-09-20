import type { FaqArticle, FaqCategory } from './types';

/**
 * Exports the active article and full catalog data as a downloadable JSON file.
 */
export function exportArticleJson(
  article: FaqArticle | undefined,
  categories: FaqCategory[],
): void {
  const payload = {
    activeArticle: article,
    exportedAt: new Date().toISOString(),
    categories,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `xenochoice-wiki-${article?.id ?? 'all'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
