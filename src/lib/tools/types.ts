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

/** Numeric value with −/+ buttons and direct typing (preferred over slider). */
export interface StepperOption extends OptionBase {
  type: 'stepper';
  min: number;
  max: number;
  step?: number;
  default: number;
  /** Small helper text shown beside the label, e.g. "lower = better". */
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

export interface TextOption extends OptionBase {
  type: 'text';
  default?: string;
  placeholder?: string;
  maxLength?: number;
}

/** Discriminated union — extend here + in ToolOptionControl to add a control. */
export type ToolOption =
  | SegmentedOption
  | SliderOption
  | StepperOption
  | ToggleOption
  | TimeOption
  | TextOption;

export interface BuiltCommand {
  args: string[];
  /** Download filename. For multi-output tools this is the .zip name. */
  outputName: string;
  /** When set, the tool writes many files whose names start with this prefix;
      the runner collects them all and returns a ZIP named `outputName`. */
  collectPrefix?: string;
}

/** A static asset staged into the WASM FS before exec (e.g. a bundled font).
    `url` is relative to the site base; `name` is the in-FS filename to reference. */
export interface ToolAsset {
  url: string;
  name: string;
}

/** A second required file (e.g. a watermark image, replacement audio, subtitle). */
export interface SecondaryInput {
  /** Logical id (unused by ffmpeg; for keys/labels). */
  id: string;
  label: string;
  /** File input `accept` attribute for the second file, e.g. "image/*". */
  accept?: string;
  /** Prompt shown inside the drop zone. */
  prompt?: string;
}

/** A multi-file input (e.g. clips to merge, tracks to join). */
export interface MultiInput {
  label: string;
  accept?: string;
  prompt?: string;
  /** Minimum number of files required (default 2). */
  min?: number;
}

/** The input the command builder sees: primary file name + optional extras. */
export interface CommandInput {
  name: string;
  /** Present only for tools that declare a `secondary` input. */
  secondaryName?: string;
  /** All file names for tools that declare a `multi` input (includes `name`). */
  names?: string[];
  /** Media duration in seconds, read in-browser. 0/undefined if unavailable. */
  durationSec?: number;
}

/** A fully-implemented ("live") tool. */
export interface Tool extends ToolMeta {
  status: 'live';
  /** File input `accept` attribute, e.g. "video/*". */
  accept?: string;
  /** When set, the tool requires a second file (rendered as a second drop zone). */
  secondary?: SecondaryInput;
  /** When set, the tool takes several files at once (rendered as a multi drop zone). */
  multi?: MultiInput;
  /** Static assets staged into the FS before exec (e.g. a bundled font). */
  assets?: ToolAsset[];
  options: ToolOption[];
  /** Pure: option values + input -> ffmpeg argv + output filename. Unit-testable. */
  buildCommand: (values: OptionValues, input: CommandInput) => BuiltCommand;
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
      case 'stepper':
        values[o.id] = o.default;
        break;
      case 'toggle':
        values[o.id] = o.default;
        break;
      case 'time':
        values[o.id] = o.default ?? '00:00:00.000';
        break;
      case 'text':
        values[o.id] = o.default ?? '';
        break;
    }
  }
  return values;
}
