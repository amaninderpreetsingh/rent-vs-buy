import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BuyingInputs, FormData, GeneralInputs, InvestmentInputs, RentingInputs } from "@/lib/types";
import GeneralInputsForm from "@/components/forms/GeneralInputsForm";
import BuyingInputsForm from "@/components/forms/BuyingInputsForm";
import RentingInputsForm from "@/components/forms/RentingInputsForm";
import InvestmentInputsForm from "@/components/forms/InvestmentInputsForm";
import { Calculator, RefreshCw } from "lucide-react";

interface FormContainerProps {
  formData: FormData;
  validationError: string | null;
  onGeneralChange: (general: GeneralInputs) => void;
  onBuyingChange: (buying: BuyingInputs) => void;
  onRentingChange: (renting: RentingInputs) => void;
  onInvestmentChange: (investment: InvestmentInputs) => void;
  onCalculate: () => void;
  onReset: () => void;
}

const FormContainer: React.FC<FormContainerProps> = ({
  formData,
  validationError,
  onGeneralChange,
  onBuyingChange,
  onRentingChange,
  onInvestmentChange,
  onCalculate,
  onReset,
}) => {
  const [showSections, setShowSections] = useState({
    buying: true,
    renting: true,
    investment: true,
    general: true,
  });

  // Toggle section visibility
  const toggleSection = (section: 'buying' | 'renting' | 'investment' | 'general') => {
    setShowSections({
      ...showSections,
      [section]: !showSections[section],
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid md:grid-cols-3 md:items-start gap-6">
        {/* Buying Section */}
        <div className="bg-buy-light/20 border border-buy-light/40 rounded-lg p-4 shadow-sm">
          <div
            className="flex justify-between items-center cursor-pointer p-2 hover:bg-buy-light/30 rounded-md transition-colors"
            onClick={() => toggleSection('buying')}
          >
            <h2 className="text-xl font-semibold text-buy-dark">Buying Scenario</h2>
            {showSections.buying ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showSections.buying && (
            <div className="mt-4">
              <BuyingInputsForm
                values={formData.buying}
                onChange={onBuyingChange}
              />
            </div>
          )}
        </div>

        {/* Renting Section */}
        <div className="bg-rent-light/20 border border-rent-light/40 rounded-lg p-4 shadow-sm">
          <div
            className="flex justify-between items-center cursor-pointer p-2 hover:bg-rent-light/30 rounded-md transition-colors"
            onClick={() => toggleSection('renting')}
          >
            <h2 className="text-xl font-semibold text-rent-dark">Renting Scenario</h2>
            {showSections.renting ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showSections.renting && (
            <div className="mt-4">
              <RentingInputsForm
                values={formData.renting}
                onChange={onRentingChange}
              />
            </div>
          )}
        </div>

        {/* Investment Section */}
        <div className="bg-investment-light/20 border border-investment-light/40 rounded-lg p-4 shadow-sm">
          <div
            className="flex justify-between items-center cursor-pointer p-2 hover:bg-investment-light/30 rounded-md transition-colors"
            onClick={() => toggleSection('investment')}
          >
            <h2 className="text-xl font-semibold text-investment-dark">Investment Settings</h2>
            {showSections.investment ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showSections.investment && (
            <div className="mt-4">
              <InvestmentInputsForm
                values={formData.investment}
                onChange={onInvestmentChange}
              />
            </div>
          )}
        </div>

        {/* General Information — spans all 3 columns */}
        <div className="md:col-span-3 bg-muted/50 border rounded-lg p-4 shadow-sm">
          <div
            className="flex justify-between items-center cursor-pointer p-2 hover:bg-muted rounded-md transition-colors"
            onClick={() => toggleSection('general')}
          >
            <h2 className="text-xl font-semibold text-foreground">General Information</h2>
            {showSections.general ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showSections.general && (
            <div className="mt-4">
              <GeneralInputsForm
                values={formData.general}
                onChange={onGeneralChange}
                formData={formData}
                validationError={validationError}
              />
            </div>
          )}
        </div>
      </div>

      {/* Validation error + action buttons — full width below the grid */}
      <div className="space-y-4">
        {validationError && (
          <div className="p-3 text-sm border border-red-300 bg-red-50 text-red-800 rounded-md">
            <p className="font-medium">Validation Error:</p>
            <p>{validationError}</p>
          </div>
        )}

        <div className="flex flex-row gap-3">
          <button
            onClick={onCalculate}
            disabled={!!validationError}
            className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold h-14 px-6 sm:px-10 shadow-md transition-all ${
              validationError
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]'
            }`}
            title={validationError || "Calculate results"}
          >
            <Calculator className="w-5 h-5" />
            Calculate Results
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium h-14 px-6 sm:px-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormContainer;