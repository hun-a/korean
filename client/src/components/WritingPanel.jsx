import { CANVAS_SIZE } from '../lib/traceCanvas';

const feedbackTextMap = {
  idle: '글자를 보고 천천히 따라 써 보세요.',
  success: '정답이에요! 정말 잘했어요.',
  retry: '조금만 더 천천히, 다시 써볼까요?'
};

const WritingPanel = ({
  target,
  writingResult,
  guideCanvasRef,
  drawCanvasRef,
  onStartStroke,
  onDrawStroke,
  onEndStroke,
  onPlayText,
  onGrade,
  onClear,
  onNext
}) => (
  <article className="panel writing-panel">
    <div className="canvas-header">
      <h2>따라 쓰기</h2>
      <div className="target-chip">목표 글자: {target}</div>
    </div>

    <div className="canvas-stack">
      <canvas ref={guideCanvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="guide-canvas" />
      <canvas
        ref={drawCanvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="draw-canvas"
        onPointerDown={onStartStroke}
        onPointerMove={onDrawStroke}
        onPointerUp={onEndStroke}
        onPointerLeave={onEndStroke}
        onPointerCancel={onEndStroke}
      />
    </div>

    <div className="canvas-actions">
      <button type="button" onClick={() => onPlayText(target)}>
        글자 듣기
      </button>
      <button type="button" onClick={onGrade}>
        확인하기
      </button>
      <button type="button" onClick={onClear}>
        다시 쓰기
      </button>
      <button type="button" onClick={onNext}>
        다음 글자
      </button>
    </div>

    <p className={`writing-feedback ${writingResult}`}>{feedbackTextMap[writingResult]}</p>
  </article>
);

export default WritingPanel;
