import {
  type ButtonHTMLAttributes,
  createContext,
  forwardRef,
  type HTMLAttributes,
  useContext,
  useEffect,
  useRef,
} from 'react';

import { cn } from '@/shared/lib/utils';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface DialogContextValue {
  close: () => void;
}

interface DialogProps extends HTMLAttributes<HTMLDialogElement> {
  open?: boolean;
  onClose?: () => void;
}

// ═══════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════

const DialogContext = createContext<DialogContextValue>({ close: () => {} });

const useDialogContext = () => useContext(DialogContext);

// ═══════════════════════════════════════════
// COMPOUND COMPONENTS
// ═══════════════════════════════════════════

const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ className, open, onClose, children, ...props }, forwardedRef) => {
    const internalRef = useRef<HTMLDialogElement>(null);
    const ref =
      (forwardedRef as React.RefObject<HTMLDialogElement>) ?? internalRef;

    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (open && !el.open) el.showModal();
      else if (!open && el.open) el.close();
    }, [open, ref]);

    const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
      e.preventDefault();
      onClose?.();
    };

    const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const isInside =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInside) {
        onClose?.();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    return (
      <DialogContext.Provider value={{ close: () => ref.current?.close() }}>
        <dialog
          ref={ref}
          data-slot="dialog"
          onClose={onClose}
          onCancel={handleCancel}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            'fixed inset-0 z-50 m-auto h-fit max-h-[calc(100dvh-2rem)] overflow-y-auto',
            'w-[90%] max-w-[520px] p-[30px] rounded-[14px]',
            'border border-border bg-card text-foreground shadow-2xl outline-none',
            'backdrop:bg-black/60 backdrop:backdrop-blur-xs',
            'open:animate-in open:fade-in-0 open:zoom-in-95',
            className,
          )}
          {...props}
        >
          {children}
        </dialog>
      </DialogContext.Provider>
    );
  },
);
Dialog.displayName = 'Dialog';

function DialogTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn('text-[22px] font-medium text-foreground', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="dialog-description"
      className={cn(
        'text-[#a8acae] leading-[1.9] my-[17px] text-[13px]',
        className,
      )}
      {...props}
    />
  );
}

function DialogClose({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { close } = useDialogContext();
  return (
    <button
      type="button"
      data-slot="dialog-close"
      onClick={close}
      className={cn(
        'float-right border border-border rounded-[7px] px-[14px] py-[10px] text-[13px] bg-transparent text-foreground',
        'hover:bg-secondary transition-colors cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[4px]',
        className,
      )}
      {...props}
    />
  );
}

// ═══════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════

export { Dialog, DialogClose, DialogDescription, DialogTitle };
