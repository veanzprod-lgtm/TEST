'use client';

import { ReactNode, cloneElement, isValidElement } from 'react';

export type FieldProps = {
  id: string;
  label: string;
  error?: string;
  description?: string;
  children: ReactNode;
};

export function Field({ id, label, error, description, children }: FieldProps) {
  const describedBy = [
    description ? `${id}-description` : undefined,
    error ? `${id}-error` : undefined
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy = [
    description ? `${id}-description` : undefined,
    error ? `${id}-error` : undefined
  ]
    .filter(Boolean)
    .join(' ');

  let control = children;
  if (isValidElement(children)) {
    control = cloneElement(children, {
      'aria-describedby': describedBy || undefined,
      'aria-invalid': error ? true : children.props['aria-invalid']
    });
  }

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {description ? (
        <p id={`${id}-description`} style={{ marginTop: 0, marginBottom: '0.4rem', color: '#475569' }}>
          {description}
        </p>
      ) : null}
      {control}
      {error ? (
        <p
          id={`${id}-error`}
          style={{
            marginTop: '0.35rem',
            color: '#ef4444',
            fontSize: '0.95rem'
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type FormActionsProps = {
  children: ReactNode;
};

export function FormActions({ children }: FormActionsProps) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>{children}</div>
  );
}
