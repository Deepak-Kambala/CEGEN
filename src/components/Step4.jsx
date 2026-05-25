import { useRef, useEffect, useState, useCallback } from 'react';
import { renderFields } from '../utils/canvas';

export default function Step4({
  templateImg, templateOrigW, templateOrigH,
  fields, excelData, allTimeCount,
  canvasDispW, canvasDispH,
  onIncrementAllTime, showToast, onBack,
}) {
  const pCanvasRef = useRef(null);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [genCount,   setGenCount]   = useState(0);
  const [generating, setGenerating] = useState(false);
  const [log,        setLog]        = useState([{ type: 'info', msg: 'Ready to generate' }]);
  const [progress,   setProgress]   = useState(0);
  const [overlay,    setOverlay]    = useState({ show: false, msg: '' });

  const dispW = canvasDispW || templateOrigW;
  const dispH = canvasDispH || templateOrigH;

  const renderPreview = useCallback((idx) => {
    const canvas = pCanvasRef.current;
    if (!canvas || !templateImg || !excelData[idx]) return;
    const wrap  = canvas.parentElement;
    const maxW  = (wrap?.clientWidth || 800) - 28;
    const w     = Math.min(maxW, templateOrigW);
    const h     = Math.round(w * (templateOrigH / templateOrigW));
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(templateImg, 0, 0, w, h);
    renderFields(ctx, fields, excelData[idx], w, h, dispW, dispH);
  }, [templateImg, templateOrigW, templateOrigH, fields, excelData, dispW, dispH]);

  useEffect(() => { renderPreview(previewIdx); }, [renderPreview, previewIdx]);

  const appendLog = (type, msg) => setLog(prev => [...prev, { type, msg }]);

  async function generateAll() {
    if (generating) return;
    setGenerating(true);
    setGenCount(0);
    setProgress(0);
    setLog([{ type: 'info', msg: 'Starting generation...' }]);
    setOverlay({ show: true, msg: 'Preparing...' });

    const zip    = new window.JSZip();
    const total  = excelData.length;
    let done     = 0;

    const off    = document.createElement('canvas');
    off.width    = templateOrigW;
    off.height   = templateOrigH;
    const offCtx = off.getContext('2d');

    for (let i = 0; i < total; i++) {
      const row    = excelData[i];
      const colMap = {};
      Object.keys(row).forEach(k => { colMap[k.trim().toUpperCase()] = String(row[k]); });

      offCtx.clearRect(0, 0, templateOrigW, templateOrigH);
      offCtx.drawImage(templateImg, 0, 0, templateOrigW, templateOrigH);
      renderFields(offCtx, fields, row, templateOrigW, templateOrigH, dispW, dispH);

      const blob     = await new Promise(res => off.toBlob(res, 'image/png'));
      const rawName  = colMap['NAME'] || ('cert_' + (i + 1));
      const safeName = rawName.toString().replace(/[^a-zA-Z0-9_\- ]/g, '_').trim();
      zip.file(safeName + '_certificate.png', blob);
      done++;

      const pct = Math.round(done / total * 100);
      setProgress(pct);
      setGenCount(done);
      setOverlay({ show: true, msg: `Generating ${done} / ${total}...` });
      appendLog('ok', `${safeName} (${done}/${total})`);

      if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
    }

    setOverlay({ show: true, msg: 'Compressing ZIP...' });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a   = document.createElement('a');
    a.href = url; a.download = 'CEGEN_Certificates.zip'; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);

    onIncrementAllTime(total);
    setOverlay({ show: false, msg: '' });
    setGenerating(false);
    appendLog('info', `Done. ${total} certificates generated.`);
    showToast(`${total} certificates downloaded as ZIP.`);
  }

  const showPages = Math.min(excelData.length, 10);

  return (
    <>
      {overlay.show && (
        <div className="overlay show">
          <div className="spinner" />
          <div className="overlay-msg">{overlay.msg}</div>
        </div>
      )}

      <div className="panel">
        <div className="section-title">Generate Certificates</div>
        <div className="section-sub">Preview each certificate, then generate and download all as a ZIP file.</div>

        <div className="gen-layout">
          <div className="preview-canvas-wrap">
            <canvas ref={pCanvasRef} style={{ maxWidth: '100%', borderRadius: 5, boxShadow: '0 6px 30px rgba(0,0,0,0.5)' }} />
            {excelData.length > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => setPreviewIdx(p => Math.max(0, p - 1))}>‹</button>
                {Array.from({ length: showPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-btn ${i === previewIdx ? 'active' : ''}`}
                    onClick={() => setPreviewIdx(i)}
                  >{i + 1}</button>
                ))}
                {excelData.length > 10 && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    + {excelData.length - 10} more
                  </span>
                )}
                <button className="page-btn" onClick={() => setPreviewIdx(p => Math.min(showPages - 1, p + 1))}>›</button>
              </div>
            )}
          </div>

          <div className="gen-controls">
            <div className="stat-card">
              <div className="big-num">{excelData.length}</div>
              <div className="stat-label">Certificates to Generate</div>
            </div>
            <div className="stat-card">
              <div className="big-num" style={{ color: 'var(--green)' }}>{genCount}</div>
              <div className="stat-label">Generated This Session</div>
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: progress + '%' }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="big-num" style={{ color: 'var(--gold2)' }}>{allTimeCount}</div>
              <div className="stat-label">All-Time Certificates</div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              onClick={generateAll}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate All & Download ZIP'}
            </button>

            <div className="gen-log">
              {log.map((entry, i) => (
                <div key={i} className={`log-${entry.type}`}>{entry.msg}</div>
              ))}
            </div>

            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={onBack}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
