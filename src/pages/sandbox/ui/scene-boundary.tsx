import { Component, type ReactNode } from 'react';

import { Globe2 } from 'lucide-react';

/** Error boundary for the WebGL scene — fallback when 3D is unavailable. */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface SceneBoundaryProps {
  children: ReactNode;
}

interface SceneBoundaryState {
  failed: boolean;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export class SceneBoundary extends Component<
  SceneBoundaryProps & { resetKey?: string },
  SceneBoundaryState
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prev: SceneBoundaryProps & { resetKey?: string }) {
    if (
      prev.resetKey !== this.props.resetKey &&
      this.state.failed &&
      this.props.resetKey !== undefined
    ) {
      this.setState({ failed: false });
    }
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
