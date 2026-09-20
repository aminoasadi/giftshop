import { OrderStatus, WalletTransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { nextBalanceForPurchase } from "@/lib/domain/wallet-engine";

export type CheckoutInput = {
  userId: string;
  productId: string;
  quantity: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  postalCode: string;
  courierNotes?: string;
};

export async function checkoutWithWallet(input: CheckoutInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: input.productId, isActive: true, deletedAt: null }
    });
    if (!product || product.stock < input.quantity) throw new Error("PRODUCT_UNAVAILABLE");

    const wallet = await tx.wallet.findUnique({ where: { userId: input.userId } });
    const totalCredits = product.priceCredits * input.quantity;
    const purchase = nextBalanceForPurchase(wallet?.balance ?? 0, totalCredits);
    if (!purchase.ok) throw new Error("INSUFFICIENT_BALANCE");

    await tx.product.update({
      where: { id: product.id },
      data: { stock: { decrement: input.quantity } }
    });

    const updatedWallet = await tx.wallet.update({
      where: { userId: input.userId },
      data: { balance: purchase.balanceAfter }
    });

    const order = await tx.order.create({
      data: {
        userId: input.userId,
        totalCredits,
        receiverName: input.receiverName,
        receiverPhone: input.receiverPhone,
        receiverAddress: input.receiverAddress,
        postalCode: input.postalCode,
        courierNotes: input.courierNotes,
        items: {
          create: {
            productId: product.id,
            quantity: input.quantity,
            priceCredits: product.priceCredits
          }
        }
      }
    });

    await tx.walletTransaction.create({
      data: {
        userId: input.userId,
        amount: -totalCredits,
        balanceAfter: updatedWallet.balance,
        type: WalletTransactionType.PRODUCT_PURCHASE,
        orderId: order.id,
        reason: `خرید ${product.name}`
      }
    });

    return order;
  });
}

export async function cancelOrderAndRefund({ orderId, adminId, reason }: { orderId: string; adminId: string; reason: string }) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.refundedAt) throw new Error("ALREADY_REFUNDED");

    const canceled = await tx.order.updateMany({
      where: { id: orderId, refundedAt: null },
      data: { status: OrderStatus.CANCELED, refundedAt: new Date(), cancelReason: reason }
    });
    if (canceled.count !== 1) throw new Error("ALREADY_REFUNDED");

    const wallet = await tx.wallet.update({
      where: { userId: order.userId },
      data: { balance: { increment: order.totalCredits } }
    });

    await tx.walletTransaction.create({
      data: {
        userId: order.userId,
        amount: order.totalCredits,
        balanceAfter: wallet.balance,
        type: WalletTransactionType.ORDER_REFUND,
        orderId,
        reason: `بازگشت اعتبار سفارش: ${reason}`
      }
    });

    await tx.adminAuditLog.create({
      data: {
        adminId,
        action: "ORDER_CANCELED_AND_REFUNDED",
        target: orderId,
        metadata: { reason }
      }
    });
  });
}
