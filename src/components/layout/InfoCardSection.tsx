import React from "react";
import InfoCard from "@/components/layout/InfoCard";

const InfoCardSection: React.FC = () => {
  return (
    <InfoCard title="About This Tool">
      <p>
        This tool helps you compare the financial outcomes of renting versus buying a home over your specified time period.
        By considering factors like property appreciation, investment returns, and various costs, you can make a more informed
        decision about whether renting or buying makes more financial sense for your situation.
      </p>
      <ul className="list-disc pl-5 mt-3 space-y-1">
        <li>Enter your financial details</li>
        <li>Customize assumptions for both scenarios</li>
        <li>Get a detailed year-by-year breakdown</li>
        <li>See visualizations of wealth growth</li>
      </ul>
      
      <div className="mt-4 p-3 bg-primary/10 rounded-md">
        <p className="text-sm font-medium">
          You can switch between the comprehensive table view and a guided step-by-step experience using the toggle at the top of the page.
        </p>
      </div>
    </InfoCard>
  );
};

export default InfoCardSection;