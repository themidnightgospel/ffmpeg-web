/** Join class names, dropping falsy values. Keeps JSX className logic readable. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
