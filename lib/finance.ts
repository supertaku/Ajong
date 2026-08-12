export const peso = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
export const compactPeso = (value: number) => `₱${new Intl.NumberFormat("en-PH", { maximumFractionDigits: 1 }).format(value / 1000)}k`;

export function reservationPricing(monthlyRent: number) {
  const holdingDeposit = Math.round(monthlyRent * 0.2);
  const serviceFee = Math.round(monthlyRent * 0.05);
  return {
    holdingDeposit,
    serviceFee,
    dueToday: holdingDeposit + serviceFee,
    firstMonthBalance: monthlyRent - holdingDeposit,
    securityDeposit: monthlyRent,
    dueAtMoveIn: monthlyRent - holdingDeposit + monthlyRent,
  };
}
