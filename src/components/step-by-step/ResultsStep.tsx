import React from "react";
import { ComparisonResults, FormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";
import ResultsSummary from "@/components/results/ResultsSummary";
import ComparisonChart from "@/components/results/ComparisonChart";
import CostsChart from "@/components/results/CostsChart";
import ComparisonTable from "@/components/results/ComparisonTable";
import { useNavigate } from "react-router-dom";

interface ResultsStepProps {
  results: ComparisonResults;
  onReset: () => void;
  onPrevious: () => void;
  formData: FormData;
}

const ResultsStep: React.FC<ResultsStepProps> = ({
  results,
  onReset,
  onPrevious,
  formData,
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-8xl mx-auto">
      <Card className="shadow-lg border-0 mb-8">
        <div className="bg-primary text-primary-foreground p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Your Results</h2>
          <p className="mt-2 opacity-90">
            Here's the comparison between buying and renting based on your inputs.
          </p>
        </div>
        <CardContent className="p-6 pt-6">
          <ResultsSummary results={results} />

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <ComparisonChart results={results} />
            <CostsChart results={results} />
          </div>

          <ComparisonTable results={results} formData={formData}/>

          <div className="flex flex-wrap justify-between mt-8 gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onPrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Inputs
              </Button>
              
              <Button
                variant="outline"
                onClick={onReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Start Over
              </Button>
            </div>
            
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsStep;