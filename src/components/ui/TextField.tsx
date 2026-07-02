interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  onChange: (value: string) => void;
}

/** Single-line text entry (e.g. caption / overlay text). */
export function TextField({ id, label, value, placeholder, maxLength, disabled, onChange }: TextFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="textfield__input"
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
