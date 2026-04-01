# Rent vs Buy Calculator — Math & Architecture Refactor Plan

## Overview

The core financial formulas are correct, but the system suffers from a two-pass mutation architecture, duplicate/dead fields, misleading naming, and missing industry-standard features. This plan addresses all issues in a phased approach — structural cleanup first, then feature additions.

### Changes Already Completed

- **Annual Income in tables:** `yearlyIncome` field added to `YearlyBuyingResult` and `YearlyRentingResult` types, populated by the calculation engine using `general.annualIncome` with year-over-year growth when `incomeIncrease` is enabled. Displayed in both Buying Details and Renting Details tables.
- **Column filter fix:** `ComparisonTable.tsx` now requires `useIncomeAndSavings === true` before showing the Annual Income column (previously only checked `annualIncome > 0`).
- **`yearlyIncome` added to `YearlyTableData`** in `tableTypes.ts` so the table type recognizes the field.
- Files changed: `src/lib/types.ts`, `src/lib/types/tableTypes.ts`, `src/lib/utils/calculationEngine.ts`, `src/components/results/ComparisonTable.tsx`

---

## Phase 1: Eliminate Two-Pass Mutation Architecture

**Problem:** `buyingCalculator` and `rentingCalculator` produce skeleton objects with zeros for investment fields. Then `calculationEngine` loops through all 360 months again to mutate those objects in-place. This means the output of `calculateBuyingYearlyData` is incomplete — half the fields are placeholders that another function fills in later.

**Solution:** Merge the investment logic into a single forward pass inside `calculationEngine`. The sub-calculators should only return what they own (housing costs, rent costs). Investment tracking lives exclusively in the engine.

### Steps

1. **Remove investment fields from `MonthlyBuyingDataPoint` and `MonthlyRentingDataPoint`**
   - Remove: `amountInvested`, `investmentEarnings`, `investmentsWithEarnings`, `totalWealthBuying`/`totalWealthRenting`
   - These fields don't belong in the housing/renting calculators — they're investment concerns

2. **Create a new `MonthlyComparisonPoint` type** in `types.ts`
   - This is what the engine produces per month: buying expenses, renting expenses, investment balances, wealth totals
   - Clean separation: sub-calculators produce cost data, engine produces comparison data

3. **Refactor `buyingCalculator.ts`**
   - Only compute and return: home value, equity, loan balance, mortgage breakdown, property taxes, insurance, maintenance, total monthly expense
   - No investment fields, no wealth fields, no zeros-as-placeholders

4. **Refactor `rentingCalculator.ts`**
   - Only compute and return: monthly rent, yearly rent total
   - No investment fields, no wealth fields

5. **Refactor `calculationEngine.ts`**
   - Single forward loop that:
     1. Reads buying monthly expense from buying results
     2. Reads renting monthly expense from renting results
     3. Calculates investment returns and contributions
     4. Produces `MonthlyComparisonPoint` with complete data
   - No mutation of sub-calculator output

### Files Changed
- `src/lib/types.ts`
- `src/lib/utils/buyingCalculator.ts`
- `src/lib/utils/rentingCalculator.ts`
- `src/lib/utils/calculationEngine.ts`

### Risk
- High — this touches every calculation file and the types that UI components consume
- All existing tests will need updates
- UI components that read from `buyingResults[year].investmentsWithEarnings` etc. will need to read from the new comparison structure instead

---

## Phase 2: Remove Duplicate and Dead Fields

**Problem:** Multiple fields exist that are either duplicates or completely unused in calculations.

### Step 1: Remove `monthlyCosts` (duplicate of `monthlyExpenses`)

Both fields are always set to the same value. `monthlyCosts` exists on:
- `MonthlyBuyingDataPoint` (types.ts:62)
- `YearlyBuyingResult` (types.ts:95)
- `tableTypes.ts` (lines 17, 39)

**Action:** Remove `monthlyCosts` everywhere. Update `ComparisonTable.tsx:71` and `tableUtils.ts` to use `monthlyExpenses`.

### Step 2: Remove dead `GeneralInputs` fields

