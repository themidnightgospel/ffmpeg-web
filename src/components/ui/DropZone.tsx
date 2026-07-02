import { useRef, useState } from 'react';
import type { DragEvent, KeyboardEvent } from 'react';
import { humanSize } from '@/lib/format';
import { cx } from '@/lib/cx';

interface DropZoneProps {
  accept?: string;
  file: File | null;
  onFile: (file: File) => void;
  prompt?: string;
  /** Multi-file mode: accept several files at once (e.g. concat/join). */
  multiple?: boolean;
  /** Selected files in multi-file mode. */
  files?: File[];
  /** Called with all selected files in multi-file mode. */
  onFiles?: (files: File[]) => void;
}

export function DropZone({ accept, file, onFile, prompt, multiple, files, onFiles }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = () => inputRef.current?.click();
  const selected = multiple ? (files ?? []) : file ? [file] : [];
  const hasFiles = selected.length > 0;

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

  const accept_ = (dropped: FileList | null) => {
    if (!dropped || dropped.length === 0) return;
    if (multiple) onFiles?.(Array.from(dropped));
    else onFile(dropped[0]!);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    accept_(e.dataTransfer.files);
  };

  return (
    <>
      <div
        className={cx('drop', hasFiles && 'has-file', dragging && 'drag')}
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

        {hasFiles && !multiple && (
          <div className="filemeta" aria-live="polite">
            <div className="fname">{selected[0]!.name}</div>
            <div className="fsize">{humanSize(selected[0]!.size)} · ready to convert</div>
            <span className="change">Choose a different file</span>
          </div>
        )}

        {hasFiles && multiple && (
          <div className="filemeta" aria-live="polite">
            <div className="fname">{selected.length} files selected</div>
            <ol className="filelist">
              {selected.map((f, i) => (
                <li key={`${f.name}-${i}`}>{f.name}</li>
              ))}
            </ol>
            <span className="change">Choose different files</span>
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
        multiple={multiple}
        onChange={(e) => {
          accept_(e.target.files);
          // Reset so choosing the identical file again still fires `change`.
          e.target.value = '';
        }}
      />
    </>
  );
}
