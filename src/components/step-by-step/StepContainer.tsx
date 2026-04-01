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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
      {/* Progress bar */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs sm:text-sm font-medium">Step {stepNumber} of {totalSteps}</span>
          <span className="text-xs sm:text-sm font-medium">{Math.round((stepNumber / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main content card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <div className="bg-primary text-primary-foreground px-4 py-3 sm:px-6 sm:py-4 rounded-t-lg">
          <h2 className="text-lg sm:text-2xl font-bold">{title}</h2>
          {description && <p className="mt-1 text-sm sm:text-base opacity-90">{description}</p>}
        </div>
        <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
          {children}

          {validationError && (
            <div className="p-3 mt-4 text-sm border border-red-300 bg-red-50 text-red-800 rounded-md">
              <p className="font-medium">Validation Error:</p>
              <p>{validationError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky navigation buttons */}
      <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-2 mt-4 bg-white/80 backdrop-blur-md border-t border-border/50">
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={stepNumber === 1}
            className="flex items-center gap-2 h-11 sm:h-10 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="flex items-center gap-2 h-11 sm:h-10 text-sm font-semibold px-6"
          >
            {isLastStep ? "Calculate Results" : "Next"}
            {!isLastStep && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepContainer;
