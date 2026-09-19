import { Link, useParams } from 'react-router';

import { STATIC_ROUTES } from '@/shared/constants';
import { Button } from '@/shared/ui/button';

export const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();

  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Post</h1>
        <p className="text-muted-foreground text-sm">
          Dynamic route example for post id:{' '}
          <span className="text-foreground font-medium">{postId}</span>
        </p>
      </div>

      <Button variant="outline" render={<Link to={STATIC_ROUTES.HOME} />}>
        Back home
      </Button>
    </div>
  );
};
