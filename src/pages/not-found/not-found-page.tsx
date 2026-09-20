import { Link } from 'react-router';

import { STATIC_ROUTES } from '@/shared/constants';
import { Button } from '@/shared/ui';

/** 404 page — route not found. */

// ═══════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════

export const NotFoundPage = () => {
  return (
    <div className="flex h-full flex-col items-start justify-center gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">404</h1>
        <p className="text-muted-foreground text-sm">Страница не найдена.</p>
      </div>

      <Button render={<Link to={STATIC_ROUTES.HOME} />}>На главную</Button>
    </div>
  );
};
