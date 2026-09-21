import { OrderStatus, RechargeCodeStatus } from "@prisma/client";

export type RechargeInput = {
  code: string;
  status: RechargeCodeStatus;
  valueCredits: number;
  expiresAt?: Date | null;
};

export function canRedeemCode(input: RechargeInput, now = new Date()) {
  if (!/^[A-Z0-9]{5,6}$/.test(input.code)) return { ok: false as const, reason: "INVALID_FORMAT" };
  if (input.status !== RechargeCodeStatus.ACTIVE) return { ok: false as const, reason: "NOT_ACTIVE" };
  if (input.expiresAt && input.expiresAt <= now) return { ok: false as const, reason: "EXPIRED" };
  if (input.valueCredits <= 0) return { ok: false as const, reason: "INVALID_VALUE" };
  return { ok: true as const };
}

export function nextBalanceForPurchase(balance: number, totalCredits: number) {
  if (totalCredits <= 0) throw new Error("INVALID_TOTAL");
  if (balance < totalCredits) return { ok: false as const, reason: "INSUFFICIENT_BALANCE" };
  return { ok: true as const, balanceAfter: balance - totalCredits };
}

export function canRefundOrder(order: { status: OrderStatus; refundedAt?: Date | null }) {
  if (order.status !== OrderStatus.CANCELED) return { ok: false as const, reason: "ORDER_NOT_CANCELED" };
  if (order.refundedAt) return { ok: false as const, reason: "ALREADY_REFUNDED" };
  return { ok: true as const };
}
