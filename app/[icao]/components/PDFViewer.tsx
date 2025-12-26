'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, IconButton, Paper, Typography } from '@mui/material';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { NavigateNext, NavigateBefore } from '@mui/icons-material';
import type { Chart } from '@/prisma/generated/client';

type PdfJs = typeof import('pdfjs-dist');

export default function PDFViewer({ chart, theme }: { chart: Chart, theme: 'dark' | 'light' }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [pdfjs, setPdfjs] = useState<PdfJs | null>(null);
  const [pdfDoc, setPdfDoc] = useState<import('pdfjs-dist').PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

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

      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, canvas, viewport }).promise;
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, currentPage]);

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

  return (
    <Box flex={1} display="flex" flexDirection="column" alignItems="center">
      <TransformWrapper minScale={0.5} maxScale={4}>
        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
          <Paper>
            <canvas
              ref={canvasRef}
              style={{
                filter: theme === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'none',
                background: theme === 'dark' ? '#000' : '#fff',
                width: '100%',
                height: '100%',
              }}
            />
          </Paper>
        </TransformComponent>
      </TransformWrapper>

      <Box position="absolute" bottom={0} p={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={handlePrevPage}>
            <NavigateBefore />
          </IconButton>
          <Typography>Page {currentPage} of {pdfDoc?.numPages ?? 0}</Typography>
          <IconButton onClick={handleNextPage}>
            <NavigateNext />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
