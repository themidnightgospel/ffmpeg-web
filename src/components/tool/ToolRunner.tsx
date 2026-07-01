import type { OptionValues, Tool, ToolOption } from '@/lib/tools/types';
import type { ConversionRunner } from '@/lib/runner/types';
import { DropZone } from '@/components/ui/DropZone';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ToolOptionControl } from './ToolOptionControl';
import { useConversion } from './useConversion';
import { ffmpegRunner } from '@/lib/runner/ffmpegRunner';

interface ToolRunnerProps {
  tool: Tool;
  /** Seed option values (e.g. preselect the target format on a conversion page). */
  initialValues?: Partial<OptionValues>;
  /** Format the source file is expected to be, e.g. "mp4" — shown as a soft hint. */
  sourceHint?: string;
  /** Injectable engine; defaults to the real ffmpeg.wasm runner. */
  runner?: ConversionRunner;
}

export function ToolRunner({
  tool,
  initialValues,
  sourceHint,
  runner = ffmpegRunner,
}: ToolRunnerProps) {
  const conversion = useConversion(tool, runner, initialValues);
  const { file, values, phase, progress, output, error } = conversion;

  const dropPrompt = sourceHint
    ? `Drop your ${sourceHint.toUpperCase()} or click to browse`
    : undefined;

  const mainOptions = tool.options.filter((o) => !o.advanced);
  const advancedOptions = tool.options.filter((o) => o.advanced);

  const renderOption = (option: ToolOption) => (
    <ToolOptionControl
      key={option.id}
      option={option}
      values={values}
      disabled={option.disabledWhen?.(values) ?? false}
      onChange={conversion.setValue}
    />
  );

  return (
    <>
      <div className="wrap work">
        <div className="col-a">
          <p className="section-label">Source file</p>
          <DropZone
            accept={tool.accept}
            file={file}
            onFile={conversion.selectFile}
            prompt={dropPrompt}
          />
        </div>

        <div className="col-b">
          <p className="section-label">Output settings</p>

          {mainOptions.map(renderOption)}

          {advancedOptions.length > 0 && (
            <details className="adv">
              <summary>
                Advanced options{' '}
                <span className="chev" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="adv-body">{advancedOptions.map(renderOption)}</div>
            </details>
          )}
        </div>
      </div>

      <section className="wrap action">
        <Button onClick={conversion.start} disabled={!conversion.canStart} arrow="→">
          {phase === 'running' ? 'Converting…' : 'Convert'}
        </Button>

        {phase === 'running' && (
          <div className="action__panel">
            <ProgressBar ratio={progress.ratio} stage={progress.stage} />
          </div>
        )}

        {phase === 'error' && error && (
          <p className="action__error" role="alert">
            {error}
          </p>
        )}

        {phase === 'done' && output && (
          <div className="result on action__panel">
            <span className="done-label">✓ Conversion complete</span>
            <div className="outname">{output.name}</div>
            <div className="outmeta">{output.meta}</div>
            <a className="btn btn--secondary" href={output.url} download={output.name}>
              Download{' '}
              <span className="arrow" aria-hidden="true">
                ↓
              </span>
            </a>
          </div>
        )}

        <p className="note">All processing happens in your browser — nothing is uploaded.</p>
      </section>
    </>
  );
}