~~These are declared and rendered in UI but **never used in any calculation**:~~
~~- `annualIncome` — not read by any calculator~~
~~- `incomeIncrease` — not read by any calculator~~
~~- `annualIncomeGrowthRate` — not read by any calculator~~
~~- `monthlyExpenses` — not read by any calculator~~

**DONE (partial):** `annualIncome`, `incomeIncrease`, and `annualIncomeGrowthRate` are now used — the calculation engine populates `yearlyIncome` on both `YearlyBuyingResult` and `YearlyRentingResult`, displayed in the Buying Details and Renting Details tables when the user enables "Use Personal Income & Savings" and enters an income. Income growth is applied year-over-year when enabled.

**Remaining:** `monthlyExpenses` on `GeneralInputs` is still not used in any calculation. Either integrate it (e.g., subtract from investable surplus) or remove it.

### Step 3: ~~Remove~~ `loanType` — Remove or implement

> **Note:** `yearlyIncome` column filter in `ComparisonTable.tsx` was also fixed to require `useIncomeAndSavings === true` (previously it only checked if `annualIncome > 0`).

### Step 4: Remove `loanType` or implement it

`BuyingInputs.loanType: "fixed" | "adjustable"` exists in the type and UI dropdown but calculations always assume fixed-rate.

**Action:** Remove from type, defaults, and UI. Add back when actually implemented.

### Files Changed
- `src/lib/types.ts`
- `src/lib/types/tableTypes.ts`
- `src/lib/defaults.ts`
- `src/lib/utils/buyingCalculator.ts`
- `src/lib/utils/tableUtils.ts`
- `src/components/results/ComparisonTable.tsx`
- `src/components/forms/BuyingInputsForm.tsx`
- `src/components/step-by-step/BuyingInputsStep.tsx`
- `src/components/forms/GeneralInputsForm.tsx` (or equivalent)

### Risk
- Low-medium — mostly deletions, but need to verify no UI component crashes on missing fields

---

## Phase 3: Fix Naming and Semantics

### Step 1: Rename `monthlyExpenses` on yearly records to `totalYearlyExpenses`

At the yearly level, `monthlyExpenses` stores the sum of 12 months of expenses (~$30K), not a single month's value (~$2.5K). This is actively misleading.

**Action:** Rename to `totalYearlyExpenses` on `YearlyBuyingResult` and `YearlyRentingResult`. Update all references.

### Step 2: Simplify Year 0 representation

Currently Year 0 has 12 fake monthly data points all filled with zeros. Year 0 is a point-in-time snapshot (closing day), not a period with months.

**Action:** Change Year 0's `monthlyData` to a single-element array (or make monthlyData optional for year 0). Update any UI code that assumes 12 entries for every year.

### Files Changed
- `src/lib/types.ts`
- `src/lib/utils/buyingCalculator.ts`
- `src/lib/utils/rentingCalculator.ts`
- `src/lib/utils/calculationEngine.ts`
- `src/lib/utils/tableUtils.ts`
- UI components that reference `monthlyExpenses` at yearly level

### Risk
- Low — renaming and simplification only

---

## Phase 4: Performance — Hoist Constants Out of Loops

### Step 1: Hoist `monthlyAppreciationRate` in `buyingCalculator.ts`

Currently computed 360 times inside the inner loop (line 96). It's a constant.

```ts
// Before (inside double loop):
const monthlyAppreciationRate = Math.pow(1 + appreciationRate, 1 / 12) - 1;

// After (above both loops):
const monthlyAppreciationRate = Math.pow(1 + appreciationRate, 1 / 12) - 1;
```

### Step 2: Cache `calculateMonthlyMortgagePayment` result

`calculateMortgageAmortizationForMonth` internally calls `calculateMonthlyMortgagePayment` with identical arguments on each of the 360 invocations.

**Action:** Either:
- (a) Calculate `monthlyPayment` once in `buyingCalculator` and pass it in, or
- (b) Add a parameter to `calculateMortgageAmortizationForMonth` for a pre-computed monthly payment

### Files Changed
- `src/lib/utils/buyingCalculator.ts`
- `src/lib/utils/mortgageUtils.ts`

### Risk
- Very low — pure optimization, no behavioral change

---

## Phase 5: Add Mortgage Interest Tax Deduction

