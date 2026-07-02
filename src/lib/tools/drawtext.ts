import type { ToolAsset } from './types';

/** The bundled caption font, staged into the WASM FS as `font.ttf`. */
export const CAPTION_FONT: ToolAsset = { url: 'fonts/Anton-Regular.ttf', name: 'font.ttf' };

/** Escape user text for a drawtext value embedded in a filtergraph string.
    Handles both drawtext option separators and filtergraph specials. */
export function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/%/g, '\\%')
    .replace(/,/g, '\\,')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/;/g, '\\;');
}

export interface DrawtextParams {
  text: string;
  fontsize: number;
  color: string;
  /** x expression, e.g. "(w-text_w)/2". */
  x: string;
  /** y expression. */
  y: string;
  borderw?: number;
  bordercolor?: string;
  box?: boolean;
  boxcolor?: string;
  /** Only render during this window, e.g. "between(t,2,5)". */
  enable?: string;
}

/** Build a single `drawtext=...` filter string using the bundled font. */
export function drawtextFilter(p: DrawtextParams): string {
  const parts = [
    `fontfile=${CAPTION_FONT.name}`,
    `text=${escapeDrawtext(p.text)}`,
    `fontsize=${p.fontsize}`,
    `fontcolor=${p.color}`,
    `x=${p.x}`,
    `y=${p.y}`,
    'expansion=none',
  ];
  if (p.borderw) parts.push(`borderw=${p.borderw}`, `bordercolor=${p.bordercolor ?? 'black'}`);
  if (p.box) parts.push('box=1', `boxcolor=${p.boxcolor ?? 'black@0.5'}`, 'boxborderw=10');
  if (p.enable) parts.push(`enable='${p.enable}'`);
  return `drawtext=${parts.join(':')}`;
}
