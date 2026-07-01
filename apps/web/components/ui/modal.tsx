'use client';

import { type ReactNode, useEffect, useRef } from 'react';

// Dependency-free, accessible modal: a real <button> backdrop (keyboard-reachable), Escape to
// close, focus moved to the close control on open, and a fade + rise entrance animation.
export function Modal({
  onClose,
  label,
  width = 'max-w-2xl',
  children,
}: {
  onClose: () => void;
  label: string;
  width?: string;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="modal-backdrop absolute inset-0 cursor-default bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`modal-dialog relative z-10 max-h-[85vh] w-full ${width} overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-xl`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded px-2 text-xl leading-none text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
