import { useCallback, useEffect, useRef } from 'react';
import { CANVAS_SIZE, drawGuideText } from '../lib/traceCanvas';

export const useDrawingCanvas = (targetText, lessonDay, isCanvasVisible) => {
  const guideCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    if (!isCanvasVisible) {
      return;
    }

    const guideCanvas = guideCanvasRef.current;
    const drawCanvas = drawCanvasRef.current;
    if (!guideCanvas || !drawCanvas || !targetText) {
      return;
    }

    drawGuideText(guideCanvas, targetText, lessonDay);
    const context = drawCanvas.getContext('2d');
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    context.lineWidth = 16;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#ff7a2b';
  }, [targetText, lessonDay, isCanvasVisible]);

  const toCanvasPoint = useCallback((event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }, []);

  const startStroke = useCallback((event) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    const point = toCanvasPoint(event, canvas);

    drawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  }, [toCanvasPoint]);

  const drawStroke = useCallback((event) => {
    if (!drawingRef.current) {
      return;
    }

    const canvas = drawCanvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    const point = toCanvasPoint(event, canvas);

    context.lineTo(point.x, point.y);
    context.stroke();
  }, [toCanvasPoint]);

  const endStroke = useCallback(() => {
    drawingRef.current = false;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.getContext('2d').clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, []);

  return {
    guideCanvasRef,
    drawCanvasRef,
    startStroke,
    drawStroke,
    endStroke,
    clearCanvas
  };
};
