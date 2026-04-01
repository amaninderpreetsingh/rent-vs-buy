import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useRentBuyCalculator } from "@/hooks/useRentBuyCalculator";
import StepByStepView from "@/components/views/StepByStepView";
import TableView from "@/components/views/TableView";
import { cn } from "@/lib/utils";

type ViewMode = 'step-by-step' | 'table';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('step-by-step');

  const {
    formData,
    results,
    validationError,
    handleGeneralChange,
    handleBuyingChange,
    handleRentingChange,
    handleInvestmentChange,
    handleReset,
    handleCalculate
  } = useRentBuyCalculator();

  const commonProps = {
    formData,
    results,
    validationError,
    onGeneralChange: handleGeneralChange,
    onBuyingChange: handleBuyingChange,
    onRentingChange: handleRentingChange,
    onInvestmentChange: handleInvestmentChange,
    onReset: handleReset,
    onCalculate: handleCalculate,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto w-full">
        {/* View toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border bg-card p-0.5">
            <button
              onClick={() => setViewMode('step-by-step')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                viewMode === 'step-by-step'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Step-by-Step
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                viewMode === 'table'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Inputs
            </button>
          </div>
        </div>

        {viewMode === 'step-by-step' ? (
          <StepByStepView {...commonProps} />
        ) : (
          <TableView {...commonProps} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
