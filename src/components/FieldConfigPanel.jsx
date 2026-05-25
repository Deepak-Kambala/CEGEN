const FONTS = [
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: "'DM Sans', sans-serif",     label: 'DM Sans' },
  { value: "'DM Mono', monospace",      label: 'DM Mono' },
  { value: 'Georgia, serif',            label: 'Georgia' },
  { value: "'Times New Roman', serif",  label: 'Times New Roman' },
  { value: 'Arial, sans-serif',         label: 'Arial' },
  { value: "'Courier New', monospace",  label: 'Courier New' },
  { value: 'Impact, sans-serif',        label: 'Impact' },
];

export default function FieldConfigPanel({ field, onUpdate }) {
  if (!field) return null;

  function change(key, value) { onUpdate(field.id, { [key]: value }); }

  const previewStyle = {
    fontFamily:     field.font,
    fontSize:       Math.min(field.size, 28) + 'px',
    color:          field.color,
    fontWeight:     field.bold      ? 'bold'      : 'normal',
    fontStyle:      field.italic    ? 'italic'    : 'normal',
    textDecoration: field.underline ? 'underline' : 'none',
  };

  return (
    <div className="sidebar-card">
      <h3>Configure Field</h3>

      <label className="form-label">Field Name</label>
      <input
        type="text"
        value={field.name}
        placeholder="e.g. NAME, RANK, DATE"
        onChange={e => { if (e.target.value.trim()) change('name', e.target.value); }}
      />

      <label className="form-label">Font Family</label>
      <select value={field.font} onChange={e => change('font', e.target.value)}>
        {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>

      <label className="form-label">Font Size (px)</label>
      <input
        type="number" min={8} max={200}
        value={field.size}
        onChange={e => change('size', parseInt(e.target.value) || 32)}
      />

      <label className="form-label">Style</label>
      <div className="style-toggles">
        {[['bold','B'],['italic','I'],['underline','U']].map(([key, label]) => (
          <div
            key={key}
            className={`style-toggle ${field[key] ? 'on' : ''}`}
            onClick={() => change(key, !field[key])}
          >
            <span style={{ fontWeight: key==='bold'?'bold':'normal', fontStyle: key==='italic'?'italic':'normal', textDecoration: key==='underline'?'underline':'none' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <label className="form-label" style={{ marginTop: 12 }}>Text Color</label>
      <div className="color-row">
        <input
          type="color" value={field.color}
          onChange={e => change('color', e.target.value)}
        />
        <input
          type="text" value={field.color}
          onChange={e => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) change('color', e.target.value); }}
        />
      </div>

      <label className="form-label">Alignment</label>
      <select value={field.align} onChange={e => change('align', e.target.value)}>
        <option value="center">Center</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>

      <label className="form-label">Live Preview</label>
      <div className="font-preview-box">
        <span style={previewStyle}>{field.name || 'Sample Name'}</span>
      </div>
    </div>
  );
}
