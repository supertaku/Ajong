import type { AffordabilityAssumptions } from "./types";

export const DEFAULT_AFFORDABILITY: AffordabilityAssumptions = {
  monthlyBudget: 60_000,
  cashAvailable: 1_200_000,
  downPaymentPercent: 20,
  annualInterestRate: 7,
  termYears: 20,
};

export function monthlyMortgagePayment(principal: number, annualInterestRate: number, termYears: number) {
  if (principal <= 0) return 0;
  const payments = termYears * 12;
  const rate = annualInterestRate / 100 / 12;
  if (rate === 0) return principal / payments;
  return principal * (rate * (1 + rate) ** payments) / ((1 + rate) ** payments - 1);
}

export function estimatedMonthlyPayment(price: number, downPaymentPercent: number, annualInterestRate: number, termYears: number) {
  return monthlyMortgagePayment(price * (1 - downPaymentPercent / 100), annualInterestRate, termYears);
}

export function maxAffordablePrice(assumptions: AffordabilityAssumptions) {
  const payments = assumptions.termYears * 12;
  const rate = assumptions.annualInterestRate / 100 / 12;
  const loan = rate === 0
    ? assumptions.monthlyBudget * payments
    : assumptions.monthlyBudget * ((1 + rate) ** payments - 1) / (rate * (1 + rate) ** payments);
  return Math.max(0, loan + assumptions.cashAvailable);
}

export const peso = (value: number) => new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
}).format(value);

export const compactPeso = (value: number) => `₱${new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 1,
}).format(value / 1_000_000)}M`;
