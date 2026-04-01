import React, { ReactNode } from "react";
import { Step } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepContainerProps {
  currentStep: Step;
  totalSteps: number;
  stepNumber: number;
  title: string;
  description?: string;
  children: ReactNode;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  isLastStep?: boolean;
  validationError?: string | null;
}

const StepContainer: React.FC<StepContainerProps> = ({
  currentStep,
  totalSteps,
  stepNumber,
  title,
  description,
  children,
  onNext,
  onPrevious,
  canProceed,
  isLastStep = false,
  validationError,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Step {stepNumber} of {totalSteps}</span>
          <span className="text-sm font-medium">{Math.round((stepNumber / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main content card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className="bg-primary text-primary-foreground p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="mt-2 opacity-90">{description}</p>}
        </div>
        <CardContent className="p-6 pt-6">
          {children}

          {validationError && (
            <div className="p-3 mt-4 text-sm border border-red-300 bg-red-50 text-red-800 rounded-md">
              <p className="font-medium">Validation Error:</p>
              <p>{validationError}</p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={stepNumber === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <Button
              onClick={onNext}
              disabled={!canProceed}
              className="flex items-center gap-2"
            >
              {isLastStep ? "Calculate Results" : "Next"}
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepContainer;
