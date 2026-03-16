const CelebrationOverlay = ({ visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="celebrate" role="status" aria-live="polite">
      <p>잘했어요!</p>
      <div className="confetti confetti-1" />
      <div className="confetti confetti-2" />
      <div className="confetti confetti-3" />
      <div className="confetti confetti-4" />
    </div>
  );
};

export default CelebrationOverlay;
