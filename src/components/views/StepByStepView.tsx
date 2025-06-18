import React, { useState, useMemo, useEffect } from "react";
import { ComparisonResults, FormData, GeneralInputs, BuyingInputs, RentingInputs, InvestmentInputs } from "@/lib/types";
import GeneralInputsStep from "@/components/step-by-step/GeneralInputsStep";
import BuyingInputsStep from "@/components/step-by-step/BuyingInputsStep";
import RentingInputsStep from "@/components/step-by-step/RentingInputsStep";
import InvestmentInputsStep from "@/components/step-by-step/InvestmentInputsStep";
import ResultsStep from "@/components/step-by-step/ResultsStep";

type Step = 'buying' | 'renting' | 'investment' | 'general' | 'results';

interface StepByStepViewProps {
  formData: FormData;
  results: ComparisonResults | null;
  validationError: string | null;
  onGeneralChange: (general: GeneralInputs) => void;
  onBuyingChange: (buying: BuyingInputs) => void;
  onRentingChange: (renting: RentingInputs) => void;
  onInvestmentChange: (investment: InvestmentInputs) => void;
  onReset: () => void;
  onCalculate: () => void;
}

const StepByStepView: React.FC<StepByStepViewProps> = ({
  formData,
  results,
  validationError,
  onGeneralChange,
  onBuyingChange,
  onRentingChange,
  onInvestmentChange,
  onReset,
  onCalculate,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('buying');

  useEffect(() => {
    if (results && currentStep !== 'results') {
      setCurrentStep('results');
    }
  }, [results, currentStep]);

  const goToNextStep = () => {
    switch (currentStep) {
      case 'buying':
        setCurrentStep('renting');
        break;
      case 'renting':
        setCurrentStep('investment');
        break;
      case 'investment':
        setCurrentStep('general');
        break;
      case 'general':
        onCalculate();
        break;
      default:
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'renting':
        setCurrentStep('buying');
        break;
      case 'investment':
        setCurrentStep('renting');
        break;
      case 'general':
        setCurrentStep('investment')
        break;
      case 'results':
        setCurrentStep('general');
        break;
      default:
        break;
    }
  };
  
  const handleResetAndGoToStart = () => {
      onReset();
      setCurrentStep('buying');
  }

  const canProceed = useMemo(() => {
    const { general, buying } = formData;
    const downPaymentAmount = buying.housePrice * (buying.downPaymentPercent / 100);
    if (general.useIncomeAndSavings && general.currentSavings < downPaymentAmount) {
      return false;
    }
    return !validationError;
  }, [formData, validationError]);

  if (currentStep === 'results' && results) {
      return (
          <ResultsStep
            results={results}
            onReset={handleResetAndGoToStart}
            onPrevious={goToPreviousStep}
            formData={formData}
          />
      )
  }

  return (
    <div>
      {currentStep === 'buying' && (
        <BuyingInputsStep
          values={formData.buying}
          onChange={onBuyingChange}
          formData={formData}
          validationError={validationError}
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          canProceed={canProceed}
          currentStep={currentStep}
        />
      )}
      {currentStep === 'renting' && (
        <RentingInputsStep
          values={formData.renting}
          onChange={onRentingChange}
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          canProceed={true}
          currentStep={currentStep}
        />
      )}
      {currentStep === 'investment' && (
        <InvestmentInputsStep
          values={formData.investment}
          onChange={onInvestmentChange}
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          canProceed={true}
          currentStep={currentStep}
        />
      )}
       {currentStep === 'general' && (
          <GeneralInputsStep
            values={formData.general}
            onChange={onGeneralChange}
            formData={formData}
            validationError={validationError}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            canProceed={canProceed}
            currentStep={currentStep}
          />
        )}
    </div>
  );
};

export default StepByStepView;