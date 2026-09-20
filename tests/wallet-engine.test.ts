import { describe, expect, it } from "vitest";
import { OrderStatus, RechargeCodeStatus } from "@prisma/client";
import { canRedeemCode, canRefundOrder, nextBalanceForPurchase } from "@/lib/domain/wallet-engine";
import { normalizeDigits } from "@/lib/persian";

describe("recharge code rules", () => {
  it("accepts a valid active 5 or 6 digit code", () => {
    expect(canRedeemCode({ code: "12345", status: RechargeCodeStatus.ACTIVE, valueCredits: 500 }).ok).toBe(true);
    expect(canRedeemCode({ code: "123456", status: RechargeCodeStatus.ACTIVE, valueCredits: 500 }).ok).toBe(true);
  });

  it("normalizes Persian and Latin code input", () => {
    expect(normalizeDigits("۱۲۳45")).toBe("12345");
  });

  it("rejects reused, disabled, expired or malformed codes", () => {
    expect(canRedeemCode({ code: "1234", status: RechargeCodeStatus.ACTIVE, valueCredits: 500 }).ok).toBe(false);
    expect(canRedeemCode({ code: "12345", status: RechargeCodeStatus.USED, valueCredits: 500 }).ok).toBe(false);
    expect(canRedeemCode({ code: "12345", status: RechargeCodeStatus.DISABLED, valueCredits: 500 }).ok).toBe(false);
    expect(canRedeemCode({ code: "12345", status: RechargeCodeStatus.ACTIVE, valueCredits: 500, expiresAt: new Date("2024-01-01") }, new Date("2024-01-02")).ok).toBe(false);
  });
});

describe("purchase rules", () => {
  it("allows purchase when wallet balance is enough", () => {
    expect(nextBalanceForPurchase(500, 300)).toEqual({ ok: true, balanceAfter: 200 });
  });

  it("prevents purchase when wallet balance is not enough", () => {
    expect(nextBalanceForPurchase(100, 300)).toEqual({ ok: false, reason: "INSUFFICIENT_BALANCE" });
  });
});

describe("refund rules", () => {
  it("allows refund only after cancellation", () => {
    expect(canRefundOrder({ status: OrderStatus.CANCELED }).ok).toBe(true);
    expect(canRefundOrder({ status: OrderStatus.PREPARING }).ok).toBe(false);
  });

  it("prevents duplicate refunds", () => {
    expect(canRefundOrder({ status: OrderStatus.CANCELED, refundedAt: new Date() })).toEqual({
      ok: false,
      reason: "ALREADY_REFUNDED"
    });
  });
});
