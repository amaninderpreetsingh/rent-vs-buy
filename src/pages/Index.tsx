import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useRentBuyCalculator } from "@/hooks/useRentBuyCalculator";
import StepByStepView from "@/components/views/StepByStepView";
import TableView from "@/components/views/TableView";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

  const toggleViewMode = () => {
    setViewMode(current => current === 'step-by-step' ? 'table' : 'step-by-step');
  };

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="flex-grow py-8 px-4 md:px-8 max-w-120rem mx-auto w-full">
        <div className="flex justify-center items-center space-x-2 mb-8 p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border-white/20">
          <Label htmlFor="view-toggle" className={viewMode === 'table' ? 'text-muted-foreground' : 'font-bold'}>Step-by-Step View</Label>
          <Switch
            id="view-toggle"
            checked={viewMode === 'table'}
            onCheckedChange={toggleViewMode}
          />
          <Label htmlFor="view-toggle" className={viewMode === 'table' ? 'font-bold' : 'text-muted-foreground'}>Table View</Label>
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