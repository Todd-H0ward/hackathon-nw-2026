import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

import { STATIC_ROUTES } from '@/shared/constants';
import { LabRail } from '@/shared/ui';

import { exportArticleJson } from './lib';
import { FaqArticleView, FaqHeader, FaqSidebar, SearchResultsView } from './ui';
import { useFaqNavigation } from './use-faq-navigation';

export const FaqPage = () => {
  const navigate = useNavigate();
  const {
    categories,
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
  } = useFaqNavigation();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    drawerRef.current?.querySelector<HTMLElement>('button, a, [href]')?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  const handleExport = () => {
    exportArticleJson(activeArticle, categories);
  };

  const handleOpenGuide = () => {
    selectArticle('intro-concept');
  };

  return (
    <div className="flex h-dvh w-dvw overflow-hidden bg-background text-foreground font-sans max-mobile:flex-col">
      {/* Левый рейл навигации */}
      <LabRail
        onGoHome={() => navigate(STATIC_ROUTES.HOME)}
        onExport={handleExport}
        onOpenGuide={handleOpenGuide}
      />

      {/* Десктопный сайдбар со структурой статей */}
      <div className="hidden md:flex w-64 lg:w-72 shrink-0 h-full">
        <FaqSidebar
          categories={categories}
          activeArticleId={activeArticleId}
          onSelectArticle={selectArticle}
        />
      </div>

      {/* Мобильный сайдбар (Drawer) */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Закрыть меню"
            className="fixed inset-0 bg-black/70 backdrop-blur-xs border-0 cursor-pointer"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div
            ref={drawerRef}
            id="faq-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Содержание справочника"
            className="relative w-72 max-w-[85vw] h-full z-10"
          >
            <FaqSidebar
              categories={categories}
              activeArticleId={activeArticleId}
              onSelectArticle={selectArticle}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Основная область: шапка поиска и контент */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden bg-background">
        <FaqHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          activeArticle={activeArticle}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {searchQuery.trim() ? (
            <SearchResultsView
              searchQuery={searchQuery}
              searchResults={searchResults}
              onSelectArticle={selectArticle}
              onResetSearch={clearSearch}
            />
          ) : activeArticle ? (
            <FaqArticleView article={activeArticle} />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Статья не найдена
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
