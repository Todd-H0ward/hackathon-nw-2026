import { Link } from 'react-router';

import { DYNAMIC_ROUTES, STATIC_ROUTES } from '@/shared/constants';
import { Button } from '@/shared/ui/button';

export const HomePage = () => {
  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
      </div>

      <nav className="flex flex-wrap gap-2">
        <Button render={<Link to={STATIC_ROUTES.ABOUT} />}>About</Button>
        <Button render={<Link to={STATIC_ROUTES.VOICE} />}>🎙 Голос</Button>
        <Button variant="outline" render={<Link to={DYNAMIC_ROUTES.POST(1)} />}>
          Sample post
        </Button>
      </nav>
    </div>
  );
};
