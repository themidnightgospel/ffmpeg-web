import { useRef, useState } from 'react';
import type { DragEvent, KeyboardEvent } from 'react';
import { humanSize } from '@/lib/format';
import { cx } from '@/lib/cx';

interface DropZoneProps {
  accept?: string;
  file: File | null;
  onFile: (file: File) => void;
  prompt?: string;
}

export function DropZone({ accept, file, onFile, prompt }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  };

  const setDrag = (on: boolean) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(on);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFile(dropped);
  };

  return (
    <>
      <div
        className={cx('drop', file && 'has-file', dragging && 'drag')}
        role="button"
        tabIndex={0}
        aria-label="Drop a file here or press Enter to browse"
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDragEnter={setDrag(true)}
        onDragOver={setDrag(true)}
        onDragLeave={setDrag(false)}
        onDrop={onDrop}
      >
        <div className="prompt">
          <div className="plus" aria-hidden="true">
            +
          </div>
          <p className="headline">{prompt ?? 'Drop a video or click to browse'}</p>
          <p className="hint">Processed locally — nothing is uploaded</p>
        </div>

        {file && (
          <div className="filemeta" aria-live="polite">
            <div className="fname">{file.name}</div>
            <div className="fsize">{humanSize(file.size)} · ready to convert</div>
            <span className="change">Choose a different file</span>
          </div>
        )}
      </div>

      {/* Kept as a sibling (not inside the clickable div) so its programmatic
          .click() can't bubble back and re-trigger openPicker. */}
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={accept}
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) onFile(picked);
        }}
      />
    </>
  );
}
