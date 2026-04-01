import { describe, it, expect } from "vitest";
import {
  calculateMonthlyPropertyTaxes,
  calculateMonthlyHomeInsurance,
  calculateMonthlyMaintenanceCosts,
} from "../propertyCostUtils";

describe("calculateMonthlyPropertyTaxes", () => {
  it("calculates correctly for $400k home at 1.2% rate", () => {
    // 400000 * 1.2 / (12 * 100) = $400/mo
    expect(calculateMonthlyPropertyTaxes(400000, 1.2)).toBeCloseTo(400, 2);
  });

  it("returns 0 for 0% rate", () => {
    expect(calculateMonthlyPropertyTaxes(400000, 0)).toBe(0);
  });

  it("scales with home value", () => {
    const low = calculateMonthlyPropertyTaxes(200000, 1.2);
    const high = calculateMonthlyPropertyTaxes(400000, 1.2);
    expect(high).toBeCloseTo(low * 2, 2);
  });
});

describe("calculateMonthlyHomeInsurance", () => {
  it("calculates correctly for $400k home at 0.5% rate", () => {
    // 400000 * 0.5 / (12 * 100) = $166.67/mo
    expect(calculateMonthlyHomeInsurance(400000, 0.5)).toBeCloseTo(166.67, 0);
  });

  it("returns 0 for 0% rate", () => {
    expect(calculateMonthlyHomeInsurance(400000, 0)).toBe(0);
  });
});

describe("calculateMonthlyMaintenanceCosts", () => {
  it("calculates percentage-based maintenance", () => {
    // 400000 * 1 / (12 * 100) = $333.33/mo
    expect(calculateMonthlyMaintenanceCosts(400000, 1, true)).toBeCloseTo(333.33, 0);
  });

  it("calculates fixed annual amount", () => {
    // $6000/year = $500/mo
    expect(calculateMonthlyMaintenanceCosts(400000, 6000, false)).toBeCloseTo(500, 2);
  });

  it("percentage scales with home value", () => {
    const low = calculateMonthlyMaintenanceCosts(200000, 1, true);
    const high = calculateMonthlyMaintenanceCosts(400000, 1, true);
    expect(high).toBeCloseTo(low * 2, 2);
  });

  it("fixed amount ignores home value", () => {
    const a = calculateMonthlyMaintenanceCosts(200000, 6000, false);
    const b = calculateMonthlyMaintenanceCosts(400000, 6000, false);
    expect(a).toBe(b);
  });
});
