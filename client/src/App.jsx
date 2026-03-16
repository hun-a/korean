import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchLesson } from './api';
import CelebrationOverlay from './components/CelebrationOverlay';
import LessonCompletePanel from './components/LessonCompletePanel';
import StageFocusPanel from './components/StageFocusPanel';
import StageTabs from './components/StageTabs';
import WritingPanel from './components/WritingPanel';
import { useDrawingCanvas } from './hooks/useDrawingCanvas';
import { usePrebuiltAudio } from './hooks/usePrebuiltAudio';
import { getCanvasScore, getTraceTargets } from './lib/traceCanvas';
import clapSound from '../clap.mp3';

const App = () => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [lesson, setLesson] = useState(null);
  const [activeStage, setActiveStage] = useState(0);
  const [traceIndex, setTraceIndex] = useState(0);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [writingResult, setWritingResult] = useState('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [celebrate, setCelebrate] = useState(false);

  const traceTargets = useMemo(() => getTraceTargets(lesson), [lesson]);
  const currentTraceTarget = traceTargets[traceIndex] ?? traceTargets[0];

  const {
    guideCanvasRef,
    drawCanvasRef,
    startStroke,
    drawStroke,
    endStroke,
    clearCanvas
  } = useDrawingCanvas(currentTraceTarget, selectedDay, activeStage === 2);

  const onAudioError = useCallback((message) => {
    setErrorMessage(message);
  }, []);

  const { availableAudioDays, playText } = usePrebuiltAudio({ onError: onAudioError });

  const loadLesson = useCallback(
    async (day) => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const payload = await fetchLesson(day);
        setLesson(payload);
        setTraceIndex(0);
        setIsLessonComplete(false);
        setActiveStage(0);
        setWritingResult('idle');
        clearCanvas();
      } catch (error) {
        setErrorMessage(error.message);
        setLesson(null);
      } finally {
        setIsLoading(false);
      }
    },
    [clearCanvas]
  );

  useEffect(() => {
    loadLesson(selectedDay);
  }, [selectedDay, loadLesson]);

  useEffect(() => {
    if (!celebrate) {
      return;
    }

    const clapAudio = new Audio(clapSound);
    clapAudio.play().catch(() => {});

    const timer = setTimeout(() => setCelebrate(false), 1800);
    return () => clearTimeout(timer);
  }, [celebrate]);

  const gradeDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas || !currentTraceTarget) {
      return;
    }

    const hiddenScore = getCanvasScore(canvas, currentTraceTarget);
    if (hiddenScore >= 60) {
      setWritingResult('success');
      setCelebrate(true);
      return;
    }

    setWritingResult('retry');
    playText('다시 써보세요', { force: true });
  };

  const resetDrawing = () => {
    clearCanvas();
    setWritingResult('idle');
  };

  const restartWritingLesson = () => {
    setTraceIndex(0);
    setIsLessonComplete(false);
    resetDrawing();
  };

  const nextTrace = () => {
    if (traceTargets.length === 0) {
      setIsLessonComplete(true);
      setCelebrate(true);
      return;
    }

    const isLastTrace = traceIndex >= traceTargets.length - 1;
    if (isLastTrace) {
      setIsLessonComplete(true);
      setCelebrate(true);
      return;
    }

    setTraceIndex((previous) => previous + 1);
    resetDrawing();
  };

  const hasAudioForDay = availableAudioDays.length === 0 || availableAudioDays.includes(selectedDay);

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">한글 15분 MVP</p>
          <h1>{lesson?.title || '한글 학습'}</h1>
          <p>5분 읽기 + 5분 단어 읽기 + 5분 따라쓰기, 오늘도 완료해봐요.</p>
          {!hasAudioForDay && <p className="error">이 회차 오디오는 아직 준비 중이에요.</p>}
        </div>
        <label className="day-picker" htmlFor="lessonDay">
          회차
          <select
            id="lessonDay"
            value={selectedDay}
            onChange={(event) => setSelectedDay(Number.parseInt(event.target.value, 10))}
          >
            {Array.from({ length: 30 }, (_, index) => index + 1).map((day) => (
              <option
                key={day}
                value={day}
                disabled={availableAudioDays.length > 0 && !availableAudioDays.includes(day)}
              >
                {day}일차
              </option>
            ))}
          </select>
        </label>
      </header>

      <StageTabs activeStage={activeStage} onChange={setActiveStage} />

      <section className="content-grid single-panel">
        {activeStage === 2 ? (
          isLessonComplete ? (
            <LessonCompletePanel
              onRestart={restartWritingLesson}
              onGoStageOne={() => setActiveStage(0)}
            />
          ) : (
            <WritingPanel
              target={currentTraceTarget}
              writingResult={writingResult}
              guideCanvasRef={guideCanvasRef}
              drawCanvasRef={drawCanvasRef}
              onStartStroke={startStroke}
              onDrawStroke={drawStroke}
              onEndStroke={endStroke}
              onPlayText={playText}
              onGrade={gradeDrawing}
              onClear={resetDrawing}
              onNext={nextTrace}
            />
          )
        ) : (
          <StageFocusPanel
            activeStage={activeStage}
            lesson={lesson}
            onPlayText={playText}
            onGoNext={() => setActiveStage((previous) => Math.min(previous + 1, 2))}
          />
        )}
      </section>

      <CelebrationOverlay visible={celebrate} />
    </main>
  );
};

export default App;
