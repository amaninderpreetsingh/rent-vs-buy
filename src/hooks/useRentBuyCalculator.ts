import { useState, useEffect, useCallback } from "react";
import { BuyingInputs, ComparisonResults, FormData, GeneralInputs, InvestmentInputs, RentingInputs, Step } from "@/lib/types";
import { calculateComparison } from "@/lib/calculations";
import { toast } from "@/components/ui/use-toast";
import { defaultFormData, calculateDownPayment, validateDownPayment } from "@/lib/defaults";

export const useRentBuyCalculator = () => {
  const [formData, setFormData] = useState<FormData>({ ...defaultFormData });
  const [results, setResults] = useState<ComparisonResults | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('buying');

  // Run validation whenever relevant fields change
  useEffect(() => {
    const error = validateDownPayment(
      formData.general.useIncomeAndSavings,
      formData.general.currentSavings,
      formData.buying.housePrice,
      formData.buying.downPaymentPercent
    );
    setValidationError(error);
  }, [
    formData.general.useIncomeAndSavings,
    formData.general.currentSavings,
    formData.buying.housePrice,
    formData.buying.downPaymentPercent
  ]);

  // Form update handlers
  const handleGeneralChange = (general: GeneralInputs) => {
    setFormData(prev => ({ ...prev, general }));
  };

  const handleBuyingChange = (buying: BuyingInputs) => {
    setFormData(prev => ({ ...prev, buying }));
  };

  const handleRentingChange = (renting: RentingInputs) => {
    setFormData(prev => ({ ...prev, renting }));
  };

  const handleInvestmentChange = (investment: InvestmentInputs) => {
    setFormData(prev => ({ ...prev, investment }));
  };

  const handleReset = useCallback(() => {
    setFormData({ ...defaultFormData });
    setResults(null);
    setValidationError(null);
    setCurrentStep('buying');
  }, []);

  const handleCalculate = useCallback(() => {
    if (formData.general.useIncomeAndSavings) {
      const downPaymentAmount = calculateDownPayment(formData.buying.housePrice, formData.buying.downPaymentPercent);
      if (formData.general.currentSavings < downPaymentAmount) {
        toast({
          title: "Insufficient Savings",
          description: `You need at least $${downPaymentAmount.toLocaleString()} for the down payment.`,
          variant: "destructive"
        });
        return;
      }
    }

    const calculationResults = calculateComparison(formData);
    setResults(calculationResults);
    setCurrentStep('results');

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [formData]);

  // Step navigation
  const goToNextStep = useCallback(() => {
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
        handleCalculate();
        break;
    }
  }, [currentStep, handleCalculate]);

  const goToPreviousStep = useCallback(() => {
    switch (currentStep) {
      case 'renting':
        setCurrentStep('buying');
        break;
      case 'investment':
        setCurrentStep('renting');
        break;
      case 'general':
        setCurrentStep('investment');
        break;
      case 'results':
        setCurrentStep('general');
        break;
    }
  }, [currentStep]);

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const canProceedToNextStep = useCallback(() => {
    const error = validateDownPayment(
      formData.general.useIncomeAndSavings,
      formData.general.currentSavings,
      formData.buying.housePrice,
      formData.buying.downPaymentPercent
    );
    return error === null;
  }, [
    formData.general.useIncomeAndSavings,
    formData.general.currentSavings,
    formData.buying.housePrice,
    formData.buying.downPaymentPercent
  ]);

  return {
    formData,
    results,
    validationError,
    currentStep,
    handleGeneralChange,
    handleBuyingChange,
    handleRentingChange,
    handleInvestmentChange,
    handleReset,
    handleCalculate,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    canProceedToNextStep,
  };
};
