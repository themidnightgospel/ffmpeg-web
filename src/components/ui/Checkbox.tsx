interface CheckboxProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Bordered, generously-hit checkbox row with a custom red check. */
export function Checkbox({ id, label, description, checked, onChange }: CheckboxProps) {
  return (
    <label className="check" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="ctext">
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </span>
    </label>
  );
}
