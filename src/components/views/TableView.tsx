import React from "react";
import InfoCardSection from "@/components/layout/InfoCardSection";
import FormContainer from "@/components/layout/FormContainer";
import ResultsContainer from "@/components/results/ResultsContainer";
import { ComparisonResults, FormData, GeneralInputs, BuyingInputs, RentingInputs, InvestmentInputs } from "@/lib/types";

interface TableViewProps {
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

const TableView: React.FC<TableViewProps> = ({
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

  return (
    <>
      <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
        <InfoCardSection />
      </div>
      
      <div className="mb-8 p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
        <FormContainer 
          formData={formData}
          validationError={validationError}
          onGeneralChange={onGeneralChange}
          onBuyingChange={onBuyingChange}
          onRentingChange={onRentingChange}
          onInvestmentChange={onInvestmentChange}
          onCalculate={onCalculate}
          onReset={onReset}
        />
      </div>
      
      {results && (
        <div className="p-6 bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
          <ResultsContainer results={results} formData={formData} />
        </div>
      )}
    </>
  );
};

export default TableView;