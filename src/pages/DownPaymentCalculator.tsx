import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InfoCard from "@/components/layout/InfoCard";
import DownPaymentForm from "@/components/calculators/downpayment/DownPaymentForm";
import SavingsPlanResults from "@/components/calculators/downpayment/SavingsPlanResults";
import InvestmentGrowthTable from "@/components/calculators/downpayment/InvestmentGrowthTable";
import { calculateInvestmentReturnForMonth } from "@/lib/utils/investmentUtils";
import { calculateDownPayment } from "@/lib/defaults";

interface MonthlyData {
  month: number;
  startingBalance: number;
  contribution: number;
  investmentReturn: number;
  endingBalance: number;
}

interface YearlyData {
  period: number;
  startingBalance: number;
  contribution: number;
  investmentReturn: number;
  endingBalance: number;
  totalContributions: number;
  totalReturns: number;
  capitalGains: number;
  monthlyData: MonthlyData[];
}

const DownPaymentCalculator = () => {
  // State for form inputs
  const [incomeType, setIncomeType] = useState<'annual' | 'monthly'>('monthly');
  const [income, setIncome] = useState<number>(6000);
  const [homePrice, setHomePrice] = useState<number>(500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [timelineYears, setTimelineYears] = useState<number>(5);
  const [currentSavings, setCurrentSavings] = useState<number>(10000);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(10);
  const [capitalGainsTaxRate, setCapitalGainsTaxRate] = useState<number>(15);

  // State for calculation results
  const [downPaymentAmount, setDownPaymentAmount] = useState<number>(0);
  const [monthlySavingsNeeded, setMonthlySavingsNeeded] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [investmentGrowthData, setInvestmentGrowthData] = useState<YearlyData[]>([]);

  // Calculate down payment amount when home price or percentage changes
  useEffect(() => {
    const calculatedDownPayment = calculateDownPayment(homePrice, downPaymentPercent);
    setDownPaymentAmount(calculatedDownPayment);
  }, [homePrice, downPaymentPercent]);

  useEffect(() => {
    setShowResults(false);
  }, [income, homePrice, downPaymentPercent, timelineYears, currentSavings]);

  // Handle form submission
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate how much needs to be saved
    const targetAmount = downPaymentAmount;
    const startingAmount = currentSavings;
    const monthsToSave = timelineYears * 12;

    // Calculate monthly savings needed using compound interest formula
    let monthlySavings = 0;
    let currentTotal = startingAmount;

    // Iterative approach to find the monthly savings needed
    for (let month = 1; month <= monthsToSave; month++) {
      const monthlyReturn = calculateInvestmentReturnForMonth(currentTotal, annualReturnRate);
      currentTotal += monthlySavings + monthlyReturn;
    }

    // Use binary search to find the right monthly savings amount
    let low = 0;
    let high = (targetAmount - startingAmount) / monthsToSave * 3; // Increased initial guess to account for taxes
    let finalTotal = 0;
    let finalTotalAfterTax = 0;

    while (high - low > 1) {
      monthlySavings = (high + low) / 2;

      // Simulate savings growth
      currentTotal = startingAmount;
      let totalReturns = 0;

      for (let month = 1; month <= monthsToSave; month++) {
        const monthlyReturn = calculateInvestmentReturnForMonth(currentTotal, annualReturnRate);
        currentTotal += monthlySavings + monthlyReturn;
        totalReturns += monthlyReturn;
      }

      // Calculate capital gains tax
      const capitalGainsTax = totalReturns * (capitalGainsTaxRate / 100);
      const totalAfterTax = currentTotal - capitalGainsTax;

      if (totalAfterTax >= targetAmount) {
        high = monthlySavings;
        finalTotal = currentTotal;
        finalTotalAfterTax = totalAfterTax;
      } else {
        low = monthlySavings;
      }
    }

    // Calculate investment growth data for the table
    const growthData: YearlyData[] = [];
    let balance = startingAmount;
    let totalContributions = startingAmount;
    let totalReturns = 0;
    let yearlyData: YearlyData | null = null;
    let previousYearReturns = 0;

    for (let month = 1; month <= monthsToSave; month++) {
      const startingBalance = balance;
      const contribution = high;
      const investmentReturn = calculateInvestmentReturnForMonth(balance, annualReturnRate);

      balance += contribution + investmentReturn;
      totalContributions += contribution;
      totalReturns += investmentReturn;

      // Start a new year's data
      if (month % 12 === 1 || month === 1) {
        const currentYear = Math.ceil(month / 12);
        yearlyData = {
          period: currentYear,
          startingBalance,
          contribution,
          investmentReturn,
          endingBalance: balance,
          totalContributions,
          totalReturns,
          capitalGains: 0,
          monthlyData: [{
            month: (month - 1) % 12 + 1,
            startingBalance,
            contribution,
            investmentReturn,
            endingBalance: balance
          }]
        };
      } else if (yearlyData) {
        // Add monthly data to the current year
        yearlyData.monthlyData.push({
          month: (month - 1) % 12 + 1,
          startingBalance,
          contribution,
          investmentReturn,
          endingBalance: balance
        });

        // Update the year's ending values
        yearlyData.endingBalance = balance;
        yearlyData.totalContributions = totalContributions;
        yearlyData.totalReturns = totalReturns;
      }

      // Add data point for each year and the final month
      if (month % 12 === 0 || month === monthsToSave) {
        if (yearlyData) {
          growthData.push(yearlyData);
          yearlyData = null;
        }
      }
    }

    // Calculate capital gains tax only for the final year
    const lastYear = growthData[growthData.length - 1];
    // Capital gains tax is calculated on all investment returns
    lastYear.capitalGains = lastYear.totalReturns * (capitalGainsTaxRate / 100);
    lastYear.endingBalance -= lastYear.capitalGains;

    // Set capital gains to 0 for all other years
    growthData.slice(0, -1).forEach(yearData => {
      yearData.capitalGains = 0;
    });

    setInvestmentGrowthData(growthData);
    setMonthlySavingsNeeded(high);
    setShowResults(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="absolute top-1/3 -right-48 h-[600px] w-[600px] rounded-full bg-accent/[0.08] blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-[500px] w-[500px] rounded-full bg-primary/[0.05] blur-3xl" />
      </div>
      {/* Subtle grid overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid" />

      <Header />

      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto w-full">
        <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
          <InfoCard title="Down Payment Savings Calculator">
            <p>
              This calculator helps you determine how much you need to save each month to reach your down payment goal.
              It assumes you'll be investing your savings in the S&P 500 with an average annual return of 10%.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Enter your financial details and home price</li>
              <li>Specify your desired down payment percentage</li>
              <li>Set your timeline for saving</li>
              <li>Calculate how much you need to save monthly</li>
            </ul>
          </InfoCard>
        </div>

        <div className="grid md:grid-cols-2 gap-8 p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-white/20">
          <DownPaymentForm
            incomeType={incomeType}
            income={income}
            homePrice={homePrice}
            downPaymentPercent={downPaymentPercent}
            downPaymentAmount={downPaymentAmount}
            timelineYears={timelineYears}
            currentSavings={currentSavings}
            annualReturnRate={annualReturnRate}
            capitalGainsTaxRate={capitalGainsTaxRate}
            onIncomeTypeChange={setIncomeType}
            onIncomeChange={setIncome}
            onHomePriceChange={setHomePrice}
            onDownPaymentPercentChange={setDownPaymentPercent}
            onTimelineYearsChange={setTimelineYears}
            onCurrentSavingsChange={setCurrentSavings}
            onAnnualReturnChange={setAnnualReturnRate}
            onCapitalGainsTaxRateChange={setCapitalGainsTaxRate}
            onSubmit={handleCalculate}
          />

          {showResults && (
            <div className="space-y-8">
              <SavingsPlanResults
                downPaymentAmount={downPaymentAmount}
                downPaymentPercent={downPaymentPercent}
                homePrice={homePrice}
                currentSavings={currentSavings}
                monthlySavingsNeeded={monthlySavingsNeeded}
                timelineYears={timelineYears}
                monthlyIncome={incomeType === 'annual' ? income / 12 : income}
              />

              <InvestmentGrowthTable
                investmentGrowthData={investmentGrowthData}
                timelineYears={timelineYears}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DownPaymentCalculator;
