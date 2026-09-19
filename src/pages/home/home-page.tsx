import { GlobeCanvas } from '@/shared/ui/globe';

export const HomePage = () => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <GlobeCanvas body="earth" />
    </div>
  );
};
