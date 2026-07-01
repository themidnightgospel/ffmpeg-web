import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'sm' | 'lg';
  /** Full-width — use with size="lg" for a prominent primary CTA. */
  block?: boolean;
  /** Trailing arrow glyph, e.g. "→" or "↓". */
  arrow?: string;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
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
        size === 'lg' && 'btn--lg',
        block && 'btn--block',
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
