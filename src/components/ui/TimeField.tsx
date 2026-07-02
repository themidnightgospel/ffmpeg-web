import { useEffect, useRef, useState } from 'react';
import { normalizeTime } from '@/lib/format';

interface TimeFieldProps {
  id: string;
  label: string;
  /** Canonical "HH:MM:SS" or "HH:MM:SS.mmm". */
  value: string;
  /** Keep millisecond precision on normalization. */
  withMs?: boolean;
  hint?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

/**
 * Timestamp entry. Accepts loose input while typing ("90", "1:30", "1:02:03.5")
 * and normalizes to canonical HH:MM:SS(.mmm) on blur. Mirrors Stepper's markup.
 */
export function TimeField({ id, label, value, withMs, hint, disabled, onChange }: TimeFieldProps) {
  const labelId = `${id}-label`;
  const [text, setText] = useState(value);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(value);
  }, [value]);

  return (
    <div className="field">
      <div className="stepper-head">
        <span className="flabel" id={labelId}>
          {label}
        </span>
        {hint && <span className="stepper__hint">{hint}</span>}
      </div>

      <input
        id={id}
        className="timefield__input"
        type="text"
        inputMode="numeric"
        placeholder={withMs ? 'HH:MM:SS.mmm' : 'HH:MM:SS'}
        value={text}
        disabled={disabled}
        aria-labelledby={labelId}
        onFocus={() => {
          focused.current = true;
        }}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          focused.current = false;
          const normalized = normalizeTime(text, withMs);
          if (normalized) {
            onChange(normalized);
            setText(normalized);
          } else {
            setText(value); // revert unparseable input
          }
        }}
      />
    </div>
  );
}
