import { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { useToast } from './hooks/useToast';
import Header from './components/Header';
import StepNav from './components/StepNav';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Toast from './components/Toast';

export default function App() {
  const { state, actions } = useAppStore();
  const { toast, showToast } = useToast();
  const [templateSrc, setTemplateSrc] = useState(null);
  // Track canvas display dimensions for accurate field rendering in Step4
  const [dispSize, setDispSize] = useState({ w: 0, h: 0 });

  function handleTemplate(img, w, h, src) {
    actions.setTemplate(img, w, h);
    setTemplateSrc(src);
  }

  function goToStep(n) {
    if (n === 2 && !state.templateImg)        { showToast('Please upload a template first.');   return; }
    if (n === 3 && state.fields.length === 0)  { showToast('Define at least one field first.'); return; }
    if (n === 4 && state.excelData.length === 0) { showToast('Please upload Excel data first.');  return; }
    actions.setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <Header allTimeCount={state.allTimeCount} />
      <StepNav currentStep={state.currentStep} />

      {state.currentStep === 1 && (
        <Step1
          templateImg={state.templateImg}
          templateOrigW={state.templateOrigW}
          templateOrigH={state.templateOrigH}
          templateSrc={templateSrc}
          onTemplate={handleTemplate}
          onNext={() => goToStep(2)}
          showToast={showToast}
        />
      )}

      {state.currentStep === 2 && (
        <Step2
          templateImg={state.templateImg}
          templateOrigW={state.templateOrigW}
          templateOrigH={state.templateOrigH}
          fields={state.fields}
          selectedFieldId={state.selectedFieldId}
          mode={state.mode}
          actions={actions}
          showToast={showToast}
          onBack={() => goToStep(1)}
          onNext={() => goToStep(3)}
          onDispSizeChange={setDispSize}
        />
      )}

      {state.currentStep === 3 && (
        <Step3
          fields={state.fields}
          excelData={state.excelData}
          onExcelData={actions.setExcelData}
          showToast={showToast}
          onBack={() => goToStep(2)}
          onNext={() => goToStep(4)}
        />
      )}

      {state.currentStep === 4 && (
        <Step4
          templateImg={state.templateImg}
          templateOrigW={state.templateOrigW}
          templateOrigH={state.templateOrigH}
          fields={state.fields}
          excelData={state.excelData}
          allTimeCount={state.allTimeCount}
          canvasDispW={dispSize.w || state.templateOrigW}
          canvasDispH={dispSize.h || state.templateOrigH}
          onIncrementAllTime={actions.incrementAllTime}
          showToast={showToast}
          onBack={() => goToStep(3)}
        />
      )}

      <Toast toast={toast} />
    </>
  );
}
