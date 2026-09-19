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

type DialogContextValue = {
  close: () => void;
};

type DialogProps = HTMLAttributes<HTMLDialogElement> & {
  open?: boolean;
  onClose?: () => void;
};

const DialogContext = createContext<DialogContextValue>({ close: () => {} });

const useDialogContext = () => useContext(DialogContext);

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

    return (
      <DialogContext.Provider value={{ close: () => ref.current?.close() }}>
        <dialog
          ref={ref}
          data-slot="dialog"
          onClose={onClose}
          className={cn(
            'bg-card text-foreground border border-[#444] rounded-[14px] max-w-[520px] w-[90%] p-[30px]',
            'backdrop:bg-black/60',
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

export const DialogTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2
      data-slot="dialog-title"
      className={cn('text-[22px] font-medium text-foreground', className)}
      {...props}
    />
  );
};

export const DialogDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => {
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
};

export const DialogClose = ({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
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
};

export { Dialog };
