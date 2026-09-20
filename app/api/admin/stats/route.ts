import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { OrderStatus, Role, WalletTransactionType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.ADMIN) return NextResponse.json({ message: "دسترسی مجاز نیست." }, { status: 403 });

  const [users, orders, products, pendingOrders, charged] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.order.count({ where: { status: OrderStatus.PENDING_REVIEW } }),
    prisma.walletTransaction.aggregate({
      where: { type: WalletTransactionType.RECHARGE_CODE },
      _sum: { amount: true }
    })
  ]);

  return NextResponse.json({
    users,
    orders,
    products,
    pendingOrders,
    chargedCredits: charged._sum.amount ?? 0
  });
}
