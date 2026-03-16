export const CANVAS_SIZE = 360;

export const getTraceTargets = (lesson) => {
  const words = lesson?.words ?? [];
  const letters = lesson?.letters ?? [];

  if (letters.length > 0) {
    return letters.slice(0, 3);
  }

  if (words.length > 0) {
    return words.slice(0, 3);
  }

  return ['가', '나', '다'];
};

const getGuideFontSize = (targetText) => {
  const textLength = [...(targetText ?? '')].length;
  if (textLength >= 3) {
    return 110;
  }

  if (textLength === 2) {
    return 150;
  }

  return 220;
};

const getGuideOpacityByDay = (day) => {
  if (day <= 10) {
    return 0.58;
  }

  if (day <= 20) {
    return 0.4;
  }

  return 0.3;
};

export const drawGuideText = (canvas, targetText, day = 1) => {
  const context = canvas.getContext('2d');
  const fontSize = getGuideFontSize(targetText);
  const guideOpacity = getGuideOpacityByDay(day);
  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  context.fillStyle = '#eef6ff';
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  context.strokeStyle = '#d8e6ff';
  context.lineWidth = 1;
  context.setLineDash([8, 6]);
  context.beginPath();
  context.moveTo(CANVAS_SIZE / 2, 0);
  context.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE);
  context.moveTo(0, CANVAS_SIZE / 2);
  context.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2);
  context.stroke();
  context.setLineDash([]);

  context.font = `700 ${fontSize}px Gaegu, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = `rgba(14, 77, 146, ${guideOpacity})`;
  context.strokeStyle = `rgba(14, 77, 146, ${Math.min(guideOpacity + 0.18, 0.78)})`;
  context.lineWidth = 2.5;
  context.strokeText(targetText, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 12);
  context.fillText(targetText, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 12);
};

export const getCanvasScore = (drawingCanvas, targetText) => {
  const targetCanvas = document.createElement('canvas');
  const fontSize = getGuideFontSize(targetText);
  targetCanvas.width = CANVAS_SIZE;
  targetCanvas.height = CANVAS_SIZE;
  const targetContext = targetCanvas.getContext('2d');

  targetContext.font = `700 ${fontSize}px Gaegu, sans-serif`;
  targetContext.textAlign = 'center';
  targetContext.textBaseline = 'middle';
  targetContext.fillStyle = '#000';
  targetContext.fillText(targetText, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 20);

  const drawingContext = drawingCanvas.getContext('2d');
  const targetData = targetContext.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
  const drawingData = drawingContext.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

  let targetPixels = 0;
  let drawnPixels = 0;
  let overlapPixels = 0;

  for (let i = 3; i < targetData.length; i += 4) {
    const targetAlpha = targetData[i] > 40;
    const drawAlpha = drawingData[i] > 40;

    if (targetAlpha) {
      targetPixels += 1;
    }

    if (drawAlpha) {
      drawnPixels += 1;
    }

    if (targetAlpha && drawAlpha) {
      overlapPixels += 1;
    }
  }

  if (targetPixels === 0 || drawnPixels === 0) {
    return 0;
  }

  const overlapRatio = overlapPixels / targetPixels;
  const drawCoverage = overlapPixels / drawnPixels;
  return Math.round((overlapRatio * 0.7 + drawCoverage * 0.3) * 100);
};
