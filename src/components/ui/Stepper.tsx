import { useEffect, useRef, useState } from 'react';

interface StepperProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Small helper text beside the label, e.g. "lower = better". */
  hint?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/** Numeric field with −/+ buttons and direct typing. Clamps to [min, max]. */
export function Stepper({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  hint,
  disabled,
  onChange,
}: StepperProps) {
  const labelId = `${id}-label`;
  const [text, setText] = useState(String(value));
  const focused = useRef(false);

  // Reflect external value changes (buttons, resets) unless the user is typing.
  useEffect(() => {
    if (!focused.current) setText(String(value));
  }, [value]);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const commit = (n: number) => {
    const clamped = clamp(n);
    onChange(clamped);
    setText(String(clamped));
  };

  return (
    <div className="field">
      <div className="stepper-head">
        <span className="flabel" id={labelId}>
          {label}
        </span>
        {hint && <span className="stepper__hint">{hint}</span>}
      </div>

      <div className="stepper" role="group" aria-labelledby={labelId}>
        <button
          type="button"
          className="stepper__btn"
          onClick={() => commit(value - step)}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          id={id}
          className="stepper__input"
          type="number"
          inputMode="numeric"
          value={text}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-labelledby={labelId}
          onFocus={() => {
            focused.current = true;
          }}
          onChange={(e) => {
            setText(e.target.value);
            const n = Number(e.target.value);
            if (e.target.value.trim() !== '' && Number.isFinite(n)) onChange(clamp(n));
          }}
          onBlur={() => {
            focused.current = false;
            const n = Number(text);
            commit(text.trim() !== '' && Number.isFinite(n) ? n : value);
          }}
        />
        <button
          type="button"
          className="stepper__btn"
          onClick={() => commit(value + step)}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
