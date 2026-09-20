import { RechargeCodeStatus, WalletTransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeDigits } from "@/lib/persian";
import { canRedeemCode } from "@/lib/domain/wallet-engine";

const MAX_FAILED_ATTEMPTS = 7;

export async function redeemRechargeCode({ userId, rawCode, ip }: { userId: string; rawCode: string; ip?: string }) {
  const code = normalizeDigits(rawCode);

  const recentFailures = await prisma.rechargeAttempt.count({
    where: {
      OR: [{ userId }, ip ? { ip } : undefined].filter(Boolean) as { userId?: string; ip?: string }[],
      success: false,
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }
    }
  });

  if (recentFailures >= MAX_FAILED_ATTEMPTS) {
    await prisma.rechargeAttempt.create({ data: { userId, ip, code, success: false, reason: "RATE_LIMIT" } });
    return { ok: false as const, message: "درخواست فعلاً قابل انجام نیست. کمی بعد دوباره تلاش کنید." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const rechargeCode = await tx.rechargeCode.findUnique({ where: { code } });
      if (!rechargeCode) throw new Error("GENERIC_INVALID");

      const validation = canRedeemCode(rechargeCode);
      if (!validation.ok) throw new Error("GENERIC_INVALID");

      const claimed = await tx.rechargeCode.updateMany({
        where: { id: rechargeCode.id, status: RechargeCodeStatus.ACTIVE, usedAt: null },
        data: { status: RechargeCodeStatus.USED, usedByUserId: userId, usedAt: new Date() }
      });
      if (claimed.count !== 1) throw new Error("GENERIC_INVALID");

      const wallet = await tx.wallet.upsert({
        where: { userId },
        update: { balance: { increment: rechargeCode.valueCredits } },
        create: { userId, balance: rechargeCode.valueCredits }
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          userId,
          amount: rechargeCode.valueCredits,
          balanceAfter: wallet.balance,
          type: WalletTransactionType.RECHARGE_CODE,
          rechargeCodeId: rechargeCode.id,
          reason: "شارژ کیف پول با کد فیزیکی"
        }
      });

      await tx.rechargeAttempt.create({ data: { userId, ip, code, success: true } });
      return { transaction, balance: wallet.balance, amount: rechargeCode.valueCredits };
    });

    return { ok: true as const, ...result };
  } catch {
    await prisma.rechargeAttempt.create({ data: { userId, ip, code, success: false, reason: "GENERIC_INVALID" } });
    return { ok: false as const, message: "کد واردشده قابل استفاده نیست." };
  }
}
