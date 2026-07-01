interface ProgressBarProps {
  ratio: number;
  stage: string;
}

export function ProgressBar({ ratio, stage }: ProgressBarProps) {
  const pct = Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
  return (
    <div className="progress on">
      <div className="ptop">
        <span className="pstage">{stage}</span>
        <span className="ppct">{pct}%</span>
      </div>
      <div
        className="track"
        role="progressbar"
        aria-label={stage}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Inline width is a runtime-computed value — the one allowed use of inline style. */}
        <div className="bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
