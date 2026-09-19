import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { cn } from '@/shared/lib/utils';

/* ── Context & hook ── */
interface ToastItem {
  id: number;
  message: ReactNode;
}

interface ToastContextValue {
  toast: (message: ReactNode) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

/* ── ToastProvider ── */
interface ToastProviderProps {
  children: ReactNode;
  duration?: number;
}

function ToastProvider({ children, duration = 2800 }: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const toast = useCallback(
    (message: ReactNode) => {
      const id = ++counterRef.current;
      setItems((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [duration],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
      >
        {items.map((item) => (
          <Toast key={item.id}>{item.message}</Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Toast (individual) ── */
function Toast({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      data-slot="toast"
      className={cn(
        'px-5 py-[13px] bg-[#d8e4cc] text-[#182013] rounded-[7px] shadow-[0_8px_30px_#0008]',
        'text-[13px] font-medium pointer-events-auto',
        'animate-in fade-in-0 slide-in-from-bottom-4',
        className,
      )}
      {...props}
    />
  );
}

export { Toast, ToastProvider };
