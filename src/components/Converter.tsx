import type { OptionValues } from '@/lib/tools/types';
import { getTool } from '@/lib/tools/registry';
import { ToolRunner } from '@/components/tool/ToolRunner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ConverterProps {
  /** Which tool config to run (e.g. "video-converter"). */
  slug: string;
  /** Seed values, e.g. preselect the target format on a conversion page. */
  initialValues?: OptionValues;
  /** Expected source format, shown as a soft hint. */
  sourceHint?: string;
}

/** Island entry point — the only React that hydrates on a page. */
export default function Converter({ slug, initialValues, sourceHint }: ConverterProps) {
  const tool = getTool(slug);
  if (!tool) {
    return (
      <p className="note">This converter isn’t available yet — it’s on the way. Nothing uploaded.</p>
    );
  }
  return (
    <ErrorBoundary>
      <ToolRunner tool={tool} initialValues={initialValues} sourceHint={sourceHint} />
    </ErrorBoundary>
  );
}
