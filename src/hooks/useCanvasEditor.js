import { useRef, useEffect, useCallback } from 'react';
import {
  getCanvasPos, hitTest, makeRect, createField,
  drawFieldsOnEditor, buildFontStr,
} from '../utils/canvas';

export function useCanvasEditor({
  templateImg, templateOrigW, templateOrigH,
  fields, selectedFieldId, mode,
  onAddField, onUpdateField, onDeleteField, onSelectField, onSetMode,
  onDispSizeChange,
  showToast,
}) {
  const tCanvasRef = useRef(null);
  const sCanvasRef = useRef(null);
  const iCanvasRef = useRef(null);
  const outerRef   = useRef(null);

  const dispRef = useRef({ w: 0, h: 0 });

  // local drag state (no re-render needed)
  const drag = useRef({
    isDragging: false,
    dragFieldId: null,
    dragOffX: 0,
    dragOffY: 0,
    drawStart: null,
  });

  // ── build / resize canvas ──────────────────────────────────────
  const rebuildCanvas = useCallback(() => {
    if (!templateImg || !outerRef.current) return;
    const outer  = outerRef.current;
    const dispW  = outer.clientWidth;
    const dispH  = Math.round(dispW * (templateOrigH / templateOrigW));
    dispRef.current = { w: dispW, h: dispH };
    onDispSizeChange?.({ w: dispW, h: dispH });

    [tCanvasRef.current, sCanvasRef.current, iCanvasRef.current].forEach(c => {
      if (!c) return;
      c.width        = dispW;
      c.height       = dispH;
      c.style.width  = dispW + 'px';
      c.style.height = dispH + 'px';
    });

    const tCtx = tCanvasRef.current?.getContext('2d');
    if (tCtx) drawFieldsOnEditor(tCtx, tCanvasRef.current, templateImg, fields, selectedFieldId);
  }, [templateImg, templateOrigW, templateOrigH, fields, selectedFieldId, onDispSizeChange]);

  // ── redraw whenever fields / selection change ──────────────────
  const redraw = useCallback(() => {
    const tCtx = tCanvasRef.current?.getContext('2d');
    if (!tCtx || !templateImg) return;
    drawFieldsOnEditor(tCtx, tCanvasRef.current, templateImg, fields, selectedFieldId);
  }, [templateImg, fields, selectedFieldId]);

  useEffect(() => { redraw(); }, [redraw]);

  // ── mouse handlers ─────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    const iCanvas = iCanvasRef.current;
    if (!iCanvas) return;
    const pos = getCanvasPos(iCanvas, e);
    const d   = drag.current;

    if (mode === 'draw') {
      d.drawStart  = pos;
      d.isDragging = true;
    } else if (mode === 'move') {
      const f = hitTest(fields, pos.x, pos.y);
      if (f) {
        d.dragFieldId = f.id;
        d.dragOffX    = pos.x - f.x;
        d.dragOffY    = pos.y - f.y;
        d.isDragging  = true;
        onSelectField(f.id);
      } else {
        onSelectField(null);
      }
    } else if (mode === 'delete') {
      const f = hitTest(fields, pos.x, pos.y);
      if (f) {
        onDeleteField(f.id);
        showToast('Field deleted.');
      }
    }
  }, [mode, fields, onSelectField, onDeleteField, showToast]);

  const onMouseMove = useCallback((e) => {
    const iCanvas = iCanvasRef.current;
    const sCanvas = sCanvasRef.current;
    if (!iCanvas) return;
    const pos = getCanvasPos(iCanvas, e);
    const d   = drag.current;

    if (!d.isDragging) {
      if (mode === 'move') {
        iCanvas.style.cursor = hitTest(fields, pos.x, pos.y) ? 'move' : 'default';
      }
      return;
    }

    if (mode === 'draw' && d.drawStart) {
      const r    = makeRect(d.drawStart, pos);
      const sCtx = sCanvas?.getContext('2d');
      redraw();
      if (sCtx) {
        sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
        sCtx.strokeStyle = '#c8a96e';
        sCtx.lineWidth   = 2;
        sCtx.setLineDash([5, 4]);
        sCtx.strokeRect(r.x, r.y, r.w, r.h);
        sCtx.fillStyle = 'rgba(200,169,110,0.09)';
        sCtx.fillRect(r.x, r.y, r.w, r.h);
        sCtx.setLineDash([]);
      }
    } else if (mode === 'move' && d.dragFieldId) {
      onUpdateField(d.dragFieldId, {
        x: pos.x - d.dragOffX,
        y: pos.y - d.dragOffY,
      });
    }
  }, [mode, fields, redraw, onUpdateField]);

  const onMouseUp = useCallback((e) => {
    const iCanvas = iCanvasRef.current;
    const sCanvas = sCanvasRef.current;
    const d       = drag.current;
    if (!d.isDragging) return;
    d.isDragging = false;

    if (mode === 'draw' && d.drawStart && iCanvas) {
      const pos = getCanvasPos(iCanvas, e);
      const r   = makeRect(d.drawStart, pos);
      d.drawStart = null;
      const sCtx = sCanvas?.getContext('2d');
      if (sCtx) sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);

      if (r.w > 18 && r.h > 12) {
        const nf = createField(fields.length, r);
        onAddField(nf);
        onSelectField(nf.id);
        showToast('Field added. Configure it in the panel →');
      }
    }

    d.dragFieldId = null;
    redraw();
  }, [mode, fields, onAddField, onSelectField, redraw, showToast]);

  // ── resize observer ────────────────────────────────────────────
  useEffect(() => {
    if (!outerRef.current) return;
    const ro = new ResizeObserver(() => rebuildCanvas());
    ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, [rebuildCanvas]);

  // trigger rebuild when entering step 2
  const triggerRebuild = useCallback(() => {
    setTimeout(rebuildCanvas, 40);
  }, [rebuildCanvas]);

  return {
    tCanvasRef, sCanvasRef, iCanvasRef, outerRef,
    onMouseDown, onMouseMove, onMouseUp,
    triggerRebuild,
    dispSize: dispRef,
  };
}
