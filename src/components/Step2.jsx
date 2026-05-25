import { useEffect } from 'react';
import { useCanvasEditor } from '../hooks/useCanvasEditor';
import FieldConfigPanel from './FieldConfigPanel';

export default function Step2({
  templateImg, templateOrigW, templateOrigH,
  fields, selectedFieldId, mode,
  actions, showToast, onBack, onNext, onDispSizeChange,
}) {
  const {
    tCanvasRef, sCanvasRef, iCanvasRef, outerRef,
    onMouseDown, onMouseMove, onMouseUp,
    triggerRebuild,
  } = useCanvasEditor({
    templateImg, templateOrigW, templateOrigH,
    fields, selectedFieldId, mode,
    onAddField:    actions.addField,
    onUpdateField: actions.updateField,
    onDeleteField: actions.deleteField,
    onSelectField: actions.setSelectedField,
    onSetMode:     actions.setMode,
    onDispSizeChange,
    showToast,
  });

  useEffect(() => { triggerRebuild(); }, [triggerRebuild]);

  const selectedField = fields.find(f => f.id === selectedFieldId) || null;
  const cursorStyle   = mode === 'draw' ? 'crosshair' : mode === 'delete' ? 'pointer' : 'default';

  return (
    <div className="panel">
      <div className="section-title">Define Text Fields</div>
      <div className="section-sub">Draw boxes directly on the certificate where each field should appear, then configure name and style.</div>

      <div className="editor-layout">
        {/* Canvas area */}
        <div className="canvas-wrapper">
          <div className="canvas-toolbar">
            <span className="toolbar-label">MODE:</span>
            {['draw','move','delete'].map(m => (
              <button
                key={m}
                className={`toolbar-btn ${mode === m ? 'active' : ''}`}
                onClick={() => actions.setMode(m)}
              >
                {m === 'draw' ? 'Draw Field' : m === 'move' ? 'Move' : 'Delete'}
              </button>
            ))}
            <span style={{ flex: 1 }} />
            <span className="toolbar-label">
              {fields.length} field{fields.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="canvas-outer" ref={outerRef}>
            <canvas ref={tCanvasRef} />
            <canvas ref={sCanvasRef} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none' }} />
            <canvas
              ref={iCanvasRef}
              style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', zIndex:5, cursor:cursorStyle }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-card">
            <h3>Fields</h3>
            <div className="field-list">
              {fields.length === 0 && (
                <div className="info-msg">Draw a rectangle on the template to create a text field zone.</div>
              )}
              {fields.map(f => (
                <div
                  key={f.id}
                  className={`field-chip ${f.id === selectedFieldId ? 'selected' : ''}`}
                  onClick={() => { actions.setSelectedField(f.id); actions.setMode('move'); }}
                >
                  <span className="field-chip-name">{f.name}</span>
                  <span
                    className="field-chip-del"
                    onClick={e => { e.stopPropagation(); actions.deleteField(f.id); }}
                  >×</span>
                </div>
              ))}
            </div>
          </div>

          {selectedField && (
            <FieldConfigPanel field={selectedField} onUpdate={actions.updateField} />
          )}

          <div className="btn-row" style={{ justifyContent: 'space-between' }}>
            <button className="btn-secondary" onClick={onBack}>← Back</button>
            <button className="btn-primary" disabled={fields.length === 0} onClick={onNext}>
              Next: Upload Data →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
