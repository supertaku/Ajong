import { describe, expect, it } from "vitest";
import { reservationPricing } from "@/lib/finance";

describe("reservation pricing", () => {
  it("charges a 20% holding deposit and 5% service fee today", () => {
    expect(reservationPricing(20_000)).toEqual({ holdingDeposit: 4_000, serviceFee: 1_000, dueToday: 5_000, firstMonthBalance: 16_000, securityDeposit: 20_000, dueAtMoveIn: 36_000 });
  });
});