**Why:** This is the single most impactful missing feature. For a $320K loan at 6%, Year 1 interest is ~$19K. At a 24% marginal tax rate, that's ~$4,600/yr in tax savings for the buyer. This materially shifts the breakeven point.

### Steps

1. **Add new input fields:**
   - `marginalTaxRate` on `BuyingInputs` (default: 24%)
   - `standardDeduction` on `BuyingInputs` (default: $14,600 single / $29,200 married — or just a single number)
   - `filingStatus` on `GeneralInputs` (single/married, affects standard deduction)

2. **Calculate itemized vs standard deduction each year:**
   - Itemized = mortgage interest + property taxes (capped at $10K SALT) + other
   - If itemized > standard deduction → tax benefit = (itemized - standard) × marginal rate
   - This correctly models that many buyers don't actually benefit from the mortgage interest deduction

3. **Apply tax savings as reduced buying expense** in the monthly loop

4. **Add UI inputs** for marginal tax rate and filing status

### Files Changed
- `src/lib/types.ts`
- `src/lib/defaults.ts`
- `src/lib/utils/calculationEngine.ts` (or a new `taxUtils.ts`)
- UI form components

### Risk
- Medium — new feature with new inputs, but isolated math

---

## Phase 6: Add Closing Costs (Buy and Sell)

**Why:** Closing costs are 2-5% of purchase price to buy and 5-6% to sell. On a $400K home, that's $8-20K upfront and potentially ~$78K at sale (after 30 years of appreciation). Omitting this biases toward buying.

### Steps

1. **Add new input fields:**
   - `closingCostPercent` on `BuyingInputs` (default: 3%)
   - `sellingCostPercent` on `BuyingInputs` (default: 6%)

2. **Apply buying closing costs at Year 0:**
   - Reduces buyer's initial investment pool (closing costs come out of savings or are added to loan)
   - Or increases renter's advantage (renter invests that money instead)

3. **Apply selling costs at final year:**
   - Final buying wealth = home equity × (1 - sellingCostPercent) + investments
   - This reduces the buyer's effective home equity at liquidation

4. **Add UI inputs** for closing cost percentages

### Files Changed
- `src/lib/types.ts`
- `src/lib/defaults.ts`
- `src/lib/utils/calculationEngine.ts`
- UI form components

### Risk
- Low — additive feature, clean integration points at year 0 and final year

---

## Phase 7: Update Tests

Every phase above requires test updates. Handle incrementally per-phase rather than batching.

### Per-phase test strategy

| Phase | Test Impact |
|-------|-------------|
| Phase 1 (architecture) | Rewrite `calculationEngine.test.ts`, update `buyingCalculator.test.ts` and `rentingCalculator.test.ts` to remove investment assertions, update `integration.test.ts` |
| Phase 2 (dead fields) | Remove assertions on deleted fields |
| Phase 3 (naming) | Update field name references in all test files |
| Phase 4 (performance) | No test changes needed — same behavior |
| Phase 5 (tax deduction) | Add new test cases for tax deduction scenarios |
| Phase 6 (closing costs) | Add new test cases for closing cost impact |

### New test cases to add
- Verify mortgage interest deduction correctly reduces buying expense
- Verify standard vs itemized deduction crossover
- Verify closing costs reduce buyer's initial position
- Verify selling costs reduce buyer's final wealth
- Verify single-pass produces identical results to old two-pass (regression)

---

## Execution Order

```
Phase 1 (architecture)     ← Do first, highest impact on simplicity
  ↓
Phase 2 (dead fields)      ← Clean deletion, low risk
  ↓
Phase 3 (naming)           ← Cosmetic but important for maintainability
  ↓
Phase 4 (performance)      ← Quick wins, no behavior change
  ↓
Phase 5 (tax deduction)    ← Biggest feature gap for accuracy
  ↓
Phase 6 (closing costs)    ← Second biggest feature gap
```

Each phase should be a separate commit (or PR) so regressions are easy to bisect.

---

## Out of Scope (Noted for Future)

- Adjustable-rate mortgage implementation
- PMI (Private Mortgage Insurance) for <20% down
- HOA fees
- Renter's insurance
- Inflation adjustment on non-housing expenses
- Multiple property scenarios
- Regional tax variation modeling
