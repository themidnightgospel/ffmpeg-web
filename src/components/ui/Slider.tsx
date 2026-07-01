interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  /** Small suffix next to the live value, e.g. "lower = better". */
  hint?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  minLabel,
  maxLabel,
  hint,
  disabled,
  onChange,
}: SliderProps) {
  const labelId = `${id}-label`;
  return (
    <div className="field">
      <div className="slider-row">
        <span className="flabel" id={labelId}>
          {label}
        </span>
        <span className="val">
          {value}
          {hint && <small>{hint}</small>}
        </span>
      </div>
      <input
        type="range"
        className="slider"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-valuetext={String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {(minLabel || maxLabel) && (
        <div className="scale">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
