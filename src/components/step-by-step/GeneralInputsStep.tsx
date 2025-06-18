import React, { useState } from "react";
import { GeneralInputs, FormData } from "@/lib/types";
import StepContainer from "./StepContainer";
import CurrencyInput from "@/components/forms/CurrencyInput";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import PercentageInput from "@/components/forms/PercentageInput";
import { AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface GeneralInputsStepProps {
  values: GeneralInputs;
  onChange: (values: GeneralInputs) => void;
  formData: FormData;
  validationError: string | null;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  currentStep: string;
}

const GeneralInputsStep: React.FC<GeneralInputsStepProps> = ({
  values,
  onChange,
  validationError,
  onNext,
  onPrevious,
  canProceed,
  currentStep,
}) => {
  const [isYearlyIncome, setIsYearlyIncome] = React.useState(false);
  const hasSavingsError = validationError?.toLowerCase().includes('current savings');

  const handleIncomeChange = (income: number) => {
    const annualIncome = isYearlyIncome ? income : income * 12;
    onChange({ ...values, annualIncome });
  };

  const handleAnnualIncomeGrowthChange = (annualIncomeGrowthRate: number) => {
    onChange({ ...values, annualIncomeGrowthRate });
  };

  const handleCurrentSavingsChange = (currentSavings: number) => {
    onChange({ ...values, currentSavings });
  };

  return (
    <StepContainer
      currentStep={currentStep as any}
      totalSteps={4}
      stepNumber={4}
      title="General & Financial Details"
      description="Provide your general financial information to personalize the calculation."
      onNext={onNext}
      onPrevious={onPrevious}
      canProceed={canProceed}
      validationError={validationError}
      isLastStep={true}
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-2 p-2 rounded-md bg-muted/50 border">
          <Checkbox
            id="useIncomeAndSavings"
            checked={values.useIncomeAndSavings}
            onCheckedChange={(checked) => {
              onChange({ ...values, useIncomeAndSavings: !!checked });
            }}
          />
          <Label
            htmlFor="useIncomeAndSavings"
            className="font-medium text-sm cursor-pointer"
          >
            Use Personal Income & Savings
          </Label>
        </div>

        {values.useIncomeAndSavings && (
          <Accordion type="multiple" className="w-full" defaultValue={['income-expenses']}>
            <AccordionItem value="income-expenses">
              <AccordionTrigger>Income & Expenses</AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                <CurrencyInput
                  id="currentSavings"
                  label={
                    <div className="flex items-center gap-2">
                      <span>Current Savings</span>
                      {hasSavingsError && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  }
                  value={values.currentSavings}
                  onChange={handleCurrentSavingsChange}
                  description="Your total current savings for a down payment and other investments"
                  className={hasSavingsError ? "border-red-300 focus-visible:ring-red-500" : ""}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="incomeMode"
                    checked={isYearlyIncome}
                    onCheckedChange={setIsYearlyIncome}
                  />
                  <Label htmlFor="incomeMode">Use annual income</Label>
                </div>
                <CurrencyInput
                  id="income"
                  label={isYearlyIncome ? "Annual Income (Post Tax)" : "Monthly Income (Post Tax)"}
                  value={values.annualIncome ? (isYearlyIncome ? values.annualIncome : values.annualIncome / 12) : 0}
                  onChange={handleIncomeChange}
                  description={`Your gross ${isYearlyIncome ? 'annual' : 'monthly'} income`}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="incomeIncrease"
                    checked={values.incomeIncrease}
                    onCheckedChange={() => onChange({ ...values, incomeIncrease: !values.incomeIncrease })}
                  />
                  <Label htmlFor="incomeIncrease">Include annual income increase</Label>
                </div>
                {values.incomeIncrease && (
                  <PercentageInput
                    id="annualIncomeGrowthRate"
                    label="Annual Income Growth"
                    value={values.annualIncomeGrowthRate}
                    onChange={handleAnnualIncomeGrowthChange}
                    description="The expected annual percentage increase in your income"
                    min={0}
                    max={20}
                  />
                )}
                <CurrencyInput
                  id="monthlyExpenses"
                  label="Other Monthly Expenses"
                  value={values.monthlyExpenses || 0}
                  onChange={(expenses) => onChange({ ...values, monthlyExpenses: expenses })}
                  description="Your total non-housing monthly expenses (e.g., food, transportation)"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </StepContainer>
  );
};

export default GeneralInputsStep;