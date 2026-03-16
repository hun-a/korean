const LessonCompletePanel = ({ onRestart, onGoStageOne }) => (
  <article className="panel complete-panel">
    <h2>오늘 공부 완료</h2>
    <p>오늘 공부는 모두 완료했어요. 🥳</p>
    <p>정말 잘했어요! 다음 회차도 도전해봐요.</p>

    <div className="complete-actions">
      <button type="button" onClick={onRestart}>
        다시 연습하기
      </button>
      <button type="button" onClick={onGoStageOne}>
        1단계로 이동
      </button>
    </div>
  </article>
);

export default LessonCompletePanel;
