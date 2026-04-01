import React, { useState } from "react";
import { InvestmentInputs } from "@/lib/types";
import StepContainer from "./StepContainer";
import PercentageInput from "@/components/forms/PercentageInput";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";

interface InvestmentInputsStepProps {
  values: InvestmentInputs;
  onChange: (values: InvestmentInputs) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  currentStep: string;
}

const InvestmentInputsStep: React.FC<InvestmentInputsStepProps> = ({
  values,
  onChange,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
}) => {
  const handleAnnualReturnChange = (annualReturn: number) => {
    onChange({ ...values, annualReturn });
  };

  const handleCapitalGainsTaxRateChange = (capitalGainsTaxRate: number) => {
    onChange({ ...values, capitalGainsTaxRate });
  };

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  return (
    <StepContainer
      currentStep={currentStep as any}
      totalSteps={4}
      stepNumber={3}
      title="Investment Settings"
      description="Configure your investment assumptions for the comparison."
      onNext={onNext}
      onPrevious={onPrevious}
      canProceed={canProceed}
      // isLastStep={true}
    >
      <div className="space-y-4">
        {/* Main required input */}
        <PercentageInput
          id="annualReturn"
          label="Expected Annual Return"
          value={values.annualReturn}
          onChange={handleAnnualReturnChange}
          description="The expected annual return on your investments (e.g., stock market)"
          min={0}
          max={30}
          step={0.1}
        />
        <Separator />

        {/* Advanced options toggle */}
        <div
          className="flex justify-between items-center cursor-pointer p-2 hover:bg-muted/50 rounded-md"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          <h3 className="text-base sm:text-lg font-medium">Advanced Options</h3>
          {showAdvancedOptions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>

        {/* Advanced options content */}
        {showAdvancedOptions && (
          <div className="space-y-4 pl-2 border-l-2 border-border">
            <PercentageInput
              id="capitalGainsTaxRate"
              label="Capital Gains Tax Rate"
              value={values.capitalGainsTaxRate}
              onChange={handleCapitalGainsTaxRateChange}
              description="The tax rate applied to your investment gains"
              min={0}
              max={50}
              step={0.1}
            />
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default InvestmentInputsStep;
