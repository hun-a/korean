const STAGE_LABELS = ['1단계 읽기', '2단계 단어', '3단계 따라쓰기'];

const StageTabs = ({ activeStage, onChange }) => (
  <section className="stage-tabs" aria-label="학습 단계">
    {STAGE_LABELS.map((label, index) => (
      <button
        key={label}
        className={index === activeStage ? 'stage-tab active' : 'stage-tab'}
        onClick={() => onChange(index)}
        type="button"
      >
        {label}
      </button>
    ))}
  </section>
);

export default StageTabs;
