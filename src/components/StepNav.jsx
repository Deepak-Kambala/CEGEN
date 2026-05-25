const STEPS = ['Template', 'Fields', 'Data', 'Generate'];

export default function StepNav({ currentStep }) {
  return (
    <div className="steps-nav">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const cls = n < currentStep ? 'done' : n === currentStep ? 'active' : '';
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`step-item ${cls}`}>
              <div className="step-circle">
                {n < currentStep ? '✓' : n}
              </div>
              <div className="step-label">{label}</div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${n < currentStep ? 'done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
