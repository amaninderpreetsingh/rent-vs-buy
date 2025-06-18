import React, { useState } from "react";
import { BuyingInputs, FormData } from "@/lib/types";
import StepContainer from "./StepContainer";
import CurrencyInput from "@/components/forms/CurrencyInput";
import SliderInput from "@/components/forms/SliderInput";
import PercentageInput from "@/components/forms/PercentageInput";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BuyingInputsStepProps {
  values: BuyingInputs;
  onChange: (values: BuyingInputs) => void;
  formData: FormData;
  validationError: string | null;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  currentStep: string;
}

const BuyingInputsStep: React.FC<BuyingInputsStepProps> = ({
  values,
  onChange,
  formData,
  validationError,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
}) => {
  const handleHousePriceChange = (housePrice: number) => {
    onChange({ ...values, housePrice });
  };


  const handleInterestRateChange = (interestRate: number) => {
    onChange({ ...values, interestRate });
  };

  const handleLoanTermChange = (loanTerm: number) => {
    onChange({ ...values, loanTerm });
  };

  const handleLoanTypeChange = (loanType: "fixed" | "adjustable") => {
    onChange({ ...values, loanType });
  };

  const handlePropertyTaxRateChange = (propertyTaxRate: number) => {
    onChange({ ...values, propertyTaxRate });
  };

  const handleHomeInsuranceRateChange = (homeInsuranceRate: number) => {
    onChange({ ...values, homeInsuranceRate });
  };

  const handleMaintenanceCostsChange = (maintenanceCosts: number) => {
    onChange({ ...values, maintenanceCosts });
  };

  const handleUsePercentageForMaintenanceToggle = () => {
    onChange({
      ...values,
      usePercentageForMaintenance: !values.usePercentageForMaintenance,
    });
  };

  const handleAppreciationScenarioChange = (
    appreciationScenario: "low" | "medium" | "high" | "custom"
  ) => {
    onChange({ ...values, appreciationScenario });
  };

  const handleCustomAppreciationRateChange = (customAppreciationRate: number) => {
    onChange({ ...values, customAppreciationRate });
  };

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  return (
    <StepContainer
      currentStep={currentStep as any}
      totalSteps={4}
      stepNumber={1}
      title="Buying Scenario"
      description="Tell us about the home you're considering buying."
      onNext={onNext}
      onPrevious={onPrevious}
      canProceed={canProceed}
      validationError={validationError}
    >
      <div className="space-y-6">
        {/* Main required inputs */}
        <CurrencyInput
          id="housePrice"
          label="House Price"
          value={values.housePrice}
          onChange={handleHousePriceChange}
          description="The purchase price of the home"
        />

        <div className="space-y-2">
          <SliderInput
            id="downPaymentPercent"
            label="Down Payment"
            min={0}
            max={100}
            step={1}
            value={values.downPaymentPercent}
            onChange={(downPaymentPercent) => onChange({ ...values, downPaymentPercent })}
            valueDisplay={formData ? `${values.downPaymentPercent}% (${(formData.buying.housePrice * (values.downPaymentPercent / 100)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })})` : `${values.downPaymentPercent}%`}
            description="The down payment as a percentage of the house price"
          />

          {formData && (
            <div className="text-sm text-muted-foreground mt-1">
              <a
                href="/down-payment-calculator"
                className="text-primary hover:text-primary/80 underline flex items-center"
              >
                <span>Need help saving for your down payment?</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </a>
            </div>
          )}
        </div>
        <Separator />

        {/* Advanced options toggle */}
        <div
          className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          <h3 className="text-lg font-medium">Advanced Options</h3>
          {showAdvancedOptions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>

        {/* Advanced options content */}
        {showAdvancedOptions && (
          <div className="space-y-6 pl-2 border-l-2 border-gray-200">
            <div className="space-y-4">
              <PercentageInput
                id="interestRate"
                label="Mortgage Interest Rate"
                value={values.interestRate}
                onChange={handleInterestRateChange}
                description="The annual interest rate for your mortgage"
                min={0}
                max={15}
                step={0.125}
              />

              <SliderInput
                id="loanTerm"
                label="Loan Term (Years)"
                min={5}
                max={30}
                step={5}
                value={values.loanTerm}
                onChange={handleLoanTermChange}
                description="The length of your mortgage loan in years"
              />

              <div className="space-y-2">
                <Label>Loan Type</Label>
                <RadioGroup
                  value={values.loanType}
                  onValueChange={(value) => handleLoanTypeChange(value as "fixed" | "adjustable")}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="cursor-pointer">Fixed Rate</Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  The type of mortgage loan you'll use
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <PercentageInput
                id="propertyTaxRate"
                label="Property Tax Rate"
                value={values.propertyTaxRate}
                onChange={handlePropertyTaxRateChange}
                description="Annual property tax as a percentage of home value"
                min={0}
                max={5}
                step={0.1}
              />

              <PercentageInput
                id="homeInsuranceRate"
                label="Home Insurance Rate"
                value={values.homeInsuranceRate}
                onChange={handleHomeInsuranceRateChange}
                description="Annual home insurance as a percentage of home value"
                min={0}
                max={2}
                step={0.1}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceCosts">
                    {values.usePercentageForMaintenance
                      ? "Maintenance Costs (% of home value)"
                      : "Annual Maintenance Costs"}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="usePercentageForMaintenance"
                      checked={values.usePercentageForMaintenance}
                      onCheckedChange={handleUsePercentageForMaintenanceToggle}
                    />
                    <Label htmlFor="usePercentageForMaintenance" className="text-sm">
                      Use percentage
                    </Label>
                  </div>
                </div>

                {values.usePercentageForMaintenance ? (
                  <PercentageInput
                    id="maintenanceCosts"
                    label=""
                    value={values.maintenanceCosts}
                    onChange={handleMaintenanceCostsChange}
                    description="Annual maintenance costs as a percentage of home value"
                    min={0}
                    max={5}
                    step={0.1}
                  />
                ) : (
                  <CurrencyInput
                    id="maintenanceCosts"
                    label=""
                    value={values.maintenanceCosts}
                    onChange={handleMaintenanceCostsChange}
                    description="Estimated annual cost for home maintenance and repairs"
                  />
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Home Appreciation Scenario</Label>
                <RadioGroup
                  value={values.appreciationScenario}
                  onValueChange={(value) =>
                    handleAppreciationScenarioChange(value as "low" | "medium" | "high" | "custom")
                  }
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="cursor-pointer">Low (2%)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="cursor-pointer">Medium (4%)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="cursor-pointer">High (6%)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="cursor-pointer">Custom</Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  Expected annual appreciation rate for the home value
                </p>
              </div>

              {values.appreciationScenario === "custom" && (
                <PercentageInput
                  id="customAppreciationRate"
                  label="Custom Appreciation Rate"
                  value={values.customAppreciationRate}
                  onChange={handleCustomAppreciationRateChange}
                  description="Your custom annual home appreciation rate"
                  min={-5}
                  max={15}
                  step={0.1}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default BuyingInputsStep;