'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

type Props = {
  enabled: boolean;
  width: number;
  height: number;
  color?: string;
  lineWidth?: number;
};

export type DrawLayerRef = {
  undo: () => void;
  redo: () => void;
  clear: () => void;
};

export default forwardRef<DrawLayerRef, Props>(({ enabled, width, height, color = '#ff0000', lineWidth = 2 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  const undoStack = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoStack.current = [];
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !undoStack.current.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const prev = undoStack.current.pop()!;
    ctx.putImageData(prev, 0, 0);
  }, []);

  const redo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !redoStack.current.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const next = redoStack.current.pop()!;
    ctx.putImageData(next, 0, 0);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [saveState]);

  useImperativeHandle(ref, () => ({ undo, redo, clear: clearCanvas }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const onDown = (e: MouseEvent) => {
      saveState();
      drawing.current = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const onMove = (e: MouseEvent) => {
      if (!drawing.current) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    };

    const onUp = () => {
      drawing.current = false;
      ctx.closePath();
    };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [enabled, color, lineWidth, saveState]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: enabled ? 'auto' : 'none',
        cursor: enabled ? 'crosshair' : 'default',
        zIndex: 1,
      }}
    />
  );
}
);
