import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'sm';
  /** Trailing arrow glyph, e.g. "→" or "↓". */
  arrow?: string;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  arrow,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'btn',
        variant === 'secondary' && 'btn--secondary',
        size === 'sm' && 'btn--sm',
        className,
      )}
      {...rest}
    >
      {children}
      {arrow && (
        <span className="arrow" aria-hidden="true">
          {arrow}
        </span>
      )}
    </button>
  );
}
