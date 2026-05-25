// ── Font ──────────────────────────────────────────────────────────
export function buildFontStr(f, size) {
  let s = '';
  if (f.italic) s += 'italic ';
  if (f.bold)   s += 'bold ';
  return `${s}${size}px ${f.font}`;
}

// ── Geometry ──────────────────────────────────────────────────────
export function makeRect(a, b) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  };
}

export function hitTest(fields, x, y) {
  for (let i = fields.length - 1; i >= 0; i--) {
    const f = fields[i];
    if (x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h) return f;
  }
  return null;
}

export function getCanvasPos(canvas, e) {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  };
}

// ── Rendering ─────────────────────────────────────────────────────
export function renderFields(ctx, fields, row, targetW, targetH, canvasDispW, canvasDispH) {
  const sx = targetW / canvasDispW;
  const sy = targetH / canvasDispH;

  const colMap = {};
  Object.keys(row).forEach(k => { colMap[k.trim().toUpperCase()] = String(row[k]); });

  fields.forEach(f => {
    const val = colMap[f.name.trim().toUpperCase()] || '';
    if (!val) return;

    const fx = f.x * sx;
    const fy = f.y * sy;
    const fw = f.w * sx;
    const fh = f.h * sy;

    let sz = Math.round(f.size * sx);
    sz = Math.max(6, Math.min(sz, Math.round(fh * 0.85)));
    ctx.font = buildFontStr(f, sz);

    let mw = ctx.measureText(val).width;
    while (mw > fw - 6 && sz > 6) {
      sz--;
      ctx.font = buildFontStr(f, sz);
      mw = ctx.measureText(val).width;
    }

    ctx.fillStyle    = f.color;
    ctx.textBaseline = 'middle';
    ctx.textAlign    = f.align;

    let tx;
    if      (f.align === 'center') tx = fx + fw / 2;
    else if (f.align === 'left')   tx = fx + 5;
    else                           tx = fx + fw - 5;

    const ty = fy + fh / 2;
    ctx.fillText(val, tx, ty);

    if (f.underline) {
      const tw = ctx.measureText(val).width;
      const uy = ty + sz * 0.12;
      const ux = f.align === 'center' ? tx - tw / 2 : f.align === 'left' ? tx : tx - tw;
      ctx.strokeStyle = f.color;
      ctx.lineWidth   = Math.max(1, sz * 0.06);
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(ux, uy);
      ctx.lineTo(ux + tw, uy);
      ctx.stroke();
    }
  });
}

export function drawFieldsOnEditor(ctx, canvas, templateImg, fields, selectedFieldId) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

  fields.forEach(f => {
    const isSel = f.id === selectedFieldId;
    ctx.strokeStyle = isSel ? '#c8a96e' : 'rgba(200,169,110,0.55)';
    ctx.lineWidth   = isSel ? 2.5 : 1.5;
    ctx.setLineDash(isSel ? [] : [4, 3]);
    ctx.strokeRect(f.x, f.y, f.w, f.h);
    ctx.fillStyle = isSel ? 'rgba(200,169,110,0.1)' : 'rgba(200,169,110,0.03)';
    ctx.fillRect(f.x, f.y, f.w, f.h);
    ctx.setLineDash([]);

    // Live preview text
    const sampleText = f.name || 'Sample';
    let previewSize  = Math.min(f.size, Math.round(f.h * 0.55));
    previewSize      = Math.max(8, previewSize);
    ctx.font         = buildFontStr(f, previewSize);

    let mw = ctx.measureText(sampleText).width;
    while (mw > f.w - 8 && previewSize > 7) {
      previewSize--;
      ctx.font = buildFontStr(f, previewSize);
      mw = ctx.measureText(sampleText).width;
    }

    ctx.fillStyle    = f.color;
    ctx.textBaseline = 'middle';
    ctx.textAlign    = 'center';
    ctx.fillText(sampleText, f.x + f.w / 2, f.y + f.h / 2);

    ctx.font      = 'bold 10px "DM Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = isSel ? '#c8a96e' : 'rgba(200,169,110,0.75)';
    ctx.fillText(f.name, f.x + 3, f.y + 11);
  });
}

// ── File Reading ──────────────────────────────────────────────────
export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => resolve({ img, src: ev.target.result });
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function loadExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const wb   = window.XLSX.read(ev.target.result, { type: 'binary' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(ws, { defval: '' });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

// ── Default field factory ─────────────────────────────────────────
export function createField(count, rect) {
  return {
    id:        Date.now(),
    name:      `FIELD_${count + 1}`,
    x: rect.x, y: rect.y,
    w: rect.w,  h: rect.h,
    font:      "'DM Sans', sans-serif",
    size:      32,
    bold:      false,
    italic:    false,
    underline: false,
    color:     '#1a1a1a',
    align:     'center',
  };
}
