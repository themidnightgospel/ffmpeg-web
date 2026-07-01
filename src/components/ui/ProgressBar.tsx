import { cx } from '@/lib/cx';

interface ProgressBarProps {
  ratio: number;
  stage: string;
}

export function ProgressBar({ ratio, stage }: ProgressBarProps) {
  const pct = Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
  // Before real progress arrives (e.g. loading the ~30 MB ffmpeg core) show an
  // animated indeterminate bar so it's clearly working, not stuck.
  const indeterminate = ratio <= 0;

  return (
    <div className="progress on">
      <div className="ptop">
        <span className="pstage">{stage}</span>
        {!indeterminate && <span className="ppct">{pct}%</span>}
      </div>
      <div
        className="track"
        role="progressbar"
        aria-label={stage}
        aria-valuenow={indeterminate ? undefined : pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cx('bar', indeterminate && 'bar--indeterminate')}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
