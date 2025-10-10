'use client';

import { useEffect } from 'react';

type ToastProps = {
  message: string | null;
  variant?: 'success' | 'error';
  onClear?: () => void;
};

export function Toast({ message, variant = 'success', onClear }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => {
      onClear?.();
    }, 4000);
    return () => window.clearTimeout(timeout);
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div
      className={`toast-region ${variant === 'success' ? 'toast-success' : 'toast-error'}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
