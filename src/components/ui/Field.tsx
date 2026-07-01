import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  /** When the control is a single input, pass its id to render a real <label for>. */
  htmlFor?: string;
  /** When the control is a group (e.g. radios), pass an id used via aria-labelledby. */
  labelId?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, labelId, children }: FieldProps) {
  return (
    <div className="field">
      {htmlFor ? (
        <label htmlFor={htmlFor}>{label}</label>
      ) : (
        <span className="flabel" id={labelId}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
