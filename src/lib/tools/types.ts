/* The Tool contract — every tool is described by data, never by per-page DOM code.
   See CODING_STANDARDS.md § "The Tool contract". */

export const CATEGORIES = [
  'Format conversion',
  'Compression',
  'Trimming & cutting',
  'Resize & transform',
  'Audio tools',
  'Subtitles & overlays',
  'Extraction & capture',
  'Social & platform',
  'GIF & meme',
  'Advanced',
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Hub filter: a specific category or the catch-all. */
export type CategoryFilter = 'All' | Category;

export type ToolStatus = 'live' | 'planned';

/** Catalogue-level metadata shown on the hub. */
export interface ToolMeta {
  slug: string;
  name: string;
  category: Category;
  desc: string;
  status: ToolStatus;
}

export type OptionValue = string | number | boolean;
export type OptionValues = Record<string, OptionValue>;

interface OptionBase {
  id: string;
  label: string;
  help?: string;
  /** Render inside the "Advanced options" disclosure. */
  advanced?: boolean;
  /** Disable this control when the predicate holds (e.g. remux disables codecs). */
  disabledWhen?: (values: OptionValues) => boolean;
}

export interface SegmentedOption extends OptionBase {
  type: 'segmented';
  choices: ReadonlyArray<{ value: string; label: string }>;
  default: string;
}

export interface SliderOption extends OptionBase {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
  default: number;
  minLabel?: string;
  maxLabel?: string;
  /** Small suffix next to the live value, e.g. "lower = better". */
  hint?: string;
}

export interface ToggleOption extends OptionBase {
  type: 'toggle';
  default: boolean;
  description?: string;
}

export interface TimeOption extends OptionBase {
  type: 'time';
  /** "HH:MM:SS.mmm" */
  default?: string;
  withMs?: boolean;
}

/** Discriminated union — extend here + in ToolOptionControl to add a control. */
export type ToolOption = SegmentedOption | SliderOption | ToggleOption | TimeOption;

export interface BuiltCommand {
  args: string[];
  outputName: string;
}

/** A fully-implemented ("live") tool. */
export interface Tool extends ToolMeta {
  status: 'live';
  /** File input `accept` attribute, e.g. "video/*". */
  accept?: string;
  options: ToolOption[];
  /** Pure: option values + input -> ffmpeg argv + output filename. Unit-testable. */
  buildCommand: (values: OptionValues, input: { name: string }) => BuiltCommand;
}

/** Initial values derived from each option's default. */
export function defaultValues(options: ToolOption[]): OptionValues {
  const values: OptionValues = {};
  for (const o of options) {
    switch (o.type) {
      case 'segmented':
        values[o.id] = o.default;
        break;
      case 'slider':
        values[o.id] = o.default;
        break;
      case 'toggle':
        values[o.id] = o.default;
        break;
      case 'time':
        values[o.id] = o.default ?? '00:00:00.000';
        break;
    }
  }
  return values;
}
