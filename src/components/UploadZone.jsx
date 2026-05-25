import { useRef, useState } from 'react';

export default function UploadZone({ accept, onFile, icon, title, subtitle, tags, compact }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }

  function handleChange(e) {
    if (e.target.files[0]) onFile(e.target.files[0]);
  }

  return (
    <div
      className={`upload-zone ${dragOver ? 'drag-over' : ''} ${compact ? 'compact' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <div className="upload-icon-text">{icon}</div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {tags && (
        <div className="formats">
          {tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
    </div>
  );
}
