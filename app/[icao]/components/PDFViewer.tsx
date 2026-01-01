'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, IconButton, Paper, Typography } from '@mui/material';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { NavigateNext as NavigateNextIcon, NavigateBefore as NavigateBeforeIcon, RotateLeft as RotateLeftIcon, RotateRight as RotateRightIcon, Draw as DrawIcon, Undo as UndoIcon, Redo as RedoIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Chart } from '@/prisma/generated/client';
import { alpha, useTheme } from '@mui/material/styles';
import DrawLayer, { DrawLayerRef } from './DrawLayer';

type PdfJs = typeof import('pdfjs-dist');

export default function PDFViewer({ chart, theme }: { chart: Chart, theme: 'dark' | 'light' }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const muiTheme = useTheme();
  const drawLayerRef = useRef<DrawLayerRef>(null);
  const [pdfjs, setPdfjs] = useState<PdfJs | null>(null);
  const [pdfDoc, setPdfDoc] = useState<import('pdfjs-dist').PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [drawEnabled, setDrawEnabled] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });


  useEffect(() => {
    let mounted = true;

    const loadPdfJs = async () => {
      if (typeof window === 'undefined') return;
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      if (mounted) setPdfjs(pdfjsLib);
    };

    loadPdfJs();

    return () => { mounted = false };
  }, []);

  useEffect(() => {
    if (!pdfjs) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      const pdf = await pdfjs.getDocument(`/api/proxy?url=${encodeURIComponent(chart.url)}`).promise;

      if (!cancelled) {
        setPdfDoc(pdf);
        setCurrentPage(1);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfjs, chart.url]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;

    const render = async () => {
      const page = await pdfDoc.getPage(currentPage);
      if (cancelled) return;

      const viewport = page.getViewport({ scale: 3, rotation });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      setCanvasSize({ width: viewport.width, height: viewport.height });

      await page.render({ canvasContext: ctx, canvas, viewport }).promise;
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, currentPage, rotation]);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => {
    if (!pdfDoc) return;
    setCurrentPage((p) => Math.min(pdfDoc.numPages, p + 1));
  };

  if (!pdfjs || loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" width="100%" height="100%">
      <CircularProgress />
    </Box>;
  }

  const rotateLeft = () => setRotation((r) => ((r + 270) % 360) as 0 | 90 | 180 | 270);
  const rotateRight = () => setRotation((r) => ((r + 90) % 360) as 0 | 90 | 180 | 270);

  return (
    <Box flex={1} display="flex" flexDirection="column" alignItems="center">
      <TransformWrapper minScale={0.5} maxScale={4} panning={{ disabled: drawEnabled }} pinch={{ disabled: drawEnabled }} wheel={{ disabled: drawEnabled }}>
        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
          <Paper sx={{ position: 'relative' }}>
            <canvas
              ref={canvasRef}
              style={{
                filter: theme === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'none',
                background: theme === 'dark' ? '#000' : '#fff',
                width: '100%',
                height: '100%',
              }}
            />
            <DrawLayer
              ref={drawLayerRef}
              enabled={drawEnabled}
              width={canvasSize.width}
              height={canvasSize.height}
            />
          </Paper>
        </TransformComponent>
      </TransformWrapper>

      <Box position="absolute" display="flex" gap={1} bottom={0} p={1}>
        <Box display="flex" alignItems="center" bgcolor={alpha(muiTheme.palette.text.primary, 0.08)} borderRadius={100}>
          <IconButton onClick={handlePrevPage}>
            <NavigateBeforeIcon />
          </IconButton>
          <Typography>Page {currentPage} of {pdfDoc?.numPages ?? 0}</Typography>
          <IconButton onClick={handleNextPage}>
            <NavigateNextIcon />
          </IconButton>
        </Box>
        <Box display="flex" alignItems="center" bgcolor={alpha(muiTheme.palette.text.primary, 0.08)} borderRadius={100}>
          <IconButton onClick={rotateLeft}>
            <RotateLeftIcon />
          </IconButton>
          <Typography>{rotation}°</Typography>
          <IconButton onClick={rotateRight}>
            <RotateRightIcon />
          </IconButton>
        </Box>
        <Box display="flex" alignItems="center" bgcolor={alpha(muiTheme.palette.text.primary, 0.08)} borderRadius={100}>
          <IconButton onClick={() => setDrawEnabled(v => !v)}>
            <DrawIcon />
          </IconButton>
          {drawEnabled && (
            <>
              <IconButton onClick={() => drawLayerRef.current.undo()}>
                <UndoIcon />
              </IconButton>
              <IconButton onClick={() => drawLayerRef.current.redo()}>
                <RedoIcon />
              </IconButton>
              <IconButton onClick={() => drawLayerRef.current.clear()}>
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
