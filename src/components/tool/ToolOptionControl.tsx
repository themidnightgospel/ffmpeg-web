import type { OptionValue, OptionValues, ToolOption } from '@/lib/tools/types';
import { Field } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Segmented';
import { Slider } from '@/components/ui/Slider';
import { Stepper } from '@/components/ui/Stepper';
import { TimeField } from '@/components/ui/TimeField';
import { TextField } from '@/components/ui/TextField';
import { Checkbox } from '@/components/ui/Checkbox';

interface ToolOptionControlProps {
  option: ToolOption;
  values: OptionValues;
  disabled: boolean;
  onChange: (id: string, value: OptionValue) => void;
}

/** Renders a single tool option based on its `type`. The switch is exhaustive:
    adding a new option kind is a compile error until handled here. */
export function ToolOptionControl({ option, values, disabled, onChange }: ToolOptionControlProps) {
  switch (option.type) {
    case 'segmented': {
      const labelId = `${option.id}-label`;
      return (
        <Field label={option.label} labelId={labelId}>
          <Segmented
            name={option.id}
            labelId={labelId}
            value={String(values[option.id] ?? option.default)}
            choices={option.choices}
            disabled={disabled}
            onChange={(v) => onChange(option.id, v)}
          />
        </Field>
      );
    }

    case 'slider':
      return (
        <Slider
          id={option.id}
          label={option.label}
          value={Number(values[option.id] ?? option.default)}
          min={option.min}
          max={option.max}
          step={option.step}
          minLabel={option.minLabel}
          maxLabel={option.maxLabel}
          hint={option.hint}
          disabled={disabled}
          onChange={(v) => onChange(option.id, v)}
        />
      );

    case 'stepper':
      return (
        <Stepper
          id={option.id}
          label={option.label}
          value={Number(values[option.id] ?? option.default)}
          min={option.min}
          max={option.max}
          step={option.step}
          hint={option.hint}
          disabled={disabled}
          onChange={(v) => onChange(option.id, v)}
        />
      );

    case 'toggle':
      return (
        <div className="field">
          <Checkbox
            id={option.id}
            label={option.label}
            description={option.description}
            checked={values[option.id] === true}
            onChange={(v) => onChange(option.id, v)}
          />
        </div>
      );

    case 'time':
      return (
        <TimeField
          id={option.id}
          label={option.label}
          value={String(values[option.id] ?? option.default ?? '00:00:00.000')}
          withMs={option.withMs}
          disabled={disabled}
          onChange={(v) => onChange(option.id, v)}
        />
      );

    case 'text':
      return (
        <TextField
          id={option.id}
          label={option.label}
          value={String(values[option.id] ?? option.default ?? '')}
          placeholder={option.placeholder}
          maxLength={option.maxLength}
          disabled={disabled}
          onChange={(v) => onChange(option.id, v)}
        />
      );

    default:
      return assertNever(option);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled tool option: ${JSON.stringify(value)}`);
}
