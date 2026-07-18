import { describe, expect, it } from "vitest";
import { estimatedMonthlyPayment, maxAffordablePrice, monthlyMortgagePayment } from "@/lib/finance";

describe("affordability calculations", () => {
  it("returns zero for no principal and handles zero interest", () => {
    expect(monthlyMortgagePayment(0, 7, 20)).toBe(0);
    expect(monthlyMortgagePayment(1_200_000, 0, 10)).toBe(10_000);
  });

  it("uses the stated 20% down, 7%, 20-year assumptions", () => {
    expect(estimatedMonthlyPayment(5_000_000, 20, 7, 20)).toBeCloseTo(31_012, -1);
  });

  it("raises the price ceiling when either budget or cash rises", () => {
    const base = { monthlyBudget: 50_000, cashAvailable: 1_000_000, downPaymentPercent: 20, annualInterestRate: 7, termYears: 20 };
    expect(maxAffordablePrice({ ...base, monthlyBudget: 60_000 })).toBeGreaterThan(maxAffordablePrice(base));
    expect(maxAffordablePrice({ ...base, cashAvailable: 1_500_000 })).toBe(maxAffordablePrice(base) + 500_000);
  });
});
