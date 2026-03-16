const stageDescriptions = {
  0: {
    title: '읽기 연습 시간',
    description: '자음/모음을 소리와 함께 읽어보며 귀를 먼저 익혀요.'
  },
  1: {
    title: '단어 읽기 시간',
    description: '그림과 단어를 함께 보고 천천히 또박또박 읽어요.'
  }
};

const StageFocusPanel = ({ activeStage, lesson, onPlayText, onGoNext }) => {
  const stageInfo = stageDescriptions[activeStage] ?? stageDescriptions[0];
  const items = activeStage === 0 ? lesson?.letters ?? [] : lesson?.words ?? [];

  return (
    <article className="panel stage-focus-panel">
      <h2>{stageInfo.title}</h2>
      <p>{stageInfo.description}</p>

      <div className="cards">
        {items.map((item) => (
          <button key={item} type="button" className="card" onClick={() => onPlayText(item)}>
            <span>{item}</span>
            <small>소리 듣기</small>
          </button>
        ))}
      </div>

      <button type="button" className="next-stage-button" onClick={onGoNext}>
        다음 단계로 이동
      </button>
    </article>
  );
};

export default StageFocusPanel;
