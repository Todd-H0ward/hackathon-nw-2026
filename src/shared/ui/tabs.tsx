import { createContext, useContext, useState, type HTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

/* ── Context ── */
interface TabsContextValue {
  value: string;
  onChange: (v: string) => void;
}

const TabsContext = createContext<TabsContextValue>({
  value: '',
  onChange: () => {},
});

/* ── Tabs (root) ── */
interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
}

function Tabs({
  className,
  defaultValue = '',
  value: controlledValue,
  onValueChange,
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;

  const onChange = (v: string) => {
    setInternalValue(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div data-slot="tabs" className={cn('flex flex-col', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/* ── TabsList ── */
function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        'flex gap-7 border-b border-border mb-6',
        className,
      )}
      {...props}
    />
  );
}

/* ── TabsTrigger ── */
interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  badge?: ReactNode;
}

function TabsTrigger({
  className,
  value,
  badge,
  children,
  ...props
}: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => ctx.onChange(value)}
      className={cn(
        'flex items-center gap-[7px] border-0 border-b-2 border-transparent rounded-none pb-[14px] text-[12px] transition-colors cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-primary',
        isActive
          ? 'text-foreground border-b-primary'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
      {badge !== undefined && (
        <span className="font-mono text-[10px] text-[#75787a]">{badge}</span>
      )}
    </button>
  );
}

/* ── TabsContent ── */
interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ value, className, ...props }: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;

  return (
    <div
      data-slot="tabs-content"
      className={cn('flex-1', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
