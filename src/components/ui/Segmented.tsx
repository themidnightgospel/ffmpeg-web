interface SegmentedProps {
  name: string;
  labelId?: string;
  value: string;
  choices: ReadonlyArray<{ value: string; label: string }>;
  disabled?: boolean;
  onChange: (value: string) => void;
}

/** Single-choice control styled as outlined buttons — the house alternative to a <select>. */
export function Segmented({ name, labelId, value, choices, disabled, onChange }: SegmentedProps) {
  return (
    <div className="segmented" role="radiogroup" aria-labelledby={labelId}>
      {choices.map((c) => (
        <label className="seg" key={c.value}>
          <input
            type="radio"
            name={name}
            value={c.value}
            checked={value === c.value}
            disabled={disabled}
            onChange={() => onChange(c.value)}
          />
          <span>{c.label}</span>
        </label>
      ))}
    </div>
  );
}
