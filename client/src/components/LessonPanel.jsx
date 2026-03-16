const LessonPanel = ({ isLoading, errorMessage, lesson, activeStage, onPlayText }) => {
  const cardItems = activeStage === 0 ? lesson?.letters ?? [] : lesson?.words ?? [];

  return (
    <article className="panel learning-panel">
      {isLoading && <p>강의를 불러오는 중...</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}
      {!isLoading && !errorMessage && lesson && (
        <>
          <h2>{lesson.stages?.[activeStage]?.title || '오늘 학습'}</h2>
          <ul className="activity-list">
            {(lesson.stages?.[activeStage]?.activities ?? []).map((activity) => (
              <li key={activity}>
                <button type="button" onClick={() => onPlayText(activity)}>
                  듣기
                </button>
                {activity}
              </li>
            ))}
          </ul>

          <div className="cards">
            {cardItems.map((item) => (
              <button key={item} type="button" className="card" onClick={() => onPlayText(item)}>
                <span>{item}</span>
                <small>눌러서 듣기</small>
              </button>
            ))}
          </div>
        </>
      )}
    </article>
  );
};

export default LessonPanel;
