import { Component, type ReactNode } from 'react';

import { Globe2 } from 'lucide-react';

interface SceneBoundaryProps {
  children: ReactNode;
}

interface SceneBoundaryState {
  failed: boolean;
}

export class SceneBoundary extends Component<
  SceneBoundaryProps,
  SceneBoundaryState
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (
      <div className="flex items-center justify-center flex-col h-full text-muted-foreground text-center">
        <Globe2 size={60} />
        <h3 className="text-base m-[15px]">3D недоступно в этом браузере</h3>
        <p className="text-[11px] leading-[1.8]">
          Симуляция, колонии и аналитика продолжают работать.
          <br />
          Откройте страницу в браузере с WebGL 2.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
